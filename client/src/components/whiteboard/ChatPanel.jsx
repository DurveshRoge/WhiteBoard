import { useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ChatPanel = ({ messages, messageText, setMessageText, handleSendMessage, isChatOpen, setIsChatOpen, activeUsers, user }) => {
  const chatContainerRef = useRef(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  return (
    <div className={`fixed right-0 bottom-0 w-80 z-10 transition-transform duration-300 ${
      isChatOpen ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div className="flex flex-col bg-white border border-gray-200 rounded-t-lg shadow-lg h-96">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-blue-50">
          <h3 className="font-medium text-blue-700">Chat</h3>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">
              {activeUsers.length} user{activeUsers.length !== 1 ? 's' : ''}
            </span>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Messages container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 p-3 overflow-y-auto"
        >
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-4">
              No messages yet
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`mb-2 ${msg.user.id === user?.id ? 'text-right' : ''}`}
              >
                <div className={`inline-block px-3 py-2 rounded-lg max-w-[80%] ${
                  msg.user.id === user?.id
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}>
                  {msg.user.id !== user?.id && (
                    <div className="font-medium text-xs mb-1">
                      {msg.user.name}
                    </div>
                  )}
                  <div className="text-sm break-words">
                    {msg.message}
                  </div>
                  <div className="text-xs mt-1 opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Message input */}
        <form 
          onSubmit={handleSendMessage}
          className="border-t border-gray-200 p-2 flex"
        >
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-1 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="px-3 py-1 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
