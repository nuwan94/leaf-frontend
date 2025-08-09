import api from '@/lib/api';

// User profile and management API endpoints
export const userService = {
  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  },

  // Upload profile picture
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/user/change-password', passwordData);
    return response.data;
  },

  // Get user preferences
  getPreferences: async () => {
    const response = await api.get('/user/preferences');
    return response.data;
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    const response = await api.put('/user/preferences', preferences);
    return response.data;
  },

  // Delete user account
  deleteAccount: async () => {
    const response = await api.delete('/user/account');
    return response.data;
  },
};

export default userService;
