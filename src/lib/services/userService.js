import api from '@/lib/api';

// User profile API endpoints matching the backend specifications
export const userService = {
  // Get current user profile - GET /api/profile
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  // Update user profile - PUT /api/profile
  updateProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);
    return response.data;
  },

  // Change password - POST /api/profile/change-password
  changePassword: async (passwordData) => {
    const response = await api.post('/profile/change-password', passwordData);
    return response.data;
  },

  // Delete/Deactivate account - DELETE /api/profile
  deleteAccount: async (password) => {
    const response = await api.delete('/profile', {
      data: { password }
    });
    return response.data;
  },
};

export default userService;
