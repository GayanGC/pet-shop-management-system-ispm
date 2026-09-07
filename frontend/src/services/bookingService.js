import API_BASE_URL, { getAuthHeader, handleResponse } from './api';

export const fetchBookings = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE_URL}/bookings${query ? `?${query}` : ''}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res);
};

export const createBooking = async (bookingData) => {
  const res = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(bookingData)
  });
  return handleResponse(res);
};

export const updateBooking = async (id, bookingData) => {
  const res = await fetch(`${API_BASE_URL}/bookings/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(bookingData)
  });
  return handleResponse(res);
};

export const cancelBooking = async (id) => {
  const res = await fetch(`${API_BASE_URL}/bookings/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  return handleResponse(res);
};

export const fetchDoctorDaySchedule = async (doctor, date) => {
  const query = new URLSearchParams({ doctor: doctor || '', date: date || '' }).toString();
  const res = await fetch(`${API_BASE_URL}/bookings/schedule?${query}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res);
};
