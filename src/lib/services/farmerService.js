import api from '@/lib/api';
import { getCurrentUser } from '@/lib/token-utils';

// Helper function to get current farmer ID
const getCurrentFarmerId = () => {
  const user = getCurrentUser();
  return user?.id || user?.farmer_id;
};

// Farmer-specific API endpoints
export const farmerService = {
  // Get Farmer Profile
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

  // Create Profile
  createProfile: async (profileData, farmerId = null) => {
    const id = farmerId || getCurrentFarmerId();
    if (!id) {
      throw new Error('Farmer ID is required');
    }
    const response = await api.post(`/farmer/${id}/profile`, profileData);
    return response.data;
  },

  // Get Farmer Products
  getProducts: async (farmerId = null) => {
    const id = farmerId || getCurrentFarmerId();
    if (!id) {
      throw new Error('Farmer ID is required');
    }
    const response = await api.get(`/farmer/${id}/products`);
    return response.data;
  },

  // Add Farmer Product
  addProduct: async (productData, farmerId = null) => {
    const id = farmerId || getCurrentFarmerId();
    if (!id) {
      throw new Error('Farmer ID is required');
    }
    const response = await api.post(`/farmer/${id}/products`, productData);
    return response.data;
  },

  // Delete Farmer Product
  deleteProduct: async (productId, farmerId = null) => {
    const id = farmerId || getCurrentFarmerId();
    if (!id) {
      throw new Error('Farmer ID is required');
    }
    if (!productId) {
      throw new Error('Product ID is required');
    }
    const response = await api.delete(`/farmer/${id}/products/${productId}`);
    return response.data;
  },

  // Update Farmer Product Inventory
  updateInventory: async (productId, inventoryData, farmerId = null) => {
    const id = farmerId || getCurrentFarmerId();
    if (!id) {
      throw new Error('Farmer ID is required');
    }
    if (!productId) {
      throw new Error('Product ID is required');
    }
    const response = await api.put(`/farmer/${id}/inventory/${productId}`, inventoryData);
    return response.data;
  },
};

export default farmerService;
