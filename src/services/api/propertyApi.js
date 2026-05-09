import apiClient, { withAuth } from "./client";

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const baseUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");
  return `${baseUrl}${path}`;
};

export const fetchFeaturedProperties = async () => (await apiClient.get("/api/properties/featured")).data;
export const fetchProperties = async (params, token) =>
  (await apiClient.get("/api/properties", { params, ...(token ? withAuth(token) : {}) })).data;

export const fetchHomeProperties = async () => {
  const featured = await fetchFeaturedProperties();
  if (featured?.items?.length) return featured;
  return fetchProperties({ limit: 8 });
};
export const fetchPropertyById = async (id, token) => {
  try {
    const config = token ? withAuth(token) : {};
    const response = await apiClient.get(`/api/properties/${id}`, config);
    console.log("Fetched property response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching property:", error.response?.data || error.message);
    throw error;
  }
};
export const fetchMyProperties = async (token) => (await apiClient.get("/api/properties/mine", withAuth(token))).data;
export const createProperty = async (token, payload) => (await apiClient.post("/api/properties", payload, withAuth(token))).data;
export const updateProperty = async (token, id, payload) => (await apiClient.put(`/api/properties/${id}`, payload, withAuth(token))).data;
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
