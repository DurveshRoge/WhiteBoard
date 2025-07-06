# 🎨 Advanced Collaborative Whiteboard

A modern, real-time collaborative whiteboard application built with React, Node.js, Socket.io, and AI integration. Create, share, and collaborate on digital whiteboards with advanced features including AI-powered assistance, voice chat, and real-time synchronization.

## 🌟 Features

### 🎨 **Digital Whiteboard**
- **Real-time Drawing**: Smooth drawing experience with Konva.js
- **Multiple Tools**: Pen, shapes (rectangle, circle, arrow), text, eraser
- **Customization**: Color picker, stroke width control, fill options
- **Navigation**: Zoom, pan, and canvas manipulation
- **Export**: Save whiteboards as PDF or images

### 🤖 **AI-Powered Assistant**
- **Gemini Integration**: AI suggestions for whiteboard improvements
- **Smart Flowcharts**: AI-generated flowchart recommendations
- **Content Analysis**: Intelligent suggestions based on whiteboard content
- **Interactive Suggestions**: Apply AI recommendations with one click

### 🎙️ **Voice & Audio**
- **Voice Chat**: Real-time voice communication between collaborators
- **Audio Controls**: Mute/unmute, volume control
- **WebRTC Integration**: Peer-to-peer audio streaming
- **Multi-user Support**: Voice chat with multiple participants

### 👥 **Real-time Collaboration**
- **Live Cursors**: See other users' cursor positions in real-time
- **Simultaneous Editing**: Multiple users can draw simultaneously
- **User Presence**: See who's online and active on the whiteboard
- **Chat System**: Text chat panel for communication

### 🔐 **Authentication & Security**
- **Google OAuth**: Secure login with Google accounts
- **Local Authentication**: Email/password registration and login
- **Protected Routes**: Secure access to whiteboards
- **Session Management**: Persistent user sessions

### 📱 **Modern UI/UX**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Tailwind CSS**: Beautiful, modern styling
- **shadcn/ui Components**: Professional UI components
- **Dark/Light Themes**: Customizable appearance
- **Intuitive Interface**: Easy-to-use design

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Professional UI components
- **Konva.js** - 2D canvas library for drawing
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **WebRTC (SimplePeer)** - Peer-to-peer audio/video

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Socket.io** - Real-time WebSocket communication
- **MongoDB** - Database with Mongoose ODM
- **Passport.js** - Authentication middleware
- **Google OAuth 2.0** - Social authentication
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing

### AI & External Services
- **Google Gemini AI** - AI-powered suggestions and content generation

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19.0 or higher
- MongoDB database
- Google OAuth credentials
- Gemini AI API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd WhiteBoard
```

2. **Install root dependencies**
```bash
npm install
```

3. **Setup Server**
```bash
cd server
npm install
```

4. **Setup Client**
```bash
cd ../client
npm install
```

### Environment Configuration

1. **Server Environment** (`server/.env`)
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whiteboard

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI Integration
GEMINI_API_KEY=your-gemini-api-key

# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
```

2. **Client Environment** (`client/.env.development`)
```env
VITE_API_URL=http://localhost:5000
```

3. **Client Environment** (`client/.env.production`)
```env
VITE_API_URL=https://your-production-api-url.com
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://your-domain.com/api/auth/google/callback`

### Gemini AI Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the key to your server environment variables

## 🎯 Usage

### Development

1. **Start the server**
```bash
cd server
npm run dev
```

2. **Start the client** (in a new terminal)
```bash
cd client
npm run dev
```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Production

1. **Build the client**
```bash
cd client
npm run build
```

2. **Start the production server**
```bash
cd server
npm start
```

## 🔧 Available Scripts

### Root Directory
- `npm install` - Install all dependencies (client + server)
- `npm run dev` - Start both client and server in development
- `npm run build` - Build client for production

### Server (`/server`)
- `npm run dev` - Start server with nodemon (development)
- `npm start` - Start server (production)
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues

### Client (`/client`)
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

## 📁 Project Structure

```
WhiteBoard/
├── client/                 # React frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ui/        # shadcn/ui components
│   │   │   └── whiteboard/ # Whiteboard-specific components
│   │   ├── pages/         # Page components
│   │   ├── stores/        # State management
│   │   ├── lib/           # Utility functions
│   │   └── assets/        # Images and icons
│   ├── package.json
│   └── vite.config.js
├── server/                # Node.js backend application
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic services
│   │   ├── socket/        # Socket.io handlers
│   │   └── config/        # Configuration files
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

The project is configured for easy deployment on Vercel:

1. **Deploy Backend**
   - Connect your repository to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy the `/server` directory

2. **Deploy Frontend**
   - Deploy the `/client` directory
   - Update `VITE_API_URL` to point to your backend URL

### Manual Deployment

1. **Build the application**
```bash
npm run build
```

2. **Deploy to your hosting provider**
   - Upload the `client/dist` folder for the frontend
   - Upload the `server` folder for the backend
   - Set up environment variables
   - Start the server with `npm start`

## 🧪 Testing

### Running Tests
```bash
# Server tests
cd server
npm test

# Client tests (if added)
cd client
npm test
```

### Manual Testing Features

1. **Authentication**
   - Register with email/password
   - Login with Google OAuth
   - Access protected routes

2. **Whiteboard Collaboration**
   - Create a new whiteboard
   - Invite collaborators
   - Test real-time drawing
   - Verify cursor positions

3. **AI Features**
   - Ask for AI suggestions
   - Generate flowcharts
   - Apply AI recommendations

4. **Voice Chat**
   - Enable microphone permissions
   - Test audio with multiple users
   - Verify mute/unmute functionality

## 🔧 Configuration

### Socket.io Configuration
Real-time features can be configured in `server/src/socket/socketHandlers.js`

### AI Configuration
AI features can be customized in `server/src/services/aiService.js`

### Database Configuration
MongoDB settings in `server/src/config/database.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/whiteboard/issues) page
2. Create a new issue with detailed information
3. Include error messages and reproduction steps

## 🙏 Acknowledgments

- [React](https://reactjs.org/) for the amazing UI library
- [Socket.io](https://socket.io/) for real-time communication
- [Konva.js](https://konvajs.org/) for the canvas functionality
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Google Gemini](https://ai.google.dev/) for AI capabilities

---

Made with ❤️ Durvesh Roge
