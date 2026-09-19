import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const DatePickerPopover = ({ checkInDate, checkOutDate, onDatesChange, onClose }) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

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
    if (clickedDate < today) return; // Ignore past dates

    if (!checkInDate || (checkInDate && checkOutDate)) {
      onDatesChange(clickedDate, null);
    } else if (checkInDate && !checkOutDate) {
      if (clickedDate < new Date(checkInDate)) {
        onDatesChange(clickedDate, null);
      } else {
        onDatesChange(checkInDate, clickedDate);
        if (onClose) setTimeout(onClose, 250);
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
      <div style={{ flex: 1, minWidth: 260 }}>
        <div style={{ textAlign: "center", fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
          {monthName} {fullYear}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, textAlign: "center", fontSize: 12, color: "var(--airbnb-muted)", marginBottom: 8 }}>
          <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px 0" }}>
          {blanks.map((b) => (
            <div key={`blank-${b}`} style={{ height: 38 }} />
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
                  height: 38,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
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
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        marginTop: 12,
        backgroundColor: "#FFFFFF",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-popover)",
        padding: "24px 32px",
        zIndex: 50,
        width: 620,
        maxWidth: "95vw",
        animation: "scaleUp 200ms ease-out",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
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
            border: "1px solid var(--airbnb-border)",
            display: "flex",
          }}
        >
          <ChevronLeft size={16} />
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
            border: "1px solid var(--airbnb-border)",
            display: "flex",
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
        {renderMonth(0)}
        {renderMonth(1)}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, gap: 12 }}>
        <button
          type="button"
          onClick={() => onDatesChange(null, null)}
          style={{
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "underline",
            padding: "6px 12px",
          }}
        >
          Clear dates
        </button>
      </div>
    </div>
  );
};
