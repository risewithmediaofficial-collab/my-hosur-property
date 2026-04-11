import apiClient, { withAuth } from "./client";

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
  const baseUrl = apiBaseUrl.replace("/api", "");
  return `${baseUrl}${path}`;
};

export const fetchFeaturedProperties = async () => (await apiClient.get("/properties/featured")).data;
export const fetchProperties = async (params, token) =>
  (await apiClient.get("/properties", { params, ...(token ? withAuth(token) : {}) })).data;
export const fetchPropertyById = async (id, token) => {
  try {
    const config = token ? withAuth(token) : {};
    const response = await apiClient.get(`/properties/${id}`, config);
    console.log("Fetched property response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching property:", error.response?.data || error.message);
    throw error;
  }
};
export const fetchMyProperties = async (token) => (await apiClient.get("/properties/mine", withAuth(token))).data;
export const createProperty = async (token, payload) => (await apiClient.post("/properties", payload, withAuth(token))).data;
export const updateProperty = async (token, id, payload) => (await apiClient.put(`/properties/${id}`, payload, withAuth(token))).data;
export const deleteProperty = async (token, id) => (await apiClient.delete(`/properties/${id}`, withAuth(token))).data;
export const promoteProperty = async (token, id) => (await apiClient.post(`/properties/${id}/promote`, {}, withAuth(token))).data;
export const uploadPropertyFiles = async (token, files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const response = await apiClient.post("/properties/upload", formData, {
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

