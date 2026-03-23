import React, { useState } from "react";

/**
 * Shown when user is logged in but email is not verified.
 * Offers Resend verification email + Log out.
 */
export default function VerifyEmailBlock({ email, featureName, onResend, onLogout }) {
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [error, setError] = useState("");

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    try {
      await onResend(email);
      setResendSent(true);
      setTimeout(() => setResendSent(false), 5000);
    } catch (e) {
      setError(e.message || "Failed to send. Try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h3>Please verify your email</h3>
      <p style={{ color: "#666", marginTop: "8px" }}>
        We sent a verification link to {email}. Verify your email first
        {featureName ? `, then you can access ${featureName}.` : "."}
      </p>
      {error && <p style={{ color: "#dc2626", marginTop: "8px", fontSize: "14px" }}>{error}</p>}
      <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "16px", flexWrap: "wrap" }}>
        <button
          onClick={handleResend}
          disabled={resendLoading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: resendLoading ? "not-allowed" : "pointer",
          }}
        >
          {resendLoading ? "Sending..." : resendSent ? "Sent! Check your inbox" : "Resend verification email"}
        </button>
        <button
          onClick={onLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}
