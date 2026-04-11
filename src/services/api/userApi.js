import apiClient, { withAuth } from "./client";

export const fetchSavedProperties = async (token) => (await apiClient.get("/users/saved", withAuth(token))).data;
export const toggleSavedProperty = async (token, payload) =>
  (await apiClient.post("/users/saved/toggle", payload, withAuth(token))).data;
