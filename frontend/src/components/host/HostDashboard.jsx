import React, { useState, useEffect } from "react";
import { Plus, Home, DollarSign, CalendarCheck, Trash2, Eye, ExternalLink, Sparkles, Users, Settings } from "lucide-react";
import { listingAPI } from "../../api/listing.api";
import { bookingAPI } from "../../api/booking.api";
import { CreateListingModal } from "./CreateListingModal";
import { ListingInventoryModal } from "./ListingInventoryModal";
import { formatCurrency, formatDateFull } from "../../utils/formatters";
import { useToast } from "../../context/ToastContext";

export const HostDashboard = ({ onSelectListing }) => {
  const { addToast } = useToast();
  const [hostListings, setHostListings] = useState([]);
  const [hostReservations, setHostReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedListingForManage, setSelectedListingForManage] = useState(null);
  const [activeTab, setActiveTab] = useState("listings"); // 'listings' | 'reservations'

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listingsRes, resRes] = await Promise.allSettled([
        listingAPI.getHostListings(),
        bookingAPI.getHostReservations(),
      ]);

      if (listingsRes.status === "fulfilled") {
        const rawListings = listingsRes.value.data;
        setHostListings(Array.isArray(rawListings) ? rawListings : (rawListings?.listings || []));
      }
      if (resRes.status === "fulfilled") {
        const rawRes = resRes.value.data;
        setHostReservations(Array.isArray(rawRes) ? rawRes : (rawRes?.reservations || []));
      }
    } catch (err) {
      console.warn("Error fetching host data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm("Are you sure you want to permanently delete this listing?")) return;
    try {
      await listingAPI.deleteListing(listingId);
      addToast("Listing deleted successfully", "info");
      fetchData();
    } catch (err) {
      addToast(err.message || "Failed to delete listing", "error");
    }
  };

  const totalEarnings = hostReservations.reduce((acc, r) => {
    if (r.bookingStatus === "confirmed" || r.bookingStatus === "completed") {
      return acc + (r.pricingBreakdown?.grandTotal || r.pricing?.totalAmount || r.totalPrice || 0);
    }
    return acc;
  }, 0);

  return (
    <div className="container-airbnb" style={{ paddingTop: 40, paddingBottom: 60, minHeight: "70vh" }}>
      {/* Top Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800 }}>Host Dashboard</h1>
          <p style={{ fontSize: 15, color: "var(--airbnb-muted)", marginTop: 4 }}>
            Manage your properties, guest bookings, and host earnings in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "var(--airbnb-accent)",
            backgroundImage: "var(--airbnb-accent-gradient)",
            color: "#FFFFFF",
            padding: "12px 24px",
            borderRadius: "var(--radius-sm)",
            fontSize: 15,
            fontWeight: 700,
            boxShadow: "0 2px 6px rgba(224, 11, 65, 0.4)",
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Create new listing</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 36 }}>
        <div style={{ backgroundColor: "var(--airbnb-bg)", padding: "20px 24px", borderRadius: "var(--radius-card)", border: "1px solid var(--airbnb-border-soft)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--airbnb-muted)", fontSize: 14, fontWeight: 600 }}>
            <Home size={18} />
            <span>Active Listings</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8, color: "var(--airbnb-ink)" }}>
            {hostListings.length}
          </div>
        </div>

        <div style={{ backgroundColor: "var(--airbnb-bg)", padding: "20px 24px", borderRadius: "var(--radius-card)", border: "1px solid var(--airbnb-border-soft)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--airbnb-muted)", fontSize: 14, fontWeight: 600 }}>
            <CalendarCheck size={18} />
            <span>Total Reservations</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8, color: "var(--airbnb-ink)" }}>
            {hostReservations.length}
          </div>
        </div>

        <div style={{ backgroundColor: "var(--airbnb-bg)", padding: "20px 24px", borderRadius: "var(--radius-card)", border: "1px solid var(--airbnb-border-soft)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--airbnb-muted)", fontSize: 14, fontWeight: 600 }}>
            <DollarSign size={18} />
            <span>Estimated Earnings</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8, color: "var(--airbnb-success)" }}>
            {formatCurrency(totalEarnings)}
          </div>
        </div>
      </div>

      {/* Tab Controls */}
      <div style={{ display: "flex", gap: 24, borderBottom: "1px solid var(--airbnb-border)", marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => setActiveTab("listings")}
          style={{
            padding: "10px 0 14px",
            fontSize: 16,
            fontWeight: activeTab === "listings" ? 700 : 500,
            color: activeTab === "listings" ? "var(--airbnb-ink)" : "var(--airbnb-muted)",
            borderBottom: `2px solid ${activeTab === "listings" ? "var(--airbnb-ink)" : "transparent"}`,
          }}
        >
          My Listings ({hostListings.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reservations")}
          style={{
            padding: "10px 0 14px",
            fontSize: 16,
            fontWeight: activeTab === "reservations" ? 700 : 500,
            color: activeTab === "reservations" ? "var(--airbnb-ink)" : "var(--airbnb-muted)",
            borderBottom: `2px solid ${activeTab === "reservations" ? "var(--airbnb-ink)" : "transparent"}`,
          }}
        >
          Reservations ({hostReservations.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "listings" ? (
        hostListings.length === 0 ? (
          <div style={{ border: "1px dashed var(--airbnb-border)", borderRadius: "var(--radius-card)", padding: "60px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>You haven't created any listings yet</div>
            <p style={{ fontSize: 14, color: "var(--airbnb-muted)", marginBottom: 20 }}>
              Start earning by hosting your apartment, villa or spare room on Airbnb.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                backgroundColor: "var(--airbnb-ink)",
                color: "#FFFFFF",
                padding: "12px 24px",
                borderRadius: "var(--radius-sm)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Create your first listing
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
            {hostListings.map((listing) => {
              const photo = listing.coverPhoto || listing.photos?.[0]?.url || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80";
              const listingBookings = hostReservations.filter((r) => (r.listing?._id || r.listing) === listing._id);

              return (
                <div
                  key={listing._id}
                  style={{
                    border: "1px solid var(--airbnb-border)",
                    borderRadius: "var(--radius-card)",
                    overflow: "hidden",
                    backgroundColor: "#FFFFFF",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ position: "relative", height: 190 }}>
                    <img
                      src={typeof photo === "string" ? photo : photo.url}
                      alt={listing.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        backgroundColor: "rgba(0,0,0,0.75)",
                        backdropFilter: "blur(4px)",
                        color: "#FFFFFF",
                        padding: "4px 10px",
                        borderRadius: "var(--radius-pill)",
                        fontSize: 12,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Users size={13} />
                      <span>{listingBookings.length} {listingBookings.length === 1 ? "Guest Booked" : "Guests Booked"}</span>
                    </div>
                  </div>

                  <div style={{ padding: 18, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--airbnb-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                        {listing.location?.city} · {listing.propertyType}
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--airbnb-ink)", marginTop: 4 }}>
                        {listing.title}
                      </h3>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--airbnb-ink)", marginTop: 6 }}>
                        {formatCurrency(listing.pricing?.basePrice)} <span style={{ fontWeight: 400, color: "var(--airbnb-muted)" }}>night</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => setSelectedListingForManage(listing)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          width: "100%",
                          padding: "9px 14px",
                          backgroundColor: "var(--airbnb-ink)",
                          color: "#FFFFFF",
                          borderRadius: "var(--radius-sm)",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        <Settings size={14} />
                        <span>Manage & View Bookings ({listingBookings.length})</span>
                      </button>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid var(--airbnb-border-soft)" }}>
                        <button
                          type="button"
                          onClick={() => onSelectListing && onSelectListing(listing)}
                          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--airbnb-ink)", textDecoration: "underline" }}
                        >
                          <Eye size={14} />
                          <span>Preview Stay</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteListing(listing._id)}
                          style={{ color: "var(--airbnb-error)", display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600 }}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Reservations View */
        hostReservations.length === 0 ? (
          <div style={{ border: "1px dashed var(--airbnb-border)", borderRadius: "var(--radius-card)", padding: "60px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No guest reservations yet</div>
            <p style={{ fontSize: 14, color: "var(--airbnb-muted)" }}>
              As guests book your properties, reservations will show up here.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {hostReservations.map((res) => (
              <div
                key={res._id}
                style={{
                  padding: 20,
                  border: "1px solid var(--airbnb-border)",
                  borderRadius: "var(--radius-card)",
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--airbnb-ink)" }}>
                    {res.listing?.title || "Listing Reservation"}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--airbnb-muted)", marginTop: 4 }}>
                    Guest: {res.user?.name || "Guest"} · {formatDateFull(res.checkInDate)} to {formatDateFull(res.checkOutDate)}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--airbnb-ink)" }}>
                    {formatCurrency(res.pricingBreakdown?.grandTotal || res.pricing?.totalAmount || res.totalPrice || 0)}
                  </div>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "var(--radius-pill)",
                      fontSize: 12,
                      fontWeight: 700,
                      backgroundColor: "var(--airbnb-success-bg)",
                      color: "var(--airbnb-success)",
                    }}
                  >
                    {res.bookingStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => fetchData()}
      />

      {/* Dedicated Listing Management & Bookings Modal */}
      {selectedListingForManage && (
        <ListingInventoryModal
          listing={selectedListingForManage}
          reservations={hostReservations}
          isOpen={Boolean(selectedListingForManage)}
          onClose={() => setSelectedListingForManage(null)}
          onUpdated={() => fetchData()}
        />
      )}
    </div>
  );
};
