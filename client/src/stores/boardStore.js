import { create } from 'zustand';
import axios from 'axios';

export const useBoardStore = create((set, get) => ({
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,

  // Keep track of recent requests to prevent infinite loops
  recentRequests: new Map(),
  REQUEST_TIMEOUT: 2000, // 2 seconds

  // Fetch all boards for the current user
  fetchBoards: async () => {
    try {
      set({ loading: true, error: null });
      
      // Log auth status for debugging
      console.log('Auth header present:', !!axios.defaults.headers.common['Authorization']);
      
      const response = await axios.get('/boards');
      
      // Extract boards array from response, ensuring we handle different response formats
      let boards = [];
      if (response.data && Array.isArray(response.data.data)) {
        boards = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        boards = response.data;
      }
      
      console.log('Fetched boards:', boards);
      
      set({ 
        boards, 
        loading: false,
        error: null 
      });
      
      return { success: true, boards };
    } catch (error) {
      console.error('Error fetching boards:', error);
      
      // Handle auth issues
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.error('Authentication issue when fetching boards');
        // Try to refresh the auth token
        const { useAuthStore } = await import('./authStore');
        await useAuthStore.getState().initializeAuth();
      }
      
      const errorMessage = error.response?.data?.message || 'Failed to fetch boards';
      set({ 
        loading: false, 
        error: errorMessage 
      });
      return { success: false, error: errorMessage };
    }
  },

  // Create a new board
  createBoard: async (title, description = '') => {
    try {
      set({ loading: true, error: null });
      
      const response = await axios.post('/boards', { title, description });
      const newBoard = response.data.data || response.data;
      
      set((state) => ({ 
        boards: [newBoard, ...state.boards],
        loading: false,
        error: null 
      }));
      
      return { success: true, board: newBoard };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create board';
      set({ 
        loading: false, 
        error: errorMessage 
      });
      return { success: false, error: errorMessage };
    }
  },

  // Get a specific board
  getBoard: async (boardId) => {
    // Check if we've recently made this exact request
    const requestKey = `board-${boardId}`;
    const now = Date.now();
    
    if (get().recentRequests.has(requestKey)) {
      const lastRequest = get().recentRequests.get(requestKey);
      if (now - lastRequest < get().REQUEST_TIMEOUT) {
        console.log('Throttling repeated board request');
        return { success: false, error: 'Request throttled to prevent infinite loop' };
      }
    }
    
    // Record this request time
    get().recentRequests.set(requestKey, now);
    
    // Clean up old requests
    for (const [key, timestamp] of get().recentRequests.entries()) {
      if (now - timestamp > get().REQUEST_TIMEOUT * 5) {
        get().recentRequests.delete(key);
      }
    }
    
  try {
    set({ loading: true, error: null });
    
    // Get auth state and log important details
    const { useAuthStore } = await import('./authStore');
    const { user, token } = useAuthStore.getState();
    
    console.log('Auth header present:', !!axios.defaults.headers.common['Authorization']);
    console.log('Attempting to fetch board:', boardId);
    console.log('User authenticated:', !!user, 'User ID:', user?.id);
    
    // Make the API request with proper error handling
    const response = await axios.get(`/boards/${boardId}`);
    
    // Extract board data from response
    let board;
    if (response.data && response.data.data) {
      board = response.data.data;
    } else if (response.data) {
      board = response.data;
    } else {
      throw new Error('Invalid response format');
    }
    
    console.log('Board fetched successfully:', board.title);
    
    set({ 
      currentBoard: board,
      loading: false,
      error: null 
    });
    
    return { success: true, board };
  } catch (error) {
    console.error('Error fetching board:', error);
    
    // Handle specific error cases
    if (error.response) {
      console.error(`Server error: ${error.response.status} - ${error.response.statusText}`);
      console.error('Error response data:', error.response.data);
      
      if (error.response.status === 403) {
        console.error('Authentication issue - 403 Forbidden');
        
        // Get more details about the current user and board
        try {
          const { useAuthStore } = await import('./authStore');
          const { user } = useAuthStore.getState();
          console.error('Current user ID:', user?.id);
          console.error('Attempted to access board:', boardId);
        } catch (e) {
          console.error('Failed to log auth details:', e);
        }
      }
    }
          let errorMessage = error.response?.data?.message || 'Failed to fetch board';
    let errorCode = error.response?.status;
    
    // Provide more helpful error messages
    if (errorCode === 403) {
      errorMessage = 'You do not have permission to access this whiteboard';
    } else if (errorCode === 404) {
      errorMessage = 'This whiteboard does not exist';
    } else if (errorCode === 401) {
      errorMessage = 'Authentication required to access this whiteboard';
    }
    
    set({ 
      loading: false, 
      error: errorMessage,
      currentBoard: null 
    });
    return { 
      success: false, 
      error: errorMessage,
      status: errorCode
    };
    }
  },

  // Update a board
  updateBoard: async (boardId, updates) => {
    try {
      set({ loading: true, error: null });
      
      const response = await axios.put(`/boards/${boardId}`, updates);
      const updatedBoard = response.data.data || response.data;
      
      set((state) => ({
        boards: state.boards.map(board => 
          board._id === boardId ? updatedBoard : board
        ),
        currentBoard: state.currentBoard?._id === boardId ? updatedBoard : state.currentBoard,
        loading: false,
        error: null
      }));
      
      return { success: true, board: updatedBoard };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update board';
      set({ 
        loading: false, 
        error: errorMessage 
      });
      return { success: false, error: errorMessage };
    }
  },

  // Delete a board
  deleteBoard: async (boardId) => {
    try {
      set({ loading: true, error: null });
      
      await axios.delete(`/boards/${boardId}`);
      
      set((state) => ({
        boards: state.boards.filter(board => board._id !== boardId),
        currentBoard: state.currentBoard?._id === boardId ? null : state.currentBoard,
        loading: false,
        error: null
      }));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete board';
      set({ 
        loading: false, 
        error: errorMessage 
      });
      return { success: false, error: errorMessage };
    }
  },

  // Share a board with users
  shareBoard: async (boardId, emails, permission = 'edit') => {
    try {
      set({ loading: true, error: null });
      
      const response = await axios.post(`/boards/${boardId}/share`, { 
        emails, 
        permission 
      });
      
      const updatedBoard = response.data;
      
      set((state) => ({
        boards: state.boards.map(board => 
          board._id === boardId ? updatedBoard : board
        ),
        currentBoard: state.currentBoard?._id === boardId ? updatedBoard : state.currentBoard,
        loading: false,
        error: null
      }));
      
      return { success: true, board: updatedBoard };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to share board';
      set({ 
        loading: false, 
        error: errorMessage 
      });
      return { success: false, error: errorMessage };
    }
  },

  // Check if a board exists and is accessible
  checkBoardAccess: async (boardId) => {
    try {
      console.log('Checking board access:', boardId);
      
      // Get the current auth state
      const { useAuthStore } = await import('./authStore');
      const { token, user } = useAuthStore.getState();
      
      console.log('Board access check - Auth state:', { 
        hasToken: !!token, 
        hasUser: !!user,
        userId: user?.id
      });
      
      if (!token) {
        console.error('No token available for board access check');
        return { success: false, error: 'Authentication required' };
      }
      
      // Ensure the token is set in headers
      useAuthStore.getState().setAuthToken(token);
      
      // Make a direct API request
      const response = await axios.get(`/boards/${boardId}`);
      
      console.log('Board access check - Success:', response.data);
      return { 
        success: true, 
        accessible: true,
        permissions: response.data.permissions,
        board: response.data.data
      };
    } catch (error) {
      console.error('Board access check failed:', error);
      
      if (error.response && error.response.status === 403) {
        return { success: true, accessible: false, error: 'Access denied' };
      }
      
      return { success: false, error: error.response?.data?.message || 'Failed to check board access' };
    }
  },

  // Clear current board
  clearCurrentBoard: () => set({ currentBoard: null }),

  // Clear errors
  clearError: () => set({ error: null }),
}));
