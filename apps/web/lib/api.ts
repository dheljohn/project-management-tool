import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
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

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("testlogin")
    ) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    if (error.response?.status === 400) {
      console.error("Backend Validation Error Details:", error.response.data);
    }
    return Promise.reject(error);
  },
);

export default api;
