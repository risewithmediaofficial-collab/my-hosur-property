import apiClient, { withAuth } from "./client";

export const fetchAdminMetrics = async (token) => (await apiClient.get("/api/admin/metrics", withAuth(token))).data;
export const fetchAdminDashboardOverview = async (token) => (await apiClient.get("/api/admin/dashboard", withAuth(token))).data;
export const fetchAdminRecentActivity = async (token) => (await apiClient.get("/api/admin/activity/recent", withAuth(token))).data;
export const fetchAdminUsers = async (token) => (await apiClient.get("/api/admin/users", withAuth(token))).data;
export const updateUserPostingAccess = async (token, userId, enabled) =>
  (await apiClient.patch(`/api/admin/users/${userId}/posting-access`, { enabled }, withAuth(token))).data;
export const toggleUserStatus = async (token, userId, status) =>
  (await apiClient.patch(`/api/admin/users/${userId}/status`, { status }, withAuth(token))).data;
export const updateAdminUserNotes = async (token, userId, notes) =>
  (await apiClient.patch(`/api/admin/users/${userId}/notes`, { notes }, withAuth(token))).data;
export const sendAdminEmail = async (token, payload) =>
  (await apiClient.post("/api/admin/users/email", payload, withAuth(token))).data;
export const fetchAdminPropertyApplications = async (token, params) =>
  (await apiClient.get("/api/admin/applications/properties", { ...withAuth(token), params })).data;
export const fetchAdminPostingAccessApplications = async (token, params) =>
  (await apiClient.get("/api/admin/applications/posting-access", { ...withAuth(token), params })).data;
export const fetchAdminLeads = async (token, params) =>
  (await apiClient.get("/api/admin/leads", { ...withAuth(token), params })).data;
export const assignLeadToBroker = async (token, leadId, brokerId) =>
  (await apiClient.patch(`/api/admin/leads/${leadId}/assign`, { brokerId }, withAuth(token))).data;
export const updateAdminLeadBrokerStatus = async (token, leadId, brokerId, status) =>
  (await apiClient.patch(`/api/admin/leads/${leadId}/brokers/${brokerId}/status`, { status }, withAuth(token))).data;
export const fetchAdminPayments = async (token, params) =>
  (await apiClient.get("/api/admin/payments", { ...withAuth(token), params })).data;
export const updatePropertyStatus = async (token, propertyId, status) =>
  (await apiClient.patch(`/api/admin/properties/${propertyId}/status`, { status }, withAuth(token))).data;
export const fetchAdminCustomerRequests = async (token, params) =>
  (await apiClient.get("/api/admin/customer-requests", { ...withAuth(token), params })).data;
export const fetchAdminLeadUnlocks = async (token, params) =>
  (await apiClient.get("/api/admin/lead-unlocks", { ...withAuth(token), params })).data;
export const fetchAdminLeadPrice = async (token) =>
  (await apiClient.get("/api/admin/settings/lead-price", withAuth(token))).data;
export const updateAdminLeadPrice = async (token, value) =>
  (await apiClient.patch("/api/admin/settings/lead-price", { value }, withAuth(token))).data;
export const deleteAdminUser = async (token, userId) =>
  (await apiClient.delete(`/api/admin/users/${userId}`, withAuth(token))).data;
export const deleteAdminLead = async (token, leadId) =>
  (await apiClient.delete(`/api/admin/leads/${leadId}`, withAuth(token))).data;
export const deleteAdminCustomerRequest = async (token, requestId) =>
  (await apiClient.delete(`/api/admin/customer-requests/${requestId}`, withAuth(token))).data;
export const deleteAdminLeadUnlock = async (token, unlockId) =>
  (await apiClient.delete(`/api/admin/lead-unlocks/${unlockId}`, withAuth(token))).data;

export const fetchAdminPaymentRequests = async (token) =>
  (await apiClient.get("/api/admin/payment-requests", withAuth(token))).data;
export const approveAdminPaymentRequest = async (token, requestId, payload) =>
  (await apiClient.put(`/api/admin/payment-request/${requestId}/approve`, payload, withAuth(token))).data;
export const rejectAdminPaymentRequest = async (token, requestId, payload) =>
  (await apiClient.put(`/api/admin/payment-request/${requestId}/reject`, payload, withAuth(token))).data;

