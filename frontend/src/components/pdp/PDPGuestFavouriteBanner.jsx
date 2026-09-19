import React from "react";

export const PDPGuestFavouriteBanner = ({ rating = 5.0 }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        borderBottom: "1px solid var(--airbnb-border-soft)",
      }}
    >
      {/* Laurel Graphic + Big 5.0 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
        {/* Left Laurel Wreath SVG */}
        <svg width="48" height="64" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M42 4C35 12 25 24 24 38C23 48 27 56 34 62" stroke="#E3B23C" strokeWidth="4" strokeLinecap="round" />
          <path d="M38 12C28 10 18 16 16 26" stroke="#E3B23C" strokeWidth="4" strokeLinecap="round" />
          <path d="M32 24C22 24 14 32 14 42" stroke="#E3B23C" strokeWidth="4" strokeLinecap="round" />
          <path d="M28 38C18 42 12 50 14 60" stroke="#E3B23C" strokeWidth="4" strokeLinecap="round" />
        </svg>

        <span
          style={{
            fontSize: 76,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "var(--airbnb-ink)",
            lineHeight: 1,
            fontFamily: "var(--font-family-base)",
          }}
        >
          {Number(rating).toFixed(1)}
        </span>

        {/* Right Laurel Wreath SVG */}
        <svg width="48" height="64" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 4C13 12 23 24 24 38C25 48 21 56 14 62" stroke="#E3B23C" strokeWidth="4" strokeLinecap="round" />
          <path d="M10 12C20 10 30 16 32 26" stroke="#E3B23C" strokeWidth="4" strokeLinecap="round" />
          <path d="M16 24C26 24 34 32 34 42" stroke="#E3B23C" strokeWidth="4" strokeLinecap="round" />
          <path d="M20 38C30 42 36 50 34 60" stroke="#E3B23C" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>

      <div style={{ fontSize: 22, fontWeight: 700, color: "var(--airbnb-ink)", marginTop: 12 }}>
        Guest favourite
      </div>
      <p style={{ fontSize: 16, color: "var(--airbnb-muted)", maxWidth: 420, marginTop: 6, lineHeight: 1.4 }}>
        One of the most loved homes on Airbnb based on ratings, reviews, and reliability
      </p>
    </div>
  );
};
