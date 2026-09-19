import React from "react";
import { Award, ShieldCheck, Clock, MessageSquare, ShieldAlert } from "lucide-react";
import { useToast } from "../../context/ToastContext";

export const PDPHostSection = ({ host }) => {
  const { addToast } = useToast();

  const hostData = host || {
    name: "Aarav Sharma",
    bio: "Passionate designer and Airbnb Superhost. I love creating cozy spaces and ensuring every guest enjoys a seamless and memorable stay.",
    isSuperHost: true,
    isHostVerified: true,
    hostingSince: "2021-04-15",
    avatar: {
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    },
  };

  const handleContactHost = () => {
    addToast(`Messaging host ${hostData.name}... (Feature enabled)`, "info");
  };

  return (
    <div style={{ paddingTop: 32, paddingBottom: 32 }}>
      {/* Host Profile Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        {hostData.avatar?.url && (
          <img
            src={hostData.avatar.url}
            alt={hostData.name}
            style={{
              width: 64,
              height: 64,
              borderRadius: "var(--radius-circle)",
              objectFit: "cover",
            }}
          />
        )}
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--airbnb-ink)" }}>
            Hosted by {hostData.name}
          </h3>
          <div style={{ fontSize: 14, color: "var(--airbnb-muted)", marginTop: 2 }}>
            Joined in {new Date(hostData.hostingSince || Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </div>
        </div>
      </div>

      {/* Host Attributes */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginBottom: 24 }}>
        {hostData.isSuperHost && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <Award size={18} color="var(--airbnb-accent)" />
            <span>Superhost</span>
          </div>
        )}

        {hostData.isHostVerified && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <ShieldCheck size={18} color="var(--airbnb-success)" />
            <span>Identity verified</span>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
          <Clock size={18} color="var(--airbnb-muted)" />
          <span>Response rate: 100% (within an hour)</span>
        </div>
      </div>

      {/* Host Bio */}
      {hostData.bio && (
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--airbnb-ink)", maxWidth: 680, marginBottom: 24 }}>
          {hostData.bio}
        </p>
      )}

      {/* Contact Host CTA */}
      <div style={{ marginBottom: 32 }}>
        <button
          type="button"
          onClick={handleContactHost}
          style={{
            padding: "12px 24px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--airbnb-ink)",
            fontSize: 15,
            fontWeight: 600,
            backgroundColor: "#FFFFFF",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <MessageSquare size={16} />
          <span>Contact Host</span>
        </button>
      </div>

      {/* Payment Security Note */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 20px",
          backgroundColor: "var(--airbnb-bg)",
          borderRadius: "var(--radius-md)",
          maxWidth: 680,
        }}
      >
        <ShieldAlert size={22} color="var(--airbnb-accent)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: 12, color: "var(--airbnb-muted-dark)", lineHeight: 1.4 }}>
          To protect your payment, never transfer money or communicate outside of the Airbnb website or app.
        </div>
      </div>
    </div>
  );
};
