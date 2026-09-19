import React, { useState } from "react";
import {
  Laptop,
  Key,
  CalendarCheck,
  ShieldAlert,
  Bed,
  Sparkles,
  ChevronRight,
  Wifi,
  Wind,
  Utensils,
  Car,
  Waves,
  Tv,
} from "lucide-react";
import { PDPAmenitiesModal } from "./PDPAmenitiesModal";

export const PDPOverview = ({ listing }) => {
  const [isAmenitiesModalOpen, setIsAmenitiesModalOpen] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  if (!listing) return null;

  const host = listing.host || {
    name: "Aarav Sharma",
    isSuperHost: true,
    avatar: { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
  };

  const capacity = listing.capacity || { guests: 4, bedrooms: 2, beds: 2, bathrooms: 2 };
  const amenities = listing.amenities || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Property Type & Host Overview */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 24,
          borderBottom: "1px solid var(--airbnb-border-soft)",
        }}
      >
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--airbnb-ink)", marginBottom: 4 }}>
            {listing.propertyType} hosted by {host.name}
          </h2>
          <div style={{ fontSize: 15, color: "var(--airbnb-muted)" }}>
            {capacity.guests} guests · {capacity.bedrooms} bedroom{capacity.bedrooms !== 1 ? "s" : ""} · {capacity.beds} bed{capacity.beds !== 1 ? "s" : ""} · {capacity.bathrooms} bathroom{capacity.bathrooms !== 1 ? "s" : ""}
          </div>
        </div>

        {host.avatar?.url && (
          <img
            src={host.avatar.url}
            alt={host.name}
            style={{
              width: 56,
              height: 56,
              borderRadius: "var(--radius-circle)",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        )}
      </div>

      {/* Highlights Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 24, borderBottom: "1px solid var(--airbnb-border-soft)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <Laptop size={24} color="var(--airbnb-ink)" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--airbnb-ink)" }}>Dedicated workspace</div>
            <div style={{ fontSize: 14, color: "var(--airbnb-muted)" }}>A room with wifi that’s well-suited for working.</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <Key size={24} color="var(--airbnb-ink)" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--airbnb-ink)" }}>Self check-in</div>
            <div style={{ fontSize: 14, color: "var(--airbnb-muted)" }}>Check yourself in with the smartlock or keypad.</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <CalendarCheck size={24} color="var(--airbnb-ink)" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--airbnb-ink)" }}>Free cancellation for 48 hours</div>
            <div style={{ fontSize: 14, color: "var(--airbnb-muted)" }}>Get a full refund if you change your mind before check-in.</div>
          </div>
        </div>
      </div>

      {/* AirCover Guarantee Banner */}
      <div style={{ paddingBottom: 24, borderBottom: "1px solid var(--airbnb-border-soft)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: "var(--airbnb-accent)" }}>air</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: "var(--airbnb-ink)" }}>cover</span>
        </div>
        <p style={{ fontSize: 14, color: "var(--airbnb-muted-dark)", lineHeight: 1.5, marginBottom: 12 }}>
          Every booking includes free protection from Host cancellations, listing inaccuracies, and other issues like trouble checking in.
        </p>
        <button
          type="button"
          style={{ fontSize: 14, fontWeight: 700, textDecoration: "underline", color: "var(--airbnb-ink)" }}
        >
          Learn more
        </button>
      </div>

      {/* Description Section */}
      <div style={{ paddingBottom: 24, borderBottom: "1px solid var(--airbnb-border-soft)" }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>About this space</h3>
        <p
          style={{
            fontSize: 15,
            color: "var(--airbnb-ink)",
            lineHeight: 1.6,
            whiteSpace: "pre-line",
            maxHeight: isDescExpanded ? "none" : 120,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {listing.description}
        </p>

        {listing.description?.length > 250 && (
          <button
            type="button"
            onClick={() => setIsDescExpanded(!isDescExpanded)}
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "underline",
            }}
          >
            <span>{isDescExpanded ? "Show less" : "Show more"}</span>
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Sleeping Arrangements */}
      <div style={{ paddingBottom: 24, borderBottom: "1px solid var(--airbnb-border-soft)" }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Where you'll sleep</h3>
        <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 6 }} className="no-scrollbar">
          {Array.from({ length: capacity.bedrooms || 1 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                minWidth: 190,
                border: "1px solid var(--airbnb-border)",
                borderRadius: "var(--radius-md)",
                padding: "20px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <Bed size={24} color="var(--airbnb-ink)" />
              <div style={{ fontSize: 15, fontWeight: 600 }}>Bedroom {idx + 1}</div>
              <div style={{ fontSize: 13, color: "var(--airbnb-muted)" }}>
                {idx === 0 ? "1 queen bed" : "1 double bed"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Amenities Preview */}
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>What this place offers</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 24 }}>
          {amenities.slice(0, 8).map((item, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15 }}>
              <Sparkles size={18} color="var(--airbnb-ink)" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {amenities.length > 0 && (
          <button
            type="button"
            onClick={() => setIsAmenitiesModalOpen(true)}
            style={{
              padding: "12px 22px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--airbnb-ink)",
              fontSize: 15,
              fontWeight: 600,
              backgroundColor: "#FFFFFF",
            }}
          >
            Show all {amenities.length} amenities
          </button>
        )}
      </div>

      {/* Amenities Modal */}
      <PDPAmenitiesModal
        amenities={amenities}
        isOpen={isAmenitiesModalOpen}
        onClose={() => setIsAmenitiesModalOpen(false)}
      />
    </div>
  );
};
