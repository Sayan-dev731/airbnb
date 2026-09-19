import React, { useState, useEffect } from "react";
import { listingAPI } from "../../api/listing.api";
import { PDPHeader } from "../pdp/PDPHeader";
import { PDPGallery } from "../pdp/PDPGallery";
import { PDPOverview } from "../pdp/PDPOverview";
import { PDPBookingCard } from "../pdp/PDPBookingCard";
import { PDPCalendarSection } from "../pdp/PDPCalendarSection";
import { PDPGuestFavouriteBanner } from "../pdp/PDPGuestFavouriteBanner";
import { PDPReviews } from "../pdp/PDPReviews";
import { PDPHostSection } from "../pdp/PDPHostSection";
import { CheckoutModal } from "../checkout/CheckoutModal";
import { useSearch } from "../../context/SearchContext";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { ChevronLeft } from "lucide-react";

export const ListingDetailPage = ({ listingId, initialListing, onBack, onBookingSuccess }) => {
  const { checkInDate, checkOutDate, guests, setCheckInDate, setCheckOutDate, setGuests } = useSearch();

  const [listing, setListing] = useState(initialListing || null);
  const [loading, setLoading] = useState(!initialListing);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activePricingQuote, setActivePricingQuote] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (!initialListing && listingId) {
      const fetchListing = async () => {
        try {
          setLoading(true);
          const res = await listingAPI.getListingById(listingId);
          setListing(res.data?.listing || res.data);
        } catch (err) {
          console.warn("Could not fetch listing PDP:", err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchListing();
    }
  }, [listingId, initialListing]);

  if (loading || !listing) {
    return (
      <div className="container-pdp" style={{ paddingTop: 32, paddingBottom: 60 }}>
        <div className="skeleton" style={{ height: 32, width: "60%", marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 20, width: "40%", marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 420, borderRadius: "var(--radius-card)", marginBottom: 32 }} />
      </div>
    );
  }

  const lat = listing.location?.coordinates?.lat || 15.549;
  const lng = listing.location?.coordinates?.lng || 73.753;

  const customPinIcon = L.divIcon({
    className: "custom-leaflet-pin",
    html: `
      <div style="background: #FF385C; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(224,11,65,0.4); border: 2px solid #FFFFFF;">
        <svg viewBox="0 0 32 32" style="width: 20px; height: 20px; fill: #FFFFFF;"><path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.011.315c0 4.533-3.21 7.806-7.5 7.806-3.056 0-5.46-1.579-6-3.805-.54 2.226-2.944 3.805-6 3.805-4.29 0-7.5-3.273-7.5-7.806 0-1.127.31-2.296.971-3.711l.145-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.282 0-2.316.638-3.329 2.433l-.478.918C10.252 10.088 6.103 18.78 5.132 21.05l-.105.253c-.567 1.217-.827 2.164-.827 3.091 0 3.39 2.37 5.806 5.5 5.806 2.658 0 4.887-1.748 5.253-4.184l.047-.396v-5.226c-1.378-.475-2.4-1.758-2.4-3.294 0-1.928 1.57-3.5 3.5-3.5s3.5 1.572 3.5 3.5c0 1.536-1.022 2.819-2.4 3.294v5.226l.047.396c.366 2.436 2.595 4.184 5.253 4.184 3.13 0 5.5-2.416 5.5-5.806 0-.927-.26-1.874-.827-3.091l-.105-.253c-.971-2.27-5.12-10.962-7.059-14.699l-.478-.918C18.316 3.638 17.282 3 16 3zm0 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" /></svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

  return (
    <div className="container-pdp" style={{ paddingTop: 24, paddingBottom: 80 }}>
      {/* Back to Results Navigation Link */}
      <button
        type="button"
        onClick={onBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 14,
          fontWeight: 600,
          color: "var(--airbnb-ink)",
          marginBottom: 18,
          textDecoration: "underline",
        }}
      >
        <ChevronLeft size={16} />
        <span>All stays</span>
      </button>

      {/* Header */}
      <PDPHeader listing={listing} />

      {/* 5-Photo Showcase Gallery */}
      <PDPGallery listing={listing} />

      {/* Main PDP Grid: Details (Left) + Sticky Booking Card (Right) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.55fr 1fr",
          gap: 64,
          alignItems: "start",
          position: "relative",
        }}
        className="pdp-main-grid"
      >
        {/* Left Column: Details, Highlights, Description, Calendar, Reviews */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <PDPOverview listing={listing} />

          {/* Embedded Dual-Month Calendar Section (Screenshot 3) */}
          <PDPCalendarSection
            listing={listing}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            onDatesChange={(inD, outD) => {
              setCheckInDate(inD);
              setCheckOutDate(outD);
            }}
          />

          {/* Giant Guest Favourite 5.0 Laurel Banner (Screenshot 3) */}
          <PDPGuestFavouriteBanner
            rating={listing.ratingsSummary?.averageRating || 5.0}
          />

          {/* Ratings Breakdown and Reviews List */}
          <PDPReviews listing={listing} />

          {/* Location Map Section */}
          <div style={{ paddingTop: 32, paddingBottom: 32, borderBottom: "1px solid var(--airbnb-border-soft)" }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Where you’ll be</h3>
            <div style={{ fontSize: 15, color: "var(--airbnb-muted)", marginBottom: 20 }}>
              {listing.location?.neighborhood ? `${listing.location.neighborhood}, ` : ""}{listing.location?.city}, {listing.location?.state}, {listing.location?.country}
            </div>

            <div style={{ width: "100%", height: 360, borderRadius: "var(--radius-card)", overflow: "hidden" }}>
              <MapContainer
                center={[lat, lng]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ width: "100%", height: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <Marker position={[lat, lng]} icon={customPinIcon}>
                  <Popup>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{listing.title}</div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          {/* Host Profile Section */}
          <PDPHostSection host={listing.host} />
        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div
          style={{
            position: "sticky",
            top: 100,
            zIndex: 20,
          }}
        >
          <PDPBookingCard
            listing={listing}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            guests={guests}
            onDatesChange={(inD, outD) => {
              setCheckInDate(inD);
              setCheckOutDate(outD);
            }}
            onGuestsChange={(g) => setGuests(g)}
            onReserveClick={(quote) => {
              setActivePricingQuote(quote);
              setIsCheckoutOpen(true);
            }}
          />
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        listing={listing}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        guests={guests}
        pricingQuote={activePricingQuote}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => {
          if (onBookingSuccess) onBookingSuccess();
        }}
      />

      <style>{`
        @media (max-width: 900px) {
          .pdp-main-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </div>
  );
};
