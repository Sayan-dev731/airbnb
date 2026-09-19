import React, { useState } from "react";
import { X, Star } from "lucide-react";
import { reviewAPI } from "../../api/review.api";
import { useToast } from "../../context/ToastContext";

export const PDPReviewModal = ({ listingId, isOpen, onClose, onReviewAdded }) => {
  const { addToast } = useToast();
  const [cleanliness, setCleanliness] = useState(5);
  const [accuracy, setAccuracy] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [location, setLocation] = useState(5);
  const [checkIn, setCheckIn] = useState(5);
  const [value, setValue] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      addToast("Please write a comment describing your stay", "error");
      return;
    }

    setLoading(true);
    try {
      const overallRating = Math.round(((cleanliness + accuracy + communication + location + checkIn + value) / 6) * 10) / 10;
      const res = await reviewAPI.createReview({
        listingId,
        rating: overallRating,
        cleanliness,
        accuracy,
        communication,
        location,
        checkIn,
        value,
        comment,
      });

      addToast("Thank you! Your review has been submitted.", "success");
      if (onReviewAdded) onReviewAdded(res.data?.review || res.data);
      onClose();
    } catch (err) {
      addToast(err.message || "Failed to submit review", "error");
    } finally {
      setLoading(false);
    }
  };

  const renderStarPicker = (val, setter, label) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
      <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setter(star)}
            style={{ padding: 2 }}
          >
            <Star
              size={20}
              fill={star <= val ? "var(--airbnb-accent)" : "none"}
              color={star <= val ? "var(--airbnb-accent)" : "var(--airbnb-muted-light)"}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 580,
          maxWidth: "100%",
          maxHeight: "88vh",
          backgroundColor: "#FFFFFF",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-modal)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "scaleUp 200ms ease-out",
        }}
      >
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
          <div style={{ fontSize: 16, fontWeight: 700 }}>Write a review</div>
          <div style={{ width: 24 }} />
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Rate your stay</h3>
          <p style={{ fontSize: 14, color: "var(--airbnb-muted)", marginBottom: 20 }}>
            Share your honest feedback to help future travellers.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24, padding: "16px", backgroundColor: "var(--airbnb-bg)", borderRadius: "var(--radius-md)" }}>
            {renderStarPicker(cleanliness, setCleanliness, "Cleanliness")}
            {renderStarPicker(accuracy, setAccuracy, "Accuracy")}
            {renderStarPicker(communication, setCommunication, "Communication")}
            {renderStarPicker(location, setLocation, "Location")}
            {renderStarPicker(checkIn, setCheckIn, "Check-in")}
            {renderStarPicker(value, setValue, "Value")}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Review comment
            </label>
            <textarea
              required
              rows={4}
              placeholder="What did you love most about this place? Any tips for future guests?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid var(--airbnb-border)",
                borderRadius: "var(--radius-md)",
                fontSize: 14,
                resize: "vertical",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              backgroundColor: "var(--airbnb-ink)",
              color: "#FFFFFF",
              padding: "14px",
              borderRadius: "var(--radius-sm)",
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Submitting review..." : "Submit review"}
          </button>
        </form>
      </div>
    </div>
  );
};
