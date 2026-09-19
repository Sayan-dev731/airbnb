import apiClient from "./axios";

export const favoriteAPI = {
  getMyFavorites: async () => {
    return apiClient.get("/favorites");
  },

  toggleFavorite: async (listingId, collectionName = "My Wishlist") => {
    return apiClient.post(`/favorites/toggle/${listingId}`, { collectionName });
  },
};
