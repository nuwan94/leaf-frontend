import api from '../api';

/**
 * Product Service
 * Handles all product-related API calls including filtering, pagination, and catalog management
 */
class ProductService {
  /**
   * Get all products with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number for pagination
   * @param {number} params.limit - Number of items per page
   * @param {number} params.category_id - Filter by category ID
   * @param {number} params.min_price - Minimum price filter
   * @param {number} params.max_price - Maximum price filter
   * @param {string} params.name - Search by product name
   * @returns {Promise} API response with products data
   */
  async getProducts(params = {}) {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get products with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise} API response with paginated products
   */
  async getProductsPaginated(page = 1, limit = 10) {
    return this.getProducts({ page, limit });
  }

  /**
   * Filter products by category
   * @param {number} categoryId - Category ID to filter by
   * @param {Object} additionalParams - Additional query parameters
   * @returns {Promise} API response with filtered products
   */
  async getProductsByCategory(categoryId, additionalParams = {}) {
    return this.getProducts({ category_id: categoryId, ...additionalParams });
  }

  /**
   * Filter products by price range
   * @param {number} minPrice - Minimum price
   * @param {number} maxPrice - Maximum price
   * @param {Object} additionalParams - Additional query parameters
   * @returns {Promise} API response with filtered products
   */
  async getProductsByPriceRange(minPrice, maxPrice, additionalParams = {}) {
    return this.getProducts({
      min_price: minPrice,
      max_price: maxPrice,
      ...additionalParams
    });
  }

  /**
   * Search products by name
   * @param {string} searchTerm - Product name to search for
   * @param {Object} additionalParams - Additional query parameters
   * @returns {Promise} API response with search results
   */
  async searchProducts(searchTerm, additionalParams = {}) {
    return this.getProducts({ name: searchTerm, ...additionalParams });
  }

  /**
   * Get all product categories
   * @returns {Promise} API response with categories data
   */
  async getCategories() {
    try {
      const response = await api.get('/products/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get all product brands
   * @returns {Promise} API response with brands data
   */
  async getBrands() {
    try {
      const response = await api.get('/products/brands');
      return response.data;
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get a single product by ID
   * @param {number|string} productId - Product ID
   * @returns {Promise} API response with product data
   */
  async getProductById(productId) {
    try {
      const response = await api.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Advanced search with multiple filters
   * @param {Object} filters - Search filters object
   * @param {string} filters.name - Product name search
   * @param {number} filters.category_id - Category filter
   * @param {number} filters.min_price - Minimum price
   * @param {number} filters.max_price - Maximum price
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Items per page
   * @param {string} filters.sort_by - Sort field
   * @param {string} filters.sort_order - Sort order (asc/desc)
   * @returns {Promise} API response with filtered products
   */
  async searchProductsAdvanced(filters) {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null && value !== '')
    );
    return this.getProducts(cleanFilters);
  }

  /**
   * Handle API errors consistently
   * @param {Error} error - Error object from axios
   * @returns {Error} Formatted error object
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred while processing your request';
      return new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Unable to connect to the server. Please check your internet connection.');
    } else {
      // Something else happened
      return new Error('An unexpected error occurred');
    }
  }
}

// Export singleton instance
const productService = new ProductService();
export default productService;
