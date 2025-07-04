import axios from "axios";

const BASE_URL = "http://localhost:5000/api"; // hoặc chỉnh port backend

// ===== AUTH =====
export const login = (data) => axios.post(`${BASE_URL}/auth/login`, data);
export const register = (data) => axios.post(`${BASE_URL}/auth/register`, data);

// ===== ROOM =====
export const filterRooms = ({ name, amenities }) => {
  const params = new URLSearchParams();

  if (name) params.append("name", name.trim());
  if (amenities && amenities.length > 0) {
    params.append("amenities", amenities.join(","));
  }

  return axios.get(`${BASE_URL}/room/filter?${params.toString()}`);
};

export const getRoomById = (id) => axios.get(`${BASE_URL}/room/${id}`);
export const getAllRooms = () => axios.get(`${BASE_URL}/room/`);

// ===== BOOKING =====
export const createBooking = (data, token) =>
  axios.post(`${BASE_URL}/booking/create`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getBookingHistory = (token) =>
  axios.get(`${BASE_URL}/booking/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const requestCancelBooking = (bookingId, token) =>
  axios.patch(`${BASE_URL}/booking/cancel-request/${bookingId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
export const lookupBooking = (data) =>
    axios.post(`${BASE_URL}/booking/lookup`, data);

export const getBookedSlotsByRoom = async (roomId, date) => {
  return await axios.get(`${BASE_URL}/booking/by-room/${roomId}?date=${date}`);
};

// ===== USER =====
export const getCurrentUser = (token) =>
  axios.get(`${BASE_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateUserInfo = (data, token) =>
  axios.put(`${BASE_URL}/users/me`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const changePassword = (data, token) =>
  axios.put(`${BASE_URL}/users/change-password`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const requestResetPassword = (data) =>
  axios.post(`${BASE_URL}/auth/forgot-password`, data);

  // ===== PAYMENT ========
export const createPayment = (data) =>
  axios.post(`${BASE_URL}/payment/create`, data);
  
  
  
