import React from "react";
import {
  X,
  Wifi,
  Wind,
  Utensils,
  Car,
  Waves,
  Laptop,
  Tv,
  Shirt,
  Bath,
  Sun,
  Compass,
  Mountain,
  Zap,
  Dog,
  Key,
  ArrowUpDown,
  Baby,
  Flame,
  Dumbbell,
  Shield,
  Sparkles,
} from "lucide-react";
import { AMENITIES_LIST } from "../../data/staticData";

const AMENITY_ICONS = {
  Wifi,
  Wind,
  Utensils,
  Car,
  Waves,
  Laptop,
  Tv,
  Shirt,
  Bath,
  Sun,
  Compass,
  Mountain,
  Zap,
  Dog,
  Key,
  ArrowUpDown,
  Baby,
  Flame,
  Dumbbell,
  Shield,
};

export const PDPAmenitiesModal = ({ amenities = [], isOpen, onClose }) => {
  if (!isOpen) return null;

  // Group amenities by category
  const categories = ["Essentials", "Features", "Location", "Parking & Facilities", "Safety", "Rules", "Family", "Access"];

  const getIcon = (amenityName) => {
    const found = AMENITIES_LIST.find((a) => a.label.toLowerCase() === amenityName.toLowerCase() || a.id.toLowerCase() === amenityName.toLowerCase());
    if (found && AMENITY_ICONS[found.icon]) {
      return AMENITY_ICONS[found.icon];
    }
    return Sparkles;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 780,
          maxWidth: "100%",
          maxHeight: "85vh",
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
          <div style={{ fontSize: 16, fontWeight: 700 }}>What this place offers</div>
          <div style={{ width: 24 }} />
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
                All Included Amenities ({amenities.length})
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {amenities.map((item, idx) => {
                  const IconComp = getIcon(item);
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: "12px 0",
                        borderBottom: "1px solid var(--airbnb-border-soft)",
                      }}
                    >
                      <IconComp size={22} color="var(--airbnb-ink)" strokeWidth={1.8} />
                      <span style={{ fontSize: 15, color: "var(--airbnb-ink)", fontWeight: 500 }}>
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
