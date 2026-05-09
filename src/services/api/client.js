import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "");
const isLocalDev =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);
const deployedApiBaseUrl = configuredApiUrl
  ? `${configuredApiUrl}/api`
  : configuredBaseUrl || "/api";
const baseURL =
  isLocalDev && !configuredApiUrl && (!configuredBaseUrl || configuredBaseUrl === "/api")
    ? "/api"
    : deployedApiBaseUrl;

const apiClient = axios.create({
  baseURL,
  timeout: 12000,
});

export const withAuth = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export default apiClient;
