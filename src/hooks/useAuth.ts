import { useState, useEffect } from 'react';

// In a real application, this would be replaced with proper authentication
const ADMIN_TOKEN = 'admin_access_token';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN);
    setIsAuthenticated(!!token);
  }, []);

  const login = (password: string) => {
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_TOKEN, 'authenticated');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_TOKEN);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    login,
    logout
  };
}
