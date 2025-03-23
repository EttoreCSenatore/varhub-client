import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

// Mock user for offline mode
const MOCK_USER = {
  id: 'offline-user-1',
  name: 'Offline User',
  email: 'user@offline.mode',
  role: 'user',
};

// Create context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUserLoggedIn = () => {
      // Check if we're in offline mode
      const offlineMode = localStorage.getItem('useMockData') === 'true';
      setIsOfflineMode(offlineMode);
      
      // In offline mode, automatically log in with mock user
      if (offlineMode) {
        const mockToken = 'mock-jwt-token-for-offline-mode';
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(MOCK_USER));
        setCurrentUser(MOCK_USER);
        setLoading(false);
        console.log('Logged in with offline mode user');
        return;
      }
      
      // Regular online login check
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        try {
          setCurrentUser(JSON.parse(user));
        } catch (error) {
          console.error('Error parsing user data:', error);
          logout(); // Logout if user data is corrupt
        }
      }
      
      setLoading(false);
    };
    
    checkUserLoggedIn();
  }, []);

  // Login function
  const login = async (email, password) => {
    // Check if we should enter offline mode
    const offlineMode = localStorage.getItem('useMockData') === 'true';
    
    // Handle offline mode login automatically
    if (offlineMode) {
      console.log('Offline mode active - using mock login');
      const mockToken = 'mock-jwt-token-for-offline-mode';
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(MOCK_USER));
      setCurrentUser(MOCK_USER);
      return { success: true, isOfflineMode: true };
    }

    try {
      setLoading(true);
      const response = await api.post('/api/auth/login', { email, password });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setCurrentUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Check if we should switch to offline mode due to API error
      if (error.useOfflineMode || error.message?.includes('CORS') || error.message?.includes('Network Error')) {
        console.log('Login failed due to API connectivity issues - switching to offline mode');
        
        // Enable offline mode
        localStorage.setItem('useMockData', 'true');
        localStorage.setItem('autoOfflineMode', 'true');
        
        // Set up mock user
        const mockToken = 'mock-jwt-token-for-offline-mode';
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(MOCK_USER));
        setCurrentUser(MOCK_USER);
        
        return { 
          success: true, 
          isOfflineMode: true,
          message: 'Logged in using offline mode due to server connectivity issues.'
        };
      }
      
      let errorMessage = 'An unexpected error occurred';
      
      if (error.response) {
        errorMessage = error.response.data.message || 'Login failed';
      } else if (error.request) {
        errorMessage = 'Unable to connect to the server. Would you like to use offline mode?';
      }
      
      return { 
        success: false, 
        message: errorMessage,
        canUseOfflineMode: true 
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name, email, password) => {
    // Check if we should enter offline mode
    const offlineMode = localStorage.getItem('useMockData') === 'true';
    
    // Handle offline mode registration automatically
    if (offlineMode) {
      console.log('Offline mode active - using mock registration');
      
      // Create a customized mock user with the provided name and email
      const customMockUser = {
        ...MOCK_USER,
        name: name,
        email: email
      };
      
      const mockToken = 'mock-jwt-token-for-offline-mode';
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(customMockUser));
      setCurrentUser(customMockUser);
      return { success: true, isOfflineMode: true };
    }

    try {
      setLoading(true);
      const response = await api.post('/api/auth/register', { name, email, password });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setCurrentUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Check if we should switch to offline mode due to API error
      if (error.useOfflineMode || error.message?.includes('CORS') || error.message?.includes('Network Error')) {
        console.log('Registration failed due to API connectivity issues - switching to offline mode');
        
        // Enable offline mode
        localStorage.setItem('useMockData', 'true');
        localStorage.setItem('autoOfflineMode', 'true');
        
        // Create a customized mock user with the provided name and email
        const customMockUser = {
          ...MOCK_USER,
          name: name,
          email: email
        };
        
        // Set up mock user
        const mockToken = 'mock-jwt-token-for-offline-mode';
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(customMockUser));
        setCurrentUser(customMockUser);
        
        return { 
          success: true, 
          isOfflineMode: true,
          message: 'Registered using offline mode due to server connectivity issues.'
        };
      }
      
      let errorMessage = 'An unexpected error occurred';
      
      if (error.response) {
        errorMessage = error.response.data.message || 'Registration failed';
      } else if (error.request) {
        errorMessage = 'Unable to connect to the server. Would you like to use offline mode?';
      }
      
      return { 
        success: false, 
        message: errorMessage,
        canUseOfflineMode: true 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    navigate('/');
  };

  // Toggle offline mode
  const toggleOfflineMode = () => {
    const newOfflineMode = !isOfflineMode;
    setIsOfflineMode(newOfflineMode);
    
    if (newOfflineMode) {
      localStorage.setItem('useMockData', 'true');
      
      // Set up mock user if not already logged in
      if (!currentUser) {
        const mockToken = 'mock-jwt-token-for-offline-mode';
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(MOCK_USER));
        setCurrentUser(MOCK_USER);
      }
    } else {
      localStorage.removeItem('useMockData');
      localStorage.removeItem('autoOfflineMode');
      
      // If using mock user, log them out
      if (currentUser && currentUser.id === MOCK_USER.id) {
        logout();
      }
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
    isOfflineMode,
    toggleOfflineMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext; 