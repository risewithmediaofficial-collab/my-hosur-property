import client from "./client";

export const createCustomerRequest = (token, payload) =>
  client.post("/api/customer-requests", payload, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data);

export const fetchMyCustomerRequests = (token) =>
  client.get("/api/customer-requests/mine", { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data);

export const fetchCustomerRequestsForAgents = (token, params = {}) =>
  client.get("/api/customer-requests/for-agents", { params, headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data);

export const sendMatchNotification = (token, id) =>
  client.post(`/api/customer-requests/${id}/match-notification`, {}, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data);

export const unlockCustomerLeadIntent = (token, id) =>
  client.post(`/api/customer-requests/${id}/unlock-intent`, {}, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data);

export const verifyCustomerLeadUnlock = (token, payload) =>
  client.post(`/api/customer-requests/verify-unlock`, payload, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data);

export const buyLeadPackIntent = (token) =>
  client.post(`/api/customer-requests/buy-pack`, {}, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data);

export const verifyLeadPackPayment = (token, payload) =>
  client.post(`/api/customer-requests/verify-pack`, payload, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data);
