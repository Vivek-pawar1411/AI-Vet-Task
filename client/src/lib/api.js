import axios from "axios";

// Render backend URL ko direct primary ya fallback me set karein
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://ai-vet-task-server.onrender.com",
  withCredentials: true,
  timeout: 30000,
});

// Request Interceptor: Har request me Bearer token attach karega
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export function getErrorMessage(error) {
  return error.response?.data?.message || error.message || "Something went wrong";
}

export default api;