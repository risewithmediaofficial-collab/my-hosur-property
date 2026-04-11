import apiClient, { withAuth } from "./client";

export const fetchMyNotifications = async (token) =>
  (await apiClient.get("/notifications/mine", withAuth(token))).data;

export const markNotificationRead = async (token, id) =>
  (await apiClient.patch(`/notifications/${id}/read`, {}, withAuth(token))).data;
