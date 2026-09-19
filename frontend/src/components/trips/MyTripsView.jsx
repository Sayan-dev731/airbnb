import React, { useState, useEffect } from "react";
import { bookingAPI } from "../../api/booking.api";
import { formatCurrency, formatDateFull } from "../../utils/formatters";
import { Plane, Calendar, Users, Ban, FileText, Star } from "lucide-react";
import { useToast } from "../../context/ToastContext";

export const MyTripsView = ({ onSelectListing }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await bookingAPI.getMyTrips();
      const raw = res.data;
      setTrips(Array.isArray(raw) ? raw : (raw?.bookings || []));
    } catch (err) {
      console.warn("Could not fetch trips:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;
    try {
      await bookingAPI.cancelBooking(bookingId, "Cancelled by user in My Trips");
      addToast("Reservation has been cancelled.", "info");
      fetchTrips();
    } catch (err) {
      addToast(err.message || "Failed to cancel reservation", "error");
    }
  };

  if (loading) {
    return (
      <div className="container-airbnb" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 24 }}>Trips</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 160, borderRadius: "var(--radius-card)" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-airbnb" style={{ paddingTop: 40, paddingBottom: 60, minHeight: "70vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Plane size={32} color="var(--airbnb-accent)" />
        <h1 style={{ fontSize: 30, fontWeight: 800 }}>Trips</h1>
      </div>

      {trips.length === 0 ? (
        <div
          style={{
            border: "1px dashed var(--airbnb-border)",
            borderRadius: "var(--radius-card)",
            padding: "60px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No trips booked... yet!</div>
          <p style={{ fontSize: 15, color: "var(--airbnb-muted)", maxWidth: 450, margin: "0 auto 24px" }}>
            Time to dust off your bags and start planning your next holiday discovery.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {trips.map((trip) => {
            const listing = trip.listing;
            const photo = listing?.coverPhoto || listing?.photos?.[0]?.url || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80";

            return (
              <div
                key={trip._id}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--airbnb-border)",
                  borderRadius: "var(--radius-card)",
                  overflow: "hidden",
                  boxShadow: "var(--shadow-search)",
                  transition: "box-shadow var(--transition-fast)",
                }}
              >
                {/* Image */}
                <div
                  onClick={() => listing && onSelectListing && onSelectListing(listing)}
                  style={{
                    width: 240,
                    minHeight: 180,
                    cursor: "pointer",
                    backgroundColor: "var(--airbnb-skeleton)",
                    flexShrink: 0,
                  }}
                  className="trip-card-image"
                >
                  <img
                    src={typeof photo === "string" ? photo : photo.url}
                    alt={listing?.title || "Listing"}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                {/* Details */}
                <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 13, color: "var(--airbnb-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                          {listing?.location?.city || "Stay"} · {listing?.propertyType || "Entire Unit"}
                        </div>
                        <h2
                          onClick={() => listing && onSelectListing && onSelectListing(listing)}
                          style={{ fontSize: 18, fontWeight: 700, color: "var(--airbnb-ink)", cursor: "pointer", marginTop: 2 }}
                        >
                          {listing?.title || "Reserved Property"}
                        </h2>
                      </div>

                      {/* Status Badge */}
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "var(--radius-pill)",
                          fontSize: 12,
                          fontWeight: 700,
                          backgroundColor:
                            trip.bookingStatus === "confirmed"
                              ? "var(--airbnb-success-bg)"
                              : trip.bookingStatus === "cancelled"
                              ? "var(--airbnb-error-bg)"
                              : "var(--airbnb-warning-bg)",
                          color:
                            trip.bookingStatus === "confirmed"
                              ? "var(--airbnb-success)"
                              : trip.bookingStatus === "cancelled"
                              ? "var(--airbnb-error)"
                              : "var(--airbnb-warning)",
                        }}
                      >
                        {trip.bookingStatus.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 12, fontSize: 14, color: "var(--airbnb-muted-dark)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Calendar size={16} />
                        <span>{formatDateFull(trip.checkInDate)} – {formatDateFull(trip.checkOutDate)}</span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Users size={16} />
                        <span>
                          {(trip.guestsCount?.adults || trip.guests?.adults || 1) +
                            (trip.guestsCount?.children || trip.guests?.children || 0)}{" "}
                          guests
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Pricing */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--airbnb-border-soft)" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--airbnb-ink)" }}>
                      {formatCurrency(trip.pricingBreakdown?.grandTotal || trip.pricing?.totalAmount || trip.totalPrice || 0)}
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      {trip.bookingStatus === "confirmed" && (
                        <button
                          type="button"
                          onClick={() => handleCancel(trip._id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "8px 14px",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--airbnb-error)",
                            color: "var(--airbnb-error)",
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          <Ban size={14} />
                          <span>Cancel booking</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => listing && onSelectListing && onSelectListing(listing)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: "var(--airbnb-ink)",
                          color: "#FFFFFF",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        View listing
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .trip-card-image {
            width: 100% !important;
            height: 200px !important;
          }
        }
      `}</style>
    </div>
  );
};
