import API_BASE_URL, { getAuthHeader, handleResponse } from './api';

export const fetchSuppliers = async () => {
  const res = await fetch(`${API_BASE_URL}/suppliers`, {
    headers: getAuthHeader()
  });
  return handleResponse(res);
};

export const createSupplier = async (data) => {
  const res = await fetch(`${API_BASE_URL}/suppliers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const updateSupplier = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const deleteSupplier = async (id) => {
  const res = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  return handleResponse(res);
};
