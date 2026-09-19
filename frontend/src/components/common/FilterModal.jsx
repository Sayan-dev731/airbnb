import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { useSearch } from "../../context/SearchContext";
import { PROPERTY_TYPES, AMENITIES_LIST } from "../../data/staticData";

export const FilterModal = ({ totalResultsCount = 0 }) => {
  const {
    filters,
    updateFilters,
    clearFilters,
    isFilterModalOpen,
    setIsFilterModalOpen,
  } = useSearch();

  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isFilterModalOpen]);

  if (!isFilterModalOpen) return null;

  const handleAmenityToggle = (amenityId) => {
    const list = localFilters.amenities || [];
    if (list.includes(amenityId)) {
      setLocalFilters({
        ...localFilters,
        amenities: list.filter((a) => a !== amenityId),
      });
    } else {
      setLocalFilters({
        ...localFilters,
        amenities: [...list, amenityId],
      });
    }
  };

  const handleApply = () => {
    updateFilters(localFilters);
    setIsFilterModalOpen(false);
  };

  const handleClear = () => {
    clearFilters();
    setLocalFilters({
      minPrice: "",
      maxPrice: "",
      propertyType: "",
      bedrooms: "",
      bathrooms: "",
      amenities: [],
      isGuestFavorite: false,
      sortBy: "newest",
    });
  };

  const numberOptions = ["Any", "1", "2", "3", "4", "5", "6", "7", "8+"];

  return (
    <div className="modal-backdrop" onClick={() => setIsFilterModalOpen(false)}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 780,
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
            onClick={() => setIsFilterModalOpen(false)}
            style={{ padding: 4, display: "flex", borderRadius: "var(--radius-circle)" }}
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Filters</div>
          <div style={{ width: 24 }} />
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          {/* Price Range Section */}
          <div style={{ paddingBottom: 32, borderBottom: "1px solid var(--airbnb-border-soft)" }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Price range</div>
            <div style={{ fontSize: 14, color: "var(--airbnb-muted)", marginBottom: 20 }}>
              Nightly prices before taxes and fees
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Min Price */}
              <div
                style={{
                  flex: 1,
                  border: "1px solid var(--airbnb-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 14px",
                }}
              >
                <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 500 }}>Minimum</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                  <span style={{ fontWeight: 600, color: "var(--airbnb-muted)" }}>₹</span>
                  <input
                    type="number"
                    placeholder="100"
                    value={localFilters.minPrice || ""}
                    onChange={(e) => setLocalFilters({ ...localFilters, minPrice: e.target.value })}
                    style={{ width: "100%", fontSize: 15, fontWeight: 600 }}
                  />
                </div>
              </div>

              <div style={{ color: "var(--airbnb-muted)" }}>–</div>

              {/* Max Price */}
              <div
                style={{
                  flex: 1,
                  border: "1px solid var(--airbnb-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 14px",
                }}
              >
                <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 500 }}>Maximum</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                  <span style={{ fontWeight: 600, color: "var(--airbnb-muted)" }}>₹</span>
                  <input
                    type="number"
                    placeholder="100000"
                    value={localFilters.maxPrice || ""}
                    onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: e.target.value })}
                    style={{ width: "100%", fontSize: 15, fontWeight: 600 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rooms and Beds */}
          <div style={{ padding: "32px 0", borderBottom: "1px solid var(--airbnb-border-soft)" }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Rooms and beds</div>

            {/* Bedrooms */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>Bedrooms</div>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }} className="no-scrollbar">
                {numberOptions.map((opt) => {
                  const val = opt === "Any" ? "" : opt.replace("+", "");
                  const isSel = (localFilters.bedrooms || "") === val;
                  return (
                    <button
                      key={`bed-${opt}`}
                      type="button"
                      onClick={() => setLocalFilters({ ...localFilters, bedrooms: val })}
                      style={{
                        padding: "8px 18px",
                        borderRadius: "var(--radius-pill)",
                        border: `1px solid ${isSel ? "var(--airbnb-ink)" : "var(--airbnb-border)"}`,
                        backgroundColor: isSel ? "var(--airbnb-ink)" : "#FFFFFF",
                        color: isSel ? "#FFFFFF" : "var(--airbnb-ink)",
                        fontSize: 13,
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bathrooms */}
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>Bathrooms</div>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }} className="no-scrollbar">
                {numberOptions.slice(0, 6).map((opt) => {
                  const val = opt === "Any" ? "" : opt.replace("+", "");
                  const isSel = (localFilters.bathrooms || "") === val;
                  return (
                    <button
                      key={`bath-${opt}`}
                      type="button"
                      onClick={() => setLocalFilters({ ...localFilters, bathrooms: val })}
                      style={{
                        padding: "8px 18px",
                        borderRadius: "var(--radius-pill)",
                        border: `1px solid ${isSel ? "var(--airbnb-ink)" : "var(--airbnb-border)"}`,
                        backgroundColor: isSel ? "var(--airbnb-ink)" : "#FFFFFF",
                        color: isSel ? "#FFFFFF" : "var(--airbnb-ink)",
                        fontSize: 13,
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Property Types */}
          <div style={{ padding: "32px 0", borderBottom: "1px solid var(--airbnb-border-soft)" }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Property type</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
              {PROPERTY_TYPES.map((type) => {
                const isSel = localFilters.propertyType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setLocalFilters({ ...localFilters, propertyType: isSel ? "" : type })}
                    style={{
                      padding: "14px 16px",
                      borderRadius: "var(--radius-md)",
                      border: `1px solid ${isSel ? "var(--airbnb-ink)" : "var(--airbnb-border)"}`,
                      backgroundColor: isSel ? "var(--airbnb-surface-muted)" : "#FFFFFF",
                      fontSize: 14,
                      fontWeight: isSel ? 600 : 400,
                      textAlign: "left",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{type}</span>
                    {isSel && <Check size={16} color="var(--airbnb-ink)" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guest Favorites Toggle */}
          <div style={{ padding: "32px 0", borderBottom: "1px solid var(--airbnb-border-soft)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Guest favourites</div>
                <div style={{ fontSize: 13, color: "var(--airbnb-muted)" }}>
                  The most loved homes on Airbnb, according to guests
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLocalFilters({ ...localFilters, isGuestFavorite: !localFilters.isGuestFavorite })}
                style={{
                  width: 44,
                  height: 26,
                  backgroundColor: localFilters.isGuestFavorite ? "var(--airbnb-ink)" : "#B0B0B0",
                  borderRadius: "var(--radius-pill)",
                  padding: 2,
                  transition: "background-color var(--transition-fast)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    backgroundColor: "#FFFFFF",
                    borderRadius: "var(--radius-circle)",
                    transform: localFilters.isGuestFavorite ? "translateX(18px)" : "translateX(0)",
                    transition: "transform var(--transition-fast)",
                  }}
                />
              </button>
            </div>
          </div>

          {/* Amenities Checklist */}
          <div style={{ paddingTop: 32 }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Amenities</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
              {AMENITIES_LIST.map((amenity) => {
                const isChecked = (localFilters.amenities || []).includes(amenity.id);
                return (
                  <label
                    key={amenity.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      userSelect: "none",
                      fontSize: 14,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleAmenityToggle(amenity.id)}
                      style={{
                        width: 20,
                        height: 20,
                        accentColor: "var(--airbnb-ink)",
                        borderRadius: 4,
                      }}
                    />
                    <span>{amenity.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderTop: "1px solid var(--airbnb-border-soft)",
            backgroundColor: "#FFFFFF",
          }}
        >
          <button
            type="button"
            onClick={handleClear}
            style={{
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "underline",
              padding: "8px 12px",
            }}
          >
            Clear all
          </button>

          <button
            type="button"
            onClick={handleApply}
            style={{
              backgroundColor: "var(--airbnb-ink)",
              color: "#FFFFFF",
              padding: "14px 28px",
              borderRadius: "var(--radius-sm)",
              fontSize: 15,
              fontWeight: 600,
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}
          >
            Show results
          </button>
        </div>
      </div>
    </div>
  );
};
