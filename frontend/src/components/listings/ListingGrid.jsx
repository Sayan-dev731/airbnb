import React from "react";
import { ListingCard } from "./ListingCard";
import { useSearch } from "../../context/SearchContext";

export const ListingGrid = ({
  listings = [],
  loading = false,
  onSelectListing,
  onHoverListing,
  hoveredListingId,
  isSplitView = false,
}) => {
  const { clearFilters, resetAllSearch } = useSearch();

  if (loading) {
    return (
      <div className={isSplitView ? "listing-grid-split" : "listing-grid-responsive"}>
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={`skel-${idx}`} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              className="skeleton"
              style={{
                width: "100%",
                paddingTop: "95%",
                borderRadius: "var(--radius-card)",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="skeleton" style={{ height: 16, width: "65%" }} />
              <div className="skeleton" style={{ height: 14, width: "40%" }} />
              <div className="skeleton" style={{ height: 14, width: "50%" }} />
              <div className="skeleton" style={{ height: 16, width: "35%", marginTop: 4 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
          textAlign: "center",
          minHeight: 400,
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: "var(--airbnb-ink)" }}>
          No exact matches found
        </div>
        <p style={{ fontSize: 16, color: "var(--airbnb-muted)", maxWidth: 460, marginBottom: 24 }}>
          Try changing or clearing some of your filters or searching for a different destination.
        </p>
        <button
          type="button"
          onClick={() => {
            clearFilters();
            resetAllSearch();
          }}
          style={{
            backgroundColor: "var(--airbnb-ink)",
            color: "#FFFFFF",
            padding: "12px 24px",
            borderRadius: "var(--radius-sm)",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Clear all filters
        </button>
      </div>
    );
  }

  return (
    <div className={isSplitView ? "listing-grid-split" : "listing-grid-responsive"}>
      {listings.map((listing) => (
        <ListingCard
          key={listing._id}
          listing={listing}
          onSelect={onSelectListing}
          onHover={onHoverListing}
          isHovered={hoveredListingId === listing._id}
        />
      ))}
    </div>
  );
};
