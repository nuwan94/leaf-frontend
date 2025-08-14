// Re-export UserProvider for unified import
export { UserProvider } from './UserContext.jsx';
import { createContext, useContext } from 'react';

export const UserContext = createContext();

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
