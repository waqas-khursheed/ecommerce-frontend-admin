import axios, { AxiosError } from "axios";
import { clearAuthToken, getAuthToken } from "./auth-token";
import type { ApiErrorResponse } from "@/types/api";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

// Uploaded images are served from the API origin at /uploads/<module>/<file>,
// not under the /api prefix (see backed/src/app.js's express.static mount).
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

// The backend stores/returns a bare filename for every image field — the
// frontend has to build the full URL itself.
export const uploadUrl = (moduleName: string, filename?: string | null) =>
  filename ? `${API_ORIGIN}/uploads/${moduleName}/${filename}` : null;

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Image/file uploads (categories, brands, attribute items, products) send
  // FormData — let axios/the browser set the multipart boundary itself
  // instead of the instance's default "application/json".
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      clearAuthToken();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
