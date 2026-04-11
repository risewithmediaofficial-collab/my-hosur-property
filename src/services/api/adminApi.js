import apiClient, { withAuth } from "./client";

export const fetchAdminMetrics = async (token) => (await apiClient.get("/admin/metrics", withAuth(token))).data;
export const fetchAdminDashboardOverview = async (token) => (await apiClient.get("/admin/dashboard", withAuth(token))).data;
export const fetchAdminRecentActivity = async (token) => (await apiClient.get("/admin/activity/recent", withAuth(token))).data;
export const fetchAdminUsers = async (token) => (await apiClient.get("/admin/users", withAuth(token))).data;
export const updateUserPostingAccess = async (token, userId, enabled) =>
  (await apiClient.patch(`/admin/users/${userId}/posting-access`, { enabled }, withAuth(token))).data;
export const toggleUserStatus = async (token, userId, status) =>
  (await apiClient.patch(`/admin/users/${userId}/status`, { status }, withAuth(token))).data;
export const fetchAdminPropertyApplications = async (token, params) =>
  (await apiClient.get("/admin/applications/properties", { ...withAuth(token), params })).data;
export const fetchAdminPostingAccessApplications = async (token, params) =>
  (await apiClient.get("/admin/applications/posting-access", { ...withAuth(token), params })).data;
export const fetchAdminLeads = async (token, params) =>
  (await apiClient.get("/admin/leads", { ...withAuth(token), params })).data;
export const assignLeadToBroker = async (token, leadId, brokerId) =>
  (await apiClient.patch(`/admin/leads/${leadId}/assign`, { brokerId }, withAuth(token))).data;
export const updateAdminLeadBrokerStatus = async (token, leadId, brokerId, status) =>
  (await apiClient.patch(`/admin/leads/${leadId}/brokers/${brokerId}/status`, { status }, withAuth(token))).data;
export const fetchAdminPayments = async (token) => (await apiClient.get("/admin/payments", withAuth(token))).data;
export const updatePropertyStatus = async (token, propertyId, status) =>
  (await apiClient.patch(`/admin/properties/${propertyId}/status`, { status }, withAuth(token))).data;
export const fetchAdminCustomerRequests = async (token, params) =>
  (await apiClient.get("/admin/customer-requests", { ...withAuth(token), params })).data;
export const fetchAdminLeadUnlocks = async (token, params) =>
  (await apiClient.get("/admin/lead-unlocks", { ...withAuth(token), params })).data;
export const fetchAdminLeadPrice = async (token) =>
  (await apiClient.get("/admin/settings/lead-price", withAuth(token))).data;
export const updateAdminLeadPrice = async (token, value) =>
  (await apiClient.patch("/admin/settings/lead-price", { value }, withAuth(token))).data;
