import React, { useState } from "react";
import { X, ShieldCheck, Home, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { PROPERTY_TYPES } from "../../data/staticData";

export const BecomeHostModal = ({ isOpen, onClose, onSuccess }) => {
  const { user, becomeHost } = useAuth();
  const { addToast } = useToast();
  const [phone, setPhone] = useState(user?.phone || "+91 ");
  const [city, setCity] = useState("Goa");
  const [propertyType, setPropertyType] = useState("Entire apartment");
  const [hostingReason, setHostingReason] = useState("I want to earn extra income and share my space with travellers.");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreedTerms) {
      addToast("Please agree to the Airbnb Host Standards and Policies", "error");
      return;
    }

    setLoading(true);
    try {
      await becomeHost();
      addToast("Congratulations! Your host application has been approved 🎉", "success");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      addToast(err.message || "Failed to submit host application", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 620,
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
          <div style={{ fontSize: 16, fontWeight: 700 }}>Apply to Become a Host</div>
          <div style={{ width: 24 }} />
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "var(--radius-circle)",
                backgroundColor: "var(--airbnb-accent-light)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Home size={28} color="var(--airbnb-accent)" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--airbnb-ink)", marginBottom: 6 }}>
              Join 4+ million Airbnb Hosts worldwide
            </h2>
            <p style={{ fontSize: 14, color: "var(--airbnb-muted)" }}>
              Complete your host profile to start creating and managing property listings.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
              <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Phone Number for Guest Inquiries</div>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: "100%", fontSize: 14, marginTop: 2, fontWeight: 500 }}
              />
            </div>

            <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
              <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Primary Location / City</div>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ width: "100%", fontSize: 14, marginTop: 2, fontWeight: 500 }}
              />
            </div>

            <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
              <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>What type of space will you host?</div>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                style={{ width: "100%", fontSize: 14, marginTop: 2, fontWeight: 500, cursor: "pointer" }}
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
              <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Tell us a bit about your hosting goals</div>
              <textarea
                rows={3}
                value={hostingReason}
                onChange={(e) => setHostingReason(e.target.value)}
                style={{ width: "100%", fontSize: 13, marginTop: 4, resize: "none" }}
              />
            </div>

            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--airbnb-muted-dark)", marginTop: 6, cursor: "pointer" }}>
              <input
                type="checkbox"
                required
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                style={{ marginTop: 2, accentColor: "var(--airbnb-ink)" }}
              />
              <span>
                I agree to adhere to Airbnb's Host Quality Guidelines, safety standards, and nondiscrimination policy.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
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
              cursor: loading ? "wait" : "pointer",
              boxShadow: "0 2px 6px rgba(224, 11, 65, 0.4)",
            }}
          >
            {loading ? "Submitting application..." : "Submit Host Application"}
          </button>
        </form>
      </div>
    </div>
  );
};
