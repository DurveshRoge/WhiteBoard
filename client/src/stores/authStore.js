import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Note: axios.defaults.baseURL is already configured in main.jsx
// We don't need to override it here

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      isRehydrated: false,
      initializationInProgress: false,
      lastRefreshAttempt: 0,

      // Set auth token in axios headers
      setAuthToken: (token) => {
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          delete axios.defaults.headers.common['Authorization'];
        }
      },

      // Refresh token or verify current session
      refreshSession: async () => {
        // Throttle refresh requests
        const now = Date.now();
        const lastRefresh = get().lastRefreshAttempt || 0;
        const REFRESH_COOLDOWN = 5000; // 5 seconds
        
        if (now - lastRefresh < REFRESH_COOLDOWN) {
          console.log(`Refresh attempt throttled (last attempt was ${now - lastRefresh}ms ago)`);
          return { success: false, throttled: true };
        }
        
        // Set last refresh timestamp
        set({ lastRefreshAttempt: now });
        
        try {
          const { token } = get();
          if (!token) return { success: false };
          
          // Ensure token is set in headers
          get().setAuthToken(token);
          
          console.log('Refreshing session with token');
          // Add timestamp to prevent caching issues
          const response = await axios.get('/api/auth/me', { 
            params: { _t: now } 
          });
          
          // Handle different response formats
          let userData = null;
          if (response.data && response.data.data) {
            userData = response.data.data;
          } else if (response.data && response.data.user) {
            userData = response.data.user;
          } else if (response.data && typeof response.data === 'object' && response.data.name) {
            userData = response.data;
          }
          
          if (userData) {
            console.log('Session refresh successful, user data:', userData.name || userData.email);
            set({ user: userData });
            return { success: true, user: userData };
          }
          
          console.warn('Session refresh response did not contain valid user data');
          return { success: false };
        } catch (error) {
          console.error('Failed to refresh session:', error);
          // Check if it's an auth error
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn('Authentication rejected by server during refresh');
            // Clear user but keep token for now - let explicit logout handle token
            set({ user: null });
          } else if (error.response && error.response.status === 429) {
            console.warn('Too many requests - rate limited');
            return { success: false, rateLimited: true };
          }
          return { success: false, error };
        }
      },
      
      // Login action
      login: async (email, password) => {
        try {
          set({ loading: true, error: null });
          
          const response = await axios.post('/api/auth/login', { email, password });
          const { token, user } = response.data;
          
          // Set token in axios headers
          get().setAuthToken(token);
          
          set({ 
            user, 
            token, 
            loading: false,
            error: null 
          });
          
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({ 
            loading: false, 
            error: errorMessage,
            user: null,
            token: null 
          });
          return { success: false, error: errorMessage };
        }
      },

      // Register action
      register: async (name, email, password) => {
        try {
          set({ loading: true, error: null });
          
          const response = await axios.post('/api/auth/register', { name, email, password });
          const { token, user } = response.data;
          
          // Set token in axios headers
          get().setAuthToken(token);
          
          set({ 
            user, 
            token, 
            loading: false,
            error: null 
          });
          
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Registration failed';
          set({ 
            loading: false, 
            error: errorMessage,
            user: null,
            token: null 
          });
          return { success: false, error: errorMessage };
        }
      },

      // Logout action
      logout: () => {
        get().setAuthToken(null);
        set({ 
          user: null, 
          token: null, 
          loading: false,
          error: null 
        });
      },

      // Check if user is authenticated
      isAuthenticated: () => {
        return !!get().token && !!get().user;
      },

      // Initialize auth state (check token on app start)
      initializeAuth: async () => {
        const { token, user, isRehydrated, initializationInProgress } = get();
        
        // Prevent multiple simultaneous initialization attempts
        if (initializationInProgress) {
          console.log('Auth initialization already in progress, skipping');
          return { success: false, alreadyRunning: true };
        }
        
        try {
          // Mark initialization as in progress
          set({ initializationInProgress: true });
          
          if (token) {
            console.log('Found stored token, attempting to restore session');
            
            // Always set the token in axios headers when we have one
            get().setAuthToken(token);
            
            // If we already have a user, we can consider ourselves authenticated immediately
            if (user) {
              console.log('User already in state, considering authenticated');
              
              // Only do background refresh if not rate limited recently
              const now = Date.now();
              const lastRefresh = get().lastRefreshAttempt || 0;
              const REFRESH_COOLDOWN = 10000; // 10 seconds
              
              if (now - lastRefresh > REFRESH_COOLDOWN) {
                // Try a background refresh but don't wait for it
                get().refreshSession().catch(err => console.warn('Background refresh failed:', err));
              }
              
              return { success: true, user };
            }
            
            // If we don't have a user but have a token, try to refresh the session
            console.log('No user in state but token exists, refreshing session');
            try {
              const result = await get().refreshSession();
              
              if (result.success) {
                console.log('Authentication restored from stored session');
                return { success: true, user: get().user };
              } else if (result.throttled || result.rateLimited) {
                console.log('Session refresh throttled or rate limited');
                // Return success if we have a token, even if refresh was throttled
                return { success: !!token, throttled: true };
              } else {
                console.log('Stored token is invalid, logging out');
                get().logout();
                return { success: false };
              }
            } catch (error) {
              console.error('Error refreshing session:', error);
              // Don't logout immediately on network errors, might just be temporary
              if (error.response) {
                // Only logout on actual auth rejection from server
                if (error.response.status === 401 || error.response.status === 403) {
                  get().logout();
                }
              }
              return { success: false, error };
            }
          } else {
            console.log('No stored authentication token found');
            return { success: false };
          }
        } finally {
          // Always mark initialization as complete
          set({ initializationInProgress: false });
        }
      },

      // Clear errors
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }),
      onRehydrateStorage: () => (state) => {
        console.log('Auth store rehydrated from persistence');
        if (state) {
          // Set the rehydrated flag
          state.isRehydrated = true;
          
          // Set auth token if we have one
          if (state.token) {
            state.setAuthToken(state.token);
            console.log('Auth token restored from storage');
          }
        }
      },
    }
  )
);

// Function to properly initialize the auth store
const initializeAuthStore = () => {
  console.log('Initializing auth store on application load');
  
  // Get the current auth state
  const state = useAuthStore.getState();
  const { token } = state;
  
  // Set token in axios if we have one, regardless of initialization
  if (token) {
    state.setAuthToken(token);
    console.log('Auth token set from storage');
  }
  
  // Mark as rehydrated to indicate the store is ready
  if (!state.isRehydrated) {
    useAuthStore.setState({ isRehydrated: true });
  }
};

// Initialize immediately for first load - but only set token, don't run full auth
initializeAuthStore();

// Also initialize after storage changes
// This helps handle when localStorage becomes available after the initial load
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'auth-storage') {
      console.log('Auth storage changed, reinitializing');
      initializeAuthStore();
    }
  });
}
