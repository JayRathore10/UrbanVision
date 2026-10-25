import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Validate existing stored token on app boot
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.auth.getMe();
          if (res?.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('currentUser', JSON.stringify(res.data.user));
          } else {
            throw new Error('Invalid user payload');
          }
        } catch (err) {
          console.warn('[UrbanVision] Stored session expired or invalid. Clearing session.');
          setAuthToken(null);
          localStorage.removeItem('currentUser');
          setUser(null);
        }
      } else {
        // Default to Admin session on initial first-time load for instant exploration
        try {
          const res = await api.auth.login('admin@urbanvision.gov.in', 'Password123');
          if (res?.data?.user) {
            setUser(res.data.user);
          }
        } catch (e) {
          console.warn('[UrbanVision] Default first-run login skipped:', e.message);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    if (res?.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const register = async (data) => {
    const res = await api.auth.register(data);
    if (res?.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setAuthToken(null);
      localStorage.removeItem('currentUser');
      setUser(null);
    }
  };

  const switchAccount = async (email, password = 'Password123') => {
    return login(email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        switchAccount,
        isAdmin: user?.role === 'Admin',
        isSupervisor: user?.role === 'Supervisor' || user?.role === 'Admin',
        isWorker: user?.role === 'Worker',
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
