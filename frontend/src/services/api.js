/**
 * Shared API Helper for Fetch/Axios Requests
 * Automatically includes JWT Bearer token from localStorage
 */

const API_BASE_URL = 'http://localhost:5000/api';

export const getAuthHeader = () => {
  const token = localStorage.getItem('pet_shop_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred while processing request');
  }
  return data;
};

export default API_BASE_URL;
