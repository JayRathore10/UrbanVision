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

  // Auto-authenticate on initial boot with default Supervisor account if token is missing
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.auth.getMe();
          if (res?.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('currentUser', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('[UrbanVision] Stored token invalid or expired. Auto-logging in with default supervisor...');
          await autoLoginSupervisor();
        }
      } else {
        await autoLoginSupervisor();
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const autoLoginSupervisor = async () => {
    try {
      const res = await api.auth.login('rajesh@urbanvision.gov.in', 'Password123');
      if (res?.data?.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.warn('[UrbanVision] Default auto-login skipped:', err.message);
    }
  };

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    if (res?.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
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
        logout,
        switchAccount,
        isSupervisor: user?.role === 'Supervisor',
        isWorker: user?.role === 'Worker',
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
