/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authAPI } from '../services/api';

/**
 * Session-based authentication context.
 *
 * The Flask API authenticates with an HttpOnly session cookie. The browser
 * therefore never stores or reads a bearer token; user state is hydrated from
 * GET /api/auth/me and cleared whenever the API reports a 401.
 */
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await authAPI.me();
      setUser(currentUser);
      setError(null);
      return currentUser;
    } catch (err) {
      if (err?.status === 401) {
        setUser(null);
        setError(null);
      } else {
        // Keeping the error separate from the user lets the UI explain that
        // the API is unreachable instead of pretending the visitor is signed
        // out for an unrelated reason.
        setError(err?.message || 'Could not check your session.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('lera:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('lera:unauthorized', handleUnauthorized);
  }, [refresh]);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const authenticatedUser = await authAPI.login(credentials);
      setUser(authenticatedUser);
      return { success: true, user: authenticatedUser };
    } catch (err) {
      const message = err?.message || 'Login failed. Please check your credentials.';
      setError(message);
      return { success: false, error: message, status: err?.status ?? null };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (details) => {
    setLoading(true);
    setError(null);
    try {
      const createdUser = await authAPI.register(details);
      setUser(createdUser);
      return { success: true, user: createdUser };
    } catch (err) {
      const message = err?.message || 'Registration failed. Please try again.';
      setError(message);
      return { success: false, error: message, status: err?.status ?? null, details: err?.details };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // A failed logout request must not leave stale UI state behind. The
      // server cookie expires independently when it is no longer valid.
    } finally {
      setUser(null);
      setError(null);
    }
  }, []);

  const hasRole = useCallback((role) => user?.role === role, [user]);
  const hasAnyRole = useCallback(
    (roles = []) => Boolean(user?.role && roles.includes(user.role)),
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refresh,
      hasRole,
      hasAnyRole,
      clearError: () => setError(null),
    }),
    [user, loading, error, login, register, logout, refresh, hasRole, hasAnyRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
