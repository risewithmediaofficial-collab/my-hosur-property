import apiClient, { withAuth } from "./client";

export const signupUser = async (payload) =>
  (await apiClient.post("/api/auth/signup", payload)).data;

export const loginUser = async (payload) =>
  (await apiClient.post("/api/auth/login", payload)).data;

export const verifyOtp = async (payload) =>
  (await apiClient.post("/api/auth/verify-otp", payload)).data;

export const resendOtp = async (payload) =>
  (await apiClient.post("/api/auth/resend-otp", payload)).data;

export const socialLogin = async (payload) =>
  (await apiClient.post("/api/auth/social", payload)).data;

export const verifyWidgetToken = async (payload) =>
  (await apiClient.post("/api/auth/verify-widget-token", payload)).data;

export const getProfile = async (token, signal) =>
  (await apiClient.get("/api/auth/me", { ...withAuth(token), signal })).data;

export const forgotPassword = async (payload) =>
  (await apiClient.post("/api/auth/forgot-password", payload)).data;

export const resetPassword = async (payload) =>
  (await apiClient.post("/api/auth/reset-password", payload)).data;

export const updateProfile = async (token, payload) =>
  (await apiClient.put("/api/users/profile", payload, withAuth(token))).data;
