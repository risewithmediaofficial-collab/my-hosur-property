import apiClient, { withAuth } from "./client";

export const createLead = async (token, payload) => (await apiClient.post("/api/leads", payload, withAuth(token))).data;
export const fetchMyLeads = async (token) => (await apiClient.get("/api/leads/mine", withAuth(token))).data;
export const fetchLeadMarketplace = async (token) => (await apiClient.get("/api/leads/marketplace", withAuth(token))).data;
export const purchaseLead = async (token, id) => (await apiClient.post(`/api/leads/${id}/purchase`, {}, withAuth(token))).data;
export const updateLeadStatus = async (token, id, status) =>
  (await apiClient.patch(`/api/leads/${id}/status`, { status }, withAuth(token))).data;
export const updateLeadApproval = async (token, id, status) =>
  (await apiClient.patch(`/api/leads/${id}/approval`, { status }, withAuth(token))).data;
export const checkMyLeadStatus = async (token, propertyId) => 
  (await apiClient.get(`/api/leads/check/${propertyId}`, withAuth(token))).data;

export const unlockInboxLead = async (token, id) =>
  (await apiClient.post(`/api/leads/${id}/unlock-inbox`, {}, withAuth(token))).data;
