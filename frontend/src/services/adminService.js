import axios from "axios";

const BASE_URL = "http://localhost:5000/api/admin";

/// ===================== USER ===================== 

export const getAllUsers = (token) =>
  axios.get(`${BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteUser = (userId, token) =>
  axios.delete(`${BASE_URL}/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateUserStatus = (userId, data, token) =>
  axios.patch(`${BASE_URL}/users/${userId}/status`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateUserName = (userId, data, token) =>
  axios.patch(`${BASE_URL}/users/${userId}/info`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

/// ===================== BOOKING ===================== 

export const getAllBookings = (token) =>
  axios.get(`${BASE_URL}/bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const confirmCancelBooking = (bookingId, action, token) =>
  axios.patch(
    `${BASE_URL}/bookings/${bookingId}/confirm-cancel`,
    { action },
    { headers: { Authorization: `Bearer ${token}` } }
  );

export const getBookingByCode = (bookingCode, token) =>
  axios.get(`${BASE_URL}/bookings/code/${bookingCode}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateBookingStatus = (bookingId, status, token) =>
  axios.patch(
    `${BASE_URL}/bookings/${bookingId}/status`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );

export const getBookingDetails = (bookingId, token) =>
  axios.get(`${BASE_URL}/bookings/${bookingId}/details`, {
    headers: { Authorization: `Bearer ${token}` },
  });

/// ===================== DASHBOARD ===================== 

export const getDashboardStats = (token, from, to) => {
  let query = "";
  if (from && to) query = `?from=${from}&to=${to}`;
  return axios.get(`${BASE_URL}/dashboard-stats${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/// ===================== ROOM ===================== 

export const getAllRoomsAdmin = (token) =>
  axios.get(`${BASE_URL}/rooms`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createRoom = (data, token) =>
  axios.post(`${BASE_URL}/rooms`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateRoom = (roomId, data, token) =>
  axios.put(`${BASE_URL}/rooms/${roomId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteRoom = (roomId, token) =>
  axios.delete(`${BASE_URL}/rooms/${roomId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

/// ===================== SERVICE ===================== 

export const getServices = (token) =>
  axios.get(`${BASE_URL}/services`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createService = (token, data) =>
  axios.post(`${BASE_URL}/services`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateService = (token, id, data) =>
  axios.patch(`${BASE_URL}/services/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteService = (token, id) =>
  axios.delete(`${BASE_URL}/services/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

/// ===================== ORDER ===================== 

export const createOrder = (token, data) =>
  axios.post(`${BASE_URL}/orders`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addOrderDetail = (token, orderId, data) =>
  axios.patch(`${BASE_URL}/orders/${orderId}/add-detail`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getOrderDetails = (token, orderId) =>
  axios.get(`${BASE_URL}/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

/// ===================== INVOICE ===================== 

export const getAllInvoices = (token) =>
  axios.get(`${BASE_URL}/invoices`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createInvoice = (token, payload) =>
  axios.post(`${BASE_URL}/invoices`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getInvoiceById = (token, invoiceId) =>
  axios.get(`${BASE_URL}/invoices/${invoiceId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteInvoice = (token, id) =>
  axios.delete(`${BASE_URL}/invoices/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

