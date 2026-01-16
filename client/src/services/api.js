import axios from 'axios';

/**
 * API Service Configuration
 * 
 * Centralized HTTP client configuration for all API communications.
 * Uses Axios with interceptors for authentication and error handling.
 * 
 * Environment Configuration:
 * - VITE_API_URL: Direct backend URL (set in netlify.toml for local dev)
 * - Fallback to '/api': Uses Vite proxy for development
 * 
 * Features:
 * - Automatic JWT token injection
 * - Centralized error handling
 * - Request/response interceptors
 * - Timeout protection
 * - Content-Type headers
 */

// Create axios instance with base configuration
const api = axios.create({
  // Use VITE_API_URL from netlify.toml or fallback to proxy
  // netlify.toml sets VITE_API_URL=http://127.0.0.1:5000 for local development
  // In production, this should point to your actual API server
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000, // 10 second timeout for all requests
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * 
 * Automatically adds JWT authentication token to all outgoing requests.
 * Token is retrieved from localStorage and added as Bearer token in Authorization header.
 * 
 * This ensures authenticated endpoints receive proper credentials without
 * manual token management in each API call.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Log request errors for debugging
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 
 * Handles common HTTP errors and provides automatic responses for authentication failures.
 * 
 * Error Handling:
 * - 401 Unauthorized: Clear auth data and redirect to login
 * - 403 Forbidden: Redirect to unauthorized page
 * - Network errors: Provide user-friendly error messages
 * 
 * This centralizes error handling and ensures consistent user experience
 * across all API interactions.
 */
api.interceptors.response.use(
  (response) => {
    // Successful responses pass through unchanged
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      console.warn('Authentication failed - clearing session');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle 403 Forbidden - insufficient permissions
    if (error.response?.status === 403) {
      console.warn('Access forbidden - insufficient permissions');
      window.location.href = '/unauthorized';
    }
    
    // Handle network errors (no response from server) - Server is offline
    if (!error.response) {
      console.error('Network Error - Server appears to be offline:', error.message);
      error.isServerOffline = true;
      error.message = 'Server is under maintenance. Please try again later.';
    }
    
    return Promise.reject(error);
  }
);

// API service methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verify: () => api.get('/auth/me'), // Backend uses /auth/me for current user
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

export const eventsAPI = {
  getAll: (params) => api.get('/api/events/', { params }),
  getById: (id) => api.get(`/api/events/${id}/`),
  create: (eventData) => api.post('/api/events/', eventData),
  update: (id, eventData) => api.put(`/api/events/${id}/`, eventData),
  delete: (id) => api.delete(`/api/events/${id}/`),
  getMyEvents: () => api.get('/api/events/my-events/'),
};

export const ticketsAPI = {
  purchase: (ticketData) => api.post('/tickets/purchase', ticketData),
  getMyTickets: () => api.get('/tickets/my-tickets'),
  getById: (id) => api.get(`/tickets/${id}`),
  cancel: (id) => api.post(`/tickets/${id}/cancel`),
};

export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  changePassword: (passwordData) => api.put('/users/change-password', passwordData),
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

/**
 * Health Check API
 * 
 * Checks the backend server health status.
 * This function is called on app load to verify backend connectivity.
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/api/health');
    console.log('✅ Backend Health Status:', response.data);
    return { status: 'healthy', data: response.data };
  } catch (error) {
    console.error('❌ Backend Health Check Failed:', error.message);
    return { status: 'unhealthy', error: error.message };
  }
};

export default api;