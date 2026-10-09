import axios from 'axios';

/**
 * Shared API Helper for Fetch/Axios Requests
 * Automatically includes JWT Bearer token from localStorage
 * Global Interceptors for 401 Session Expiration
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Global 401 Session Expiration Handler
 * 1. Clears invalid/expired session data
 * 2. Dispatches an authentication event
 * 3. Notifies UI components gracefully without white screen
 */
export const handleAuthExpiration = (customMsg = 'Session expired. Please log in again.') => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('pet_shop_token');
  localStorage.removeItem('pet_shop_user');

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('auth:expired', {
        detail: { message: customMsg }
      })
    );
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('pet_shop_token') || null;
};

export const getAuthHeader = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Pre-configured Axios Instance with Interceptors
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Inject JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 Unauthorized globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      handleAuthExpiration(error.response.data?.message || 'Session expired. Please log in again.');
    }
    return Promise.reject(error);
  }
);

export const toQueryString = (params = {}) => {
  if (!params || typeof params !== 'object') return '';
  const clean = {};
  Object.keys(params).forEach((key) => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== '' && val !== 'undefined' && val !== 'null') {
      clean[key] = val;
    }
  });
  const qs = new URLSearchParams(clean).toString();
  return qs ? `?${qs}` : '';
};

/**
 * Fetch Response Handler with 401 Interception
 */
export const handleResponse = async (response) => {
  if (response.status === 401) {
    handleAuthExpiration('Session expired. Please log in again.');
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Session expired. Please log in again.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred while processing request');
  }
  return data;
};

export default API_BASE_URL;
