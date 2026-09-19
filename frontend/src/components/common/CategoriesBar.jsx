import React, { useRef, useState, useEffect } from "react";
import {
  Flame,
  Building2,
  Waves,
  Palmtree,
  Home,
  Castle,
  Sparkles,
  TreePine,
  Crown,
  Sailboat,
  BedDouble,
  Tractor,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CATEGORIES } from "../../data/staticData";
import { useSearch } from "../../context/SearchContext";

const ICON_MAP = {
  Flame,
  Building2,
  Waves,
  Palmtree,
  Home,
  Castle,
  Sparkles,
  TreePine,
  Crown,
  Sailboat,
  BedDouble,
  Tractor,
};

export const CategoriesBar = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    activeFiltersCount,
    setIsFilterModalOpen,
    displayTotalWithTaxes,
    setDisplayTotalWithTaxes,
  } = useSearch();

  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div
      style={{
        position: "sticky",
        top: 80,
        backgroundColor: "#FFFFFF",
        zIndex: 40,
        boxShadow: "0 1px 0 rgba(0, 0, 0, 0.08)",
        paddingTop: 12,
        paddingBottom: 12,
      }}
    >
      <div
        className="container-airbnb"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          justifyContent: "space-between",
        }}
      >
        {/* Carousel with scroll arrows */}
        <div style={{ position: "relative", flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
          {/* Left Scroll Button */}
          {canScrollLeft && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                background: "linear-gradient(to right, #FFFFFF 60%, rgba(255,255,255,0) 100%)",
                paddingRight: 24,
                zIndex: 2,
              }}
            >
              <button
                type="button"
                onClick={() => handleScroll("left")}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "var(--radius-circle)",
                  border: "1px solid var(--airbnb-border)",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Scroll categories left"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          )}

          {/* Categories List */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="no-scrollbar"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
              overflowX: "auto",
              scrollBehavior: "smooth",
              paddingBottom: 4,
            }}
          >
            {CATEGORIES.map((cat) => {
              const IconComponent = ICON_MAP[cat.icon] || Sparkles;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 0 10px 0",
                    borderBottom: `2px solid ${isSelected ? "var(--airbnb-ink)" : "transparent"}`,
                    color: isSelected ? "var(--airbnb-ink)" : "var(--airbnb-muted)",
                    opacity: isSelected ? 1 : 0.75,
                    minWidth: "max-content",
                    cursor: "pointer",
                    transition: "all var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.color = "var(--airbnb-ink)";
                      e.currentTarget.style.opacity = "1";
                      e.currentTarget.style.borderBottom = "2px solid var(--airbnb-border)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.color = "var(--airbnb-muted)";
                      e.currentTarget.style.opacity = "0.75";
                      e.currentTarget.style.borderBottom = "2px solid transparent";
                    }
                  }}
                >
                  <IconComponent size={24} strokeWidth={isSelected ? 2.2 : 1.7} />
                  <span style={{ fontSize: 12, fontWeight: isSelected ? 700 : 500 }}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Scroll Button */}
          {canScrollRight && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                background: "linear-gradient(to left, #FFFFFF 60%, rgba(255,255,255,0) 100%)",
                paddingLeft: 24,
                zIndex: 2,
              }}
            >
              <button
                type="button"
                onClick={() => handleScroll("right")}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "var(--radius-circle)",
                  border: "1px solid var(--airbnb-border)",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Scroll categories right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Filter Trigger Button & Taxes Switch */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {/* Filters Button */}
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--airbnb-border)",
              backgroundColor: "#FFFFFF",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--airbnb-ink)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
              transition: "border-color var(--transition-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--airbnb-ink)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--airbnb-border)")}
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span
                style={{
                  backgroundColor: "var(--airbnb-ink)",
                  color: "#FFFFFF",
                  borderRadius: "var(--radius-circle)",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "1px 6px",
                  marginLeft: 2,
                }}
              >
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Display Total Before Taxes Toggle (Desktop only) */}
          <div
            style={{ display: "none" }}
            className="taxes-toggle-desktop"
          >
            <button
              type="button"
              onClick={() => setDisplayTotalWithTaxes(!displayTotalWithTaxes)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--airbnb-border)",
                backgroundColor: "#FFFFFF",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--airbnb-ink)",
              }}
            >
              <span>Display total before taxes</span>
              <div
                style={{
                  width: 36,
                  height: 22,
                  backgroundColor: displayTotalWithTaxes ? "var(--airbnb-ink)" : "#B0B0B0",
                  borderRadius: "var(--radius-pill)",
                  padding: 2,
                  transition: "background-color var(--transition-fast)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    backgroundColor: "#FFFFFF",
                    borderRadius: "var(--radius-circle)",
                    transform: displayTotalWithTaxes ? "translateX(14px)" : "translateX(0)",
                    transition: "transform var(--transition-fast)",
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 950px) {
          .taxes-toggle-desktop {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};
