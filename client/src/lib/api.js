import axios from "axios";

const api = axios.create({
  baseURL:"https://ai-vet-task-server.onrender.com",
  withCredentials: true,
  timeout: 30000,
});

export function getErrorMessage(error) {
  return error.response?.data?.message || error.message || "Something went wrong";
}

export default api;