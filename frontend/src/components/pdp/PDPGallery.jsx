import React, { useState } from "react";
import { Grid } from "lucide-react";
import { PhotoGalleryModal } from "./PhotoGalleryModal";

export const PDPGallery = ({ listing }) => {
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  if (!listing) return null;

  const rawPhotos = listing.photos && listing.photos.length > 0 
    ? listing.photos 
    : [{ url: listing.coverPhoto || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80" }];

  // Ensure we have at least 5 photos for grid layout (repeat if needed)
  const displayPhotos = [...rawPhotos];
  while (displayPhotos.length < 5) {
    displayPhotos.push(rawPhotos[0]);
  }

  const handleOpenPhoto = (idx) => {
    setSelectedPhotoIndex(idx);
    setIsGalleryModalOpen(true);
  };

  return (
    <div style={{ position: "relative", marginBottom: 36 }}>
      {/* 5-Photo Showcase Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "repeat(2, 220px)",
          gap: 8,
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
        }}
        className="pdp-photo-grid"
      >
        {/* Main Cover Image (spans 2 cols, 2 rows) */}
        <div
          onClick={() => handleOpenPhoto(0)}
          style={{
            gridColumn: "span 2",
            gridRow: "span 2",
            position: "relative",
            cursor: "pointer",
            overflow: "hidden",
            backgroundColor: "var(--airbnb-skeleton)",
          }}
        >
          <img
            src={typeof displayPhotos[0] === "string" ? displayPhotos[0] : displayPhotos[0].url}
            alt="Cover"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </div>

        {/* 4 Grid Photos */}
        {displayPhotos.slice(1, 5).map((photo, index) => {
          const actualIdx = index + 1;
          return (
            <div
              key={actualIdx}
              onClick={() => handleOpenPhoto(actualIdx)}
              style={{
                position: "relative",
                cursor: "pointer",
                overflow: "hidden",
                backgroundColor: "var(--airbnb-skeleton)",
              }}
            >
              <img
                src={typeof photo === "string" ? photo : photo.url}
                alt={`Photo ${actualIdx + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.4s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              />
            </div>
          );
        })}
      </div>

      {/* Floating "Show all photos" Button */}
      <button
        type="button"
        onClick={() => handleOpenPhoto(0)}
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          backgroundColor: "#FFFFFF",
          color: "var(--airbnb-ink)",
          border: "1px solid var(--airbnb-ink)",
          borderRadius: "var(--radius-sm)",
          padding: "7px 15px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 14,
          fontWeight: 600,
          boxShadow: "var(--shadow-badge)",
        }}
      >
        <Grid size={15} />
        <span>Show all {rawPhotos.length} photos</span>
      </button>

      {/* Lightbox Modal */}
      <PhotoGalleryModal
        photos={rawPhotos}
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        initialIndex={selectedPhotoIndex}
        listing={listing}
      />

      <style>{`
        @media (max-width: 743px) {
          .pdp-photo-grid {
            grid-template-columns: 1fr !important;
            grid-template-rows: 300px !important;
          }
          .pdp-photo-grid > div:not(:first-child) {
            display: none !important;
          }
          .pdp-photo-grid > div:first-child {
            grid-column: span 1 !important;
            grid-row: span 1 !important;
          }
        }
      `}</style>
    </div>
  );
};
