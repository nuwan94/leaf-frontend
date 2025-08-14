import { useState, useEffect, useCallback } from 'react';
import { authService, userService } from '@/lib/services';

/**
 * Custom hook for managing authentication state and token refresh
 * @returns {object} - Authentication state and methods
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // No token/refresh logic needed for session-based auth

  // Login function (session-based)
  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      await authService.login(credentials); // sets session cookie
      // Fetch user profile after login
      const profile = await userService.getProfile();
      setUser(profile.data);
      setIsAuthenticated(true);
      return profile.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Check authentication status on mount (session-based)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await userService.getProfile();
        setUser(profile.data);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };
};

export default useAuth;
