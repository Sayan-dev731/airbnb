import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, Menu, User as UserIcon, Heart, Plane, PlusCircle, Shield, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSearch } from "../../context/SearchContext";
import { DestinationPicker } from "./DestinationPicker";
import { DatePickerPopover } from "./DatePickerPopover";
import { GuestPickerPopover } from "./GuestPickerPopover";
import { formatGuestSummary } from "../../utils/formatters";
import { DEMO_ACCOUNTS } from "../../data/staticData";

const CATEGORY_TABS = [
  { id: "all", label: "All", icon: "🌍" },
  { id: "homes", label: "Homes", icon: "🏡" },
  { id: "experiences", label: "Experiences", icon: "🎈" },
  { id: "services", label: "Services", icon: "🛎️" },
];

export const AirbnbHeader = ({ onNavigate, onOpenLanguageModal, onOpenBecomeHost }) => {
  const { user, logout, openLogin, openRegister, login } = useAuth();
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
  } = useSearch();

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExpandedManually, setIsExpandedManually] = useState(false);

  const menuRef = useRef(null);
  const searchRef = useRef(null);

  // Scroll listener for 60px threshold
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 60;
      setIsScrolled(scrolled);
      if (scrolled) {
        setIsExpandedManually(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside search popovers
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setActiveSearchSegment(null);
        if (isScrolled) {
          setIsExpandedManually(false);
        }
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isScrolled, setActiveSearchSegment]);

  const isExpanded = !isScrolled || isExpandedManually;

  const handleCompactPillClick = () => {
    setIsExpandedManually(true);
    setActiveSearchSegment("where");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchSubmit = (e) => {
    e && e.stopPropagation();
    setActiveSearchSegment(null);
    setIsExpandedManually(false);
    onNavigate && onNavigate("home");
  };

  const handleDemoLogin = async (demo) => {
    try {
      await login({ email: demo.email, password: demo.password });
      setIsMenuOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const springTransition = {
    type: "spring",
    stiffness: 350,
    damping: 30,
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "#FFFFFF",
        borderBottom: isScrolled ? "1px solid var(--airbnb-border-soft)" : "none",
        boxShadow: isScrolled ? "0 2px 4px rgba(0,0,0,0.04)" : "none",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <div className="container-airbnb" style={{ position: "relative" }}>
        {/* Top Header Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 80,
            position: "relative",
          }}
        >
          {/* Brand Logo Left */}
          <button
            type="button"
            onClick={() => onNavigate && onNavigate("home")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              zIndex: 10,
              flexShrink: 0,
            }}
          >
            <svg
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                display: "block",
                height: 34,
                width: 34,
                fill: "var(--airbnb-accent)",
              }}
            >
              <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.011.315c0 4.533-3.21 7.806-7.5 7.806-3.056 0-5.46-1.579-6-3.805-.54 2.226-2.944 3.805-6 3.805-4.29 0-7.5-3.273-7.5-7.806 0-1.127.31-2.296.971-3.711l.145-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.282 0-2.316.638-3.329 2.433l-.478.918C10.252 10.088 6.103 18.78 5.132 21.05l-.105.253c-.567 1.217-.827 2.164-.827 3.091 0 3.39 2.37 5.806 5.5 5.806 2.658 0 4.887-1.748 5.253-4.184l.047-.396v-5.226c-1.378-.475-2.4-1.758-2.4-3.294 0-1.928 1.57-3.5 3.5-3.5s3.5 1.572 3.5 3.5c0 1.536-1.022 2.819-2.4 3.294v5.226l.047.396c.366 2.436 2.595 4.184 5.253 4.184 3.13 0 5.5-2.416 5.5-5.806 0-.927-.26-1.874-.827-3.091l-.105-.253c-.971-2.27-5.12-10.962-7.059-14.699l-.478-.918C18.316 3.638 17.282 3 16 3zm0 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
            </svg>
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "var(--airbnb-accent)",
                display: "inline-block",
              }}
            >
              airbnb
            </span>
          </button>

          {/* Center: Top Category Tabs (All / Homes / Experiences / Services) */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 28,
            }}
            className="category-tabs-wrapper"
          >
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12, pointerEvents: "none" }}
                  transition={{ duration: 0.2 }}
                  style={{ display: "flex", alignItems: "center", gap: 24 }}
                >
                  {CATEGORY_TABS.map((tab) => {
                    const isSelected = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "10px 0",
                          fontSize: 15,
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? "var(--airbnb-ink)" : "var(--airbnb-muted)",
                          position: "relative",
                        }}
                      >
                        <span style={{ fontSize: 18 }}>{tab.icon}</span>
                        <span>{tab.label}</span>
                        {isSelected && (
                          <motion.div
                            layoutId="categoryTabUnderline"
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: 2,
                              backgroundColor: "var(--airbnb-ink)",
                              borderRadius: 2,
                            }}
                            transition={springTransition}
                          />
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Navigation Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, zIndex: 10 }}>
            {user?.role === "admin" && (
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("admin")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  backgroundColor: "var(--airbnb-ink)",
                  padding: "8px 14px",
                  borderRadius: "var(--radius-pill)",
                }}
              >
                <Shield size={14} />
                <span>Admin Panel</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (!user) {
                  openLogin();
                } else if (user.role === "host" || user.role === "admin") {
                  onNavigate && onNavigate("host");
                } else {
                  onOpenBecomeHost && onOpenBecomeHost();
                }
              }}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--airbnb-ink)",
                padding: "10px 14px",
                borderRadius: "var(--radius-pill)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--airbnb-surface-muted)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {user?.role === "host" ? "Host dashboard" : user?.role === "admin" ? "Host dashboard" : "Become a host"}
            </button>

            <button
              type="button"
              onClick={onOpenLanguageModal}
              style={{
                padding: 10,
                borderRadius: "var(--radius-circle)",
                color: "var(--airbnb-ink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--airbnb-surface-muted)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              aria-label="Language and currency"
            >
              <Globe size={18} />
            </button>

            {/* Profile Dropdown Trigger */}
            <div style={{ position: "relative" }} ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "5px 5px 5px 12px",
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid var(--airbnb-border)",
                  backgroundColor: "#FFFFFF",
                  boxShadow: isMenuOpen ? "0 2px 4px rgba(0,0,0,0.18)" : "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.18)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = isMenuOpen ? "0 2px 4px rgba(0,0,0,0.18)" : "none")}
              >
                <Menu size={18} color="var(--airbnb-ink)" />
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user.name}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "var(--radius-circle)",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "var(--radius-circle)",
                      backgroundColor: "#717171",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <UserIcon size={18} />
                  </div>
                )}
              </button>

              {/* Profile Dropdown Menu */}
              {isMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    width: 260,
                    backgroundColor: "#FFFFFF",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "var(--shadow-popover)",
                    border: "1px solid rgba(0,0,0,0.04)",
                    padding: "8px 0",
                    zIndex: 200,
                    animation: "scaleUp 150ms ease-out",
                  }}
                >
                  {user ? (
                    <>
                      <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--airbnb-border-soft)" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--airbnb-ink)" }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--airbnb-muted)" }}>
                          {user.email}
                        </div>
                        <div style={{ display: "inline-block", marginTop: 4, padding: "2px 6px", fontSize: 10, fontWeight: 700, borderRadius: 4, backgroundColor: "var(--airbnb-surface-muted)", textTransform: "uppercase" }}>
                          {user.role}
                        </div>
                      </div>

                      {user.role === "admin" && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            onNavigate && onNavigate("admin");
                          }}
                          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 16px", fontSize: 14, fontWeight: 700, color: "var(--airbnb-ink)", textAlign: "left" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--airbnb-surface-muted)")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <Shield size={16} />
                          <span>Admin Governance</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onNavigate && onNavigate("trips");
                        }}
                        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 16px", fontSize: 14, fontWeight: 500, textAlign: "left" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--airbnb-surface-muted)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <Plane size={16} />
                        <span>Trips</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onNavigate && onNavigate("favorites");
                        }}
                        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 16px", fontSize: 14, fontWeight: 500, textAlign: "left" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--airbnb-surface-muted)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <Heart size={16} />
                        <span>Wishlists</span>
                      </button>

                      <div style={{ height: 1, backgroundColor: "var(--airbnb-border-soft)", margin: "6px 0" }} />

                      {user.role === "host" || user.role === "admin" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            onNavigate && onNavigate("host");
                          }}
                          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 16px", fontSize: 14, fontWeight: 500, textAlign: "left" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--airbnb-surface-muted)")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <PlusCircle size={16} />
                          <span>Manage listings</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            onOpenBecomeHost && onOpenBecomeHost();
                          }}
                          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 16px", fontSize: 14, fontWeight: 500, textAlign: "left" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--airbnb-surface-muted)")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <Shield size={16} />
                          <span>Apply to Become a Host</span>
                        </button>
                      )}

                      <div style={{ height: 1, backgroundColor: "var(--airbnb-border-soft)", margin: "6px 0" }} />

                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          logout();
                        }}
                        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 16px", fontSize: 14, fontWeight: 500, color: "var(--airbnb-error)", textAlign: "left" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--airbnb-surface-muted)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <LogOut size={16} />
                        <span>Log out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          openRegister();
                        }}
                        style={{ display: "block", width: "100%", padding: "12px 16px", fontSize: 14, fontWeight: 600, textAlign: "left" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--airbnb-surface-muted)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        Sign up
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          openLogin();
                        }}
                        style={{ display: "block", width: "100%", padding: "12px 16px", fontSize: 14, fontWeight: 400, textAlign: "left" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--airbnb-surface-muted)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        Log in
                      </button>

                      <div style={{ height: 1, backgroundColor: "var(--airbnb-border-soft)", margin: "6px 0" }} />

                      <div style={{ padding: "6px 16px 4px", fontSize: 11, fontWeight: 700, color: "var(--airbnb-muted)", textTransform: "uppercase" }}>
                        Quick Demo Logins
                      </div>

                      {DEMO_ACCOUNTS.map((demo) => (
                        <button
                          key={demo.role}
                          type="button"
                          onClick={() => handleDemoLogin(demo)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            width: "100%",
                            padding: "8px 16px",
                            fontSize: 13,
                            textAlign: "left",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--airbnb-surface-muted)")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <img
                            src={demo.avatar}
                            alt={demo.name}
                            style={{ width: 24, height: 24, borderRadius: "var(--radius-circle)", objectFit: "cover" }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{demo.role}</div>
                            <div style={{ fontSize: 11, color: "var(--airbnb-muted)" }}>{demo.name.split(" ")[0]}</div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Morphing Search Pill (Expanded vs. Compact) */}
        <div
          ref={searchRef}
          style={{
            display: "flex",
            justifyContent: "center",
            paddingBottom: isExpanded ? 18 : 0,
            transition: "padding-bottom 0.25s ease",
          }}
        >
          <motion.div
            layout
            transition={springTransition}
            style={{
              position: isExpanded ? "relative" : "absolute",
              top: isExpanded ? "auto" : 16,
              zIndex: 30,
              width: isExpanded ? "100%" : "auto",
              maxWidth: isExpanded ? 850 : 380,
              display: "flex",
              justifyContent: "center",
            }}
          >
            {isExpanded ? (
              /* Expanded Search Bar */
              <motion.div
                layoutId="searchPillContainer"
                transition={springTransition}
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: activeSearchSegment ? "#EBEBEB" : "#FFFFFF",
                  border: "1px solid var(--airbnb-border)",
                  borderRadius: "var(--radius-pill)",
                  boxShadow: activeSearchSegment ? "var(--shadow-search-expanded)" : "var(--shadow-search)",
                  position: "relative",
                  width: "100%",
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

                {/* When / Check-in Segment */}
                <div
                  onClick={() => setActiveSearchSegment("checkIn")}
                  style={{
                    flex: "1.2",
                    padding: "12px 24px",
                    borderRadius: "var(--radius-pill)",
                    backgroundColor: activeSearchSegment === "checkIn" ? "#FFFFFF" : "transparent",
                    boxShadow: activeSearchSegment === "checkIn" ? "0 4px 16px rgba(0,0,0,0.12)" : "none",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", color: "var(--airbnb-ink)" }}>
                    When
                  </div>
                  <div style={{ fontSize: 14, fontWeight: checkInDate ? 600 : 400, color: checkInDate ? "var(--airbnb-ink)" : "var(--airbnb-muted)" }}>
                    {checkInDate ? new Date(checkInDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Add dates"}
                  </div>
                </div>

                <div style={{ width: 1, height: 32, backgroundColor: "var(--airbnb-border)", opacity: activeSearchSegment ? 0 : 1 }} />

                {/* Who Segment & Search Button */}
                <div
                  onClick={() => setActiveSearchSegment("who")}
                  style={{
                    flex: "1.4",
                    padding: "12px 10px 12px 24px",
                    borderRadius: "var(--radius-pill)",
                    backgroundColor: activeSearchSegment === "who" ? "#FFFFFF" : "transparent",
                    boxShadow: activeSearchSegment === "who" ? "0 4px 16px rgba(0,0,0,0.12)" : "none",
                    cursor: "pointer",
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
                      {guests.adults + guests.children > 1 || guests.infants > 0 ? formatGuestSummary(guests) : "Add guests"}
                    </div>
                  </div>

                  <motion.button
                    layoutId="searchIconButton"
                    type="button"
                    onClick={handleSearchSubmit}
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
                    }}
                    transition={springTransition}
                  >
                    <Search size={16} strokeWidth={3} />
                    {activeSearchSegment && <span style={{ fontSize: 14, fontWeight: 700 }}>Search</span>}
                  </motion.button>
                </div>

                {/* Dropdowns */}
                {activeSearchSegment === "where" && (
                  <DestinationPicker
                    value={destination}
                    onChange={(val) => setDestination(val)}
                    onSelect={() => setActiveSearchSegment("checkIn")}
                  />
                )}

                {activeSearchSegment === "checkIn" && (
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
              </motion.div>
            ) : (
              /* Compact Morphed Pill when scrolled */
              <motion.button
                layoutId="searchPillContainer"
                transition={springTransition}
                type="button"
                onClick={handleCompactPillClick}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--airbnb-border)",
                  borderRadius: "var(--radius-pill)",
                  boxShadow: "var(--shadow-search)",
                  padding: "8px 8px 8px 16px",
                  gap: 12,
                  height: 48,
                  cursor: "pointer",
                }}
                whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.12)", scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span style={{ fontSize: 16 }}>🏡</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--airbnb-ink)" }}>
                  {destination || "Anywhere"}
                </span>
                <span style={{ width: 1, height: 16, backgroundColor: "var(--airbnb-border)" }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--airbnb-ink)" }}>
                  {checkInDate && checkOutDate ? "Dates set" : "Anytime"}
                </span>
                <span style={{ width: 1, height: 16, backgroundColor: "var(--airbnb-border)" }} />
                <span style={{ fontSize: 14, color: "var(--airbnb-muted)" }}>
                  {guests.adults + guests.children > 1 ? `${guests.adults + guests.children} guests` : "Add guests"}
                </span>

                <motion.div
                  layoutId="searchIconButton"
                  transition={springTransition}
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
                </motion.div>
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .category-tabs-wrapper {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
