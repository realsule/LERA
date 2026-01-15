// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5555';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  ME: `${API_BASE_URL}/api/auth/me`,
  
  // Events
  EVENTS: `${API_BASE_URL}/api/events`,
  EVENT: (id) => `${API_BASE_URL}/api/events/${id}`,
  
  // Categories
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  
  // Bookings
  BOOKINGS: `${API_BASE_URL}/api/bookings`,
  BOOKING: (id) => `${API_BASE_URL}/api/bookings/${id}`,
  
  // Reviews
  REVIEWS: `${API_BASE_URL}/api/reviews`,
  EVENT_REVIEWS: (eventId) => `${API_BASE_URL}/api/reviews/event/${eventId}`,
  
  // Payments
  PAYMENTS: `${API_BASE_URL}/api/payments`,
  
  // Admin
  ADMIN_EVENTS_PENDING: `${API_BASE_URL}/api/admin/events/pending`,
  ADMIN_EVENT_APPROVE: (id) => `${API_BASE_URL}/api/admin/events/${id}/approve`,
};

export { API_BASE_URL };
export default API_BASE_URL;
