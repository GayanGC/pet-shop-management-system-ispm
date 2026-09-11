/**
 * Authentication Service
 * Communicates with /api/auth endpoints and manages local storage for JWT & active user profile
 * Supports Dual-Identifier (Email OR Phone Number) and Multi-Pet Registration
 */

import API_BASE_URL, { handleResponse } from './api';

export const login = async (identifier, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, email: identifier, phone: identifier, password })
  });
  const data = await handleResponse(response);
  const token = data.token || (data.data && data.data.token);
  const user = data.user || (data.data && {
    _id: data.data._id,
    name: data.data.name,
    email: data.data.email,
    phone: data.data.phone,
    role: data.data.role,
    petsCount: data.data.petsCount || 0
  });

  if (token) {
    localStorage.setItem('pet_shop_token', token);
  }
  if (user) {
    localStorage.setItem('pet_shop_user', JSON.stringify(user));
  }
  return { token, user, data };
};

export const register = async ({ name, email, phone, password, role = 'customer', initialPets = [] }) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, password, role, initialPets })
  });
  const data = await handleResponse(response);
  const token = data.token || (data.data && data.data.token);
  const user = data.user || (data.data && {
    _id: data.data._id,
    name: data.data.name,
    email: data.data.email,
    phone: data.data.phone,
    role: data.data.role,
    petsCount: data.data.petsCount || 0
  });

  if (token) {
    localStorage.setItem('pet_shop_token', token);
  }
  if (user) {
    localStorage.setItem('pet_shop_user', JSON.stringify(user));
  }
  return { token, user, createdPets: data.createdPets || [], data };
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
