import React from "react";
import { Search, Heart, Plane, User as UserIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const MobileBottomNav = ({ currentView, onNavigate }) => {
  const { user, openLogin } = useAuth();

  const navItems = [
    { id: "home", label: "Explore", icon: Search },
    { id: "favorites", label: "Wishlists", icon: Heart },
    { id: "trips", label: "Trips", icon: Plane },
    { id: "profile", label: user ? "Profile" : "Log in", icon: UserIcon },
  ];

  return (
    <div
      style={{
        display: "flex",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid var(--airbnb-border-soft)",
        padding: "8px 0 12px",
        zIndex: 90,
        justifyContent: "space-around",
        alignItems: "center",
        boxShadow: "var(--shadow-bottom-nav)",
      }}
      className="mobile-bottom-nav"
    >
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = currentView === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (item.id === "profile" && !user) {
                openLogin();
              } else if (item.id === "profile" && user) {
                onNavigate("host");
              } else {
                onNavigate(item.id);
              }
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              color: isActive ? "var(--airbnb-accent)" : "var(--airbnb-muted)",
              minWidth: 64,
            }}
          >
            <IconComponent size={22} strokeWidth={isActive ? 2.4 : 1.8} />
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>
              {item.label}
            </span>
          </button>
        );
      })}

      <style>{`
        @media (min-width: 744px) {
          .mobile-bottom-nav {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
