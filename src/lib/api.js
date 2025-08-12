import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to track if token refresh is in progress
let isRefreshing = false;
// Queue to store failed requests while refreshing token
let failedQueue = [];

// Process the queue after token refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get user data from localStorage (following the project's pattern)
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Skip token refresh for login/register endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/register');

    // Handle token expiration (401 Unauthorized) - but skip for auth endpoints
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // If token refresh is already in progress, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          throw new Error('No user data found');
        }

        const user = JSON.parse(userData);
        if (!user.refresh_token) {
          throw new Error('No refresh token found');
        }

        // Attempt to refresh the token
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refresh_token: user.refresh_token
        });

        const newAccessToken = response.data.data.access_token;
        const newRefreshToken = response.data.data.refresh_token;

        // Update user data in localStorage with new tokens
        const updatedUser = {
          ...user,
          token: newAccessToken,
          refresh_token: newRefreshToken
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Update the authorization header for the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Process the queue with the new token
        processQueue(null, newAccessToken);

        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        // Process queue with error
        processQueue(refreshError, null);

        // Clear user data and redirect to login
        localStorage.removeItem('user');
        window.location.href = '/login';

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For all other errors or auth endpoint errors, just reject
    return Promise.reject(error);
  }
);

export default api;
