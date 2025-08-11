import api from '@/lib/api';
import { getCurrentUser } from '@/lib/token-utils';

// Helper function to get current farmer ID
const getCurrentFarmerId = () => {
  const user = getCurrentUser();
  return user?.id || user?.farmer_id;
};

// Farmer-specific API endpoints
export const farmerService = {
  // Profile Management
  getProfile: async (farmerId = null) => {
    const id = farmerId || getCurrentFarmerId();
    if (!id) {
      throw new Error('Farmer ID is required');
    }
    const response = await api.get(`/farmer/${id}/profile`);
    return response.data;
  },

  // Update Profile
  updateProfile: async (profileData, farmerId = null) => {
    const id = farmerId || getCurrentFarmerId();
    if (!id) {
      throw new Error('Farmer ID is required');
    }
    const response = await api.put(`/farmer/${id}/profile`, profileData);
    return response.data;
  },
};

export default farmerService;
