import apiClient, { withAuth } from "./client";

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (import.meta.env.DEV) return path;
  const baseUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL)?.trim().replace(/\/+$/, "");
  return baseUrl ? `${baseUrl}${path}` : path;
};

const normalizeProperty = (item) => {
  if (!item) return item;

  return {
    ...item,
    images: (item.images || []).map(getImageUrl).filter(Boolean),
    documents: (item.documents || []).map(getImageUrl).filter(Boolean),
  };
};

export const fetchPublicAgents = async () => (await apiClient.get("/api/users/agents")).data;
export const fetchAgentBySlug = async (slug) => {
  const response = await apiClient.get(`/api/users/agents/${slug}`);
  return {
    ...response.data,
    properties: (response.data?.properties || []).map(normalizeProperty),
  };
};
export const fetchSavedProperties = async (token) => (await apiClient.get("/api/users/saved", withAuth(token))).data;
export const toggleSavedProperty = async (token, payload) =>
  (await apiClient.post("/api/users/saved/toggle", payload, withAuth(token))).data;
