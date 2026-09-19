import React, { useState, useEffect } from "react";
import { Star, MessageSquarePlus, User, Check } from "lucide-react";
import { reviewAPI } from "../../api/review.api";
import { PDPReviewModal } from "./PDPReviewModal";
import { useAuth } from "../../context/AuthContext";
import { formatDateFull } from "../../utils/formatters";

export const PDPReviews = ({ listing }) => {
  const { user, openLogin } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    if (!listing?._id) return;
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await reviewAPI.getListingReviews(listing._id);
        setReviews(res.data?.reviews || []);
      } catch (err) {
        console.warn("Could not fetch reviews:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [listing?._id]);

  if (!listing) return null;

  const ratings = listing.ratingsSummary || {
    averageRating: 4.95,
    totalReviews: reviews.length || 14,
    cleanliness: 4.9,
    accuracy: 4.9,
    communication: 5.0,
    location: 4.8,
    checkIn: 5.0,
    value: 4.9,
  };

  const categories = [
    { label: "Cleanliness", score: ratings.cleanliness || 4.9 },
    { label: "Accuracy", score: ratings.accuracy || 4.9 },
    { label: "Communication", score: ratings.communication || 5.0 },
    { label: "Location", score: ratings.location || 4.8 },
    { label: "Check-in", score: ratings.checkIn || 5.0 },
    { label: "Value", score: ratings.value || 4.9 },
  ];

  const handleReviewAdded = (newReview) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  return (
    <div id="reviews" style={{ paddingTop: 32, paddingBottom: 32, borderBottom: "1px solid var(--airbnb-border-soft)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Star size={22} fill="var(--airbnb-ink)" color="var(--airbnb-ink)" />
          <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--airbnb-ink)" }}>
            {ratings.averageRating ? ratings.averageRating.toFixed(2) : "4.95"} · {reviews.length || ratings.totalReviews || 14} reviews
          </h3>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!user) {
              openLogin();
            } else {
              setIsReviewModalOpen(true);
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--airbnb-ink)",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <MessageSquarePlus size={16} />
          <span>Write a review</span>
        </button>
      </div>

      {/* Ratings Breakdown Progress Bars */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px 48px",
          marginBottom: 36,
        }}
      >
        {categories.map((cat) => (
          <div key={cat.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontSize: 14, minWidth: 110 }}>{cat.label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
              <div
                style={{
                  height: 4,
                  flex: 1,
                  backgroundColor: "var(--airbnb-skeleton)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(cat.score / 5) * 100}%`,
                    backgroundColor: "var(--airbnb-ink)",
                    borderRadius: 2,
                  }}
                />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, minWidth: 24, textAlign: "right" }}>
                {cat.score.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Reviews List */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28 }}>
        {reviews.length === 0 ? (
          // Fallback sample reviews if none yet
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                  alt="Sneha"
                  style={{ width: 44, height: 44, borderRadius: "var(--radius-circle)", objectFit: "cover" }}
                />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>Sneha Patel</div>
                  <div style={{ fontSize: 13, color: "var(--airbnb-muted)" }}>September 2026</div>
                </div>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--airbnb-ink)", marginTop: 4 }}>
                Outstanding stay! The place was spotless, incredibly stylish and looked even better than the photos. Host was very communicative and responsive.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                  alt="Vikram"
                  style={{ width: 44, height: 44, borderRadius: "var(--radius-circle)", objectFit: "cover" }}
                />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>Vikram Malhotra</div>
                  <div style={{ fontSize: 13, color: "var(--airbnb-muted)" }}>August 2026</div>
                </div>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--airbnb-ink)", marginTop: 4 }}>
                Peaceful location with stunning natural surroundings. High-speed internet made working remotely completely seamless. Highly recommended!
              </p>
            </div>
          </>
        ) : (
          reviews.map((rev) => (
            <div key={rev._id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {rev.user?.avatar?.url ? (
                  <img
                    src={rev.user.avatar.url}
                    alt={rev.user.name}
                    style={{ width: 44, height: 44, borderRadius: "var(--radius-circle)", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "var(--radius-circle)",
                      backgroundColor: "var(--airbnb-surface-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <User size={20} color="var(--airbnb-muted)" />
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{rev.user?.name || "Verified Guest"}</div>
                  <div style={{ fontSize: 13, color: "var(--airbnb-muted)" }}>
                    {formatDateFull(rev.createdAt)}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--airbnb-ink)", marginTop: 4 }}>
                {rev.comment}
              </p>

              {rev.hostReply?.comment && (
                <div style={{ marginTop: 8, paddingLeft: 16, borderLeft: "2px solid var(--airbnb-border)", fontSize: 13, color: "var(--airbnb-muted-dark)" }}>
                  <span style={{ fontWeight: 600 }}>Response from host: </span>
                  {rev.hostReply.comment}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <PDPReviewModal
        listingId={listing._id}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onReviewAdded={handleReviewAdded}
      />
    </div>
  );
};
