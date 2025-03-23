import axios from 'axios';

// Get API URL based on environment
const getApiUrl = () => {
  // Check if we're in the Vercel production environment
  if (window.location.hostname === 'varhub-client.vercel.app') {
    return 'https://varhub-server.vercel.app'; // Production API URL
  }
  
  // Otherwise use environment variable or fallback to localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

const API_URL = getApiUrl();
console.log('API URL:', API_URL); // For debugging, can be removed later

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
