// src/services/api.js
import axios from "axios";
import { readAuthSession } from "./authSession";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const session = readAuthSession();
  if (session?.token) config.headers.Authorization = `Bearer ${session.token}`;
  return config;
});

export default api;
