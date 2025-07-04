import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Toaster } from 'sonner';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import WhiteboardPage from './pages/WhiteboardPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// Components
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user, loading, token, initializeAuth, setAuthToken, isRehydrated } = useAuthStore();
  
  // Set auth token immediately if available
  useEffect(() => {
    if (token) {
      setAuthToken(token);
      console.log('Auth token set in App component');
    }
  }, [token, setAuthToken]);
  
  // Initialize authentication when the app loads
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Initializing auth in App component');
        const result = await initializeAuth();
        if (result?.success) {
          console.log('Auth successfully initialized in App component');
        } else {
          console.log('Auth initialization did not succeed in App component');
        }
      } catch (error) {
        console.error('Failed to initialize auth in App component:', error);
      }
    };
    
    // Only run initialization if the store has been rehydrated from storage
    if (isRehydrated) {
      initialize();
    }
  }, [initializeAuth, isRehydrated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          {/* Logo Animation */}
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
              <span className="text-white font-bold text-3xl">W</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl opacity-0 animate-ping"></div>
          </div>
          
          {/* Loading Text */}
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            WhiteBoard
          </h2>
          <p className="text-gray-600 mb-8">Loading your workspace...</p>
          
          {/* Loading Spinner */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
            </div>
          </div>
          
          {/* Loading Dots */}
          <div className="flex justify-center mt-6 space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" richColors />
        
        {user && <Navigation />}
        
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
          />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} 
          />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/whiteboard/:id" element={
            <ProtectedRoute>
              <WhiteboardPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
