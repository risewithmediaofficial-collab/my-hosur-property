import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 12000,
});

export const withAuth = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export default apiClient;
