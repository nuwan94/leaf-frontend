import api from '@/lib/api';

const orderService = {
  // Place a new order
  async createOrder(orderData) {
    return api.post('/orders', orderData);
  },

  // Get a single order by ID
  async getOrder(orderId) {
    return api.get(`/orders/${orderId}`);
  },

  // List orders for a customer
  async listOrders(customerId) {
    return api.get('/orders', { params: { customer_id: customerId } });
  },
};

export default orderService;
