import apiClient from "./axios";

export const authAPI = {
  login: async (credentials) => {
    return apiClient.post("/auth/login", credentials);
  },

  register: async (userData) => {
    const isFormData = userData instanceof FormData;
    return apiClient.post("/auth/register", userData, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
  },

  logout: async () => {
    return apiClient.post("/auth/logout");
  },

  getCurrentUser: async () => {
    return apiClient.get("/auth/me");
  },

  updateAccount: async (data) => {
    return apiClient.patch("/auth/update-account", data);
  },

  updateAvatar: async (formData) => {
    return apiClient.patch("/auth/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  becomeHost: async () => {
    return apiClient.post("/auth/become-host");
  },

  verifyEmail: async (data) => {
    return apiClient.post("/auth/verify-email", data);
  },
};
