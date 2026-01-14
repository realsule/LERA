import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
          
          // Skip API verification for now to avoid errors
          console.log('Auth initialized with stored user:', parsedUser);
        } catch (err) {
          console.error('Failed to parse stored user:', err);
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock login for development - replace with actual API call
      const mockUser = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: credentials.email,
        role: 'attendee', // or 'organizer', 'admin'
      };
      
      const mockToken = 'mock-jwt-token-' + Date.now();
      
      setUser(mockUser);
      setToken(mockToken);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      return { user: mockUser, token: mockToken };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock registration for development - replace with actual API call
      const mockUser = {
        id: Date.now().toString(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role || 'attendee',
      };
      
      const mockToken = 'mock-jwt-token-' + Date.now();
      
      setUser(mockUser);
      setToken(mockToken);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      return { user: mockUser, token: mockToken };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  }, [navigate]);

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const updateUser = useCallback((userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    updateUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;