import React, { useState } from "react";
import { Globe } from "lucide-react";
import { INSPIRATION_TABS } from "../../data/staticData";
import { useSearch } from "../../context/SearchContext";

export const Footer = ({ onOpenLanguageModal }) => {
  const [activeTab, setActiveTab] = useState("popular");
  const { setDestination, resetAllSearch } = useSearch();

  const currentTabData = INSPIRATION_TABS.find((t) => t.id === activeTab) || INSPIRATION_TABS[0];

  return (
    <footer
      style={{
        backgroundColor: "var(--airbnb-bg)",
        borderTop: "1px solid var(--airbnb-border-soft)",
        paddingTop: 48,
        paddingBottom: 48,
        marginTop: 64,
      }}
    >
      <div className="container-airbnb">
        {/* Inspiration Section */}
        <div style={{ paddingBottom: 40, borderBottom: "1px solid var(--airbnb-border)" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
            Inspiration for future getaways
          </h2>

          {/* Inspiration Tabs */}
          <div
            style={{
              display: "flex",
              gap: 24,
              borderBottom: "1px solid var(--airbnb-border)",
              marginBottom: 28,
              overflowX: "auto",
            }}
            className="no-scrollbar"
          >
            {INSPIRATION_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: "10px 0 14px 0",
                    fontSize: 14,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "var(--airbnb-ink)" : "var(--airbnb-muted)",
                    borderBottom: `2px solid ${isActive ? "var(--airbnb-ink)" : "transparent"}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Inspiration Links Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
              gap: "24px 16px",
            }}
          >
            {currentTabData.items.map((item, idx) => (
              <button
                key={`${item.name}-${idx}`}
                type="button"
                onClick={() => {
                  setDestination(item.query);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 2 }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--airbnb-ink)" }}>
                  {item.name}
                </div>
                <div style={{ fontSize: 13, color: "var(--airbnb-muted)" }}>
                  {item.type}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column Info Directory */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 32,
            padding: "40px 0",
            borderBottom: "1px solid var(--airbnb-border)",
          }}
        >
          {/* Support Column */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Support</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14, color: "var(--airbnb-ink)" }}>
              <a href="#support" style={{ color: "inherit" }}>Help Centre</a>
              <a href="#aircover" style={{ color: "inherit" }}>AirCover</a>
              <a href="#anti-discrimination" style={{ color: "inherit" }}>Anti-discrimination</a>
              <a href="#disability" style={{ color: "inherit" }}>Disability support</a>
              <a href="#cancellation" style={{ color: "inherit" }}>Cancellation options</a>
              <a href="#report" style={{ color: "inherit" }}>Report neighbourhood concern</a>
            </div>
          </div>

          {/* Hosting Column */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Hosting</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14, color: "var(--airbnb-ink)" }}>
              <a href="#host" style={{ color: "inherit" }}>Airbnb your home</a>
              <a href="#aircover-host" style={{ color: "inherit" }}>AirCover for Hosts</a>
              <a href="#resources" style={{ color: "inherit" }}>Hosting resources</a>
              <a href="#forum" style={{ color: "inherit" }}>Community forum</a>
              <a href="#responsible" style={{ color: "inherit" }}>Hosting responsibly</a>
              <a href="#apartments" style={{ color: "inherit" }}>Airbnb-friendly apartments</a>
            </div>
          </div>

          {/* Airbnb Column */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Airbnb</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14, color: "var(--airbnb-ink)" }}>
              <a href="#newsroom" style={{ color: "inherit" }}>Newsroom</a>
              <a href="#features" style={{ color: "inherit" }}>New features</a>
              <a href="#careers" style={{ color: "inherit" }}>Careers</a>
              <a href="#investors" style={{ color: "inherit" }}>Investors</a>
              <a href="#giftcards" style={{ color: "inherit" }}>Gift cards</a>
              <a href="#emergency" style={{ color: "inherit" }}>Airbnb.org emergency stays</a>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Locale Bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            paddingTop: 24,
            fontSize: 14,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, color: "var(--airbnb-ink)" }}>
            <span>© 2026 Airbnb, Inc.</span>
            <span>·</span>
            <a href="#privacy">Privacy</a>
            <span>·</span>
            <a href="#terms">Terms</a>
            <span>·</span>
            <a href="#sitemap">Sitemap</a>
            <span>·</span>
            <a href="#company">Company details</a>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <button
              type="button"
              onClick={onOpenLanguageModal}
              style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}
            >
              <Globe size={16} />
              <span>English (IN)</span>
            </button>

            <button
              type="button"
              onClick={onOpenLanguageModal}
              style={{ fontWeight: 600 }}
            >
              <span>₹ INR</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
