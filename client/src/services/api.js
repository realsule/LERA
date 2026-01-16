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

// Mock data for emergency presentation mode
const mockEvents = [
  {
    id: 1,
    title: 'Summer Music Festival 2024',
    description: 'Join us for an unforgettable night of live music featuring top artists from around the world. Experience the magic of summer with amazing performances, food vendors, and festival activities.',
    date: '2024-07-15T19:00:00Z',
    location: 'Central Park Arena, New York',
    price: 9500.00, // KES equivalent of $75 USD
    capacity: 5000,
    category: 'concert',
    image: 'https://images.unsplash.com/photo-1459749411177-042180ceea72?q=80&w=1000&auto=format&fit=crop',
    organizer: { firstName: 'Event', lastName: 'Organizer' },
    totalTickets: 5000,
    availableTickets: 4000,
    rating: 4.8,
    reviews: 256
  },
  {
    id: 2,
    title: 'Tech Innovation Summit',
    description: 'Connect with industry leaders and discover cutting-edge technologies that are shaping our future. Network with professionals, attend workshops, and gain insights into the latest tech trends.',
    date: '2024-08-20T09:00:00Z',
    location: 'Convention Center, San Francisco',
    price: 37800.00, // KES equivalent of $299 USD
    capacity: 1000,
    category: 'conference',
    image: 'https://images.unsplash.com/photo-1540575861501-7ad05823c951?q=80&w=1000&auto=format&fit=crop',
    organizer: { firstName: 'Tech', lastName: 'Events' },
    totalTickets: 1000,
    availableTickets: 750,
    rating: 4.9,
    reviews: 189
  },
  {
    id: 3,
    title: 'Marathon Championship',
    description: 'Challenge yourself in this exciting marathon event for all fitness levels. Professional timing, medals, and a celebration at the finish line await all participants.',
    date: '2024-09-10T07:00:00Z',
    location: 'City Stadium, Chicago, IL',
    price: 6300.00, // KES equivalent of $50 USD
    capacity: 2000,
    category: 'sports',
    image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1000&auto=format&fit=crop',
    organizer: { firstName: 'Sports', lastName: 'Plus' },
    totalTickets: 2000,
    availableTickets: 1800,
    rating: 4.7,
    reviews: 142
  }
];

// Emergency presentation mode flag
const isEmergencyMode = false; // Set to true for presentation, false for normal API calls

// API service methods
export const authAPI = {
  login: (credentials) => {
    if (isEmergencyMode) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (credentials.email === 'demo@example.com' && credentials.password === 'Demo123!') {
            resolve({ 
              data: { 
                success: true, 
                user: { name: 'Demo User', email: 'demo@example.com' },
                token: 'mock-jwt-token-for-presentation'
              } 
            });
          } else {
            reject({ 
              response: { data: { error: 'Invalid credentials' } }
            });
          }
        }, 500); // Simulate network delay
      });
    }
    return api.post('/auth/login', credentials);
  },
  register: (userData) => api.post('/auth/register', userData),
  verify: () => api.get('/auth/me'), // Backend uses /auth/me for current user
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

export const eventsAPI = {
  getAll: (params) => {
    if (isEmergencyMode) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: mockEvents });
        }, 300); // Simulate network delay
      });
    }
    return api.get('/api/events/', { params });
  },
  getById: (id) => {
    if (isEmergencyMode) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const event = mockEvents.find(e => e.id === parseInt(id));
          if (event) {
            resolve({ data: event });
          } else {
            reject({ response: { data: { error: 'Event not found' } } });
          }
        }, 300);
      });
    }
    return api.get(`/api/events/${id}/`);
  },
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
  if (isEmergencyMode) {
    return { status: 'healthy', data: { message: 'Mock mode active' } };
  }
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