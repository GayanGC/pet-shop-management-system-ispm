import API_BASE_URL, { getAuthHeader, handleResponse } from './api';

export const fetchInvoices = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE_URL}/billing${query ? `?${query}` : ''}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res);
};

export const createInvoice = async (invoiceData) => {
  const res = await fetch(`${API_BASE_URL}/billing`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(invoiceData)
  });
  return handleResponse(res);
};

export const updatePaymentStatus = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/billing/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const voidInvoice = async (id) => {
  const res = await fetch(`${API_BASE_URL}/billing/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  return handleResponse(res);
};

export const fetchSalesAnalytics = async () => {
  const res = await fetch(`${API_BASE_URL}/billing/analytics`, {
    headers: getAuthHeader()
  });
  return handleResponse(res);
};

export const getCSVExportUrl = () => `${API_BASE_URL}/billing/export-csv`;
