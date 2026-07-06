import axios from "axios";
import { toast } from "sonner";
import { getCsrfToken } from "./csrf";
import { setGlobalOfflineHandler } from "./offlineSignal";

const api = axios.create({
  // baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor: attach CSRF token to mutating requests ──────────────

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

// ─── Refresh token queue ──────────────────────────────────────────────────────
// Prevents multiple simultaneous 401s from firing parallel refresh calls.

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

function drainQueue() {
  refreshQueue.forEach((cb) => cb());
  refreshQueue = [];
}

// ─── Response interceptor ─────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => {
    setGlobalOfflineHandler(false);
    return response;
  },
  async (error) => {
    if (!error.response) {
      setGlobalOfflineHandler(true);
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const originalRequest = error.config;

    // ── Transparent token refresh on 401 ────────────────────────────────────
    // Skip retry for the auth endpoints themselves to avoid infinite loops.
    const isAuthEndpoint =
      originalRequest?.url?.includes("/testlogin/refresh") ||
      originalRequest?.url?.includes("/testlogin/login") ||
      originalRequest?.url?.includes("/testlogin/logout");

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Another refresh is already in flight — queue this request.
        return new Promise((resolve) => {
          refreshQueue.push(() => resolve(api(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // POST /testlogin/refresh — CSRF header is attached by the request
        // interceptor above since this is a POST.
        await api.post("/testlogin/refresh");
        drainQueue();
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token itself is dead — force a real re-login.
        refreshQueue = [];
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
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
