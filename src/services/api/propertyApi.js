import apiClient, { withAuth } from "./client";

const CACHE_TTL_MS = 60_000;
let homeCache = null;
let locationsCache = null;

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

export const getCachedHomeProperties = () => {
  if (homeCache && Date.now() < homeCache.expiresAt) {
    return homeCache.data;
  }
  return null;
};

export const invalidatePropertyCaches = () => {
  homeCache = null;
  locationsCache = null;
};

export const fetchFeaturedProperties = async (signal) =>
  normalizePropertyResponse((await apiClient.get("/api/properties/featured", { signal })).data);

export const fetchProperties = async (params, token, signal) =>
  normalizePropertyResponse((await apiClient.get("/api/properties", { params, signal, ...(token ? withAuth(token) : {}) })).data);

export const fetchHomeProperties = async (signal) => {
  const cached = getCachedHomeProperties();
  if (cached) return cached;

  const featured = await fetchFeaturedProperties(signal);
  const result = featured?.items?.length
    ? featured
    : await fetchProperties({ limit: 8 }, undefined, signal);

  if (!signal?.aborted && result?.items) {
    homeCache = { data: result, expiresAt: Date.now() + CACHE_TTL_MS };
  }
  return result;
};

export const fetchPropertyLocations = async () => {
  if (locationsCache && Date.now() < locationsCache.expiresAt) {
    return locationsCache.data;
  }
  try {
    const res = await apiClient.get("/api/properties/locations");
    const locations = res.data?.locations || [];
    locationsCache = { data: locations, expiresAt: Date.now() + CACHE_TTL_MS };
    return locations;
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

export const createProperty = async (token, payload) => {
  const created = normalizeProperty((await apiClient.post("/api/properties", payload, withAuth(token))).data);
  invalidatePropertyCaches();
  return created;
};

export const updateProperty = async (token, id, payload) => {
  const updated = normalizeProperty((await apiClient.put(`/api/properties/${id}`, payload, withAuth(token))).data);
  invalidatePropertyCaches();
  return updated;
};

export const deleteProperty = async (token, id) => {
  const deleted = (await apiClient.delete(`/api/properties/${id}`, withAuth(token))).data;
  invalidatePropertyCaches();
  return deleted;
};

export const promoteProperty = async (token, id) => {
  const promoted = (await apiClient.post(`/api/properties/${id}/promote`, {}, withAuth(token))).data;
  invalidatePropertyCaches();
  return promoted;
};

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
