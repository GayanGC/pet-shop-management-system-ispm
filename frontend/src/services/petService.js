import API_BASE_URL, { getAuthHeader, handleResponse } from './api';

export const fetchPets = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE_URL}/pets${query ? `?${query}` : ''}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res);
};

export const createPet = async (petData) => {
  const res = await fetch(`${API_BASE_URL}/pets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(petData)
  });
  return handleResponse(res);
};

export const updatePet = async (id, petData) => {
  const res = await fetch(`${API_BASE_URL}/pets/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(petData)
  });
  return handleResponse(res);
};

export const deletePet = async (id) => {
  const res = await fetch(`${API_BASE_URL}/pets/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  return handleResponse(res);
};

export const addMedicalLog = async (id, logData) => {
  const res = await fetch(`${API_BASE_URL}/pets/${id}/medical-logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(logData)
  });
  return handleResponse(res);
};
