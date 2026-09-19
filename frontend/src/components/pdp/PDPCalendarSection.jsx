import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Keyboard } from "lucide-react";
import { calculateNights, formatDateFull } from "../../utils/formatters";

export const PDPCalendarSection = ({ listing, checkInDate, checkOutDate, onDatesChange }) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const nights = calculateNights(checkInDate, checkOutDate);
  const city = listing?.location?.city || "Pune City";

  const getMonthData = (monthOffset = 0) => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth() + monthOffset;
    const targetDate = new Date(year, month, 1);
    
    const monthName = targetDate.toLocaleString("default", { month: "long" });
    const fullYear = targetDate.getFullYear();
    
    const firstDayIndex = targetDate.getDay();
    const daysInMonth = new Date(fullYear, targetDate.getMonth() + 1, 0).getDate();
    
    return { targetDate, monthName, fullYear, firstDayIndex, daysInMonth };
  };

  const handleDayClick = (year, month, day) => {
    const clickedDate = new Date(year, month, day);
    clickedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (clickedDate < today) return;

    if (!checkInDate || (checkInDate && checkOutDate)) {
      onDatesChange(clickedDate, null);
    } else if (checkInDate && !checkOutDate) {
      if (clickedDate < new Date(checkInDate)) {
        onDatesChange(clickedDate, null);
      } else {
        onDatesChange(checkInDate, clickedDate);
      }
    }
  };

  const isSelected = (year, month, day) => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    const inTime = checkInDate ? new Date(checkInDate).setHours(0,0,0,0) : null;
    const outTime = checkOutDate ? new Date(checkOutDate).setHours(0,0,0,0) : null;
    const dateTime = date.getTime();

    const isStart = inTime === dateTime;
    const isEnd = outTime === dateTime;
    const isInRange = inTime && outTime && dateTime > inTime && dateTime < outTime;

    return { isStart, isEnd, isInRange };
  };

  const renderMonth = (offset) => {
    const { targetDate, monthName, fullYear, firstDayIndex, daysInMonth } = getMonthData(offset);
    const monthIndex = targetDate.getMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const blanks = Array.from({ length: firstDayIndex }, (_, i) => i);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div style={{ flex: 1, minWidth: 280 }}>
        <div style={{ textAlign: "center", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>
          {monthName} {fullYear}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, textAlign: "center", fontSize: 13, fontWeight: 600, color: "var(--airbnb-muted)", marginBottom: 12 }}>
          <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px 0" }}>
          {blanks.map((b) => (
            <div key={`blank-${b}`} style={{ height: 42 }} />
          ))}
          {days.map((day) => {
            const date = new Date(fullYear, monthIndex, day);
            date.setHours(0, 0, 0, 0);
            const isPast = date < today;
            const { isStart, isEnd, isInRange } = isSelected(fullYear, monthIndex, day);

            let bg = "transparent";
            let color = isPast ? "var(--airbnb-muted-light)" : "var(--airbnb-ink)";
            let borderRadius = "var(--radius-circle)";

            if (isStart || isEnd) {
              bg = "var(--airbnb-ink)";
              color = "#ffffff";
            } else if (isInRange) {
              bg = "var(--airbnb-surface-muted)";
              borderRadius = "0";
            }

            return (
              <button
                key={day}
                type="button"
                disabled={isPast}
                onClick={() => handleDayClick(fullYear, monthIndex, day)}
                style={{
                  height: 42,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: isStart || isEnd ? 700 : 500,
                  backgroundColor: bg,
                  color: color,
                  borderRadius: borderRadius,
                  cursor: isPast ? "not-allowed" : "pointer",
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "32px 0", borderBottom: "1px solid var(--airbnb-border-soft)" }}>
      {/* Title */}
      <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
        {checkInDate && checkOutDate ? `${nights} nights in ${city}` : `Select check-in date in ${city}`}
      </h3>
      <div style={{ fontSize: 14, color: "var(--airbnb-muted)", marginBottom: 24 }}>
        {checkInDate && checkOutDate ? `${formatDateFull(checkInDate)} - ${formatDateFull(checkOutDate)}` : "Add your travel dates for exact pricing"}
      </div>

      {/* Calendar Controls */}
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", position: "absolute", top: 0, left: 0, right: 0, zIndex: 2, pointerEvents: "none" }}>
          <button
            type="button"
            onClick={() => {
              const prev = new Date(currentMonthDate);
              prev.setMonth(prev.getMonth() - 1);
              setCurrentMonthDate(prev);
            }}
            style={{
              padding: 8,
              borderRadius: "var(--radius-circle)",
              display: "flex",
              pointerEvents: "auto",
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => {
              const next = new Date(currentMonthDate);
              next.setMonth(next.getMonth() + 1);
              setCurrentMonthDate(next);
            }}
            style={{
              padding: 8,
              borderRadius: "var(--radius-circle)",
              display: "flex",
              pointerEvents: "auto",
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Dual Month Calendar */}
        <div style={{ display: "flex", gap: 48, flexWrap: "wrap", justifyContent: "center" }}>
          {renderMonth(0)}
          {renderMonth(1)}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
        <button type="button" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--airbnb-muted)" }}>
          <Keyboard size={18} />
        </button>

        <button
          type="button"
          onClick={() => onDatesChange(null, null)}
          style={{
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "underline",
            color: "var(--airbnb-ink)",
          }}
        >
          Clear dates
        </button>
      </div>
    </div>
  );
};
