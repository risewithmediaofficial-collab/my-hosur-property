import apiClient, { withAuth } from "./client";

export const fetchSavedProperties = async (token) => (await apiClient.get("/api/users/saved", withAuth(token))).data;
export const toggleSavedProperty = async (token, payload) =>
  (await apiClient.post("/api/users/saved/toggle", payload, withAuth(token))).data;
export const requestRoleChange = async (token, payload) =>
  (await apiClient.post("/api/users/role-change-request", payload, withAuth(token))).data;
export const fetchMyRoleChangeRequests = async (token) =>
  (await apiClient.get("/api/users/role-change-requests", withAuth(token))).data;
