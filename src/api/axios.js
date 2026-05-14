import axios from "axios";

const resolvedApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

const baseURL = import.meta.env.DEV
  ? ""
  : resolvedApiUrl;

const API = axios.create({
  baseURL,
  withCredentials: false,
  timeout: 12000,
});

export default API;
