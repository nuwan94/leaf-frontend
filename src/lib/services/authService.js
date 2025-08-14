import api from '@/lib/api';

// Role mapping for frontend to backend
const ROLE_MAPPING = {
  admin: 1,
  customer: 2,
  farmer: 3,
  'delivery-agent': 4,
};

// Auth API endpoints
export const authService = {
  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register user
  register: async (userData) => {
    // Transform frontend data to match backend API format
    const backendData = {
      email: userData.email,
      password: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName,
      address: userData.address,
      district_id: userData.district_id,
      role_id: ROLE_MAPPING[userData.role] || 1, // Default to customer if role not found
      ...(userData.phone && { phone: userData.phone }), // Add phone if provided
    };

    const response = await api.post('/auth/register', backendData);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      throw new Error('No user data found');
    }

    const user = JSON.parse(userData);
    if (!user.refresh_token) {
      throw new Error('No refresh token found');
    }

    const response = await api.post('/auth/refresh', {
      refresh_token: user.refresh_token,
    });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },
};

export default authService;
