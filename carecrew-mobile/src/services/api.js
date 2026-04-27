import axios from "axios";
import auth from "@react-native-firebase/auth";

import { API_BASE } from "../constants/api.js";

const api = axios.create({ baseURL: API_BASE, timeout: 15000 });

// Auto-attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  const user = auth().currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const customerLogin = (firebaseToken) =>
  api.post("/auth/customer/login", {}, { headers: { Authorization: `Bearer ${firebaseToken}` } });

export const professionalLogin = (firebaseToken) =>
  api.post("/auth/professional/login", {}, { headers: { Authorization: `Bearer ${firebaseToken}` } });

export const registerProfessional = (formData) =>
  api.post("/auth/professional/register", formData, { headers: { "Content-Type": "multipart/form-data" } });

// User
export const getProfile = () => api.get("/users/profile");
export const updateProfile = (data) => api.put("/users/profile", data);

// Professional
export const getProfessionalProfile = (id) => api.get(`/professionals/${id}`);
export const updateProfessional = (id, data) => api.put(`/professionals/${id}`, data);
export const toggleOnline = (id) => api.put(`/professionals/${id}/toggle-online`);

// Services
export const getAllServices = () => api.get("/services");
export const getServiceById = (id) => api.get(`/services/${id}`);

// Bookings
export const createBooking = (data) => api.post("/bookings/create", data);
export const getCustomerBookings = (customerId) => api.get(`/bookings/customer/${customerId}`);
export const getProfessionalJobs = (professionalId) => api.get(`/bookings/professional/${professionalId}/jobs`);
export const getProfessionalTasks = (professionalId) => api.get(`/bookings/professional/${professionalId}/tasks`);
export const acceptBooking = (id, professionalId) => api.post(`/bookings/${id}/accept`, { professionalId });
export const rejectBooking = (id) => api.post(`/bookings/${id}/reject`);
export const completeBooking = (id) => api.post(`/bookings/${id}/complete`);

// Payments
export const createPaymentOrder = (bookingId) => api.post("/payments/create-order", { bookingId });
export const verifyPayment = (data) => api.post("/payments/verify", data);
export const cashPayment = (bookingId) => api.post("/payments/cash", { bookingId });

// Reviews
export const createReview = (data) => api.post("/reviews", data);
export const getProfessionalReviews = (professionalId) => api.get(`/reviews/professional/${professionalId}`);

// Notifications
export const getNotifications = () => api.get("/notifications");
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllRead = () => api.patch("/notifications/read-all");

// Translate
export const translateText = (text, targetLang) => api.post("/translate", { text, targetLang });

export default api;
