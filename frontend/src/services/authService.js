/**
 * Authentication Service
 * Communicates with /api/auth endpoints and manages local storage for JWT & active user profile
 */

import API_BASE_URL, { handleResponse } from './api';

export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await handleResponse(response);
  const token = data.token || (data.data && data.data.token);
  const user = data.user || (data.data && {
    _id: data.data._id,
    name: data.data.name,
    email: data.data.email,
    role: data.data.role
  });

  if (token) {
    localStorage.setItem('pet_shop_token', token);
  }
  if (user) {
    localStorage.setItem('pet_shop_user', JSON.stringify(user));
  }
  return { token, user };
};

export const register = async (name, email, password, role = 'customer') => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role })
  });
  const data = await handleResponse(response);
  const token = data.token || (data.data && data.data.token);
  const user = data.user || (data.data && {
    _id: data.data._id,
    name: data.data.name,
    email: data.data.email,
    role: data.data.role
  });

  if (token) {
    localStorage.setItem('pet_shop_token', token);
  }
  if (user) {
    localStorage.setItem('pet_shop_user', JSON.stringify(user));
  }
  return { token, user };
};

export const logout = () => {
  localStorage.removeItem('pet_shop_token');
  localStorage.removeItem('pet_shop_user');
};

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('pet_shop_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('pet_shop_token') || null;
};
