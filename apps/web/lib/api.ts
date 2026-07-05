import axios from "axios";
import { toast } from "sonner";
import { getCsrfToken } from "./csrf";
import { setGlobalOfflineHandler } from "./offlineSignal";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach CSRF token to state-changing requests (cookie auth handles the rest)
api.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase();
  if (method && !["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers["x-csrf-token"] = csrfToken;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    setGlobalOfflineHandler(false);
    return response;
  },
  (error) => {
    if (!error.response) {
      setGlobalOfflineHandler(true);
      return Promise.reject(error);
    }
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

    if (status === 403 && error.response?.data?.message?.includes("CSRF")) {
      toast.error("Session expired, please refresh and try again.");
    }

    return Promise.reject(error);
  },
);

export default api;
