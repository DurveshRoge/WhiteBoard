# WhiteBoard Frontend

A modern, enhanced collaborative whiteboard frontend built with React, Vite, Tailwind CSS, and shadcn/ui components.

## 🚀 Features

### 🎨 Modern UI/UX
- Beautiful, responsive design with Tailwind CSS
- Professional shadcn/ui components
- Gradient backgrounds and smooth animations
- Mobile-first responsive design

### 🔐 Authentication
- Complete login/register system
- Form validation with visual feedback
- Password strength indicators
- Social login UI (Google, Facebook)
- Protected routes

### 📊 Dashboard
- Clean, card-based whiteboard overview
- Search and filter functionality
- Real-time board statistics
- Quick actions (share, duplicate, delete)

### 🎭 Collaborative Whiteboard
- Real-time drawing with Konva.js
- Multiple drawing tools (pen, shapes, text)
- Color picker and stroke width controls
- Zoom and pan functionality
- Grid system with snap-to-grid
- Professional toolbar

### 👤 User Management
- Comprehensive profile management
- Settings with multiple categories
- Privacy and security controls
- Account statistics

### 🎛️ Advanced Settings
- Appearance customization
- Notification preferences
- Collaboration settings
- Data export/import

## 🛠️ Tech Stack

- **React 19** - Modern React with latest features
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Konva.js** - High-performance 2D canvas
- **Heroicons** - Beautiful SVG icons
- **Sonner** - Toast notifications

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── Navigation.jsx   # Main navigation
│   └── ProtectedRoute.jsx
├── pages/               # Page components
│   ├── LandingPage.jsx  # Marketing landing page
│   ├── LoginPage.jsx    # Authentication
│   ├── RegisterPage.jsx
│   ├── Dashboard.jsx    # Main dashboard
│   ├── WhiteboardPage.jsx # Collaborative whiteboard
│   ├── ProfilePage.jsx  # User profile
│   └── SettingsPage.jsx # Application settings
├── stores/              # Zustand stores
│   ├── authStore.js     # Authentication state
│   └── boardStore.js    # Whiteboard state
├── lib/                 # Utilities
│   └── utils.js         # Helper functions
└── App.jsx              # Main app component
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19.0 or higher
- npm or yarn

### Installation

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:3000`

### Environment Setup

The frontend is configured to connect to the backend API at `http://localhost:5000`. Make sure your backend server is running.

## 📱 Features Walkthrough

### 🏠 Landing Page
- Professional marketing page
- Feature highlights
- Pricing section
- Call-to-action buttons

### 🔑 Authentication
- **Login**: Email/password with remember me option
- **Register**: Full validation with password strength meter
- **Social Auth**: UI ready for Google/Facebook integration

### 📋 Dashboard
- **Board Grid**: Visual card layout for all whiteboards
- **Search**: Real-time filtering by title/description
- **Quick Actions**: Create, share, duplicate, delete boards
- **Stats**: Board count and collaborator information

### 🎨 Whiteboard
- **Drawing Tools**: 
  - Pen tool with customizable stroke
  - Rectangle and circle shapes
  - Text tool (planned)
  - Selection tool
- **Controls**:
  - Color picker with preset colors
  - Stroke width slider
  - Zoom in/out controls
  - Clear canvas
- **Collaboration**:
  - Real-time cursor tracking (planned)
  - Live updates (planned)
  - User presence indicators (planned)

### 👤 Profile Management
- **Personal Info**: Name, email, company, location
- **Avatar**: Gradient-based user avatar
- **Security**: Password change, 2FA setup
- **Account Stats**: Whiteboard and collaborator counts

### ⚙️ Settings
- **Notifications**: Email, push, and activity notifications
- **Appearance**: Theme, language, grid preferences
- **Privacy**: Profile visibility and invitation settings
- **Collaboration**: Default permissions and auto-save

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (blue-500 to blue-700)
- **Secondary**: Purple accent (purple-500 to purple-700)
- **Success**: Green (green-500)
- **Warning**: Yellow (yellow-500)
- **Danger**: Red (red-500)

### Typography
- **Headers**: Inter font, bold weights
- **Body**: Inter font, regular weight
- **Code**: Monospace font

### Components
- Consistent border radius (rounded-lg)
- Subtle shadows for depth
- Smooth transitions and animations
- Responsive grid layouts

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## 🌐 API Integration

The frontend is designed to work with the WhiteBoard backend API:

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Board Endpoints
- `GET /api/boards` - Get user's boards
- `POST /api/boards` - Create new board
- `GET /api/boards/:id` - Get specific board
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board
- `POST /api/boards/:id/share` - Share board

### Real-time Features
- Socket.io integration for live collaboration
- Real-time cursor tracking
- Live drawing updates
- User presence indicators

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Vercel**: Connect your GitHub repo for automatic deployments
- **Netlify**: Drag and drop the `dist` folder
- **AWS S3**: Upload static files to S3 bucket
- **Docker**: Use the included Dockerfile

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Heroicons](https://heroicons.com/) for the icon set
- [Konva.js](https://konvajs.org/) for canvas rendering
- [Zustand](https://github.com/pmndrs/zustand) for state management+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
