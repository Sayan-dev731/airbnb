import React, { useState, useRef, useEffect } from "react";
import { Globe, Menu, User as UserIcon, Heart, Plane, PlusCircle, Shield, LogOut, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSearch } from "../../context/SearchContext";
import { SearchBar } from "./SearchBar";
import { CompactSearchPill } from "./CompactSearchPill";
import { DEMO_ACCOUNTS } from "../../data/staticData";

export const Header = ({ onOpenLanguageModal, onNavigate, currentTab = "stays", onTabChange }) => {
  const { user, logout, openLogin, openRegister, becomeHost, login } = useAuth();
  const { isSearchExpanded, setIsSearchExpanded, setActiveSearchSegment } = useSearch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef(null);

  // Monitor scroll to collapse/expand search bar dynamically
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDemoLogin = async (demo) => {
    try {
      await login({ email: demo.email, password: demo.password });
      setIsMenuOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const showExpandedSearch = !isScrolled || isSearchExpanded;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "#FFFFFF",
        borderBottom: isScrolled ? "1px solid var(--airbnb-border-soft)" : "none",
        transition: "all var(--transition-normal)",
      }}
    >
      <div className="container-airbnb" style={{ paddingTop: 16, paddingBottom: 16 }}>
        {/* Top Header Row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 48 }}>
          {/* Logo */}
          <button
            type="button"
            onClick={() => onNavigate && onNavigate("home")}
            style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}
          >
            {/* Airbnb Belo SVG */}
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
                fontSize: 21,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "var(--airbnb-accent)",
                fontFamily: "var(--font-family-base)",
              }}
            >
              airbnb
            </span>
          </button>

          {/* Stays / Experiences Product Tabs (when expanded on desktop) */}
          {showExpandedSearch ? (
            <div style={{ display: "none" }} className="desktop-tabs-wrapper">
              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <button
                  type="button"
                  onClick={() => onTabChange && onTabChange("stays")}
                  style={{
                    fontSize: 16,
                    fontWeight: currentTab === "stays" ? 600 : 400,
                    color: currentTab === "stays" ? "var(--airbnb-ink)" : "var(--airbnb-muted)",
                    padding: "10px 0",
                    position: "relative",
                  }}
                >
                  Stays
                  {currentTab === "stays" && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                        backgroundColor: "var(--airbnb-ink)",
                        borderRadius: 2,
                      }}
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange && onTabChange("experiences")}
                  style={{
                    fontSize: 16,
                    fontWeight: currentTab === "experiences" ? 600 : 400,
                    color: currentTab === "experiences" ? "var(--airbnb-ink)" : "var(--airbnb-muted)",
                    padding: "10px 0",
                    position: "relative",
                  }}
                >
                  Experiences
                  {currentTab === "experiences" && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                        backgroundColor: "var(--airbnb-ink)",
                        borderRadius: 2,
                      }}
                    />
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Compact Search Pill when scrolled */
            <div style={{ display: "none" }} className="desktop-compact-pill">
              <CompactSearchPill
                onClick={() => {
                  setIsSearchExpanded(true);
                  setActiveSearchSegment("where");
                }}
              />
            </div>
          )}

          {/* Right Navigation & Profile Menu */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  openLogin();
                } else if (user.role === "host" || user.role === "admin") {
                  onNavigate && onNavigate("host");
                } else {
                  becomeHost();
                  onNavigate && onNavigate("host");
                }
              }}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--airbnb-ink)",
                padding: "10px 14px",
                borderRadius: "var(--radius-pill)",
                transition: "background var(--transition-fast)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--airbnb-surface-muted)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {user?.role === "host" || user?.role === "admin" ? "Host dashboard" : "Airbnb your home"}
            </button>

            {/* Language & Currency Globe Trigger */}
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
                transition: "background var(--transition-fast)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--airbnb-surface-muted)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              aria-label="Language and currency"
            >
              <Globe size={18} />
            </button>

            {/* User Profile Pill */}
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
                  transition: "all var(--transition-fast)",
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

              {/* Dropdown Menu */}
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

                      {(user.role === "host" || user.role === "admin") ? (
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
                          onClick={async () => {
                            setIsMenuOpen(false);
                            await becomeHost();
                            onNavigate && onNavigate("host");
                          }}
                          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 16px", fontSize: 14, fontWeight: 500, textAlign: "left" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--airbnb-surface-muted)")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <Shield size={16} />
                          <span>Switch to hosting</span>
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

        {/* Search Bar Row when expanded */}
        {showExpandedSearch && (
          <div style={{ marginTop: 16, paddingBottom: 8 }} className="searchbar-expanded-container">
            <SearchBar onSearchSubmit={() => onNavigate && onNavigate("home")} />
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 744px) {
          .desktop-tabs-wrapper {
            display: block !important;
          }
          .desktop-compact-pill {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
};
