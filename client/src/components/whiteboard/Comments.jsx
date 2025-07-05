import React, { useState, useEffect, useRef } from 'react';
import { 
  ChatBubbleLeftIcon,
  PlusIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  UserCircleIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';

const Comments = ({ socket, boardId, user, isCommentsOpen, setIsCommentsOpen, selectedElementId, setSelectedElementId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentPosition, setCommentPosition] = useState({ x: 0, y: 0 });
  
  const commentsContainerRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    if (!socket || !isCommentsOpen) return;

    // Load existing comments
    socket.emit('get-comments', { boardId });

    // Socket event listeners
    socket.on('comments-loaded', handleCommentsLoaded);
    socket.on('comment-added', handleCommentAdded);
    socket.on('comment-updated', handleCommentUpdated);
    socket.on('comment-deleted', handleCommentDeleted);
    socket.on('comment-reply-added', handleCommentReplyAdded);
    socket.on('error', handleSocketError);

    return () => {
      socket.off('comments-loaded');
      socket.off('comment-added');
      socket.off('comment-updated');
      socket.off('comment-deleted');
      socket.off('comment-reply-added');
      socket.off('error', handleSocketError);
    };
  }, [socket, boardId, isCommentsOpen]);

  useEffect(() => {
    // Auto-scroll to bottom when comments change
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
    }
  }, [comments]);

  const handleCommentsLoaded = (data) => {
    setComments(data.comments || []);
  };

  const handleCommentAdded = (data) => {
    setComments(prev => [...prev, data.comment]);
    setNewComment('');
    setIsAddingComment(false);
  };

  const handleCommentUpdated = (data) => {
    setComments(prev => prev.map(comment => 
      comment.id === data.comment.id ? data.comment : comment
    ));
    setEditingComment(null);
    setEditText('');
  };

  const handleCommentDeleted = (data) => {
    setComments(prev => prev.filter(comment => comment.id !== data.commentId));
  };

  const handleCommentReplyAdded = (data) => {
    setComments(prev => prev.map(comment => 
      comment.id === data.parentId 
        ? { ...comment, replies: [...(comment.replies || []), data.reply] }
        : comment
    ));
  };

  const handleSocketError = (error) => {
    if (error && error.message) {
      alert(`Error: ${error.message}\nDetails: ${JSON.stringify(error, null, 2)}`);
      console.error('Comment action error:', error);
    } else {
      alert(`Unknown error: ${JSON.stringify(error, null, 2)}`);
      console.error('Unknown comment action error:', error);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !socket) return;
    const comment = {
      id: Date.now().toString(),
      text: newComment,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatarUrl,
      elementId: selectedElementId,
      position: commentPosition,
      timestamp: new Date().toISOString(),
      replies: []
    };
    console.log('Emitting add-comment:', { boardId, comment });
    socket.emit('add-comment', { boardId, comment });
  };

  const handleUpdateComment = (commentId) => {
    if (!editText.trim() || !socket) return;
    console.log('Emitting update-comment:', { boardId, commentId, text: editText });
    socket.emit('update-comment', { 
      boardId, 
      commentId, 
      text: editText 
    });
  };

  const handleDeleteComment = (commentId) => {
    if (!socket) return;
    console.log('Emitting delete-comment:', { boardId, commentId });
    socket.emit('delete-comment', { boardId, commentId });
  };

  const handleAddReply = (parentId, replyText) => {
    if (!socket) return;
    const reply = {
      id: Date.now().toString(),
      text: replyText,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatarUrl,
      timestamp: new Date().toISOString()
    };
    console.log('Emitting add-comment-reply:', { boardId, parentId, reply });
    socket.emit('add-comment-reply', { boardId, parentId, reply });
  };

  const startEditing = (comment) => {
    setEditingComment(comment.id);
    setEditText(comment.text);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditText('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getCommentsForElement = (elementId) => {
    return comments.filter(comment => comment.elementId === elementId);
  };

  const allComments = selectedElementId 
    ? getCommentsForElement(selectedElementId)
    : comments;

  return (
    <div className={`fixed right-4 top-16 w-96 z-60 transition-all duration-300 ease-in-out ${
      isCommentsOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="flex flex-col bg-white border border-gray-200 rounded-2xl shadow-2xl h-[600px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <ChatBubbleLeftIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold">Comments</h3>
              <p className="text-xs text-purple-100">
                {allComments.length} comment{allComments.length !== 1 ? 's' : ''}
                {selectedElementId && ' on selected element'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => setIsCommentsOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <XMarkIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Comments container */}
        <div 
          ref={commentsContainerRef}
          className="flex-1 p-4 overflow-y-auto bg-gray-50"
        >
          {allComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ChatBubbleLeftIcon className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm font-medium">No comments yet</p>
              <p className="text-xs">Add a comment to start the discussion!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allComments.map((comment) => (
                <div key={comment.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  {/* Comment header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          {comment.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {comment.userName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(comment.timestamp)}
                      </span>
                    </div>
                    
                    {comment.userId === user?.id && (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="iconSm"
                          onClick={() => startEditing(comment)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <PencilIcon className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="iconSm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Comment content */}
                  {editingComment === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        rows="2"
                        autoFocus
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateComment(comment.id)}
                          className="flex-1"
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEditing}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {comment.text}
                    </p>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="ml-6 bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">
                                {reply.userName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-gray-600">
                              {reply.userName}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatTime(reply.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700">
                            {reply.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply input */}
                  <div className="mt-3">
                    <ReplyInput 
                      onAddReply={(text) => handleAddReply(comment.id, text)}
                      placeholder="Add a reply..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add comment input */}
        <div className="border-t border-gray-200 p-4 bg-white">
          {isAddingComment ? (
            <form onSubmit={handleAddComment} className="space-y-2">
              <textarea
                ref={inputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows="3"
                autoFocus
              />
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={!newComment.trim()}
                  size="sm"
                  className="flex-1"
                >
                  <PaperAirplaneIcon className="w-4 h-4 mr-1" />
                  Add Comment
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingComment(false);
                    setNewComment('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button
              onClick={() => {
                setIsAddingComment(true);
                setTimeout(() => inputRef.current?.focus(), 100);
              }}
              variant="outline"
              className="w-full"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Comment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Reply input component
const ReplyInput = ({ onAddReply, placeholder }) => {
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    onAddReply(replyText);
    setReplyText('');
    setIsReplying(false);
  };

  if (!isReplying) {
    return (
      <button
        onClick={() => setIsReplying(true)}
        className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
      >
        <ChatBubbleLeftIcon className="w-3 h-3" />
        <span>Reply</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent resize-none"
        rows="2"
        autoFocus
      />
      <div className="flex space-x-1">
        <Button
          type="submit"
          disabled={!replyText.trim()}
          size="sm"
          className="text-xs px-2 py-1"
        >
          Reply
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsReplying(false);
            setReplyText('');
          }}
          className="text-xs px-2 py-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default Comments; 