import axios from 'axios';

/**
 * Resolve the API location from Vite environment variables.
 *
 * Supported forms:
 *   VITE_API_BASE_URL=/api
 *   VITE_API_BASE_URL=http://localhost:5555        -> http://localhost:5555/api
 *   VITE_API_BASE_URL=https://api.example.com/api
 *
 * The legacy VITE_API_URL name is still accepted so existing deployments do
 * not break. No secret is ever read from the frontend environment.
 */
export function resolveApiBaseUrl() {
  const raw = (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    '/api'
  ).trim();

  if (!raw) return '/api';

  if (/^https?:\/\//i.test(raw)) {
    const url = new URL(raw);
    if (!url.pathname || url.pathname === '/') {
      url.pathname = '/api';
    }
    return url.toString().replace(/\/+$/, '');
  }

  return raw.replace(/\/+$/, '');
}

export const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  // Flask session authentication is carried in an HttpOnly cookie.
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export function normalizeApiError(error) {
  if (axios.isCancel?.(error) || error?.code === 'ERR_CANCELED') {
    const cancelled = new Error('Request cancelled');
    cancelled.isCanceled = true;
    return cancelled;
  }

  if (error?.isCanceled) return error;

  const response = error?.response;
  const payload = response?.data;
  let message = 'Something went wrong. Please try again.';

  if (payload) {
    if (typeof payload === 'string') {
      message = payload;
    } else if (payload.error) {
      message = String(payload.error);
    } else if (payload.message) {
      message = String(payload.message);
    } else if (payload.details && typeof payload.details === 'object') {
      const firstDetail = Object.values(payload.details)[0];
      if (firstDetail) message = String(firstDetail);
    }
  } else if (error?.code === 'ECONNABORTED') {
    message = 'The request timed out. Please try again.';
  } else if (!response) {
    message = 'Cannot reach the LERA API. Check that the backend is running and try again.';
  } else if (response.status >= 500) {
    message = 'The server could not complete this request. Please try again later.';
  } else if (error?.message) {
    message = error.message;
  }

  const normalized = new Error(message);
  normalized.status = response?.status ?? null;
  normalized.code = payload?.code;
  normalized.details = payload?.details;
  normalized.isNetworkError = !response;
  normalized.isTimeout = error?.code === 'ECONNABORTED';
  normalized.response = response;
  return normalized;
}

api.interceptors.request.use((config) => config);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = normalizeApiError(error);
    if (normalized.status === 401 && !error?.config?.skipAuthRedirect) {
      // AuthContext listens for this event and clears the UI state. We do not
      // force a full page reload, which previously caused redirect loops.
      window.dispatchEvent(new CustomEvent('lera:unauthorized'));
    }
    return Promise.reject(normalized);
  }
);

const request = (config) => api.request(config).then((response) => response.data);

export const authAPI = {
  login: (credentials) =>
    request({
      url: '/auth/login',
      method: 'POST',
      data: credentials,
      skipAuthRedirect: true,
    }),
  register: (userData) =>
    request({
      url: '/auth/register',
      method: 'POST',
      data: userData,
      skipAuthRedirect: true,
    }),
  me: () =>
    request({
      url: '/auth/me',
      method: 'GET',
      skipAuthRedirect: true,
    }),
  logout: () => request({ url: '/auth/logout', method: 'POST' }),
};

export const eventsAPI = {
  getAll: (params = {}, config = {}) =>
    request({ url: '/events/', method: 'GET', params, ...config }),
  getById: (id, config = {}) =>
    request({ url: `/events/${id}`, method: 'GET', ...config }),
  create: (eventData) =>
    request({ url: '/events/', method: 'POST', data: eventData }),
  update: (id, eventData) =>
    request({ url: `/events/${id}`, method: 'PUT', data: eventData }),
  delete: (id) => request({ url: `/events/${id}`, method: 'DELETE' }),
  getMyEvents: (params = {}) =>
    request({ url: '/events/my-events', method: 'GET', params }),
};

export const categoriesAPI = {
  getAll: (config = {}) =>
    request({ url: '/categories/', method: 'GET', ...config }),
};

export const bookingsAPI = {
  create: (bookingData) =>
    request({ url: '/bookings/', method: 'POST', data: bookingData }),
  getAll: (config = {}) =>
    request({ url: '/bookings/', method: 'GET', ...config }),
  getById: (id) => request({ url: `/bookings/${id}`, method: 'GET' }),
  cancel: (id) => request({ url: `/bookings/${id}`, method: 'DELETE' }),
};

export const paymentsAPI = {
  // The backend has no card processor connected: this marks a pending booking
  // as confirmed and never charges a card.
  pay: (bookingId) =>
    request({ url: '/payments/process', method: 'POST', data: { booking_id: bookingId } }),
};

export const recommendationsAPI = {
  get: (params = {}, config = {}) =>
    request({ url: '/recommendations', method: 'GET', params, ...config }),
};

export const reviewsAPI = {
  getForEvent: (eventId, config = {}) =>
    request({ url: `/reviews/event/${eventId}`, method: 'GET', ...config }),
  create: (review) =>
    request({ url: '/reviews/', method: 'POST', data: review }),
};

export const adminAPI = {
  getUsers: () => request({ url: '/admin/users', method: 'GET' }),
  getEvents: () => request({ url: '/admin/events', method: 'GET' }),
  getAnalytics: () => request({ url: '/admin/analytics', method: 'GET' }),
};

export const checkHealth = async () => {
  try {
    const data = await request({
      url: '/health',
      method: 'GET',
      timeout: 5000,
      skipAuthRedirect: true,
    });
    return { status: 'healthy', data };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};

export default api;
