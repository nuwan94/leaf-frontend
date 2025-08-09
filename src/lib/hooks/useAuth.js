import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, isTokenExpired, setupTokenRefresh, clearUserSession } from '@/lib/token-utils';
import { authService } from '@/lib/services';

/**
 * Custom hook for managing authentication state and token refresh
 * @returns {object} - Authentication state and methods
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser?.refresh_token) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken();

      // Update user data with new tokens
      const updatedUser = {
        ...currentUser,
        token: response.data.access_token,
        refresh_token: response.data.refresh_token
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Setup next refresh
      const timeoutId = setupTokenRefresh(updatedUser.token, refreshToken);

      return updatedUser;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);

      const userData = response.data.user;
      const accessToken = response.data.access_token;
      const refreshToken = response.data.refresh_token;

      // Convert role_id to role string - FIXED mapping
      const roleMap = {
        1: 'admin',
        2: 'customer',
        3: 'farmer',
        4: 'delivery-agent'
      };

      const user = {
        ...userData,
        role: roleMap[userData.role_id] || 'customer',
        token: accessToken,
        refresh_token: refreshToken
      };

      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);

      // Setup automatic token refresh
      setupTokenRefresh(accessToken, refreshToken);

      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshToken]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearUserSession();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const currentUser = getCurrentUser();

      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);

        // Setup token refresh if token is still valid
        if (!isTokenExpired(currentUser.token)) {
          setupTokenRefresh(currentUser.token, refreshToken);
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [refreshToken]);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshToken,
  };
};

export default useAuth;
