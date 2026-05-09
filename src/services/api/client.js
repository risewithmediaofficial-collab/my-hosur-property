import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "");
const isLocalDev =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);
const baseURL =
  isLocalDev && (!configuredBaseUrl || configuredBaseUrl === "/api")
    ? "http://localhost:5001/api"
    : configuredBaseUrl || "/api";

const apiClient = axios.create({
  baseURL,
  timeout: 12000,
});

export const withAuth = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export default apiClient;
