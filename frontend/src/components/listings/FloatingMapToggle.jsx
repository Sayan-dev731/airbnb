import React from "react";
import { Map as MapIcon, List } from "lucide-react";

export const FloatingMapToggle = ({ isMapOpen, onToggle }) => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 36,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 80,
      }}
      className="floating-map-toggle-wrapper"
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: "var(--airbnb-ink)",
          color: "#FFFFFF",
          padding: "14px 20px",
          borderRadius: "var(--radius-pill)",
          boxShadow: "var(--shadow-floating-btn)",
          fontSize: 14,
          fontWeight: 600,
          transition: "transform var(--transition-fast), background-color var(--transition-fast)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {isMapOpen ? (
          <>
            <span>Show list</span>
            <List size={16} />
          </>
        ) : (
          <>
            <span>Show map</span>
            <MapIcon size={16} />
          </>
        )}
      </button>

      <style>{`
        @media (max-width: 743px) {
          .floating-map-toggle-wrapper {
            bottom: 80px !important;
          }
        }
      `}</style>
    </div>
  );
};
