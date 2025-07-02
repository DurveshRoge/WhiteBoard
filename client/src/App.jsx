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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
