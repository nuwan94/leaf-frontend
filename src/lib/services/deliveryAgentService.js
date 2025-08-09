import api from '@/lib/api';

// Delivery Agent-specific API endpoints
export const deliveryAgentService = {
  // Get delivery agent dashboard data
  getDashboard: async () => {
    const response = await api.get('/delivery-agent/dashboard');
    return response.data;
  },

  // Delivery management
  getAssignedDeliveries: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/delivery-agent/deliveries', { params });
    return response.data;
  },

  getDelivery: async (deliveryId) => {
    const response = await api.get(`/delivery-agent/deliveries/${deliveryId}`);
    return response.data;
  },

  updateDeliveryStatus: async (deliveryId, status, notes = '') => {
    const response = await api.put(`/delivery-agent/deliveries/${deliveryId}/status`, {
      status,
      notes,
    });
    return response.data;
  },

  // Location tracking
  updateLocation: async (latitude, longitude) => {
    const response = await api.put('/delivery-agent/location', {
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
    });
    return response.data;
  },

  // Availability management
  updateAvailability: async (isAvailable) => {
    const response = await api.put('/delivery-agent/availability', { isAvailable });
    return response.data;
  },

  getAvailability: async () => {
    const response = await api.get('/delivery-agent/availability');
    return response.data;
  },

  // Route optimization
  getOptimizedRoute: async (deliveryIds) => {
    const response = await api.post('/delivery-agent/route/optimize', { deliveryIds });
    return response.data;
  },

  // Performance metrics
  getPerformanceMetrics: async (period = '30d') => {
    const response = await api.get('/delivery-agent/metrics', { params: { period } });
    return response.data;
  },

  // Proof of delivery
  uploadProofOfDelivery: async (deliveryId, file, notes = '') => {
    const formData = new FormData();
    formData.append('proof', file);
    formData.append('notes', notes);
    const response = await api.post(`/delivery-agent/deliveries/${deliveryId}/proof`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default deliveryAgentService;
