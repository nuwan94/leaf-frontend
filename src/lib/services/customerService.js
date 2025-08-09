import api from '@/lib/api';

// Customer-specific API endpoints
export const customerService = {
  // Get customer dashboard data
  getDashboard: async () => {
    const response = await api.get('/customer/dashboard');
    return response.data;
  },

  // Product browsing - Fixed to use general products API
  getProducts: async (filters = {}) => {
    const response = await api.get('/products', { params: filters });
    return response.data;
  },

  getProduct: async (productId) => {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  },

  searchProducts: async (query, filters = {}) => {
    const response = await api.get('/products', {
      params: { name: query, ...filters }
    });
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/products/categories');
    return response.data;
  },

  getBrands: async () => {
    const response = await api.get('/products/brands');
    return response.data;
  },

  // Cart management
  getCart: async () => {
    const response = await api.get('/customer/cart');
    return response.data;
  },

  addToCart: async (productId, quantity) => {
    const response = await api.post('/customer/cart/items', { productId, quantity });
    return response.data;
  },

  updateCartItem: async (itemId, quantity) => {
    const response = await api.put(`/customer/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (itemId) => {
    const response = await api.delete(`/customer/cart/items/${itemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete('/customer/cart');
    return response.data;
  },

  // Order management
  getOrders: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/customer/orders', { params });
    return response.data;
  },

  getOrder: async (orderId) => {
    const response = await api.get(`/customer/orders/${orderId}`);
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await api.post('/customer/orders', orderData);
    return response.data;
  },

  cancelOrder: async (orderId) => {
    const response = await api.put(`/customer/orders/${orderId}/cancel`);
    return response.data;
  },

  // Wishlist
  getWishlist: async () => {
    const response = await api.get('/customer/wishlist');
    return response.data;
  },

  addToWishlist: async (productId) => {
    const response = await api.post('/customer/wishlist/items', { productId });
    return response.data;
  },

  removeFromWishlist: async (productId) => {
    const response = await api.delete(`/customer/wishlist/items/${productId}`);
    return response.data;
  },

  // Reviews
  getProductReviews: async (productId) => {
    const response = await api.get(`/customer/products/${productId}/reviews`);
    return response.data;
  },

  createReview: async (productId, reviewData) => {
    const response = await api.post(`/customer/products/${productId}/reviews`, reviewData);
    return response.data;
  },
};

export default customerService;
