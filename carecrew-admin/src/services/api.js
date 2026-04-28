import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("adminToken");
      window.location.href = "/admin/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────
export const adminLogin = (email, password) =>
  api.post("/admin/login", { email, password });

// ── Dashboard ─────────────────────────────────────────────────────
export const getDashboardStats = () => api.get("/admin/dashboard");

// ── Services ──────────────────────────────────────────────────────
export const getServices = () => api.get("/services");
export const createService = (formData) =>
  api.post("/services", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const updateService = (id, formData) =>
  api.put(`/services/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
export const deleteService = (id) => api.delete(`/services/${id}`);

// ── Professionals ─────────────────────────────────────────────────
export const getProfessionals = () => api.get("/admin/professionals");
export const approveProfessional = (id) => api.patch(`/admin/professionals/${id}/approve`);
export const rejectProfessional = (id) => api.patch(`/admin/professionals/${id}/reject`);

// ── Bookings ──────────────────────────────────────────────────────
export const getBookings = () => api.get("/admin/bookings");

// ── Users ─────────────────────────────────────────────────────────
export const getUsers = () => api.get("/admin/users");

export default api;
