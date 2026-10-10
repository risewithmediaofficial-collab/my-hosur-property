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

  const images = (item.images || []).map(getImageUrl).filter(Boolean);
  const documents = (item.documents || []).map(getImageUrl).filter(Boolean);

  return {
    ...item,
    images,
    documents,
  };
};

const normalizePropertyResponse = (payload) => ({
  ...payload,
  items: (payload?.items || []).map(normalizeProperty),
});

export const fetchFeaturedProperties = async (signal) =>
  normalizePropertyResponse((await apiClient.get("/api/properties/featured", { signal })).data);

export const fetchProperties = async (params, token, signal) =>
  normalizePropertyResponse((await apiClient.get("/api/properties", { params, signal, ...(token ? withAuth(token) : {}) })).data);

export const fetchHomeProperties = async (signal) => {
  const featured = await fetchFeaturedProperties(signal);
  if (featured?.items?.length) return featured;
  return fetchProperties({ limit: 8 }, undefined, signal);
};

export const fetchPropertyLocations = async () => {
  try {
    const res = await apiClient.get("/api/properties/locations");
    return res.data?.locations || [];
  } catch {
    return [];
  }
};

export const fetchPropertyById = async (id, token, signal) => {
  const response = await apiClient.get(`/api/properties/${id}`, { ...(token ? withAuth(token) : {}), signal });
  return {
    ...response.data,
    property: normalizeProperty(response.data?.property),
    similar: (response.data?.similar || []).map(normalizeProperty),
  };
};

export const fetchMyProperties = async (token) =>
  normalizePropertyResponse((await apiClient.get("/api/properties/mine", withAuth(token))).data);

export const createProperty = async (token, payload) =>
  normalizeProperty((await apiClient.post("/api/properties", payload, withAuth(token))).data);

export const updateProperty = async (token, id, payload) =>
  normalizeProperty((await apiClient.put(`/api/properties/${id}`, payload, withAuth(token))).data);

export const deleteProperty = async (token, id) => (await apiClient.delete(`/api/properties/${id}`, withAuth(token))).data;

export const promoteProperty = async (token, id) => (await apiClient.post(`/api/properties/${id}/promote`, {}, withAuth(token))).data;

export const uploadPropertyFiles = async (token, files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const response = await apiClient.post("/api/properties/upload", formData, {
    ...withAuth(token),
    headers: {
      ...withAuth(token).headers,
      "Content-Type": "multipart/form-data",
    },
  });

  return {
    ...response.data,
    images: response.data.images?.map(getImageUrl) || [],
    documents: response.data.documents?.map(getImageUrl) || [],
  };
};
