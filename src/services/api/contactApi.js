import apiClient from "./client";

export const submitContactEnquiry = async (payload) =>
  (await apiClient.post("/api/contact", payload)).data;

