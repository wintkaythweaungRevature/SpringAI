import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function ForgotPassword({ mode = "password", onBack }) {
  const { forgotPassword, forgotUsername } = useAuth();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isPassword = mode === "password";
  const title = isPassword ? "Reset your password" : "Recover your username";
  const subtitle = isPassword
    ? "Enter your email and we'll send you a reset link."
    : "Enter your email and we'll send you your username.";
  const successMsg = isPassword
    ? "If that email is registered, a password reset link has been sent. Check your inbox."
    : "If that email is registered, your username has been sent to it. Check your inbox.";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isPassword) {
        await forgotPassword(email.trim());
      } else {
        await forgotUsername(email.trim());
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-wrap">
      <div className="auth-form-card">
        <div className="auth-form-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {isPassword
              ? <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>
              : <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>
            }
          </svg>
        </div>
        <h2 className="auth-form-title">{title}</h2>
        <p className="auth-form-sub">{subtitle}</p>

        {submitted ? (
          <div className="auth-success-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            {successMsg}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="auth-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="auth-btn auth-btn-primary">
              {loading ? "Sending..." : isPassword ? "Send reset link" : "Send my username"}
            </button>
          </form>
        )}

        <p className="auth-footer">
          <button type="button" onClick={onBack} className="auth-switch-btn">
            ← Back to sign in
          </button>
        </p>
      </div>
    </div>
  );
}
