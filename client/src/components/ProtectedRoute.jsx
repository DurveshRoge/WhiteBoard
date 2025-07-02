import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const ProtectedRoute = ({ children }) => {
  const { user, token, loading, initializeAuth, isRehydrated } = useAuthStore();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authCheckCount, setAuthCheckCount] = useState(0);
  const location = useLocation();
  
  // Check authentication status on route load
  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthChecking(true);
      
      // If we have a token but no user, try to initialize auth
      if (token && !user) {
        console.log('Token exists but no user, reinitializing auth...');
        try {
          const result = await initializeAuth();
          if (result?.success) {
            console.log('Auth restored successfully in ProtectedRoute');
          } else if (authCheckCount < 2) {
            // Try one more time if first attempt fails
            console.log('First auth check failed, retrying...');
            setAuthCheckCount(count => count + 1);
          }
        } catch (error) {
          console.error('Failed to initialize auth in ProtectedRoute:', error);
        }
      } else if (!token) {
        console.log('No token available in ProtectedRoute');
      } else if (user) {
        console.log('User already authenticated in ProtectedRoute');
      }
      
      setIsAuthChecking(false);
    };
    
    // Only run the check if the store has been rehydrated from storage
    if (isRehydrated) {
      checkAuth();
    } else {
      // If not rehydrated yet, wait a bit and check again
      const timer = setTimeout(() => {
        setAuthCheckCount(count => count + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, token, initializeAuth, isRehydrated, authCheckCount]);

  if (loading || isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('Not authenticated, redirecting to login');
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
