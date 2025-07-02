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
          board.elements = elements;
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
