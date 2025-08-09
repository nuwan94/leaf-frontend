import api from '@/lib/api';

// Farmer-specific API endpoints
export const farmerService = {
  // Get farmer dashboard data
  getDashboard: async () => {
    const response = await api.get('/farmer/dashboard');
    return response.data;
  },

  // Product management
  getProducts: async (filters = {}) => {
    const response = await api.get('/farmer/products', { params: filters });
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/farmer/products', productData);
    return response.data;
  },

  updateProduct: async (productId, productData) => {
    const response = await api.put(`/farmer/products/${productId}`, productData);
    return response.data;
  },

  deleteProduct: async (productId) => {
    const response = await api.delete(`/farmer/products/${productId}`);
    return response.data;
  },

  // Order management
  getOrders: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/farmer/orders', { params });
    return response.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/farmer/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Farm management
  getFarmInfo: async () => {
    const response = await api.get('/farmer/farm');
    return response.data;
  },

  updateFarmInfo: async (farmData) => {
    const response = await api.put('/farmer/farm', farmData);
    return response.data;
  },

  // Analytics
  getAnalytics: async (period = '30d') => {
    const response = await api.get('/farmer/analytics', { params: { period } });
    return response.data;
  },
};

export default farmerService;
