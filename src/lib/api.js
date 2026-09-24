import axios from "axios";

const BACKEND_URL = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) 
  || (typeof process !== "undefined" && process.env && process.env.REACT_APP_BACKEND_URL) 
  || "";

export const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("astra_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
