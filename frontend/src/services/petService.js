import API_BASE_URL, { getAuthHeader, handleResponse, toQueryString } from './api';

export const fetchPets = async (params = {}) => {
  const qs = toQueryString(params);
  const res = await fetch(`${API_BASE_URL}/pets${qs}`, {
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

export const archivePet = async (id, payload = {}) => {
  const res = await fetch(`${API_BASE_URL}/pets/${id}/archive`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

export const fetchPetHealthPassport = async (id) => {
  const res = await fetch(`${API_BASE_URL}/pets/${id}/health-passport`, {
    headers: getAuthHeader()
  });
  return handleResponse(res);
};

export const getMyPets = async (params = {}) => {
  const qs = toQueryString(params);
  const res = await fetch(`${API_BASE_URL}/pets/my-pets${qs}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res);
};

export const searchMyPets = async (searchTerm, params = {}) => {
  return getMyPets({ ...params, search: searchTerm });
};

export const getMyArchivedPets = async (params = {}) => {
  return getMyPets({ ...params, archived: 'true' });
};

export const fetchPetByPin = async (pin) => {
  const cleanPin = String(pin).trim().toUpperCase();
  const res = await fetch(`${API_BASE_URL}/pets/pin/${cleanPin}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res);
};

export const getAllPets = fetchPets;

const petService = {
  getAllPets,
  fetchPets,
  fetchPetByPin,
  getMyPets,
  searchMyPets,
  getMyArchivedPets,
  createPet,
  updatePet,
  deletePet,
  addMedicalLog,
  archivePet,
  fetchPetHealthPassport
};

export default petService;
