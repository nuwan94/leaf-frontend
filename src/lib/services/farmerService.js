import api from '@/lib/api';


// Farmer-specific API endpoints
export const farmerService = {
  // Get Orders for Farmer
  getOrders: async (farmerId, user) => {
    // user must be passed from a component using useAuth
    const id = farmerId || user?.id || user?.farmer_id;
    if (!id) {
      throw new Error('Farmer ID is required');
    }
    // Assumes backend endpoint: /farmer/:id/orders
    const response = await api.get(`/farmer/${id}/orders`);
    return response.data;
  },
  // Get Farmer Profile
  getFarmDetails: async (farmerId) => {
    if (!farmerId) throw new Error('Farmer ID is required');
    const response = await api.get(`/farmer/${farmerId}/detail`);
    return response.data;
  },

  // Update Profile
  updateFarmDetails: async (profileData, farmerId) => {
    if (!farmerId) throw new Error('Farmer ID is required');
    const response = await api.put(`/farmer/${farmerId}/detail`, profileData);
    return response.data;
  },

  // Create Profile
  createFarmDetails: async (profileData, farmerId) => {
    if (!farmerId) throw new Error('Farmer ID is required');
    const response = await api.post(`/farmer/${farmerId}/detail`, profileData);
    return response.data;
  },

  // Get Farmer Products
  getProducts: async ({ farmerId, page = 1, limit = 10, filters = {} } = {}) => {
    if (!farmerId) throw new Error('Farmer ID is required');
    const params = { page, limit, ...filters };
    const response = await api.get(`/farmer/${farmerId}/products`, { params });
    return response.data;
  },

  // Add Farmer Product
  addProduct: async (productData, farmerId) => {
    if (!farmerId) throw new Error('Farmer ID is required');
    const response = await api.post(`/farmer/${farmerId}/products`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete Farmer Product
  deleteProduct: async (productId, farmerId) => {
    if (!farmerId) throw new Error('Farmer ID is required');
    if (!productId) throw new Error('Product ID is required');
    const response = await api.delete(`/farmer/${farmerId}/products/${productId}`);
    return response.data;
  },

  // Update Farmer Product Inventory
  updateInventory: async (productId, inventoryData, farmerId) => {
    if (!farmerId) throw new Error('Farmer ID is required');
    if (!productId) throw new Error('Product ID is required');
    const response = await api.put(`/farmer/${farmerId}/inventory/${productId}`, inventoryData);
    return response.data;
  },

  // Update Farmer Product Price
  updateProduct: async (productId, productData, farmerId) => {
    if (!farmerId) throw new Error('Farmer ID is required');
    if (!productId) throw new Error('Product ID is required');
    // Handle FormData for image uploads
    const response = await api.post(`/farmer/${farmerId}/products/${productId}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get Farmer Stats
  getFarmerStats: async (farmerId) => {
    if (!farmerId) throw new Error('Farmer ID is required');
    const response = await api.get(`/farmer/${farmerId}/stats`);
    return response.data;
  },
};

export default farmerService;
