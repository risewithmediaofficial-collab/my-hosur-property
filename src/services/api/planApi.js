import apiClient from "./client";

export const fetchPlans = async (params) => (await apiClient.get("/api/plans", { params })).data;
