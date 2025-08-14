import { useContext, useCallback } from 'react';
import { authService, userService } from '@/lib/services';
import { UserContext } from '@/lib/UserContext.js';

/**
 * Custom hook for managing authentication state and token refresh
 * @returns {object} - Authentication state and methods
 */
export const useAuth = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useAuth must be used within a UserProvider');
  }
  const { user, setUser, loading, setProfile } = context;
  // Login function (session-based)
  const login = useCallback(async (credentials) => {
    try {
      await authService.login(credentials); // sets session cookie
      // Fetch user profile after login
      const profile = await userService.getProfile();
      // Map role_id to role name
      const roleMap = { 1: 'admin', 2: 'customer', 3: 'farmer', 4: 'delivery-agent' };
      const userWithRole = {
        ...profile.data,
        role: roleMap[profile.data.role_id] || 'customer',
      };
      setUser(userWithRole);
      setProfile(profile.data);
      localStorage.setItem('user', JSON.stringify(userWithRole));
      return userWithRole;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [setUser, setProfile]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('user');
    }
  }, [setUser, setProfile]);


  return {
    user,
    isLoading: loading,
    isAuthenticated: !!user,
    login,
    logout,
  };
};

export default useAuth;
