import React from "react";
import { Star, Share, Heart, Award, MapPin } from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";
import { useToast } from "../../context/ToastContext";

export const PDPHeader = ({ listing }) => {
  const { isFavorite, toggleFavorite } = useWishlist();
  const { addToast } = useToast();

  if (!listing) return null;

  const saved = isFavorite(listing._id);
  const rating = listing.ratingsSummary?.averageRating || 4.95;
  const reviewCount = listing.ratingsSummary?.totalReviews || 14;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast("Link copied to clipboard!", "success");
    } else {
      addToast("Share URL: " + window.location.href, "info");
    }
  };

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Title */}
      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: "var(--airbnb-ink)",
          lineHeight: 1.25,
          marginBottom: 10,
        }}
      >
        {listing.title}
      </h1>

      {/* Meta Row: Rating, Host badge, Location, Share, Save */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          fontSize: 14,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          {/* Rating */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
            <Star size={14} fill="var(--airbnb-ink)" color="var(--airbnb-ink)" />
            <span>{rating.toFixed(2)}</span>
          </div>

          <span>·</span>

          {/* Reviews count */}
          <a href="#reviews" style={{ fontWeight: 600, textDecoration: "underline" }}>
            {reviewCount} reviews
          </a>

          {listing.host?.isSuperHost && (
            <>
              <span>·</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--airbnb-ink)" }}>
                <Award size={14} color="var(--airbnb-accent)" />
                <span style={{ fontWeight: 600 }}>Superhost</span>
              </div>
            </>
          )}

          <span>·</span>

          {/* Location */}
          <span style={{ fontWeight: 600, textDecoration: "underline", color: "var(--airbnb-muted-dark)" }}>
            {listing.location?.address ? `${listing.location.address}, ${listing.location.city}` : `${listing.location?.city}, ${listing.location?.state}`}
          </span>
        </div>

        {/* Share & Save CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            type="button"
            onClick={handleShare}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "underline",
              padding: "6px 8px",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <Share size={15} />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={(e) => toggleFavorite(listing, e)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "underline",
              padding: "6px 8px",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <Heart
              size={16}
              fill={saved ? "var(--airbnb-accent)" : "none"}
              color={saved ? "var(--airbnb-accent)" : "var(--airbnb-ink)"}
              className={saved ? "heart-animated" : ""}
            />
            <span>{saved ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
