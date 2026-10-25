import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { setAccessToken, clearAuth } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Try to restore session on mount
  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      try {
        // Try refreshing the token (cookie-based)
        await authService.refresh();
        const userData = await authService.getMe();
        if (mounted) {
          setUser(userData.user || userData);
          setIsAuthenticated(true);
        }
      } catch (e) {
        // Not authenticated - that's fine
        if (mounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    initAuth();
    return () => { mounted = false; };
  }, []);

  // Listen for session expiry events from the API interceptor
  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
      clearAuth();
    };
    window.addEventListener('auth:session-expired', handleExpired);
    return () => window.removeEventListener('auth:session-expired', handleExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    const userData = await authService.getMe();
    setUser(userData.user || userData);
    setIsAuthenticated(true);
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const data = await authService.register(userData);
    const me = await authService.getMe();
    setUser(me.user || me);
    setIsAuthenticated(true);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
