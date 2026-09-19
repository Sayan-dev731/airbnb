import apiClient from "./axios";

export const listingAPI = {
  getListings: async (params = {}) => {
    return apiClient.get("/listings", { params });
  },

  getListingById: async (id) => {
    return apiClient.get(`/listings/${id}`);
  },

  getGuestFavorites: async () => {
    return apiClient.get("/listings/guest-favorites");
  },

  getHostListings: async () => {
    return apiClient.get("/listings/host/my-listings");
  },

  createListing: async (listingData) => {
    const isFormData = listingData instanceof FormData;
    return apiClient.post("/listings", listingData, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
  },

  updateListing: async (id, updateData) => {
    return apiClient.patch(`/listings/${id}`, updateData);
  },

  deleteListing: async (id) => {
    return apiClient.delete(`/listings/${id}`);
  },

  uploadPhotos: async (listingId, formData) => {
    return apiClient.post(`/listings/${listingId}/photos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deletePhoto: async (listingId, photoId) => {
    return apiClient.delete(`/listings/${listingId}/photos/${photoId}`);
  },
};
