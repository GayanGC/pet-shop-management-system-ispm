/**
 * Shared API Helper for Fetch/Axios Requests
 * Automatically includes JWT Bearer token from localStorage
 */

const API_BASE_URL = 'http://localhost:5000/api';

export const getAuthHeader = () => {
  const token = localStorage.getItem('pet_shop_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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

export const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred while processing request');
  }
  return data;
};

export default API_BASE_URL;
