import React, { useState, useEffect } from "react";
import { Star, ChevronDown, Flag, Gem } from "lucide-react";
import { bookingAPI } from "../../api/booking.api";
import { formatCurrency, calculateNights, formatGuestSummary, formatDateFull } from "../../utils/formatters";
import { DatePickerPopover } from "../common/DatePickerPopover";
import { GuestPickerPopover } from "../common/GuestPickerPopover";
import { useAuth } from "../../context/AuthContext";

export const PDPBookingCard = ({
  listing,
  checkInDate,
  checkOutDate,
  guests,
  onDatesChange,
  onGuestsChange,
  onReserveClick,
}) => {
  const { openLogin, user } = useAuth();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isGuestPickerOpen, setIsGuestPickerOpen] = useState(false);
  const [pricingQuote, setPricingQuote] = useState(null);

  const basePrice = listing?.pricing?.basePrice || 4500;
  const discountPercent = listing?.pricing?.discountPercentage || 0;
  const discountedPrice = listing?.discountedPrice || (discountPercent > 0 ? Math.round(basePrice * (1 - discountPercent / 100)) : basePrice);
  const nights = calculateNights(checkInDate, checkOutDate);
  const rating = listing?.ratingsSummary?.averageRating || 5.0;
  const reviewCount = listing?.ratingsSummary?.totalReviews || 2;

  // Real-time backend quote check
  useEffect(() => {
    if (!checkInDate || !checkOutDate) {
      const stayTotal = discountedPrice * nights;
      const weeklyDiscount = nights >= 7 ? Math.round(stayTotal * 0.1) : 0;
      const cleaning = listing?.pricing?.cleaningFee || 500;
      const service = Math.round((stayTotal - weeklyDiscount) * 0.12);
      const total = stayTotal - weeklyDiscount + cleaning + service;

      setPricingQuote({
        nights,
        basePrice: discountedPrice,
        stayTotal,
        weeklyDiscount,
        cleaningFee: cleaning,
        serviceFee: service,
        totalAmount: total,
      });
      return;
    }

    const fetchQuote = async () => {
      try {
        const res = await bookingAPI.checkPrice({
          listingId: listing._id,
          checkInDate,
          checkOutDate,
          guests: (guests?.adults || 1) + (guests?.children || 0),
        });
        if (res.data?.pricing) {
          setPricingQuote(res.data.pricing);
        }
      } catch (err) {
        console.warn("Pricing calculation error:", err.message);
      }
    };
    fetchQuote();
  }, [listing?._id, checkInDate, checkOutDate, guests, discountedPrice, nights, listing?.pricing]);

  const handleReserve = () => {
    if (!user) {
      openLogin();
      return;
    }
    if (!checkInDate || !checkOutDate) {
      setIsDatePickerOpen(true);
      return;
    }
    onReserveClick && onReserveClick(pricingQuote);
  };

  const cancellationDate = checkInDate 
    ? new Date(new Date(checkInDate).getTime() - 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "long" })
    : "31 October";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Rare find banner (Screenshot 2 & 3) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--airbnb-border)",
          borderRadius: "var(--radius-card)",
          padding: "16px 20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <span style={{ fontSize: 20 }}>💎</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--airbnb-ink)" }}>
          Rare find! This place is usually booked
        </span>
      </div>

      {/* Main Reserve Card */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--airbnb-border)",
          borderRadius: "var(--radius-card)",
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Header Price & Rating */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: "var(--airbnb-ink)" }}>
              {checkInDate && checkOutDate ? formatCurrency(pricingQuote?.totalAmount || discountedPrice * nights) : formatCurrency(discountedPrice)}
            </span>
            <span style={{ fontSize: 15, color: "var(--airbnb-muted)" }}>
              {checkInDate && checkOutDate ? `for ${nights} nights` : "night"}
            </span>
            {discountPercent > 0 && !checkInDate && (
              <span style={{ fontSize: 14, color: "var(--airbnb-muted)", textDecoration: "line-through" }}>
                {formatCurrency(basePrice)}
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, fontWeight: 600 }}>
            <Star size={14} fill="var(--airbnb-ink)" color="var(--airbnb-ink)" />
            <span>{rating.toFixed(2)}</span>
            <span style={{ color: "var(--airbnb-muted)", fontWeight: 400 }}>·</span>
            <span style={{ color: "var(--airbnb-muted)", fontWeight: 400, textDecoration: "underline" }}>
              {reviewCount} reviews
            </span>
          </div>
        </div>

        {/* Date & Guests Selector Box */}
        <div
          style={{
            border: "1px solid var(--airbnb-border-dark)",
            borderRadius: "var(--radius-sm)",
            overflow: "visible",
            position: "relative",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid var(--airbnb-border-dark)" }}>
            <button
              type="button"
              onClick={() => {
                setIsGuestPickerOpen(false);
                setIsDatePickerOpen(!isDatePickerOpen);
              }}
              style={{
                padding: "10px 14px",
                textAlign: "left",
                borderRight: "1px solid var(--airbnb-border-dark)",
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "var(--airbnb-ink)" }}>
                CHECK-IN
              </div>
              <div style={{ fontSize: 13, color: checkInDate ? "var(--airbnb-ink)" : "var(--airbnb-muted)", fontWeight: 500, marginTop: 2 }}>
                {checkInDate ? new Date(checkInDate).toLocaleDateString("en-GB") : "Add date"}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsGuestPickerOpen(false);
                setIsDatePickerOpen(!isDatePickerOpen);
              }}
              style={{
                padding: "10px 14px",
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "var(--airbnb-ink)" }}>
                CHECKOUT
              </div>
              <div style={{ fontSize: 13, color: checkOutDate ? "var(--airbnb-ink)" : "var(--airbnb-muted)", fontWeight: 500, marginTop: 2 }}>
                {checkOutDate ? new Date(checkOutDate).toLocaleDateString("en-GB") : "Add date"}
              </div>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsDatePickerOpen(false);
              setIsGuestPickerOpen(!isGuestPickerOpen);
            }}
            style={{
              width: "100%",
              padding: "10px 14px",
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "var(--airbnb-ink)" }}>
                GUESTS
              </div>
              <div style={{ fontSize: 13, color: "var(--airbnb-ink)", fontWeight: 500, marginTop: 2 }}>
                {formatGuestSummary(guests || { adults: 1 })}
              </div>
            </div>
            <ChevronDown size={16} color="var(--airbnb-ink)" />
          </button>

          {/* Date Picker Popover */}
          {isDatePickerOpen && (
            <DatePickerPopover
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
              onDatesChange={(inD, outD) => {
                onDatesChange(inD, outD);
                if (inD && outD) setIsDatePickerOpen(false);
              }}
              onClose={() => setIsDatePickerOpen(false)}
            />
          )}

          {/* Guest Picker Popover */}
          {isGuestPickerOpen && (
            <GuestPickerPopover
              guests={guests || { adults: 1, children: 0, infants: 0, pets: 0 }}
              onChange={(g) => onGuestsChange(g)}
              maxGuests={listing?.capacity?.guests || 10}
            />
          )}
        </div>

        {/* Free Cancellation Callout Box (Screenshot 3) */}
        <div
          style={{
            backgroundColor: "var(--airbnb-bg)",
            padding: "12px 16px",
            borderRadius: "var(--radius-sm)",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--airbnb-ink)",
            textAlign: "center",
          }}
        >
          Free cancellation before <span style={{ fontWeight: 700 }}>{cancellationDate}</span>
        </div>

        {/* Reserve CTA */}
        <button
          type="button"
          onClick={handleReserve}
          style={{
            width: "100%",
            backgroundColor: "var(--airbnb-accent)",
            backgroundImage: "var(--airbnb-accent-gradient)",
            color: "#FFFFFF",
            padding: "14px",
            borderRadius: "var(--radius-sm)",
            fontSize: 16,
            fontWeight: 700,
            boxShadow: "0 2px 8px rgba(224, 11, 65, 0.4)",
            transition: "transform var(--transition-fast)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {checkInDate && checkOutDate ? "Reserve" : "Check availability"}
        </button>

        <div style={{ textAlign: "center", fontSize: 13, color: "var(--airbnb-muted)" }}>
          You won't be charged yet
        </div>

        {/* Price Breakdown */}
        {pricingQuote && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span style={{ textDecoration: "underline" }}>
                {formatCurrency(pricingQuote.basePrice || pricingQuote.basePricePerNight || discountedPrice)} × {pricingQuote.nights || pricingQuote.nightsCount || nights} night{(pricingQuote.nights || pricingQuote.nightsCount || nights) !== 1 ? "s" : ""}
              </span>
              <span>{formatCurrency(pricingQuote.stayTotal || pricingQuote.discountedBaseTotal || pricingQuote.baseTotal || discountedPrice * nights)}</span>
            </div>

            {(pricingQuote.weeklyDiscount > 0 || pricingQuote.discountAmount > 0) && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--airbnb-success)" }}>
                <span>Weekly discount</span>
                <span>-{formatCurrency(pricingQuote.weeklyDiscount || pricingQuote.discountAmount)}</span>
              </div>
            )}

            {(pricingQuote.cleaningFee > 0) && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ textDecoration: "underline" }}>Cleaning fee</span>
                <span>{formatCurrency(pricingQuote.cleaningFee)}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span style={{ textDecoration: "underline" }}>Airbnb service fee</span>
              <span>{formatCurrency(pricingQuote.serviceFee)}</span>
            </div>

            {pricingQuote.taxes > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ textDecoration: "underline" }}>Taxes & GST (18%)</span>
                <span>{formatCurrency(pricingQuote.taxes)}</span>
              </div>
            )}

            <div style={{ height: 1, backgroundColor: "var(--airbnb-border-soft)", margin: "4px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700 }}>
              <span>Total before taxes</span>
              <span>{formatCurrency(pricingQuote.totalAmount || pricingQuote.grandTotal || discountedPrice * nights)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Report this listing */}
      <div style={{ textAlign: "center", marginTop: 4 }}>
        <button
          type="button"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--airbnb-muted-dark)",
            textDecoration: "underline",
          }}
        >
          <Flag size={13} />
          <span>Report this listing</span>
        </button>
      </div>
    </div>
  );
};
