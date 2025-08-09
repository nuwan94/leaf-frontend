import api from '@/lib/api';

// Admin-specific API endpoints
export const adminService = {
  // Dashboard and analytics
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getSystemMetrics: async (period = '30d') => {
    const response = await api.get('/admin/metrics', { params: { period } });
    return response.data;
  },

  // User management
  getUsers: async (filters = {}) => {
    const response = await api.get('/admin/users', { params: filters });
    return response.data;
  },

  getUser: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deactivateUser: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/deactivate`);
    return response.data;
  },

  activateUser: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/activate`);
    return response.data;
  },

  // Product management
  getAllProducts: async (filters = {}) => {
    const response = await api.get('/admin/products', { params: filters });
    return response.data;
  },

  approveProduct: async (productId) => {
    const response = await api.put(`/admin/products/${productId}/approve`);
    return response.data;
  },

  rejectProduct: async (productId, reason) => {
    const response = await api.put(`/admin/products/${productId}/reject`, { reason });
    return response.data;
  },

  // Order management
  getAllOrders: async (filters = {}) => {
    const response = await api.get('/admin/orders', { params: filters });
    return response.data;
  },

  getOrderDetails: async (orderId) => {
    const response = await api.get(`/admin/orders/${orderId}`);
    return response.data;
  },

  // Delivery management
  getDeliveryAgents: async (filters = {}) => {
    const response = await api.get('/admin/delivery-agents', { params: filters });
    return response.data;
  },

  assignDelivery: async (orderId, agentId) => {
    const response = await api.post('/admin/deliveries/assign', { orderId, agentId });
    return response.data;
  },

  // System configuration
  getSystemSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateSystemSettings: async (settings) => {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  },

  // Reports
  generateReport: async (reportType, filters = {}) => {
    const response = await api.post('/admin/reports/generate', {
      type: reportType,
      filters,
    });
    return response.data;
  },

  downloadReport: async (reportId) => {
    const response = await api.get(`/admin/reports/${reportId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default adminService;
