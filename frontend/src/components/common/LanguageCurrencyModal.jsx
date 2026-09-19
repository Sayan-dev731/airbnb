import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { LANGUAGES, CURRENCIES } from "../../data/staticData";

export const LanguageCurrencyModal = ({ isOpen, onClose, selectedLanguage = "en-IN", selectedCurrency = "INR", onSelectLanguage, onSelectCurrency }) => {
  const [activeTab, setActiveTab] = useState("language"); // 'language' | 'currency'

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 780,
          maxWidth: "100%",
          maxHeight: "85vh",
          backgroundColor: "#FFFFFF",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-modal)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "scaleUp 200ms ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid var(--airbnb-border-soft)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{ padding: 4, display: "flex", borderRadius: "var(--radius-circle)" }}
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 16 }}>
            <button
              type="button"
              onClick={() => setActiveTab("language")}
              style={{
                fontSize: 15,
                fontWeight: activeTab === "language" ? 700 : 500,
                color: activeTab === "language" ? "var(--airbnb-ink)" : "var(--airbnb-muted)",
                padding: "8px 0",
                position: "relative",
              }}
            >
              Language and region
              {activeTab === "language" && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    backgroundColor: "var(--airbnb-ink)",
                  }}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("currency")}
              style={{
                fontSize: 15,
                fontWeight: activeTab === "currency" ? 700 : 500,
                color: activeTab === "currency" ? "var(--airbnb-ink)" : "var(--airbnb-muted)",
                padding: "8px 0",
                position: "relative",
              }}
            >
              Currency
              {activeTab === "currency" && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    backgroundColor: "var(--airbnb-ink)",
                  }}
                />
              )}
            </button>
          </div>

          <div style={{ width: 24 }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          {activeTab === "language" ? (
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Suggested languages</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                {LANGUAGES.map((lang) => {
                  const isSel = selectedLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        onSelectLanguage && onSelectLanguage(lang.code);
                        onClose();
                      }}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "var(--radius-md)",
                        border: isSel ? "2px solid var(--airbnb-ink)" : "1px solid transparent",
                        backgroundColor: isSel ? "var(--airbnb-surface-muted)" : "transparent",
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        transition: "all var(--transition-fast)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSel) e.currentTarget.style.backgroundColor = "var(--airbnb-surface-muted)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSel) e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--airbnb-ink)" }}>{lang.name}</div>
                      <div style={{ fontSize: 12, color: "var(--airbnb-muted)" }}>{lang.region}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Choose a currency</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                {CURRENCIES.map((curr) => {
                  const isSel = selectedCurrency === curr.code;
                  return (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => {
                        onSelectCurrency && onSelectCurrency(curr.code);
                        onClose();
                      }}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "var(--radius-md)",
                        border: isSel ? "2px solid var(--airbnb-ink)" : "1px solid transparent",
                        backgroundColor: isSel ? "var(--airbnb-surface-muted)" : "transparent",
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        transition: "all var(--transition-fast)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSel) e.currentTarget.style.backgroundColor = "var(--airbnb-surface-muted)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSel) e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--airbnb-ink)" }}>
                        {curr.name}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--airbnb-muted)" }}>
                        {curr.code} – {curr.symbol}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
