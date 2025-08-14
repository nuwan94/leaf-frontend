import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});


// Request interceptor to add only locale header
api.interceptors.request.use(
  (config) => {
    config.headers['X-Locale-Language'] = localStorage.getItem('user-language') || 'en';
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling (no token refresh)
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
