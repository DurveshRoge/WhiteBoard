import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Board from '../models/Board.js';
import { v4 as uuidv4 } from 'uuid';

// Store active users per board
const activeUsers = new Map();
const userSockets = new Map();

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};

export const setupSocketHandlers = (io) => {
  // Authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`👤 User ${socket.user.name} connected: ${socket.id}`);
    
    // Store user socket mapping
    userSockets.set(socket.userId, socket.id);

    // Update user online status
    User.findByIdAndUpdate(socket.userId, { isOnline: true }).exec();

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle joining a board room
    socket.on('join-board', async (data) => {
      try {
        const { boardId } = data;
        
        if (!boardId) {
          socket.emit('error', { message: 'Board ID is required' });
          return;
        }

        // Check if user has access to the board
        const board = await Board.findById(boardId)
          .populate('owner', 'name email avatar')
          .populate('collaborators.user', 'name email avatar');

        if (!board) {
          socket.emit('error', { message: 'Board not found' });
          return;
        }

        // Check access permissions
        if (!board.hasAccess(socket.userId, 'viewer')) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Leave previous board room if any
        const previousRoom = Array.from(socket.rooms).find(room => room.startsWith('board:'));
        if (previousRoom) {
          socket.leave(previousRoom);
          handleUserLeaveBoard(previousRoom, socket);
        }

        // Join the board room
        const roomName = `board:${boardId}`;
        socket.join(roomName);
        socket.currentBoard = boardId;

        // Add user to active users for this board
        if (!activeUsers.has(boardId)) {
          activeUsers.set(boardId, new Map());
        }
        
        const boardUsers = activeUsers.get(boardId);
        boardUsers.set(socket.userId, {
          id: socket.userId,
          name: socket.user.name,
          avatar: socket.user.avatarUrl,
          cursor: { x: 0, y: 0 },
          socketId: socket.id,
          joinedAt: new Date()
        });

        // Update board's active users
        const activeUsersList = Array.from(boardUsers.values()).map(user => ({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          cursor: user.cursor
        }));

        // Notify all users in the room about the new user
        socket.to(roomName).emit('user-joined', {
          user: {
            id: socket.userId,
            name: socket.user.name,
            avatar: socket.user.avatarUrl
          },
          activeUsers: activeUsersList
        });

        // Send current board state and active users to the joining user
        socket.emit('board-joined', {
          board: {
            id: board._id,
            title: board.title,
            elements: board.elements,
            background: board.background,
            dimensions: board.dimensions,
            settings: board.settings
          },
          activeUsers: activeUsersList,
          permissions: {
            canEdit: board.hasAccess(socket.userId, 'editor'),
            canAdmin: board.hasAccess(socket.userId, 'admin'),
            isOwner: board.owner._id.toString() === socket.userId
          }
        });

        console.log(`👤 User ${socket.user.name} joined board: ${boardId}`);
      } catch (error) {
        console.error('Error joining board:', error);
        socket.emit('error', { message: 'Failed to join board' });
      }
    });

    // Handle leaving a board
    socket.on('leave-board', () => {
      const roomName = Array.from(socket.rooms).find(room => room.startsWith('board:'));
      if (roomName) {
        socket.leave(roomName);
        handleUserLeaveBoard(roomName, socket);
      }
    });

    // Handle drawing events
    socket.on('drawing-update', async (data) => {
      try {
        if (!socket.currentBoard) {
          socket.emit('error', { message: 'Not in a board room' });
          return;
        }

        const { elements, action, elementId } = data;
        const roomName = `board:${socket.currentBoard}`;

        // Check if user has edit permissions
        const board = await Board.findById(socket.currentBoard);
        if (!board || !board.hasAccess(socket.userId, 'editor')) {
          socket.emit('error', { message: 'No edit permissions' });
          return;
        }

        // Update board elements in database
        if (elements) {
          // Ensure all elements have required fields
          const formattedElements = elements.map(element => ({
            ...element,
            createdBy: socket.userId,
            lastModifiedBy: socket.userId,
            // Ensure required fields are present
            x: element.x || 0,
            y: element.y || 0,
            type: element.type || element.tool || 'pen',
            // Convert tool to type for pen elements
            ...(element.tool === 'pen' && { type: 'pen' })
          }));
          
          board.elements = formattedElements;
          board.lastActivity = new Date();
          await board.save();
        }

        // Broadcast to all other users in the room
        socket.to(roomName).emit('drawing-updated', {
          elements,
          action,
          elementId,
          userId: socket.userId,
          timestamp: new Date()
        });

        console.log(`🎨 Drawing update in board ${socket.currentBoard} by ${socket.user.name}`);
      } catch (error) {
        console.error('Error handling drawing update:', error);
        socket.emit('error', { message: 'Failed to update drawing' });
      }
    });

    // Handle cursor movement
    socket.on('cursor-move', (data) => {
      if (!socket.currentBoard) return;

      const { x, y } = data;
      const boardUsers = activeUsers.get(socket.currentBoard);
      
      if (boardUsers && boardUsers.has(socket.userId)) {
        boardUsers.get(socket.userId).cursor = { x, y };
        
        // Broadcast cursor position to other users
        socket.to(`board:${socket.currentBoard}`).emit('cursor-moved', {
          userId: socket.userId,
          cursor: { x, y }
        });
      }
    });

    // Handle element selection
    socket.on('element-select', (data) => {
      if (!socket.currentBoard) return;

      const { elementId, selected } = data;
      const roomName = `board:${socket.currentBoard}`;

      socket.to(roomName).emit('element-selected', {
        elementId,
        selected,
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    // Handle chat messages
    socket.on('chat-message', async (data) => {
      try {
        if (!socket.currentBoard) {
          socket.emit('error', { message: 'Not in a board room' });
          return;
        }

        const { message } = data;
        const roomName = `board:${socket.currentBoard}`;

        if (!message || message.trim().length === 0) {
          return;
        }

        const chatMessage = {
          id: uuidv4(),
          user: {
            id: socket.userId,
            name: socket.user.name,
            avatar: socket.user.avatarUrl
          },
          message: message.trim(),
          timestamp: new Date()
        };

        // Broadcast to all users in the room including sender
        io.to(roomName).emit('chat-message', chatMessage);

        console.log(`💬 Chat message in board ${socket.currentBoard} by ${socket.user.name}`);
      } catch (error) {
        console.error('Error handling chat message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle board settings update
    socket.on('board-settings-update', async (data) => {
      try {
        if (!socket.currentBoard) return;

        const board = await Board.findById(socket.currentBoard);
        if (!board || !board.hasAccess(socket.userId, 'admin')) {
          socket.emit('error', { message: 'No admin permissions' });
          return;
        }

        const { settings } = data;
        board.settings = { ...board.settings, ...settings };
        await board.save();

        const roomName = `board:${socket.currentBoard}`;
        socket.to(roomName).emit('board-settings-updated', {
          settings: board.settings,
          updatedBy: socket.userId
        });
      } catch (error) {
        console.error('Error updating board settings:', error);
        socket.emit('error', { message: 'Failed to update settings' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`👤 User ${socket.user.name} disconnected: ${socket.id}`);
      
      // Remove from user sockets mapping
      userSockets.delete(socket.userId);

      // Update user online status
      User.findByIdAndUpdate(socket.userId, { isOnline: false }).exec();

      // Handle leaving current board
      const roomName = Array.from(socket.rooms).find(room => room.startsWith('board:'));
      if (roomName) {
        handleUserLeaveBoard(roomName, socket);
      }
    });

    // Handle voice chat events
    socket.on('join-voice-chat', (data) => {
      try {
        const { boardId } = data;
        if (!boardId) return;

        const roomName = `voice:${boardId}`;
        socket.join(roomName);
        socket.currentVoiceRoom = roomName;

        // Get existing peers in the voice chat
        const voiceRoom = io.sockets.adapter.rooms.get(roomName);
        const peers = [];
        
        if (voiceRoom) {
          voiceRoom.forEach(socketId => {
            if (socketId !== socket.id) {
              const peerSocket = io.sockets.sockets.get(socketId);
              if (peerSocket && peerSocket.userId !== socket.userId) {
                peers.push({
                  userId: peerSocket.userId,
                  signal: null // Will be sent by the peer
                });
              }
            }
          });
        }

        // Notify the joining user about existing peers
        socket.emit('voice-chat-joined', { peers });

        // Notify other users about the new participant
        socket.to(roomName).emit('user-joined-voice', {
          userId: socket.userId,
          userName: socket.user.name
        });

        console.log(`🎤 User ${socket.user.name} joined voice chat in board ${boardId}`);
      } catch (error) {
        console.error('Error joining voice chat:', error);
        socket.emit('error', { message: 'Failed to join voice chat' });
      }
    });

    socket.on('leave-voice-chat', (data) => {
      const { boardId } = data;
      if (boardId && socket.currentVoiceRoom) {
        const roomName = `voice:${boardId}`;
        socket.leave(roomName);
        socket.currentVoiceRoom = null;

        // Notify other users
        socket.to(roomName).emit('user-left-voice', {
          userId: socket.userId,
          userName: socket.user.name
        });

        console.log(`🎤 User ${socket.user.name} left voice chat in board ${boardId}`);
      }
    });

    socket.on('voice-signal', (data) => {
      const { boardId, userId, signal } = data;
      if (boardId && userId) {
        const roomName = `voice:${boardId}`;
        socket.to(roomName).emit('voice-signal', {
          userId: socket.userId,
          signal
        });
      }
    });

    socket.on('voice-ice-candidate', (data) => {
      const { boardId, userId, candidate } = data;
      if (boardId && userId) {
        const roomName = `voice:${boardId}`;
        socket.to(roomName).emit('voice-ice-candidate', {
          userId: socket.userId,
          candidate
        });
      }
    });

    // Handle comments
    socket.on('get-comments', async (data) => {
      try {
        const { boardId } = data;
        if (!boardId) return;

        const board = await Board.findById(boardId);
        if (!board) return;

        // For now, we'll store comments in memory
        // In a real app, you'd want to store them in the database
        const comments = board.comments || [];
        
        socket.emit('comments-loaded', { comments });
      } catch (error) {
        console.error('Error loading comments:', error);
        socket.emit('error', { message: 'Failed to load comments' });
      }
    });

    socket.on('add-comment', async (data) => {
      try {
        const { boardId, comment } = data;
        if (!boardId || !comment) return;

        const board = await Board.findById(boardId);
        if (!board) return;

        // Add comment to board
        if (!board.comments) board.comments = [];
        const serverComment = {
          ...comment,
          userId: socket.userId,
          userName: socket.user.name,
          userAvatar: socket.user.avatarUrl,
        };
        board.comments.push(serverComment);
        await board.save();

        // Broadcast to all users in the board
        const roomName = `board:${boardId}`;
        io.to(roomName).emit('comment-added', { comment: serverComment });

        console.log(`💬 Comment added to board ${boardId} by ${socket.user.name}`);
      } catch (error) {
        console.error('Error adding comment:', error);
        socket.emit('error', { message: 'Failed to add comment' });
      }
    });

    socket.on('update-comment', async (data) => {
      try {
        const { boardId, commentId, text } = data;
        if (!boardId || !commentId || !text) return;

        const board = await Board.findById(boardId);
        if (!board || !board.comments) return;

        const comment = board.comments.find(c => c.id === commentId);
        if (!comment) {
          socket.emit('error', { message: 'Comment not found', commentId });
          return;
        }
        if (comment.userId.toString() !== socket.userId.toString()) {
          socket.emit('error', { message: 'Cannot edit this comment: userId mismatch', commentUserId: comment.userId, socketUserId: socket.userId });
          return;
        }

        comment.text = text;
        comment.lastEdited = new Date();
        await board.save();

        // Broadcast update
        const roomName = `board:${boardId}`;
        io.to(roomName).emit('comment-updated', { comment });

        console.log(`💬 Comment updated in board ${boardId} by ${socket.user.name}`);
      } catch (error) {
        console.error('Error updating comment:', error);
        socket.emit('error', { message: 'Failed to update comment', error: error.message });
      }
    });

    socket.on('delete-comment', async (data) => {
      try {
        const { boardId, commentId } = data;
        if (!boardId || !commentId) return;

        const board = await Board.findById(boardId);
        if (!board || !board.comments) return;

        const comment = board.comments.find(c => c.id === commentId);
        if (!comment) {
          socket.emit('error', { message: 'Comment not found', commentId });
          return;
        }
        if (comment.userId.toString() !== socket.userId.toString()) {
          socket.emit('error', { message: 'Cannot delete this comment: userId mismatch', commentUserId: comment.userId, socketUserId: socket.userId });
          return;
        }

        board.comments = board.comments.filter(c => c.id !== commentId);
        await board.save();

        // Broadcast deletion
        const roomName = `board:${boardId}`;
        io.to(roomName).emit('comment-deleted', { commentId });

        console.log(`💬 Comment deleted from board ${boardId} by ${socket.user.name}`);
      } catch (error) {
        console.error('Error deleting comment:', error);
        socket.emit('error', { message: 'Failed to delete comment', error: error.message });
      }
    });

    socket.on('add-comment-reply', async (data) => {
      try {
        const { boardId, parentId, reply } = data;
        if (!boardId || !parentId || !reply) return;

        const board = await Board.findById(boardId);
        if (!board || !board.comments) return;

        const parentComment = board.comments.find(c => c.id === parentId);
        if (!parentComment) return;

        if (!parentComment.replies) parentComment.replies = [];
        parentComment.replies.push(reply);
        await board.save();

        // Broadcast reply
        const roomName = `board:${boardId}`;
        io.to(roomName).emit('comment-reply-added', { parentId, reply });

        console.log(`💬 Reply added to comment in board ${boardId} by ${socket.user.name}`);
      } catch (error) {
        console.error('Error adding comment reply:', error);
        socket.emit('error', { message: 'Failed to add reply' });
      }
    });

    // Additional WebRTC Voice Chat Handlers
    socket.on('voice-offer', ({ targetUserId, offer, boardId }) => {
      console.log(`🎤 Voice offer from ${socket.userId} to ${targetUserId}`);
      const targetSocketId = userSockets.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('voice-offer', {
          fromUserId: socket.userId,
          fromUserName: socket.user.name,
          offer,
          boardId
        });
      }
    });

    socket.on('voice-answer', ({ targetUserId, answer, boardId }) => {
      console.log(`🎤 Voice answer from ${socket.userId} to ${targetUserId}`);
      const targetSocketId = userSockets.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('voice-answer', {
          fromUserId: socket.userId,
          answer,
          boardId
        });
      }
    });

    socket.on('voice-ice-candidate', ({ targetUserId, candidate, boardId }) => {
      console.log(`🎤 ICE candidate from ${socket.userId} to ${targetUserId}`);
      const targetSocketId = userSockets.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('voice-ice-candidate', {
          fromUserId: socket.userId,
          candidate,
          boardId
        });
      }
    });

    socket.on('voice-call-request', ({ targetUserId, boardId }) => {
      console.log(`📞 Voice call request from ${socket.userId} to ${targetUserId}`);
      const targetSocketId = userSockets.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('voice-call-request', {
          fromUserId: socket.userId,
          fromUserName: socket.user.name,
          fromUserAvatar: socket.user.avatar,
          boardId
        });
      }
    });

    socket.on('voice-call-response', ({ targetUserId, accepted, boardId }) => {
      console.log(`📞 Voice call response from ${socket.userId} to ${targetUserId}: ${accepted}`);
      const targetSocketId = userSockets.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('voice-call-response', {
          fromUserId: socket.userId,
          accepted,
          boardId
        });
      }
    });

    socket.on('voice-call-end', ({ targetUserId, boardId }) => {
      console.log(`📞 Voice call ended by ${socket.userId}`);
      const targetSocketId = userSockets.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('voice-call-end', {
          fromUserId: socket.userId,
          boardId
        });
      }
    });

    socket.on('voice-mute-toggle', ({ boardId, muted }) => {
      console.log(`🎤 ${socket.userId} ${muted ? 'muted' : 'unmuted'} microphone`);
      const roomName = `board:${boardId}`;
      socket.to(roomName).emit('user-voice-status', {
        userId: socket.userId,
        muted
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Helper function to handle user leaving board
  function handleUserLeaveBoard(roomName, socket) {
    const boardId = roomName.replace('board:', '');
    const boardUsers = activeUsers.get(boardId);
    
    if (boardUsers && boardUsers.has(socket.userId)) {
      boardUsers.delete(socket.userId);
      
      // If no users left, remove the board from active users
      if (boardUsers.size === 0) {
        activeUsers.delete(boardId);
      } else {
        // Notify remaining users
        const activeUsersList = Array.from(boardUsers.values()).map(user => ({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          cursor: user.cursor
        }));

        socket.to(roomName).emit('user-left', {
          userId: socket.userId,
          activeUsers: activeUsersList
        });
      }
    }
    
    socket.currentBoard = null;
  }

  console.log('🔌 Socket.IO handlers initialized');
};
