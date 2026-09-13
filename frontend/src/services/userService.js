import API_BASE_URL, { getAuthHeader, handleResponse } from './api';

/**
 * Fetch all registered customers with their associated pets
 */
export const fetchCustomers = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE_URL}/users/customers${query ? `?${query}` : ''}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res);
};

/**
 * Fetch all users across system
 */
export const fetchAllUsers = async (role = '') => {
  const query = role ? `?role=${role}` : '';
  const res = await fetch(`${API_BASE_URL}/users${query}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res);
};

const userService = {
  fetchCustomers,
  fetchAllUsers
};

export default userService;
