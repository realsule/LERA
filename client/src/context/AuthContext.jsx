import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

/**
 * Authentication Context
 * 
 * Provides centralized authentication state and functionality throughout the application.
 * This context manages user authentication status, tokens, and provides methods
 * for login, registration, logout, and role-based access control.
 * 
 * Key features:
 * - Persistent authentication using localStorage
 * - Automatic token management and validation
 * - Role-based access control methods
 * - Error handling and loading states
 * - Mock authentication for development (to be replaced with real API calls)
 */

const AuthContext = createContext();

/**
 * Custom hook to access authentication context
 * 
 * @returns {Object} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Authentication Provider Component
 * 
 * Wraps the application and provides authentication state and methods to all child components.
 * Handles authentication persistence, state management, and provides authentication utilities.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped
 */
export const AuthProvider = ({ children }) => {
  // Core authentication state
  const [user, setUser] = useState(null);           // Current user object
  const [token, setToken] = useState(localStorage.getItem('token'));  // JWT token
  const [loading, setLoading] = useState(true);     // Loading state for async operations
  const [error, setError] = useState(null);         // Error state for auth operations

  // Initialize auth state from localStorage on component mount
  // This ensures users stay logged in across page refreshes
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
          
          // Verify token with backend (only if we have a token)
          try {
            const response = await authAPI.verify().catch(() => {
              // If verification fails, don't clear auth (might be server offline)
              return null;
            });
            
            if (response && response.data) {
              // Transform backend user data
              const userData = response.data;
              const transformedUser = {
                id: userData.id,
                username: userData.username,
                email: userData.email,
                role: userData.role || 'attendee',
                firstName: parsedUser.firstName || userData.username?.split(' ')[0] || userData.username,
                lastName: parsedUser.lastName || userData.username?.split(' ')[1] || ''
              };
              setUser(transformedUser);
              localStorage.setItem('user', JSON.stringify(transformedUser));
            } else if (response === null) {
              // Server offline, keep stored user
              console.warn('Server offline, using stored user data');
            }
          } catch (verifyErr) {
            // Token invalid, clear auth data only if it's an auth error
            if (verifyErr.response?.status === 401) {
              console.warn('Token verification failed:', verifyErr);
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              setToken(null);
            }
            // If server is offline, keep the stored user but don't verify
          }
        } catch (err) {
          console.error('Failed to parse stored user:', err);
          // Clear invalid stored data
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
      
      // Use email for login (backend uses email)
      const loginData = {
        email: credentials.email || credentials.username,
        password: credentials.password
      };
      
      const response = await authAPI.login(loginData).catch((err) => {
        // Handle network errors
        if (!err.response) {
          const errorMsg = 'Server is under maintenance. Please try again later.';
          setError(errorMsg);
          return { success: false, error: errorMsg };
        }
        // Handle API errors
        const errorMsg = err.response?.data?.error || err.message || 'Login failed. Please check your credentials.';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      });
      
      // If response is an error object, return it
      if (response && !response.data) {
        return response;
      }
      
      const userData = response.data;
      
      // Transform backend user data to match frontend expectations
      const user = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role || 'attendee',
        firstName: userData.username?.split(' ')[0] || userData.username,
        lastName: userData.username?.split(' ')[1] || ''
      };
      
      // Backend uses Flask session, but we store a token identifier in localStorage
      // The actual session is maintained by Flask via cookies
      const token = `session-${userData.id}-${Date.now()}`;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Return success format for Login component
      return { success: true, user, token };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      
      // Return error format for Login component
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Transform frontend userData to backend format
      const registerData = {
        username: userData.username || `${userData.firstName}${userData.lastName}`.toLowerCase(),
        email: userData.email,
        password: userData.password,
        role: userData.role || 'attendee'
      };
      
      const response = await authAPI.register(registerData).catch((err) => {
        // Handle network errors
        if (!err.response) {
          setError('Server is under maintenance. Please try again later.');
          throw { response: null, message: 'Server is under maintenance. Please try again later.' };
        }
        throw err;
      });
      
      const userDataResponse = response.data;
      
      // Transform backend user data to match frontend expectations
      const user = {
        id: userDataResponse.id,
        username: userDataResponse.username,
        email: userDataResponse.email,
        role: userDataResponse.role || 'attendee',
        firstName: userData.firstName || userDataResponse.username?.split(' ')[0] || userDataResponse.username,
        lastName: userData.lastName || userDataResponse.username?.split(' ')[1] || ''
      };
      
      const token = `session-${userDataResponse.id}-${Date.now()}`;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user, token };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call backend logout endpoint
      await authAPI.logout();
    } catch (err) {
      console.warn('Logout API call failed:', err);
      // Continue with local logout even if API call fails
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, []);

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