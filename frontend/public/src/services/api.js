// API service functions
import { API_ENDPOINTS, API_BASE_URL } from '../config/api.js';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important for cookies/sessions
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(username, password) {
    return this.request(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async register(userData) {
    return this.request(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request(API_ENDPOINTS.LOGOUT, {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request(API_ENDPOINTS.ME);
  }

  // Events methods
  async getEvents() {
    return this.request(API_ENDPOINTS.EVENTS);
  }

  async getEvent(id) {
    return this.request(API_ENDPOINTS.EVENT(id));
  }

  async createEvent(eventData) {
    return this.request(API_ENDPOINTS.EVENTS, {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  // Categories methods
  async getCategories() {
    return this.request(API_ENDPOINTS.CATEGORIES);
  }

  // Bookings methods
  async getBookings() {
    return this.request(API_ENDPOINTS.BOOKINGS);
  }

  async createBooking(bookingData) {
    return this.request(API_ENDPOINTS.BOOKINGS, {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  // Reviews methods
  async getEventReviews(eventId) {
    return this.request(API_ENDPOINTS.EVENT_REVIEWS(eventId));
  }

  async createReview(reviewData) {
    return this.request(API_ENDPOINTS.REVIEWS, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }
}

export default new ApiService();
