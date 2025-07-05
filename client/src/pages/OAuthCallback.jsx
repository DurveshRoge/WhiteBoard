import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { setAuthToken } = useAuthStore();

  useEffect(() => {
    const handleCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userStr = urlParams.get('user');
      const error = urlParams.get('error');

      if (error) {
        let errorMessage = 'Authentication failed';
        switch (error) {
          case 'oauth_failed':
            errorMessage = 'OAuth authentication failed';
            break;
          case 'google_failed':
            errorMessage = 'Google authentication failed';
            break;
          case 'facebook_failed':
            errorMessage = 'Facebook authentication failed';
            break;
          default:
            errorMessage = 'Authentication failed';
        }
        
        toast.error(errorMessage);
        navigate('/login');
        return;
      }

      if (token && userStr) {
        try {
          const user = JSON.parse(decodeURIComponent(userStr));
          
          // Store token and user using the auth store's set method
          useAuthStore.setState({ 
            user, 
            token, 
            loading: false, 
            error: null 
          });
          
          // Set token in axios headers
          setAuthToken(token);
          
          toast.success(`Welcome back, ${user.name}!`);
          navigate('/dashboard');
        } catch (error) {
          console.error('Error parsing OAuth callback data:', error);
          toast.error('Authentication data parsing failed');
          navigate('/login');
        }
      } else {
        toast.error('Invalid authentication response');
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, setAuthToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing authentication...</h2>
        <p className="text-gray-600">Please wait while we sign you in.</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
