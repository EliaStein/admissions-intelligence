import { useState, useEffect } from 'react';

const ADMIN_TOKEN = 'admin_access_token';
const ADMIN_PASSWORD = 'Eliloves0livia!'; // Hardcoded for demo purposes only

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN);
    setIsAuthenticated(!!token);
  }, []);

  const login = (password: string) => {
    if (password === ADMIN_PASSWORD) {
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
