const UserCursors = ({ userCursors, activeUsers, user, zoom, stagePos }) => {
  return Object.entries(userCursors).map(([userId, cursor]) => {
    // Don't show our own cursor
    if (userId === user?.id) return null;
    
    // Find user info
    const userInfo = activeUsers.find(u => u.id === userId);
    if (!userInfo) return null;
    
    return (
      <div
        key={userId}
        className="absolute pointer-events-none"
        style={{
          left: cursor.x * zoom + stagePos.x,
          top: cursor.y * zoom + stagePos.y,
          zIndex: 1000
        }}
      >
        <div className="flex flex-col items-center">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-md"
          >
            <path
              d="M5 3L19 12L12 13L9 20L5 3Z"
              fill="white"
              stroke="#2563eb"
              strokeWidth="2"
            />
          </svg>
          <div className="mt-1 px-2 py-1 bg-blue-500 text-white text-xs rounded-md whitespace-nowrap">
            {userInfo.name}
          </div>
        </div>
      </div>
    );
  });
};

export default UserCursors;
