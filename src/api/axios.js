import axios from "axios";

const baseURL = import.meta.env.DEV
  ? ""
  : import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL,
  withCredentials: false,
  timeout: 12000,
});

export default API;
