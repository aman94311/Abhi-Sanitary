import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('abhi_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('abhi_token') || null;
  });

  const [loading, setLoading] = useState(true);

  // Set default auth header on axios
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('abhi_token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('abhi_token');
    }
  }, [token]);

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('abhi_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('abhi_user');
    }
  }, [user]);

  // Check current session on mount
  useEffect(() => {
    const checkUserSession = async () => {
      const savedToken = localStorage.getItem('abhi_token');
      if (savedToken) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
          }
        } catch {
          // If token expired
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkUserSession();
  }, []);

  // Login action
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  // Register action
  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data?.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: 'Registration failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Registration failed. Please try again.',
      };
    }
  };

  // Logout action
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API warning:', err);
    } finally {
      setToken(null);
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
