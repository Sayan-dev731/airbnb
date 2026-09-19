import React from "react";
import { MapPin, Sparkles } from "lucide-react";
import { POPULAR_DESTINATIONS } from "../../data/staticData";

export const DestinationPicker = ({ value, onChange, onSelect }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        marginTop: 12,
        width: 480,
        maxWidth: "90vw",
        backgroundColor: "#FFFFFF",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-popover)",
        padding: "24px 32px",
        zIndex: 50,
        animation: "scaleUp 200ms ease-out",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "var(--airbnb-ink)" }}>
        Search by region or popular destinations
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {POPULAR_DESTINATIONS.slice(0, 6).map((dest) => (
          <button
            key={dest.city}
            type="button"
            onClick={() => {
              onChange(dest.city);
              onSelect && onSelect(dest.city);
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 8,
              padding: 6,
              borderRadius: "var(--radius-md)",
              border: value.toLowerCase() === dest.city.toLowerCase() ? "2px solid var(--airbnb-ink)" : "1px solid transparent",
              transition: "all var(--transition-fast)",
            }}
          >
            <img
              src={dest.image}
              alt={dest.title}
              style={{
                width: "100%",
                height: 80,
                objectFit: "cover",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--airbnb-border-soft)",
              }}
            />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--airbnb-ink)" }}>{dest.title}</div>
              <div style={{ fontSize: 11, color: "var(--airbnb-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 100 }}>
                {dest.state}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--airbnb-border-soft)" }}>
        <button
          type="button"
          onClick={() => {
            onChange("");
            onSelect && onSelect("");
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            width: "100%",
            padding: "8px 12px",
            borderRadius: "var(--radius-sm)",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--airbnb-accent)",
          }}
        >
          <Sparkles size={16} />
          <span>I'm flexible (Explore all destinations)</span>
        </button>
      </div>
    </div>
  );
};
