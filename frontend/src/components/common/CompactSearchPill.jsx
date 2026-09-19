import React from "react";
import { Search } from "lucide-react";
import { useSearch } from "../../context/SearchContext";
import { formatDateRange, formatGuestSummary } from "../../utils/formatters";

export const CompactSearchPill = ({ onClick }) => {
  const { destination, checkInDate, checkOutDate, guests } = useSearch();

  const whereText = destination || "Anywhere";
  const whenText = checkInDate && checkOutDate 
    ? formatDateRange(checkInDate, checkOutDate) 
    : "Any week";
    
  const whoText = guests.adults + guests.children > 1 || guests.infants > 0 || guests.pets > 0
    ? `${guests.adults + guests.children} guests`
    : "Add guests";

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        border: "1px solid var(--airbnb-border)",
        borderRadius: "var(--radius-pill)",
        boxShadow: "var(--shadow-search)",
        padding: "8px 8px 8px 18px",
        gap: 12,
        transition: "box-shadow var(--transition-fast), transform var(--transition-fast)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-search)";
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--airbnb-ink)" }}>
        {whereText}
      </span>
      <span style={{ width: 1, height: 16, backgroundColor: "var(--airbnb-border)" }} />
      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--airbnb-ink)" }}>
        {whenText}
      </span>
      <span style={{ width: 1, height: 16, backgroundColor: "var(--airbnb-border)" }} />
      <span style={{ fontSize: 14, color: "var(--airbnb-muted)" }}>
        {whoText}
      </span>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "var(--radius-circle)",
          backgroundColor: "var(--airbnb-accent)",
          backgroundImage: "var(--airbnb-accent-gradient)",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: 4,
        }}
      >
        <Search size={13} strokeWidth={3} />
      </div>
    </button>
  );
};
