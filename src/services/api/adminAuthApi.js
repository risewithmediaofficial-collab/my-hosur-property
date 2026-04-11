import apiClient from "./client";

export const adminLoginUser = async (payload) => (await apiClient.post("/admin-auth/login", payload)).data;
