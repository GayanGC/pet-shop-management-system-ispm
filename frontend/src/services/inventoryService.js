import API_BASE_URL, { getAuthHeader, handleResponse } from './api';

export const fetchProducts = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE_URL}/inventory${query ? `?${query}` : ''}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res);
};

export const createProduct = async (productData) => {
  const res = await fetch(`${API_BASE_URL}/inventory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(productData)
  });
  return handleResponse(res);
};

export const updateProduct = async (id, productData) => {
  const res = await fetch(`${API_BASE_URL}/inventory/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(productData)
  });
  return handleResponse(res);
};

export const deleteProduct = async (id) => {
  const res = await fetch(`${API_BASE_URL}/inventory/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  return handleResponse(res);
};

export const adjustStock = async (id, delta) => {
  const res = await fetch(`${API_BASE_URL}/inventory/${id}/stock`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ delta })
  });
  return handleResponse(res);
};

export const fetchExpiringProducts = async () => {
  const res = await fetch(`${API_BASE_URL}/inventory/expiring-soon`, {
    headers: getAuthHeader()
  });
  return handleResponse(res);
};

export const disposeBatch = async (id, reason) => {
  const res = await fetch(`${API_BASE_URL}/inventory/dispose-batch/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ reason })
  });
  return handleResponse(res);
};
