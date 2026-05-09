import apiClient, { withAuth } from "./client";

export const signupUser = async (payload) => (await apiClient.post("/api/auth/signup", payload)).data;
export const loginUser = async (payload) => (await apiClient.post("/api/auth/login", payload)).data;
export const socialLogin = async (payload) => (await apiClient.post("/api/auth/social", payload)).data;
export const requestOtp = async (payload) => (await apiClient.post("/api/auth/otp/request", payload)).data;
export const verifyOtp = async (payload) => (await apiClient.post("/api/auth/otp/verify", payload)).data;
export const getProfile = async (token) => (await apiClient.get("/api/auth/me", withAuth(token))).data;
