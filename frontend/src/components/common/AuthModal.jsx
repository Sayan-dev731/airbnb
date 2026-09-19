import React, { useState } from "react";
import { X, Lock, Mail, User, Phone, Upload, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { DEMO_ACCOUNTS } from "../../data/staticData";

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    register,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("user");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (authModalMode === "login") {
        await login({ email, password });
      } else {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("role", role);
        if (phone) formData.append("phone", phone);
        if (avatarFile) formData.append("avatar", avatarFile);

        await register(formData);
      }
    } catch (err) {
      setErrorMsg(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (demo) => {
    setErrorMsg("");
    setLoading(true);
    try {
      await login({ email: demo.email, password: demo.password });
    } catch (err) {
      setErrorMsg(err.message || "Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsAuthModalOpen(false)}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 540,
          maxWidth: "100%",
          maxHeight: "90vh",
          backgroundColor: "#FFFFFF",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-modal)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "scaleUp 200ms ease-out",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid var(--airbnb-border-soft)",
          }}
        >
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            style={{ padding: 4, display: "flex", borderRadius: "var(--radius-circle)" }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {authModalMode === "login" ? "Log in" : "Sign up"}
          </div>
          <div style={{ width: 24 }} />
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            {authModalMode === "login" ? "Welcome back to Airbnb" : "Create your Airbnb account"}
          </h2>
          <p style={{ fontSize: 14, color: "var(--airbnb-muted)", marginBottom: 24 }}>
            {authModalMode === "login"
              ? "Sign in to manage your bookings, wishlist and listings."
              : "Discover extraordinary places to stay with hosts around the world."}
          </p>

          {errorMsg && (
            <div
              style={{
                backgroundColor: "var(--airbnb-error-bg)",
                color: "var(--airbnb-error)",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 16,
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {authModalMode === "register" && (
              <>
                <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Full Name</div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sayan Dev"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: "100%", fontSize: 14, marginTop: 2, fontWeight: 500 }}
                  />
                </div>

                <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Phone Number (Optional)</div>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: "100%", fontSize: 14, marginTop: 2, fontWeight: 500 }}
                  />
                </div>

                <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Account Type</div>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ width: "100%", fontSize: 14, marginTop: 2, fontWeight: 500, cursor: "pointer" }}
                  >
                    <option value="user">Guest (Explore and book stays)</option>
                    <option value="host">Host (List and rent out your property)</option>
                  </select>
                </div>
              </>
            )}

            <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
              <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Email</div>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", fontSize: 14, marginTop: 2, fontWeight: 500 }}
              />
            </div>

            <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
              <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Password</div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", fontSize: 14, marginTop: 2, fontWeight: 500 }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8,
                backgroundColor: "var(--airbnb-accent)",
                backgroundImage: "var(--airbnb-accent-gradient)",
                color: "#FFFFFF",
                padding: "14px",
                borderRadius: "var(--radius-sm)",
                fontSize: 16,
                fontWeight: 700,
                cursor: loading ? "wait" : "pointer",
                boxShadow: "0 2px 6px rgba(224, 11, 65, 0.4)",
              }}
            >
              {loading ? "Please wait..." : authModalMode === "login" ? "Continue" : "Agree and Sign up"}
            </button>
          </form>

          {/* Toggle between login and register */}
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 14 }}>
            {authModalMode === "login" ? (
              <span>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setAuthModalMode("register");
                  }}
                  style={{ fontWeight: 700, textDecoration: "underline" }}
                >
                  Sign up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setAuthModalMode("login");
                  }}
                  style={{ fontWeight: 700, textDecoration: "underline" }}
                >
                  Log in
                </button>
              </span>
            )}
          </div>

          {/* 1-Click Quick Demo Switcher Section */}
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--airbnb-border-soft)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--airbnb-ink)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <ShieldCheck size={16} color="var(--airbnb-accent)" />
              <span>Instant One-Click Demo Logins</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {DEMO_ACCOUNTS.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoClick(demo)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--airbnb-border)",
                    backgroundColor: "var(--airbnb-canvas)",
                    transition: "all var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--airbnb-surface-muted)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--airbnb-canvas)")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img
                      src={demo.avatar}
                      alt={demo.name}
                      style={{ width: 36, height: 36, borderRadius: "var(--radius-circle)", objectFit: "cover" }}
                    />
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--airbnb-ink)" }}>
                        {demo.role} ({demo.name.split(" ")[0]})
                      </div>
                      <div style={{ fontSize: 12, color: "var(--airbnb-muted)" }}>{demo.badge}</div>
                    </div>
                  </div>
                  <ArrowRight size={16} color="var(--airbnb-muted)" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
