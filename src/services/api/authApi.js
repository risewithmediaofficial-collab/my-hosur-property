import apiClient, { withAuth } from "./client";

// ── Helpers ──────────────────────────────────────────────────────────────────
const logResponse = (label, data) => {
  console.log(`[authApi] ${label} response:`, data);
  return data;
};

const logError = (label, error) => {
  console.error(`[authApi] ${label} error:`, {
    status: error?.response?.status,
    data: error?.response?.data,
    message: error?.message,
  });
  throw error;
};

// ── Auth API calls ────────────────────────────────────────────────────────────

export const signupUser = async (payload) => {
  try {
    const res = await apiClient.post("/api/auth/signup", payload);
    return logResponse("signupUser", res.data);
  } catch (err) {
    return logError("signupUser", err);
  }
};

export const loginUser = async (payload) => {
  try {
    const res = await apiClient.post("/api/auth/login", payload);
    return logResponse("loginUser", res.data);
  } catch (err) {
    return logError("loginUser", err);
  }
};

export const verifyOtp = async (payload) => {
  console.log("[authApi] verifyOtp called with payload:", payload);
  try {
    const res = await apiClient.post("/api/auth/verify-otp", payload);
    return logResponse("verifyOtp", res.data);
  } catch (err) {
    return logError("verifyOtp", err);
  }
};

export const resendOtp = async (payload) => {
  try {
    const res = await apiClient.post("/api/auth/resend-otp", payload);
    return logResponse("resendOtp", res.data);
  } catch (err) {
    return logError("resendOtp", err);
  }
};

export const socialLogin = async (payload) => {
  try {
    const res = await apiClient.post("/api/auth/social", payload);
    return logResponse("socialLogin", res.data);
  } catch (err) {
    return logError("socialLogin", err);
  }
};

export const verifyWidgetToken = async (payload) => {
  console.log("[authApi] verifyWidgetToken called with payload:", payload);
  try {
    const res = await apiClient.post("/api/auth/verify-widget-token", payload);
    return logResponse("verifyWidgetToken", res.data);
  } catch (err) {
    return logError("verifyWidgetToken", err);
  }
};

export const getProfile = async (token) => {
  try {
    const res = await apiClient.get("/api/auth/me", withAuth(token));
    return logResponse("getProfile", res.data);
  } catch (err) {
    return logError("getProfile", err);
  }
};

export const forgotPassword = async (payload) => {
  try {
    const res = await apiClient.post("/api/auth/forgot-password", payload);
    return logResponse("forgotPassword", res.data);
  } catch (err) {
    return logError("forgotPassword", err);
  }
};

export const resetPassword = async (payload) => {
  try {
    const res = await apiClient.post("/api/auth/reset-password", payload);
    return logResponse("resetPassword", res.data);
  } catch (err) {
    return logError("resetPassword", err);
  }
};

export const updateProfile = async (token, payload) => {
  try {
    const res = await apiClient.put("/api/users/profile", payload, withAuth(token));
    return logResponse("updateProfile", res.data);
  } catch (err) {
    return logError("updateProfile", err);
  }
};
