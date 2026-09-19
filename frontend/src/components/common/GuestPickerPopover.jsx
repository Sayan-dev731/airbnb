import React from "react";
import { Plus, Minus } from "lucide-react";

export const GuestPickerPopover = ({ guests, onChange, maxGuests = 16 }) => {
  const updateCount = (type, delta) => {
    const current = guests[type] || 0;
    const nextVal = Math.max(type === "adults" ? 1 : 0, current + delta);
    
    // Check total capacity
    const total = (type === "adults" ? nextVal : guests.adults) + (type === "children" ? nextVal : guests.children);
    if (total > maxGuests && delta > 0) return;

    onChange({
      ...guests,
      [type]: nextVal,
    });
  };

  const rows = [
    {
      type: "adults",
      title: "Adults",
      subtitle: "Ages 13 or above",
      value: guests.adults || 1,
      min: 1,
    },
    {
      type: "children",
      title: "Children",
      subtitle: "Ages 2–12",
      value: guests.children || 0,
      min: 0,
    },
    {
      type: "infants",
      title: "Infants",
      subtitle: "Under 2",
      value: guests.infants || 0,
      min: 0,
    },
    {
      type: "pets",
      title: "Pets",
      subtitle: "Bringing a service animal?",
      value: guests.pets || 0,
      min: 0,
    },
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        right: 0,
        marginTop: 12,
        backgroundColor: "#FFFFFF",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-popover)",
        padding: "24px 32px",
        zIndex: 50,
        width: 380,
        maxWidth: "90vw",
        animation: "scaleUp 200ms ease-out",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {rows.map((row, idx) => (
          <div
            key={row.type}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: idx !== rows.length - 1 ? 20 : 0,
              borderBottom: idx !== rows.length - 1 ? "1px solid var(--airbnb-border-soft)" : "none",
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--airbnb-ink)" }}>{row.title}</div>
              <div style={{ fontSize: 13, color: "var(--airbnb-muted)" }}>{row.subtitle}</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button
                type="button"
                disabled={row.value <= row.min}
                onClick={() => updateCount(row.type, -1)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-circle)",
                  border: `1px solid ${row.value <= row.min ? "var(--airbnb-border-soft)" : "var(--airbnb-border)"}`,
                  color: row.value <= row.min ? "var(--airbnb-muted-light)" : "var(--airbnb-ink)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: row.value <= row.min ? "not-allowed" : "pointer",
                }}
              >
                <Minus size={14} />
              </button>

              <span style={{ fontSize: 15, fontWeight: 500, minWidth: 16, textAlign: "center" }}>
                {row.value}
              </span>

              <button
                type="button"
                onClick={() => updateCount(row.type, 1)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-circle)",
                  border: "1px solid var(--airbnb-border)",
                  color: "var(--airbnb-ink)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
