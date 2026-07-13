import apiClient, { withAuth } from "./client";

// export const createPaymentIntent = async (token, payload) =>
//   (await apiClient.post("/api/payments/create-intent", payload, withAuth(token))).data;

// export const verifyPayment = async (token, payload) =>
//   (await apiClient.post("/api/payments/verify", payload, withAuth(token))).data;

export const fetchMyPayments = async (token) => (await apiClient.get("/api/payments/mine", withAuth(token))).data;

export const submitPaymentRequest = async (token, formData) =>
  (await apiClient.post("/api/payments/payment-request", formData, withAuth(token))).data;

export const fetchUserPaymentRequests = async (token) =>
  (await apiClient.get("/api/payments/payment-request/user", withAuth(token))).data;

