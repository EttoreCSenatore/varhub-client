import axios from 'axios';

// Sample mock data for offline mode
const MOCK_DATA = {
  '/api/projects': [
    {
      id: 'mock-1',
      name: 'Solar System VR Tour',
      description: 'Explore the solar system in immersive 360° virtual reality.',
      thumbnail_url: 'https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      vr_video_url: 'https://cdn.aframe.io/360-video-boilerplate/video/city.mp4',
      model_url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF/Duck.gltf',
      created_at: new Date().toISOString()
    },
    {
      id: 'mock-2',
      name: 'Underwater Exploration',
      description: 'Dive into the depths of the ocean with this stunning VR experience.',
      thumbnail_url: 'https://images.unsplash.com/photo-1682686580391-8ace8709092a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      vr_video_url: 'https://cdn.aframe.io/360-video-sample/video/raccoon.mp4',
      model_url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF/Box.gltf',
      created_at: new Date().toISOString()
    }
  ],
  // Add other endpoints as needed
};

// Check if we should use mock data (offline mode)
const useOfflineMode = () => {
  return localStorage.getItem('useMockData') === 'true';
};

// Check if we should use an alternative API endpoint
const shouldUseAlternativeApi = () => {
  return localStorage.getItem('useAlternativeApi') === 'true';
};

// Get API URL based on environment
const getApiUrl = () => {
  // Check if we're in offline mode
  if (useOfflineMode()) {
    console.log('Using offline mode - API calls will use mock data');
    return 'offline';
  }
  
  // Check if we should use an alternative API
  if (shouldUseAlternativeApi()) {
    console.log('Using alternative API endpoint');
    return 'https://varhub-server-backup.vercel.app';
  }
  
  // Check if we're in development mode
  const isDevelopment = import.meta.env.MODE === 'development';
  
  // Check if we're in the Vercel production environment
  const hostname = window.location.hostname;
  const isVercel = hostname === 'varhub-client.vercel.app' || hostname.includes('vercel.app');
  
  // In development, use the proxy defined in vite.config.js
  if (isDevelopment) {
    console.log('Using development proxy for API requests');
    return ''; // Empty string will use the proxy
  }
  
  // In production on Vercel
  if (isVercel) {
    return 'https://varhub-server.vercel.app';
  }
  
  // Otherwise use environment variable or fallback to localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

const API_URL = getApiUrl();
console.log('API URL:', API_URL); // For debugging, can be removed later

// Create a custom adapter for offline mode
const offlineModeAdapter = (config) => {
  return new Promise((resolve) => {
    console.log('Using offline mode adapter for:', config.url);
    
    // Small delay to simulate network
    setTimeout(() => {
      // Extract the endpoint path
      const url = config.url || '';
      
      // Check if we have mock data for this endpoint
      if (MOCK_DATA[url]) {
        resolve({
          data: MOCK_DATA[url],
          status: 200,
          statusText: 'OK (Mocked)',
          headers: {},
          config,
        });
      } else {
        // If no specific mock data, return a generic success
        resolve({
          data: { success: true, message: 'Mock data response' },
          status: 200,
          statusText: 'OK (Mocked)',
          headers: {},
          config,
        });
      }
    }, 500); // 500ms delay
  });
};

// Create axios instance with improved CORS handling
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable withCredentials for cross-origin requests when not in offline mode
  withCredentials: API_URL !== 'offline',
  // Reduce timeout to fail faster for better user experience
  timeout: 8000,
});

// Check if we're in offline mode and use the mock adapter
if (API_URL === 'offline') {
  // Override the adapter to use our offline mock
  api.defaults.adapter = offlineModeAdapter;
}

// Direct access to the underlying XMLHttpRequest
api.interceptors.request.use(config => {
  // Don't override adapter if we're in offline mode
  if (API_URL === 'offline') {
    return config;
  }
  
  // Configure the XMLHttpRequest for better error handling
  config.adapter = config => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Track if the request completed
      let requestCompleted = false;
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          requestCompleted = true;
          
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = {
              data: JSON.parse(xhr.responseText),
              status: xhr.status,
              statusText: xhr.statusText,
              headers: xhr.getAllResponseHeaders(),
              config: config,
              request: xhr
            };
            resolve(response);
          } else {
            reject(new Error(`Request failed with status code ${xhr.status}`));
          }
        }
      };
      
      xhr.onerror = function() {
        console.error('XHR Error:', xhr);
        reject(new Error('Network Error: No response received from server'));
      };
      
      xhr.ontimeout = function() {
        reject(new Error('Request timeout: Server did not respond in time'));
      };
      
      xhr.open(config.method.toUpperCase(), config.baseURL + config.url, true);
      
      // Set headers
      if (config.headers) {
        Object.keys(config.headers).forEach(key => {
          xhr.setRequestHeader(key, config.headers[key]);
        });
      }
      
      // Crucial for CORS requests with credentials
      xhr.withCredentials = true;
      
      // Set timeout
      xhr.timeout = config.timeout;
      
      // Send the request
      xhr.send(config.data ? JSON.stringify(config.data) : null);
      
      // Check if request is completed after 5 seconds
      setTimeout(() => {
        if (!requestCompleted) {
          console.warn('Request has not completed after 5 seconds');
        }
      }, 5000);
    });
  };
  
  return config;
});

