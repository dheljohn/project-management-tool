import axios from "axios";
import { toast } from "sonner"; // or whatever toast lib you pick

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && !error.config?.url?.includes("testlogin")) {
      window.location.href = "/login";
    }

    if (status === 400) {
      console.error("Backend Validation Error Details:", error.response.data);
    }

    if (status === 429) {
      const message =
        error.response?.data?.message ??
        "Too many requests. Please wait a moment and try again.";
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default api;
