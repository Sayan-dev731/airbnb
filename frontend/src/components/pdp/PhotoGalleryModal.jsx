import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Share, Heart } from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";
import { useToast } from "../../context/ToastContext";

export const PhotoGalleryModal = ({ photos = [], isOpen, onClose, initialIndex = 0, listing }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const { isFavorite, toggleFavorite } = useWishlist();
  const { addToast } = useToast();

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setCurrentIndex((p) => (p === 0 ? photos.length - 1 : p - 1));
      if (e.key === "ArrowRight") setCurrentIndex((p) => (p === photos.length - 1 ? 0 : p + 1));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, photos.length, onClose]);

  if (!isOpen || photos.length === 0) return null;

  const saved = listing ? isFavorite(listing._id) : false;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast("Link copied to clipboard!", "success");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#000000",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        animation: "fadeIn 200ms ease",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 24px",
          color: "#FFFFFF",
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <X size={20} />
          <span>Close</span>
        </button>

        <div style={{ fontSize: 14, fontWeight: 600 }}>
          {currentIndex + 1} / {photos.length}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            type="button"
            onClick={handleShare}
            style={{ color: "#FFFFFF", display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}
          >
            <Share size={18} />
          </button>
          {listing && (
            <button
              type="button"
              onClick={(e) => toggleFavorite(listing, e)}
              style={{ color: "#FFFFFF", display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}
            >
              <Heart
                size={18}
                fill={saved ? "var(--airbnb-accent)" : "none"}
                color={saved ? "var(--airbnb-accent)" : "#FFFFFF"}
              />
            </button>
          )}
        </div>
      </div>

      {/* Main Image View */}
      <div
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
        }}
      >
        {/* Left Arrow */}
        <button
          type="button"
          onClick={() => setCurrentIndex((p) => (p === 0 ? photos.length - 1 : p - 1))}
          style={{
            position: "absolute",
            left: 24,
            width: 44,
            height: 44,
            borderRadius: "var(--radius-circle)",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
            zIndex: 10,
          }}
          aria-label="Previous photo"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Current Photo */}
        <img
          src={typeof photos[currentIndex] === "string" ? photos[currentIndex] : photos[currentIndex].url}
          alt={typeof photos[currentIndex] === "object" ? photos[currentIndex].caption || `Photo ${currentIndex + 1}` : `Photo ${currentIndex + 1}`}
          style={{
            maxWidth: "100%",
            maxHeight: "82vh",
            objectFit: "contain",
            borderRadius: "var(--radius-sm)",
            userSelect: "none",
          }}
        />

        {/* Right Arrow */}
        <button
          type="button"
          onClick={() => setCurrentIndex((p) => (p === photos.length - 1 ? 0 : p + 1))}
          style={{
            position: "absolute",
            right: 24,
            width: 44,
            height: 44,
            borderRadius: "var(--radius-circle)",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
            zIndex: 10,
          }}
          aria-label="Next photo"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Caption at bottom */}
      {typeof photos[currentIndex] === "object" && photos[currentIndex]?.caption && (
        <div style={{ textAlign: "center", padding: "16px 24px 24px", color: "rgba(255, 255, 255, 0.8)", fontSize: 14 }}>
          {photos[currentIndex].caption}
        </div>
      )}
    </div>
  );
};
