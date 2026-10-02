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

export const rescheduleBooking = async (id, { newDate, newTimeSlot, reason }) => {
  const res = await fetch(`${API_BASE_URL}/bookings/${id}/reschedule`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ newDate, newTimeSlot, reason })
  });
  return handleResponse(res);
};

export const cancelBooking = async (id, reason = '') => {
  const res = await fetch(`${API_BASE_URL}/bookings/${id}/cancel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ reason })
  });
  return handleResponse(res);
};

export const fetchBookingSlip = async (id) => {
  const res = await fetch(`${API_BASE_URL}/bookings/${id}/slip`, {
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