// Request interceptor: Add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log the request in development mode
    if (import.meta.env.MODE === 'development') {
      console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, config);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Custom function to help diagnose CORS issues
const debugCorsIssue = (url, error) => {
  console.group('CORS Issue Debugging');
  console.error(`CORS error detected on request to: ${url}`);
  console.log('Error details:', error);
  
  // Check the request URL against allowed origins
  const clientOrigin = window.location.origin;
  console.log('Client origin:', clientOrigin);
  console.log('API URL being accessed:', url);
  
  // Log which browsers handle CORS better
  console.log('Browser compatibility note: If you\'re having CORS issues, Firefox and Safari sometimes handle CORS differently than Chrome.');
  
  // Suggest using offline mode
  console.log('Suggestion: Try enabling offline mode by using the following command in the console:');
  console.log('localStorage.setItem("useMockData", "true"); localStorage.setItem("autoOfflineMode", "true"); window.location.reload();');
  
  // Suggestion for developers
  console.log('For developers: Ensure the server has proper CORS headers for', clientOrigin);
  console.groupEnd();
  
  // You can also track these errors to your analytics
  try {
    // Send to your error tracking service if available
    // e.g. Sentry, LogRocket, etc.
  } catch (e) {
    // Ignore tracking errors
  }
};

// Response interceptor: Handle common errors
api.interceptors.response.use(
  (response) => {
    // Log the response in development mode
    if (import.meta.env.MODE === 'development') {
      console.log(`API Response: ${response.status} ${response.config.url}`, response);
    }
    return response;
  },
  (error) => {
    // Detailed logging for all API errors
    if (error.config) {
      console.group(`API Error for ${error.config.method?.toUpperCase() || 'Unknown'} ${error.config.url || 'Unknown URL'}`);
      console.error('Error:', error.message);
      console.log('Status:', error.response?.status);
      console.log('Status text:', error.response?.statusText);
      console.log('Headers:', error.response?.headers);
      console.log('Request config:', {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers,
        baseURL: error.config.baseURL,
        withCredentials: error.config.withCredentials
      });
      console.groupEnd();
    }
    
    // Handle CORS errors specifically - these typically return a status of 0
    if (error.response && error.response.status === 0) {
      debugCorsIssue(error.config?.url, error);
      
      // If this is a login endpoint, show a specific message
      if (error.config.url.includes('/api/auth/login')) {
        console.error('Login failed due to CORS issue - switching to offline mode');
        localStorage.setItem('useMockData', 'true');
        localStorage.setItem('autoOfflineMode', 'true');
        error.useOfflineMode = true;
        
        // Provide a more helpful error message
        error.message = 'Login failed due to cross-origin restrictions. Switching to offline mode.';
        
        // Trigger a page reload after a short delay
        setTimeout(() => {
          window.location.href = '/'; // Redirect to home page
        }, 500);
      }
    }
    
    // Handle generic failed to load resource error
    if (error.message && error.message.includes('net::ERR_FAILED')) {
      console.error('Resource failed to load (net::ERR_FAILED):', error);
      debugCorsIssue(error.config?.url, error);
      
      // Always switch to offline mode for net::ERR_FAILED errors
      console.log('Critical API endpoint failed, switching to offline mode automatically');
      localStorage.setItem('useMockData', 'true');
      
      // Add a flag to show a message to the user about automatic offline mode
      localStorage.setItem('autoOfflineMode', 'true');
      
      // Instead of reloading immediately, let the caller handle the error
      error.useOfflineMode = true;
    }
    
    // Handle CORS errors specifically
    if (error.message && error.message.includes('Network Error')) {
      console.error('Network or CORS error:', error);
      debugCorsIssue(error.config?.url, error);
      
      // Log more details about the request
      const requestInfo = {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers,
      };
      console.log('Request that caused the error:', requestInfo);
      
      // Switch to offline mode for CORS errors
      localStorage.setItem('useMockData', 'true');
      localStorage.setItem('autoOfflineMode', 'true');
      error.useOfflineMode = true;
      
      // Trigger page reload for auth-related endpoints
      if (error.config?.url?.includes('/auth/')) {
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
