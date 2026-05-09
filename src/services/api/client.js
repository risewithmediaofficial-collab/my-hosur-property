import API from "../../api/axios";

export const withAuth = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export default API;
