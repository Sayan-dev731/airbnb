import React, { useState } from "react";
import { X, CreditCard, ShieldCheck, CheckCircle2, ChevronRight, Smartphone } from "lucide-react";
import { paymentAPI } from "../../api/payment.api";
import { formatCurrency, formatDateFull, calculateNights } from "../../utils/formatters";
import { useToast } from "../../context/ToastContext";

export const CheckoutModal = ({
  listing,
  checkInDate,
  checkOutDate,
  guests = { adults: 1, children: 0, infants: 0, pets: 0 },
  pricingQuote,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addToast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' | 'upi' | 'netbanking'
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8912");
  const [cardHolder, setCardHolder] = useState("Rohan Verma");
  const [expiryDate, setExpiryDate] = useState("12/28");
  const [cvv, setCvv] = useState("892");
  const [upiId, setUpiId] = useState("rohan@okhdfcbank");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  if (!isOpen || !listing) return null;

  const nights = pricingQuote?.nightsCount || pricingQuote?.nights || calculateNights(checkInDate, checkOutDate);
  const basePrice = listing.pricing?.basePrice || 3500;
  const discountPercent = listing.pricing?.discountPercentage || 0;
  const discountedPrice = listing.discountedPrice || (discountPercent > 0 ? Math.round(basePrice * (1 - discountPercent / 100)) : basePrice);
  const stayTotal = pricingQuote?.stayTotal || pricingQuote?.discountedBaseTotal || pricingQuote?.baseTotal || (discountedPrice * nights);
  const weeklyDiscount = pricingQuote?.weeklyDiscount || pricingQuote?.discountAmount || (nights >= 7 ? Math.round(stayTotal * 0.1) : 0);
  const cleaningFee = pricingQuote?.cleaningFee ?? (listing.pricing?.cleaningFee || 500);
  const serviceFee = pricingQuote?.serviceFee ?? Math.round((stayTotal - weeklyDiscount) * 0.12);
  const taxes = pricingQuote?.taxes ?? Math.round((stayTotal - weeklyDiscount + serviceFee) * 0.18);
  const total = pricingQuote?.grandTotal || pricingQuote?.totalAmount || (stayTotal - weeklyDiscount + cleaningFee + serviceFee + taxes);

  const handleConfirmAndPay = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const payload = {
        listingId: listing._id,
        checkInDate,
        checkOutDate,
        adults: guests.adults || 1,
        children: guests.children || 0,
        infants: guests.infants || 0,
        pets: guests.pets || 0,
        guests: {
          adults: guests.adults || 1,
          children: guests.children || 0,
          infants: guests.infants || 0,
          pets: guests.pets || 0,
        },
        specialRequests,
        paymentMethod: {
          type: paymentMethod,
          cardNumber: paymentMethod === "card" ? cardNumber : undefined,
          cardholderName: paymentMethod === "card" ? cardHolder : undefined,
          expMonth: 12,
          expYear: 2028,
          upiId: paymentMethod === "upi" ? upiId : undefined,
          bankName: paymentMethod === "netbanking" ? "HDFC Bank" : undefined,
        },
      };

      const res = await paymentAPI.processPaymentAndBook(payload);
      const bookingData = res.data?.booking || res.data;
      setConfirmedBooking(bookingData);
      addToast("Reservation confirmed! Have a wonderful trip 🎉", "success");
      if (onSuccess) onSuccess(bookingData);
    } catch (err) {
      addToast(err.message || "Failed to process reservation payment", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const photos = listing.photos && listing.photos.length > 0 
    ? listing.photos.map((p) => (typeof p === "string" ? p : p.url))
    : [listing.coverPhoto];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 820,
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
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {confirmedBooking ? "Booking Confirmed" : "Confirm and pay"}
          </div>
          <div style={{ width: 24 }} />
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          {confirmedBooking ? (
            /* Success Confirmation State */
            <div style={{ textAlign: "center", padding: "32px 16px" }}>
              <CheckCircle2 size={64} color="#008A05" style={{ margin: "0 auto 16px" }} />
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: "var(--airbnb-ink)" }}>
                You're all booked!
              </h2>
              <p style={{ fontSize: 15, color: "var(--airbnb-muted)", marginBottom: 24 }}>
                A confirmation has been sent to your email with check-in instructions.
              </p>

              <div
                style={{
                  backgroundColor: "var(--airbnb-bg)",
                  borderRadius: "var(--radius-md)",
                  padding: "20px 24px",
                  textAlign: "left",
                  maxWidth: 500,
                  margin: "0 auto 28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "var(--airbnb-muted)" }}>Listing</span>
                  <span style={{ fontWeight: 600 }}>{listing.title}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "var(--airbnb-muted)" }}>Dates</span>
                  <span style={{ fontWeight: 600 }}>
                    {formatDateFull(checkInDate)} – {formatDateFull(checkOutDate)}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "var(--airbnb-muted)" }}>Total Paid</span>
                  <span style={{ fontWeight: 700, color: "var(--airbnb-ink)" }}>{formatCurrency(total)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "var(--airbnb-muted)" }}>Status</span>
                  <span style={{ fontWeight: 700, color: "var(--airbnb-success)" }}>Confirmed</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{
                  backgroundColor: "var(--airbnb-ink)",
                  color: "#FFFFFF",
                  padding: "14px 32px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                View My Trips
              </button>
            </div>
          ) : (
            /* Checkout Form */
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 36 }} className="checkout-columns">
              {/* Left Column: Trip review & Payment Method */}
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Your trip</h3>

                {/* Dates */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>Dates</div>
                    <div style={{ fontSize: 14, color: "var(--airbnb-muted)" }}>
                      {formatDateFull(checkInDate)} – {formatDateFull(checkOutDate)}
                    </div>
                  </div>
                </div>

                {/* Guests */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--airbnb-border-soft)" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>Guests</div>
                    <div style={{ fontSize: 14, color: "var(--airbnb-muted)" }}>
                      {guests.adults + guests.children} guests {guests.infants > 0 ? `, ${guests.infants} infant` : ""}
                    </div>
                  </div>
                </div>

                {/* Payment Selection */}
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Pay with</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px 16px",
                      borderRadius: "var(--radius-md)",
                      border: `1px solid ${paymentMethod === "card" ? "var(--airbnb-ink)" : "var(--airbnb-border)"}`,
                      backgroundColor: paymentMethod === "card" ? "var(--airbnb-surface-muted)" : "#FFFFFF",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="payMethod"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      style={{ accentColor: "var(--airbnb-ink)" }}
                    />
                    <CreditCard size={18} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Credit or debit card</span>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px 16px",
                      borderRadius: "var(--radius-md)",
                      border: `1px solid ${paymentMethod === "upi" ? "var(--airbnb-ink)" : "var(--airbnb-border)"}`,
                      backgroundColor: paymentMethod === "upi" ? "var(--airbnb-surface-muted)" : "#FFFFFF",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="payMethod"
                      checked={paymentMethod === "upi"}
                      onChange={() => setPaymentMethod("upi")}
                      style={{ accentColor: "var(--airbnb-ink)" }}
                    />
                    <Smartphone size={18} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>UPI (GPay / PhonePe / Paytm)</span>
                  </label>
                </div>

                {/* Card Fields */}
                {paymentMethod === "card" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                    <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                      <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Card Number</div>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        style={{ width: "100%", fontSize: 14, marginTop: 2, fontWeight: 500 }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                        <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Expiration</div>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          style={{ width: "100%", fontSize: 14, marginTop: 2, fontWeight: 500 }}
                        />
                      </div>

                      <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                        <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>CVV</div>
                        <input
                          type="password"
                          value={cvv}
                          maxLength={4}
                          onChange={(e) => setCvv(e.target.value)}
                          style={{ width: "100%", fontSize: 14, marginTop: 2, fontWeight: 500 }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI Fields */}
                {paymentMethod === "upi" && (
                  <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px", marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>UPI ID</div>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@bank"
                      style={{ width: "100%", fontSize: 14, marginTop: 2, fontWeight: 500 }}
                    />
                  </div>
                )}

                {/* Message to Host */}
                <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Note to host (Optional)</div>
                  <textarea
                    rows={2}
                    placeholder="Tell your host about yourself and the trip purpose..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    style={{ width: "100%", fontSize: 13, marginTop: 4, resize: "none" }}
                  />
                </div>
              </div>

              {/* Right Column: Mini Listing Card & Price Breakdown */}
              <div
                style={{
                  border: "1px solid var(--airbnb-border)",
                  borderRadius: "var(--radius-card)",
                  padding: 24,
                  height: "fit-content",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <div style={{ display: "flex", gap: 16, paddingBottom: 20, borderBottom: "1px solid var(--airbnb-border-soft)" }}>
                  <img
                    src={photos[0]}
                    alt={listing.title}
                    style={{
                      width: 90,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: "var(--radius-sm)",
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 12, color: "var(--airbnb-muted)" }}>{listing.propertyType}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--airbnb-ink)", marginTop: 2 }}>{listing.title}</div>
                    <div style={{ fontSize: 12, color: "var(--airbnb-muted)", marginTop: 4 }}>
                      ★ {listing.ratingsSummary?.averageRating?.toFixed(2) || "4.95"} ({listing.ratingsSummary?.totalReviews || 14} reviews)
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div style={{ paddingTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Price details</div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span>{formatCurrency(discountedPrice)} × {nights} night{nights !== 1 ? "s" : ""}</span>
                    <span>{formatCurrency(stayTotal)}</span>
                  </div>

                  {weeklyDiscount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--airbnb-success)" }}>
                      <span>Weekly discount</span>
                      <span>-{formatCurrency(weeklyDiscount)}</span>
                    </div>
                  )}

                  {cleaningFee > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                      <span>Cleaning fee</span>
                      <span>{formatCurrency(cleaningFee)}</span>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span>Airbnb service fee</span>
                    <span>{formatCurrency(serviceFee)}</span>
                  </div>

                  {taxes > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                      <span>Taxes & GST (18%)</span>
                      <span>{formatCurrency(taxes)}</span>
                    </div>
                  )}

                  <div style={{ height: 1, backgroundColor: "var(--airbnb-border-soft)", margin: "4px 0" }} />

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700 }}>
                    <span>Total (INR)</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  type="button"
                  onClick={handleConfirmAndPay}
                  disabled={isProcessing}
                  style={{
                    width: "100%",
                    marginTop: 24,
                    backgroundColor: "var(--airbnb-accent)",
                    backgroundImage: "var(--airbnb-accent-gradient)",
                    color: "#FFFFFF",
                    padding: "14px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 16,
                    fontWeight: 700,
                    boxShadow: "0 2px 6px rgba(224, 11, 65, 0.4)",
                    cursor: isProcessing ? "wait" : "pointer",
                  }}
                >
                  {isProcessing ? "Processing reservation..." : `Confirm and pay ${formatCurrency(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 743px) {
          .checkout-columns {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
