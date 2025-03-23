import axios from 'axios';

// Create axios instance with base config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Check if the error is related to a network issue
    if (error.message === 'Network Error') {
      console.error('Network error detected. Server might be down.');
    }
    
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to login. Please try again.'
    };
  }
};

export const register = async (name, email, password) => {
  try {
    const response = await api.post('/auth/register', { name, email, password });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to register. Please try again.'
    };
  }
};

export const getProjects = async () => {
  try {
    const response = await api.get('/projects');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get projects error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch projects.'
    };
  }
};

export const getProjectById = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get project error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch project details.'
    };
  }
};

export default api;
