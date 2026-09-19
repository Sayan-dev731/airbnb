import React, { useState } from "react";
import { X, Calendar, Users, DollarSign, Upload, Trash2, CheckCircle2, Shield, Plus, Sparkles } from "lucide-react";
import { formatCurrency, formatDateFull } from "../../utils/formatters";
import { listingAPI } from "../../api/listing.api";
import { useToast } from "../../context/ToastContext";

export const ListingInventoryModal = ({ listing, reservations = [], isOpen, onClose, onUpdated }) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("bookings"); // 'bookings' | 'inventory' | 'photos'
  const [loading, setLoading] = useState(false);

  // Listing inventory editable states
  const [basePrice, setBasePrice] = useState(listing?.pricing?.basePrice || 5000);
  const [discountPercentage, setDiscountPercentage] = useState(listing?.pricing?.discountPercentage || 0);
  const [cleaningFee, setCleaningFee] = useState(listing?.pricing?.cleaningFee || 500);
  const [guests, setGuests] = useState(listing?.capacity?.guests || 4);
  const [bedrooms, setBedrooms] = useState(listing?.capacity?.bedrooms || 2);
  const [beds, setBeds] = useState(listing?.capacity?.beds || 2);
  const [bathrooms, setBathrooms] = useState(listing?.capacity?.bathrooms || 2);

  // Photos state
  const initialPhotos = listing?.photos?.map((p) => (typeof p === "string" ? p : p.url)) || [
    listing?.coverPhoto || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
  ];
  const [photos, setPhotos] = useState(initialPhotos);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen || !listing) return null;

  // Filter reservations specific to this listing
  const listingBookings = reservations.filter(
    (r) => (r.listing?._id || r.listing) === listing._id
  );

  const totalListingEarnings = listingBookings.reduce((sum, r) => {
    if (r.bookingStatus === "confirmed" || r.bookingStatus === "completed") {
      return sum + (r.pricingBreakdown?.grandTotal || r.pricingBreakdown?.totalAmount || r.pricing?.totalAmount || r.totalPrice || 0);
    }
    return sum;
  }, 0);

  const handleDeviceFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        addToast("Please select valid image files", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvt) => {
        if (uploadEvt.target?.result) {
          setPhotos((prev) => [...prev, uploadEvt.target.result]);
        }
      };
      reader.readAsDataURL(file);
    });
    addToast(`${files.length} photo(s) selected from your device`, "success");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (uploadEvt) => {
        if (uploadEvt.target?.result) {
          setPhotos((prev) => [...prev, uploadEvt.target.result]);
        }
      };
      reader.readAsDataURL(file);
    });
    addToast(`${files.length} photo(s) added`, "success");
  };

  const handleAddUrl = () => {
    if (newPhotoUrl.trim()) {
      setPhotos([...photos, newPhotoUrl.trim()]);
      setNewPhotoUrl("");
      addToast("Photo URL added", "info");
    }
  };

  const handleSetCover = (index) => {
    const chosen = photos[index];
    const rest = photos.filter((_, i) => i !== index);
    setPhotos([chosen, ...rest]);
    addToast("Cover photo updated", "info");
  };

  const handleRemovePhoto = (index) => {
    if (photos.length <= 1) {
      addToast("Listing must have at least 1 photo", "error");
      return;
    }
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSaveInventory = async () => {
    setLoading(true);
    try {
      const payload = {
        pricing: {
          basePrice: Number(basePrice),
          discountPercentage: Number(discountPercentage),
          cleaningFee: Number(cleaningFee),
          currency: "INR",
        },
        capacity: {
          guests: Number(guests),
          bedrooms: Number(bedrooms),
          beds: Number(beds),
          bathrooms: Number(bathrooms),
        },
        photos: photos.map((url, i) => ({
          url,
          isCover: i === 0,
          order: i,
        })),
        coverPhoto: photos[0],
      };

      await listingAPI.updateListing(listing._id, payload);
      addToast("Listing inventory and photos updated successfully! 🎉", "success");
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      addToast(err.message || "Failed to update listing inventory", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 860,
          maxWidth: "100%",
          maxHeight: "90vh",
          backgroundColor: "#FFFFFF",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-modal)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "scaleUp 200ms ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid var(--airbnb-border-soft)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{ padding: 4, display: "flex", borderRadius: "var(--radius-circle)" }}
          >
            <X size={20} />
          </button>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            Listing Management & Guest Bookings
          </div>
          <div style={{ width: 24 }} />
        </div>

        {/* Listing Mini Hero */}
        <div
          style={{
            padding: "16px 24px",
            backgroundColor: "var(--airbnb-bg)",
            borderBottom: "1px solid var(--airbnb-border-soft)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img
              src={photos[0] || listing.coverPhoto}
              alt={listing.title}
              style={{ width: 64, height: 64, borderRadius: "var(--radius-sm)", objectFit: "cover" }}
            />
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--airbnb-ink)" }}>{listing.title}</h2>
              <div style={{ fontSize: 13, color: "var(--airbnb-muted)", marginTop: 2 }}>
                {listing.location?.city} · {listing.propertyType} · {formatCurrency(listing.pricing?.basePrice)}/night
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--airbnb-muted)", textTransform: "uppercase" }}>Bookings</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--airbnb-ink)" }}>{listingBookings.length}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--airbnb-muted)", textTransform: "uppercase" }}>Total Payout</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--airbnb-success)" }}>{formatCurrency(totalListingEarnings)}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: 24, padding: "0 24px", borderBottom: "1px solid var(--airbnb-border)" }}>
          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            style={{
              padding: "12px 0",
              fontSize: 14,
              fontWeight: activeTab === "bookings" ? 700 : 500,
              color: activeTab === "bookings" ? "var(--airbnb-ink)" : "var(--airbnb-muted)",
              borderBottom: `2px solid ${activeTab === "bookings" ? "var(--airbnb-ink)" : "transparent"}`,
            }}
          >
            Guest Bookings ({listingBookings.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("inventory")}
            style={{
              padding: "12px 0",
              fontSize: 14,
              fontWeight: activeTab === "inventory" ? 700 : 500,
              color: activeTab === "inventory" ? "var(--airbnb-ink)" : "var(--airbnb-muted)",
              borderBottom: `2px solid ${activeTab === "inventory" ? "var(--airbnb-ink)" : "transparent"}`,
            }}
          >
            Inventory & Rates
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("photos")}
            style={{
              padding: "12px 0",
              fontSize: 14,
              fontWeight: activeTab === "photos" ? 700 : 500,
              color: activeTab === "photos" ? "var(--airbnb-ink)" : "var(--airbnb-muted)",
              borderBottom: `2px solid ${activeTab === "photos" ? "var(--airbnb-ink)" : "transparent"}`,
            }}
          >
            Photo Gallery ({photos.length})
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {/* TAB 1: Guest Bookings */}
          {activeTab === "bookings" && (
            <div>
              {listingBookings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 16px" }}>
                  <Users size={40} color="var(--airbnb-muted)" style={{ margin: "0 auto 12px" }} />
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No guest bookings for this listing yet</h3>
                  <p style={{ fontSize: 13, color: "var(--airbnb-muted)" }}>
                    When guests book this specific property, their full reservation details will be listed here.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {listingBookings.map((b) => (
                    <div
                      key={b._id}
                      style={{
                        padding: "18px 20px",
                        border: "1px solid var(--airbnb-border)",
                        borderRadius: "var(--radius-card)",
                        backgroundColor: "#FFFFFF",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <img
                            src={b.user?.avatar?.url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                            alt={b.user?.name || "Guest"}
                            style={{ width: 40, height: 40, borderRadius: "var(--radius-circle)", objectFit: "cover" }}
                          />
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--airbnb-ink)" }}>
                              {b.user?.name || "Guest User"}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--airbnb-muted)" }}>
                              {b.user?.email || "guest@airbnb.com"}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--airbnb-ink)" }}>
                            {formatCurrency(b.pricingBreakdown?.grandTotal || b.pricingBreakdown?.totalAmount || b.pricing?.totalAmount || b.totalPrice || 0)}
                          </div>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "var(--radius-pill)",
                              fontSize: 11,
                              fontWeight: 700,
                              backgroundColor: b.bookingStatus === "confirmed" ? "var(--airbnb-success-bg)" : "var(--airbnb-warning-bg)",
                              color: b.bookingStatus === "confirmed" ? "var(--airbnb-success)" : "var(--airbnb-warning)",
                            }}
                          >
                            {(b.bookingStatus || "CONFIRMED").toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 13, color: "var(--airbnb-muted-dark)", paddingTop: 10, borderTop: "1px solid var(--airbnb-border-soft)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Calendar size={15} />
                          <span>{formatDateFull(b.checkInDate)} – {formatDateFull(b.checkOutDate)}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Users size={15} />
                          <span>
                            {(b.guestsCount?.adults || b.guests?.adults || 1) + (b.guestsCount?.children || b.guests?.children || 0)} Guests ({(b.guestsCount?.adults || b.guests?.adults || 1)} adults{(b.guestsCount?.children || b.guests?.children) ? `, ${b.guestsCount?.children || b.guests?.children} children` : ""})
                          </span>
                        </div>
                        {b.specialRequests && (
                          <div style={{ width: "100%", fontSize: 12, color: "var(--airbnb-muted)", fontStyle: "italic" }}>
                            Special note: "{b.specialRequests}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Inventory & Rates */}
          {activeTab === "inventory" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Pricing Settings</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Nightly Rate (₹)</div>
                  <input
                    type="number"
                    min={100}
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    style={{ width: "100%", fontSize: 15, fontWeight: 700, marginTop: 2 }}
                  />
                </div>

                <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Discount (%)</div>
                  <input
                    type="number"
                    min={0}
                    max={90}
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    style={{ width: "100%", fontSize: 15, fontWeight: 700, marginTop: 2 }}
                  />
                </div>

                <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Cleaning Fee (₹)</div>
                  <input
                    type="number"
                    min={0}
                    value={cleaningFee}
                    onChange={(e) => setCleaningFee(e.target.value)}
                    style={{ width: "100%", fontSize: 15, fontWeight: 700, marginTop: 2 }}
                  />
                </div>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 12 }}>Capacity & Rooms</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Max Guests</div>
                  <input
                    type="number"
                    min={1}
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    style={{ width: "100%", fontSize: 15, fontWeight: 700, marginTop: 2 }}
                  />
                </div>

                <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Bedrooms</div>
                  <input
                    type="number"
                    min={1}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    style={{ width: "100%", fontSize: 15, fontWeight: 700, marginTop: 2 }}
                  />
                </div>

                <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Beds</div>
                  <input
                    type="number"
                    min={1}
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                    style={{ width: "100%", fontSize: 15, fontWeight: 700, marginTop: 2 }}
                  />
                </div>

                <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Bathrooms</div>
                  <input
                    type="number"
                    min={1}
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    style={{ width: "100%", fontSize: 15, fontWeight: 700, marginTop: 2 }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Photos Gallery & Upload */}
          {activeTab === "photos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Drag Drop Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${isDragging ? "var(--airbnb-ink)" : "var(--airbnb-border)"}`,
                  backgroundColor: isDragging ? "var(--airbnb-surface-muted)" : "var(--airbnb-bg)",
                  borderRadius: "var(--radius-card)",
                  padding: "20px 16px",
                  textAlign: "center",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <Upload size={22} color="var(--airbnb-accent)" />
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--airbnb-ink)" }}>
                    Upload new photos from device
                  </div>
                  <label
                    style={{
                      cursor: "pointer",
                      backgroundColor: "var(--airbnb-ink)",
                      color: "#FFFFFF",
                      padding: "6px 16px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    <span>Browse device files</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleDeviceFileUpload}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              </div>

              {/* URL Input */}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="url"
                  placeholder="Or paste an image URL..."
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    border: "1px solid var(--airbnb-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: 13,
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  style={{
                    backgroundColor: "var(--airbnb-surface-muted)",
                    color: "var(--airbnb-ink)",
                    border: "1px solid var(--airbnb-border)",
                    padding: "8px 16px",
                    borderRadius: "var(--radius-md)",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Add Link
                </button>
              </div>

              {/* Photos Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10, marginTop: 8 }}>
                {photos.map((url, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: "relative",
                      height: 100,
                      borderRadius: "var(--radius-sm)",
                      overflow: "hidden",
                      border: idx === 0 ? "2px solid var(--airbnb-accent)" : "1px solid var(--airbnb-border)",
                    }}
                  >
                    <img src={url} alt={`Listing Photo ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        color: "#FFFFFF",
                        padding: 4,
                        borderRadius: "var(--radius-circle)",
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                    {idx === 0 ? (
                      <span style={{ position: "absolute", bottom: 4, left: 4, backgroundColor: "var(--airbnb-accent)", color: "#FFFFFF", fontSize: 9, padding: "2px 5px", borderRadius: 3, fontWeight: 700 }}>
                        Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetCover(idx)}
                        style={{
                          position: "absolute",
                          bottom: 4,
                          left: 4,
                          backgroundColor: "rgba(0,0,0,0.7)",
                          color: "#FFFFFF",
                          fontSize: 9,
                          padding: "2px 5px",
                          borderRadius: 3,
                          fontWeight: 600,
                        }}
                      >
                        Set cover
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--airbnb-border-soft)", display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: "10px 18px", fontSize: 14, fontWeight: 600 }}
          >
            Close
          </button>

          {(activeTab === "inventory" || activeTab === "photos") && (
            <button
              type="button"
              disabled={loading}
              onClick={handleSaveInventory}
              style={{
                backgroundColor: "var(--airbnb-accent)",
                backgroundImage: "var(--airbnb-accent-gradient)",
                color: "#FFFFFF",
                padding: "10px 24px",
                borderRadius: "var(--radius-sm)",
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? "Saving changes..." : "Save Inventory Changes"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
