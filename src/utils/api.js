import axios from 'axios';

// Empty by default: requests go to the same origin (the Vite dev server proxies /api to the backend).
// In production set VITE_API_URL to the API's address.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export const TOKEN_KEY = 'varhub.token';

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    /* storage unavailable (private mode): continue anonymously */
  }
  return config;
});

// Human-readable message from any axios error.
export const errorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ECONNABORTED') return 'The server took too long to answer.';
  if (error?.request && !error.response) return 'Unable to reach the server. Check your connection.';
  return fallback;
};

// Fire-and-forget analytics. Never blocks or breaks the UI.
export const track = (action, projectId = null) => {
  api.post('/api/events', { action, projectId }).catch(() => {});
};

export default api;
