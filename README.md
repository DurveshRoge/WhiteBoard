# Advanced Collaborative Whiteboard SaaS

A comprehensive real-time collaborative whiteboard application built with MERN stack and WebSockets.

## 🚀 Features

- **Real-time Collaboration**: Multiple users can work simultaneously on the same whiteboard
- **Advanced Drawing Tools**: Shapes, freehand drawing, text, sticky notes
- **User Management**: Authentication, roles, and permissions
- **Room System**: Public/private boards with access control
- **Communication**: WebRTC audio chat and text chat
- **Export Options**: PNG, PDF export capabilities
- **AI Integration**: AI-powered flowchart generation
- **Modern UI**: Built with Tailwind CSS and ShadCN UI

## 🛠️ Tech Stack

### Frontend
- **React 18** with **Vite** for fast development
- **Tailwind CSS** for styling
- **ShadCN UI** for component library
- **react-konva** for canvas rendering
- **Zustand** for state management
- **Socket.io Client** for real-time communication

### Backend
- **Express.js** for server framework
- **MongoDB Atlas** for database
- **Socket.io** for WebSocket connections
- **JWT** for authentication
- **Mongoose** for ODM

### Additional Technologies
- **WebRTC** for audio chat
- **PDF.js** for document annotation
- **OpenAI/Gemini API** for AI features

## 📁 Project Structure

```
whiteBoard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── store/         # Zustand stores
│   │   ├── utils/         # Utility functions
│   │   └── lib/           # Third-party integrations
│   ├── public/
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # MongoDB models
│   │   ├── middleware/    # Custom middleware
│   │   ├── routes/        # API routes
│   │   ├── socket/        # Socket.io handlers
│   │   └── utils/         # Server utilities
│   └── package.json
├── shared/                # Shared types and utilities
└── docs/                  # Documentation
```

## 🏗️ Development Phases

### Phase 1: Boilerplate Setup ✅
- [x] React (Vite) + Tailwind CSS + ShadCN setup
- [x] Express backend with folder structure
- [x] MongoDB Atlas connection
- [x] Socket.io server setup
- [x] Environment configuration

### Phase 2: Advanced Whiteboard UI
- [ ] react-konva canvas integration
- [ ] Drawing tools (shapes, pen, text, sticky notes)
- [ ] Element manipulation (drag, resize, rotate)
- [ ] UI components (toolbar, color picker, layers)
- [ ] Undo/redo functionality

### Phase 3: Real-time Collaboration
- [ ] Socket.io client integration
- [ ] Real-time drawing synchronization
- [ ] User presence and cursors
- [ ] Room management
- [ ] Session persistence

### Phase 4: Authentication & Room System
- [ ] JWT authentication
- [ ] User management
- [ ] Board permissions and roles
- [ ] User dashboard

### Phase 5: Communication & Replay
- [ ] WebRTC audio chat
- [ ] Text chat system
- [ ] Board replay functionality
- [ ] Version control and export

### Phase 6: Extra Features & Polish
- [ ] Minimap and navigation
- [ ] Board templates
- [ ] PDF annotation
- [ ] AI assistant integration
- [ ] Advanced UI features

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Git

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd whiteBoard
```

2. Install dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Environment Setup
```bash
# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env
```

4. Configure environment variables
- Update MongoDB connection string
- Set JWT secret
- Configure Socket.io settings

5. Start development servers
```bash
# Start backend (from server directory)
npm run dev

# Start frontend (from client directory)
npm run dev
```

## 🔧 Quick Setup with Your Credentials

Your environment files are already configured with your actual credentials:

**Server Environment (.env):**
- MongoDB: `mongodb+srv://Durveshroge:YOUR_PASSWORD@cluster0.kxdlj.mongodb.net/whiteboard`
- Email: `durveshroge@gmail.com` 
- OpenAI API: Configured
- Gemini API: Configured

**⚠️ Important**: You need to replace `<db_password>` in `server/.env` with your actual MongoDB password.

### Start Development:
```bash
# Install all dependencies
npm run install-all

# Start both server and client
npm run dev
```

**URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📝 Environment Variables

### Server (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Developer**: [Your Name]
- **Project Type**: Final Year Project
- **Duration**: [Project Timeline]

---

*Built with ❤️ for collaborative creativity*
