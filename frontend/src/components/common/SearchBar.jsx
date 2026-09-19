import React, { useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { useSearch } from "../../context/SearchContext";
import { DestinationPicker } from "./DestinationPicker";
import { DatePickerPopover } from "./DatePickerPopover";
import { GuestPickerPopover } from "./GuestPickerPopover";
import { formatDateRange, formatGuestSummary } from "../../utils/formatters";

export const SearchBar = ({ onSearchSubmit }) => {
  const {
    destination,
    setDestination,
    checkInDate,
    setCheckInDate,
    checkOutDate,
    setCheckOutDate,
    guests,
    setGuests,
    activeSearchSegment,
    setActiveSearchSegment,
    setIsSearchExpanded,
  } = useSearch();

  const containerRef = useRef(null);

  // Close search popovers when clicked outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveSearchSegment(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [setActiveSearchSegment]);

  const handleSearchClick = (e) => {
    e.stopPropagation();
    setActiveSearchSegment(null);
    setIsSearchExpanded(false);
    if (onSearchSubmit) onSearchSubmit();
  };

  const datesText = checkInDate && checkOutDate 
    ? formatDateRange(checkInDate, checkOutDate) 
    : checkInDate 
    ? new Date(checkInDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) 
    : "Add dates";

  const guestsText = guests.adults + guests.children > 1 || guests.infants > 0 || guests.pets > 0
    ? formatGuestSummary(guests)
    : "Add guests";

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        maxWidth: 850,
        width: "100%",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: activeSearchSegment ? "#EBEBEB" : "#FFFFFF",
          border: "1px solid var(--airbnb-border)",
          borderRadius: "var(--radius-pill)",
          boxShadow: activeSearchSegment ? "var(--shadow-search-expanded)" : "var(--shadow-search)",
          position: "relative",
          transition: "all var(--transition-normal)",
          height: 66,
        }}
      >
        {/* Where Segment */}
        <div
          onClick={() => setActiveSearchSegment("where")}
          style={{
            flex: "1.4",
            padding: "12px 28px",
            borderRadius: "var(--radius-pill)",
            backgroundColor: activeSearchSegment === "where" ? "#FFFFFF" : "transparent",
            boxShadow: activeSearchSegment === "where" ? "0 4px 16px rgba(0,0,0,0.12)" : "none",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", color: "var(--airbnb-ink)" }}>
            Where
          </div>
          <input
            type="text"
            placeholder="Search destinations"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onFocus={() => setActiveSearchSegment("where")}
            style={{
              fontSize: 14,
              fontWeight: destination ? 600 : 400,
              color: destination ? "var(--airbnb-ink)" : "var(--airbnb-muted)",
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          />
        </div>

        <div style={{ width: 1, height: 32, backgroundColor: "var(--airbnb-border)", opacity: activeSearchSegment ? 0 : 1 }} />

        {/* Check in Segment */}
        <div
          onClick={() => setActiveSearchSegment("checkIn")}
          style={{
            flex: "1",
            padding: "12px 20px",
            borderRadius: "var(--radius-pill)",
            backgroundColor: activeSearchSegment === "checkIn" ? "#FFFFFF" : "transparent",
            boxShadow: activeSearchSegment === "checkIn" ? "0 4px 16px rgba(0,0,0,0.12)" : "none",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", color: "var(--airbnb-ink)" }}>
            Check in
          </div>
          <div style={{ fontSize: 14, fontWeight: checkInDate ? 600 : 400, color: checkInDate ? "var(--airbnb-ink)" : "var(--airbnb-muted)" }}>
            {checkInDate ? new Date(checkInDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Add dates"}
          </div>
        </div>

        <div style={{ width: 1, height: 32, backgroundColor: "var(--airbnb-border)", opacity: activeSearchSegment ? 0 : 1 }} />

        {/* Check out Segment */}
        <div
          onClick={() => setActiveSearchSegment("checkOut")}
          style={{
            flex: "1",
            padding: "12px 20px",
            borderRadius: "var(--radius-pill)",
            backgroundColor: activeSearchSegment === "checkOut" ? "#FFFFFF" : "transparent",
            boxShadow: activeSearchSegment === "checkOut" ? "0 4px 16px rgba(0,0,0,0.12)" : "none",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", color: "var(--airbnb-ink)" }}>
            Check out
          </div>
          <div style={{ fontSize: 14, fontWeight: checkOutDate ? 600 : 400, color: checkOutDate ? "var(--airbnb-ink)" : "var(--airbnb-muted)" }}>
            {checkOutDate ? new Date(checkOutDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Add dates"}
          </div>
        </div>

        <div style={{ width: 1, height: 32, backgroundColor: "var(--airbnb-border)", opacity: activeSearchSegment ? 0 : 1 }} />

        {/* Who Segment & Search Button */}
        <div
          onClick={() => setActiveSearchSegment("who")}
          style={{
            flex: "1.3",
            padding: "12px 10px 12px 24px",
            borderRadius: "var(--radius-pill)",
            backgroundColor: activeSearchSegment === "who" ? "#FFFFFF" : "transparent",
            boxShadow: activeSearchSegment === "who" ? "0 4px 16px rgba(0,0,0,0.12)" : "none",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", color: "var(--airbnb-ink)" }}>
              Who
            </div>
            <div style={{ fontSize: 14, fontWeight: guests.adults + guests.children > 1 ? 600 : 400, color: guests.adults + guests.children > 1 ? "var(--airbnb-ink)" : "var(--airbnb-muted)" }}>
              {guestsText}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSearchClick}
            style={{
              backgroundColor: "var(--airbnb-accent)",
              backgroundImage: "var(--airbnb-accent-gradient)",
              color: "#FFFFFF",
              borderRadius: "var(--radius-pill)",
              padding: activeSearchSegment ? "14px 20px" : "14px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 2px 6px rgba(224, 11, 65, 0.4)",
              transition: "all var(--transition-fast)",
            }}
          >
            <Search size={16} strokeWidth={3} />
            {activeSearchSegment && <span style={{ fontSize: 14, fontWeight: 700 }}>Search</span>}
          </button>
        </div>
      </div>

      {/* Popovers */}
      {activeSearchSegment === "where" && (
        <DestinationPicker
          value={destination}
          onChange={(val) => setDestination(val)}
          onSelect={() => setActiveSearchSegment("checkIn")}
        />
      )}

      {(activeSearchSegment === "checkIn" || activeSearchSegment === "checkOut") && (
        <DatePickerPopover
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          onDatesChange={(inD, outD) => {
            setCheckInDate(inD);
            setCheckOutDate(outD);
          }}
          onClose={() => setActiveSearchSegment("who")}
        />
      )}

      {activeSearchSegment === "who" && (
        <GuestPickerPopover
          guests={guests}
          onChange={(newGuests) => setGuests(newGuests)}
        />
      )}
    </div>
  );
};
