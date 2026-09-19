import apiClient from "./axios";

export const reviewAPI = {
  getListingReviews: async (listingId, params = { page: 1, limit: 20 }) => {
    return apiClient.get(`/reviews/listing/${listingId}`, { params });
  },

  createReview: async (reviewData) => {
    return apiClient.post("/reviews", reviewData);
  },

  replyToReview: async (reviewId, hostReply) => {
    return apiClient.post(`/reviews/${reviewId}/reply`, { hostReply });
  },

  deleteReview: async (reviewId) => {
    return apiClient.delete(`/reviews/${reviewId}`);
  },
};
