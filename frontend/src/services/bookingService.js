import API_BASE_URL, { getAuthHeader, handleResponse, toQueryString } from './api';

export const fetchBookings = async (params = {}) => {
  const qs = toQueryString(params);
  const res = await fetch(`${API_BASE_URL}/bookings${qs}`, {
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
  const qs = toQueryString({ doctor, date });
  const res = await fetch(`${API_BASE_URL}/bookings/schedule${qs}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res);
};

export const fetchBookingReport = async () => {
  const res = await fetch(`${API_BASE_URL}/bookings/report`, {
    headers: getAuthHeader()
  });
  return handleResponse(res);
};
