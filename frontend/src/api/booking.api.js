import apiClient from "./axios";

export const bookingAPI = {
  checkPrice: async ({ listingId, checkInDate, checkOutDate, guests }) => {
    return apiClient.post("/bookings/check-price", {
      listingId,
      checkInDate,
      checkOutDate,
      guests,
    });
  },

  createBooking: async (bookingData) => {
    return apiClient.post("/bookings", bookingData);
  },

  getMyTrips: async () => {
    return apiClient.get("/bookings/my-trips");
  },

  getBookingById: async (bookingId) => {
    return apiClient.get(`/bookings/${bookingId}`);
  },

  cancelBooking: async (bookingId, cancellationReason = "Guest requested cancellation") => {
    return apiClient.patch(`/bookings/${bookingId}/cancel`, { cancellationReason });
  },

  getHostReservations: async () => {
    return apiClient.get("/bookings/host/reservations");
  },
};
