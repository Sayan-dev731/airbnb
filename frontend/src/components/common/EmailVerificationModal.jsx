import React, { useState } from "react";
import { ShieldCheck, Mail, ArrowRight, RefreshCw, LogOut } from "lucide-react";
import { authAPI } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export const EmailVerificationModal = () => {
  const { user, setUser, setToken, logout } = useAuth();
  const { addToast } = useToast();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Only show if user exists and is NOT email verified
  if (!user || user.isEmailVerified) return null;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setErrorMsg("Please enter the 6-digit verification code");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const res = await authAPI.verifyEmail({
        email: user.email,
        otp: otp.trim(),
      });

      if (res.data?.user) {
        setUser(res.data.user);
        if (res.data.accessToken) {
          setToken(res.data.accessToken);
          localStorage.setItem("airbnb_token", res.data.accessToken);
        }
        localStorage.setItem("airbnb_user", JSON.stringify(res.data.user));
      } else {
        const updated = { ...user, isEmailVerified: true };
        setUser(updated);
        localStorage.setItem("airbnb_user", JSON.stringify(updated));
      }

      addToast("Email verified successfully! Welcome to Airbnb.", "success");
    } catch (err) {
      setErrorMsg(err.message || "Invalid or expired verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setErrorMsg("");
    try {
      await authAPI.resendVerificationEmail({ email: user.email });
      addToast("A fresh verification code has been sent to your email.", "success");
    } catch (err) {
      addToast(err.message || "Failed to resend code", "error");
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: 500,
          maxWidth: "100%",
          backgroundColor: "#FFFFFF",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-modal)",
          padding: "36px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          animation: "scaleUp 200ms ease-out",
        }}
      >
        {/* Shield Icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "var(--radius-circle)",
            backgroundColor: "var(--airbnb-accent-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Mail size={32} color="var(--airbnb-accent)" />
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--airbnb-ink)", marginBottom: 8 }}>
          Verify your email address
        </h2>
        <p style={{ fontSize: 14, color: "var(--airbnb-muted)", marginBottom: 20, lineHeight: 1.5 }}>
          To keep your Airbnb account secure, please verify your email address. We sent a verification code to{" "}
          <strong style={{ color: "var(--airbnb-ink)" }}>{user.email}</strong>.
        </p>

        {errorMsg && (
          <div
            style={{
              width: "100%",
              backgroundColor: "var(--airbnb-error-bg)",
              color: "var(--airbnb-error)",
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 16,
              textAlign: "left",
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleVerify} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ border: "1px solid var(--airbnb-border-dark)", borderRadius: "var(--radius-md)", padding: "12px 16px", textAlign: "left" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--airbnb-muted)", textTransform: "uppercase" }}>
              6-Digit Verification Code (OTP)
            </div>
            <input
              type="text"
              required
              maxLength={10}
              placeholder="e.g. 123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{
                width: "100%",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "0.2em",
                marginTop: 4,
                textAlign: "center",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
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
            {loading ? "Verifying..." : "Verify and continue"}
          </button>
        </form>

        {/* Resend & Log out */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--airbnb-border-soft)", fontSize: 13 }}>
          <button
            type="button"
            disabled={resending}
            onClick={handleResend}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 600,
              color: "var(--airbnb-ink)",
              textDecoration: "underline",
            }}
          >
            <RefreshCw size={14} className={resending ? "animate-spin" : ""} />
            <span>Resend code</span>
          </button>

          <button
            type="button"
            onClick={logout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 600,
              color: "var(--airbnb-error)",
            }}
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
