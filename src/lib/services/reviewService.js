import api from '@/lib/api';

export const reviewService = {
  // Update a review by id
  updateReview: async (reviewId, review) => {
    const response = await api.put(`/reviews/${reviewId}`, review);
    return response.data;
  },
  // Get reviews for a product
  getProductReviews: async (productId) => {
    const response = await api.get(`/products/${productId}/reviews`);
    return response.data;
  },
  // Add a review for a product
  addProductReview: async (productId, review) => {
    const response = await api.post(`/products/${productId}/reviews`, review);
    return response.data;
  },
  // Get reviews by user
  getUserReviews: async (userId) => {
    const response = await api.get(`/users/${userId}/reviews`);
    return response.data;
  },
};

export default reviewService;
