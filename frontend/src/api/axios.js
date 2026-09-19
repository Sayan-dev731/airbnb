import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach access token if stored locally
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("airbnb_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If unauthorized, attempt to clear token if token refresh is expired
      if (originalRequest.url?.includes("/auth/refresh-token") || originalRequest.url?.includes("/auth/login")) {
        localStorage.removeItem("airbnb_token");
        localStorage.removeItem("airbnb_user");
      }
    }
    const message = error.response?.data?.message || error.message || "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
