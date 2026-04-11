import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function ForgotPassword({ onBack }) {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const title = "Reset your password";
  const subtitle = "Enter your email and we'll send you a link to set a new password.";
  const successMsg =
    "If that email is registered, we sent a message with a link to set a new password. Open the link (on this site), choose a password, then sign in. The link expires in about one hour.";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-wrap auth-recovery">
      <div className="auth-form-card auth-recovery__card">
        <p className="auth-recovery__eyebrow">Account recovery</p>
        <div className="auth-form-icon auth-recovery__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 className="auth-form-title auth-recovery__title">{title}</h2>
        <p className="auth-form-sub auth-recovery__sub">{subtitle}</p>

        {submitted ? (
          <div className="auth-recovery-success" role="status" aria-live="polite">
            <div className="auth-recovery-success__icon" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className="auth-recovery-success__text">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form auth-recovery__form">
            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-recovery-email">Email address</label>
              <input
                id="auth-recovery-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input auth-recovery__input"
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            {error && (
              <div className="auth-error auth-recovery__error" role="alert">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="auth-btn auth-btn-primary auth-recovery__submit">
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <div className="auth-footer auth-recovery__footer">
          <button type="button" onClick={onBack} className="auth-recovery-back">
            <span className="auth-recovery-back__arrow" aria-hidden>←</span>
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
}
