import apiClient from "./axios";

export const paymentAPI = {
  processPaymentAndBook: async (paymentData) => {
    return apiClient.post("/payments/process-and-book", paymentData);
  },

  getSavedPaymentMethods: async () => {
    return apiClient.get("/payments/saved-methods");
  },

  deleteSavedPaymentMethod: async (methodId) => {
    return apiClient.delete(`/payments/saved-methods/${methodId}`);
  },

  getPaymentHistory: async () => {
    return apiClient.get("/payments/history");
  },

  getPaymentReceipt: async (paymentId) => {
    return apiClient.get(`/payments/${paymentId}/receipt`);
  },
};
