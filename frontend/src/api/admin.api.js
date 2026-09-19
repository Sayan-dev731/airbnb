import apiClient from "./axios";

export const adminAPI = {
  getDashboardStats: async () => {
    return apiClient.get("/admin/dashboard-stats");
  },

  getAllUsers: async (params = {}) => {
    return apiClient.get("/admin/users", { params });
  },

  updateUserRole: async (userId, role) => {
    return apiClient.patch(`/admin/users/${userId}/role`, { role });
  },

  toggleListingPublish: async (listingId) => {
    return apiClient.patch(`/admin/listings/${listingId}/toggle-publish`);
  },

  toggleListingFeature: async (listingId) => {
    return apiClient.patch(`/admin/listings/${listingId}/toggle-feature`);
  },

  getAllBookings: async () => {
    return apiClient.get("/admin/bookings");
  },
};
