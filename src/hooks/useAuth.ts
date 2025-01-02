import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const isAdmin = await authService.isAdmin();
      setIsAuthenticated(isAdmin);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      await authService.signIn(email, password);
      const isAdmin = await authService.isAdmin();
      setIsAuthenticated(isAdmin);
      return isAdmin;
    } catch (error) {
      return false;
    }
  }

  async function logout() {
    try {
      await authService.signOut();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  return {
    isAuthenticated,
    loading,
    login,
    logout
  };
}
