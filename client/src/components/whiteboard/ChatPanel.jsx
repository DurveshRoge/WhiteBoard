import { useRef, useEffect, useState } from 'react';
import { 
  XMarkIcon, 
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';

const ChatPanel = ({ messages, messageText, setMessageText, handleSendMessage, isChatOpen, setIsChatOpen, activeUsers, user }) => {
  const chatContainerRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (messageText.trim()) {
      handleSendMessage(e);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  return (
    <div className={`fixed right-4 bottom-4 w-96 z-10 transition-all duration-300 ease-in-out ${
      isChatOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
    }`}>
      <div className="flex flex-col bg-white border border-gray-200 rounded-2xl shadow-2xl h-[500px] overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold">Team Chat</h3>
              <p className="text-xs text-blue-100">
                {activeUsers.length} active user{activeUsers.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => setIsChatOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <XMarkIcon className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Messages container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 p-4 overflow-y-auto bg-gray-50"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ChatBubbleLeftRightIcon className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs">Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const isOwnMessage = msg.user.id === user?.id;
                const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1]?.user.id !== msg.user.id);
                const showName = !isOwnMessage && (index === 0 || messages[index - 1]?.user.id !== msg.user.id);
                
                return (
                  <div 
                    key={msg.id} 
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end space-x-2 max-w-[80%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {showAvatar && (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-semibold">
                            {msg.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {!showAvatar && !isOwnMessage && (
                        <div className="w-8 flex-shrink-0"></div>
                      )}
                      
                      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                        {showName && (
                          <span className="text-xs font-medium text-gray-600 mb-1 px-2">
                            {msg.user.name}
                          </span>
                        )}
                        
                        <div className={`px-4 py-2 rounded-2xl max-w-full break-words ${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md'
                            : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                        }`}>
                          <div className="text-sm leading-relaxed">
                            {msg.message}
                          </div>
                        </div>
                        
                        <span className={`text-xs text-gray-400 mt-1 px-2 ${
                          isOwnMessage ? 'text-right' : 'text-left'
                        }`}>
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-end space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {activeUsers.find(u => u.id !== user?.id)?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Message input */}
        <form 
          onSubmit={handleSubmit}
          className="border-t border-gray-200 p-4 bg-white"
        >
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                placeholder="Type a message..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <Button
              type="submit"
              disabled={!messageText.trim()}
              variant="default"
              size="iconLg"
              className="flex-shrink-0"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
