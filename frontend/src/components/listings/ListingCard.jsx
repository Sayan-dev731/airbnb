import React, { useState } from "react";
import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";
import { useSearch } from "../../context/SearchContext";
import { formatCurrency, formatDateRange } from "../../utils/formatters";

export const ListingCard = ({ listing, onSelect, onHover, isHovered }) => {
  const { isFavorite, toggleFavorite } = useWishlist();
  const { displayTotalWithTaxes, checkInDate, checkOutDate } = useSearch();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isCardHovered, setIsCardHovered] = useState(false);

  if (!listing) return null;

  const photos = listing.photos && listing.photos.length > 0 
    ? listing.photos.map((p) => (typeof p === "string" ? p : p.url))
    : [listing.coverPhoto || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"];

  const saved = isFavorite(listing._id);

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const basePrice = listing.pricing?.basePrice || 0;
  const discountPercent = listing.pricing?.discountPercentage || 0;
  const discountedPrice = listing.discountedPrice || (discountPercent > 0 ? Math.round(basePrice * (1 - discountPercent / 100)) : basePrice);
  
  const rating = listing.ratingsSummary?.averageRating || 4.92;
  const reviewCount = listing.ratingsSummary?.totalReviews || 12;

  return (
    <div
      onClick={() => onSelect && onSelect(listing)}
      onMouseEnter={() => {
        setIsCardHovered(true);
        onHover && onHover(listing._id);
      }}
      onMouseLeave={() => {
        setIsCardHovered(false);
        onHover && onHover(null);
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        cursor: "pointer",
        position: "relative",
        userSelect: "none",
        transition: "transform var(--transition-fast)",
      }}
    >
      {/* Media Container with Carousel */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "95%", // ~1:1 Aspect ratio
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
          backgroundColor: "var(--airbnb-skeleton)",
        }}
      >
        {/* Photo Image */}
        <img
          src={photos[activePhotoIndex]}
          alt={listing.title}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s ease-out",
            transform: isCardHovered || isHovered ? "scale(1.03)" : "scale(1)",
          }}
          loading="lazy"
        />

        {/* Guest Favorite Badge */}
        {listing.isGuestFavorite && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              color: "var(--airbnb-ink)",
              padding: "5px 10px",
              borderRadius: "var(--radius-pill)",
              fontSize: 12,
              fontWeight: 700,
              boxShadow: "var(--shadow-badge)",
              zIndex: 3,
            }}
          >
            Guest favourite
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => toggleFavorite(listing, e)}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 3,
            padding: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s ease",
          }}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={24}
            className={saved ? "heart-animated" : ""}
            fill={saved ? "var(--airbnb-accent)" : "rgba(0, 0, 0, 0.4)"}
            color={saved ? "var(--airbnb-accent)" : "#FFFFFF"}
            strokeWidth={saved ? 0 : 2}
          />
        </button>

        {/* Carousel Arrow Controls (Shown on hover if > 1 photo) */}
        {photos.length > 1 && isCardHovered && (
          <>
            <button
              type="button"
              onClick={handlePrevPhoto}
              style={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                width: 32,
                height: 32,
                borderRadius: "var(--radius-circle)",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                boxShadow: "var(--shadow-carousel-btn)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 4,
                color: "var(--airbnb-ink)",
              }}
              aria-label="Previous photo"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={handleNextPhoto}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                width: 32,
                height: 32,
                borderRadius: "var(--radius-circle)",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                boxShadow: "var(--shadow-carousel-btn)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 4,
                color: "var(--airbnb-ink)",
              }}
              aria-label="Next photo"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {photos.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: 5,
              zIndex: 3,
            }}
          >
            {photos.slice(0, 5).map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: activePhotoIndex === idx ? 7 : 5,
                  height: activePhotoIndex === idx ? 7 : 5,
                  borderRadius: "var(--radius-circle)",
                  backgroundColor: activePhotoIndex === idx ? "#FFFFFF" : "rgba(255, 255, 255, 0.6)",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
                  transition: "all 0.2s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Listing Metadata */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Title & Rating Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--airbnb-ink)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {listing.location?.city ? `${listing.location.city}, ${listing.location.state || listing.location.country}` : listing.title}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0, fontSize: 14, fontWeight: 500 }}>
            <Star size={13} fill="var(--airbnb-ink)" color="var(--airbnb-ink)" />
            <span>{rating > 0 ? rating.toFixed(2) : "New"}</span>
          </div>
        </div>

        {/* Subtitle / Host / Property Type */}
        <div style={{ fontSize: 14, color: "var(--airbnb-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {listing.propertyType || "Entire rental unit"}
        </div>

        {/* Date range */}
        <div style={{ fontSize: 14, color: "var(--airbnb-muted)" }}>
          {formatDateRange(checkInDate, checkOutDate)}
        </div>

        {/* Price Row */}
        <div style={{ marginTop: 4, display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--airbnb-ink)" }}>
            {formatCurrency(discountedPrice)}
          </span>
          <span style={{ fontSize: 14, color: "var(--airbnb-ink)" }}>night</span>

          {discountPercent > 0 && (
            <span style={{ fontSize: 14, color: "var(--airbnb-muted)", textDecoration: "line-through" }}>
              {formatCurrency(basePrice)}
            </span>
          )}

          {displayTotalWithTaxes && (
            <span style={{ fontSize: 13, color: "var(--airbnb-muted)", marginLeft: "auto", textDecoration: "underline" }}>
              {formatCurrency(discountedPrice * 5)} total
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
