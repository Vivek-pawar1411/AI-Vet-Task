import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  timeout: 30000,
});

export function getErrorMessage(error) {
  return error.response?.data?.message || error.message || "Something went wrong";
}

export default api;