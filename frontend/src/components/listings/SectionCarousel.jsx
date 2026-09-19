import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { ListingCard } from "./ListingCard";

export const SectionCarousel = ({ title, listings = [], onSelectListing, onSeeAll }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [listings]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -600 : 600;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
      setTimeout(checkScroll, 300);
    }
  };

  if (listings.length === 0) return null;

  return (
    <div style={{ marginBottom: 44 }}>
      {/* Section Title & Arrow Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button
          type="button"
          onClick={onSeeAll}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 22,
            fontWeight: 800,
            color: "var(--airbnb-ink)",
            letterSpacing: "-0.02em",
          }}
        >
          <span>{title}</span>
          <ArrowRight size={20} strokeWidth={2.5} />
        </button>

        {/* Left / Right Chevron Navigation */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            disabled={!canScrollLeft}
            onClick={() => handleScroll("left")}
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-circle)",
              border: "1px solid var(--airbnb-border)",
              backgroundColor: "#FFFFFF",
              color: canScrollLeft ? "var(--airbnb-ink)" : "var(--airbnb-muted-light)",
              cursor: canScrollLeft ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            }}
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            disabled={!canScrollRight}
            onClick={() => handleScroll("right")}
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-circle)",
              border: "1px solid var(--airbnb-border)",
              backgroundColor: "#FFFFFF",
              color: canScrollRight ? "var(--airbnb-ink)" : "var(--airbnb-muted-light)",
              cursor: canScrollRight ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Row */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="no-scrollbar"
        style={{
          display: "flex",
          gap: 16,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          paddingBottom: 8,
        }}
      >
        {listings.map((listing) => (
          <div
            key={listing._id}
            style={{
              flex: "0 0 calc(100% / 6 - 14px)",
              minWidth: 230,
              scrollSnapAlign: "start",
            }}
          >
            <ListingCard
              listing={listing}
              onSelect={onSelectListing}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
