// Token management utilities

/**
 * Check if a JWT token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} - True if token is expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} - Expiration date or null if invalid
 */
export const getTokenExpiration = (token) => {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

/**
 * Get time remaining until token expires (in seconds)
 * @param {string} token - JWT token
 * @returns {number} - Seconds until expiration, 0 if expired
 */
export const getTokenTimeRemaining = (token) => {
  if (!token) return 0;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const timeRemaining = payload.exp - currentTime;
    return Math.max(0, timeRemaining);
  } catch (error) {
    console.error('Error parsing token:', error);
    return 0;
  }
};

/**
 * Get current user from localStorage with token validation
 * @returns {object|null} - User object or null if invalid/expired
 */
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return null;

    const user = JSON.parse(userData);

    // Check if access token is expired
    if (isTokenExpired(user.token)) {
      console.warn('Access token is expired');
      return user; // Return user anyway - refresh mechanism will handle it
    }

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    localStorage.removeItem('user');
    return null;
  }
};

/**
 * Clear user session and redirect to login
 */
export const clearUserSession = () => {
  localStorage.removeItem('user');
  window.location.href = '/login';
};

/**
 * Set up automatic token refresh before expiration
 * @param {string} token - Access token
 * @param {function} refreshCallback - Function to call for refresh
 * @returns {number} - Timeout ID for clearing
 */
export const setupTokenRefresh = (token, refreshCallback) => {
  const timeRemaining = getTokenTimeRemaining(token);

  // Refresh token 5 minutes before expiration (300 seconds)
  const refreshTime = Math.max(0, (timeRemaining - 300) * 1000);

  if (refreshTime > 0) {
    console.log(`Token will be refreshed in ${refreshTime / 1000} seconds`);
    return setTimeout(refreshCallback, refreshTime);
  }

  return null;
};

export default {
  isTokenExpired,
  getTokenExpiration,
  getTokenTimeRemaining,
  getCurrentUser,
  clearUserSession,
  setupTokenRefresh,
};
