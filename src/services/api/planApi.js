import apiClient, { withAuth } from "./client";

export const fetchPlans = async (params) => (await apiClient.get("/api/plans", { params })).data;
export const activateFreePlan = async (token, payload) =>
  (await apiClient.post("/api/plans/activate-free", payload, withAuth(token))).data;
