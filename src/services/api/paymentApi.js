import apiClient, { withAuth } from "./client";

export const createPaymentIntent = async (token, payload) =>
  (await apiClient.post("/payments/create-intent", payload, withAuth(token))).data;

export const verifyPayment = async (token, payload) =>
  (await apiClient.post("/payments/verify", payload, withAuth(token))).data;

export const fetchMyPayments = async (token) => (await apiClient.get("/payments/mine", withAuth(token))).data;
