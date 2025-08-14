import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '@/lib/services';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Try to load from localStorage for persistence
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Optionally, fetch profile on mount if user exists
  useEffect(() => {
    if (user && !profile) {
      setLoading(true);
      userService.getProfile()
        .then((res) => setProfile(res.data))
        .catch(() => setProfile(null))
        .finally(() => setLoading(false));
    }
  }, [user, profile]);

  // Update localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, profile, setProfile, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
