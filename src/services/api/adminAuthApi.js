import apiClient from "./client";

export const adminLoginUser = async (payload) => (await apiClient.post("/api/admin-auth/login", payload)).data;
