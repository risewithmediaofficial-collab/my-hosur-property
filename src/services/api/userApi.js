import apiClient, { withAuth } from "./client";

export const fetchSavedProperties = async (token) => (await apiClient.get("/api/users/saved", withAuth(token))).data;
export const toggleSavedProperty = async (token, payload) =>
  (await apiClient.post("/api/users/saved/toggle", payload, withAuth(token))).data;
