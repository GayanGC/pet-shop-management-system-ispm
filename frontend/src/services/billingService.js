import API_BASE_URL, { getAuthHeader, handleResponse, toQueryString } from './api';

export const fetchInvoices = async (params = {}) => {
  const qs = toQueryString(params);
  const res = await fetch(`${API_BASE_URL}/billing${qs}`, {
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

/**
 * Void Invoice with Mandatory Audit Reason & Atomic Stock Restoral
 */
export const voidInvoice = async (id, { voidReason, voidNotes } = {}) => {
  const res = await fetch(`${API_BASE_URL}/billing/${id}/void`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ voidReason, voidNotes })
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

/**
 * Cashier Shift & Day-End Settlement Services
 */
export const fetchCurrentShift = async () => {
  const res = await fetch(`${API_BASE_URL}/billing/shifts/current`, {
    headers: getAuthHeader()
  });
  return handleResponse(res);
};

export const openCashierShift = async (openingFloat = 0) => {
  const res = await fetch(`${API_BASE_URL}/billing/shifts/open`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ openingFloat: Number(openingFloat) || 0 })
  });
  return handleResponse(res);
};

export const closeCashierShift = async ({ actualCashCounted, closingNotes, shiftId } = {}) => {
  const url = shiftId ? `${API_BASE_URL}/billing/shifts/${shiftId}/close` : `${API_BASE_URL}/billing/shifts/close`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({
      actualCashCounted: Number(actualCashCounted),
      closingNotes: closingNotes || ''
    })
  });
  return handleResponse(res);
};

export const fetchAllShifts = async () => {
  const res = await fetch(`${API_BASE_URL}/billing/shifts`, {
    headers: getAuthHeader()
  });
  return handleResponse(res);
};

export const fetchShiftZReport = async (shiftId) => {
  const res = await fetch(`${API_BASE_URL}/billing/shifts/${shiftId}/z-report`, {
    headers: getAuthHeader()
  });
  return handleResponse(res);
};
