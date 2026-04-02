import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function Signup({ onSuccess, onSwitchToLogin }) {
  const { signup, resendVerification } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await signup(email, password, firstName, lastName);
      if (!data.token && data.emailVerified === false) {
        setVerifyEmail(data.email || email);
        setShowVerifyEmail(true);
      } else {
        setSuccess(true);
        onSuccess?.();
      }
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    try {
      await resendVerification(verifyEmail || email);
      setResendSent(true);
      setTimeout(() => setResendSent(false), 5000);
    } catch (err) {
      setError(err.message || "Resend failed");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-form-wrap">
      <div className="auth-form-card">
        <div className="auth-form-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>
        <h2 className="auth-form-title">Create an account</h2>
        <p className="auth-form-sub">Free to start — no credit card required</p>

        {showVerifyEmail ? (
          <div className="auth-success-box">
            <strong>Check your email</strong>
            <p>We sent a verification link to <strong>{verifyEmail || email}</strong>. Click the link to verify your account.</p>
            {error && <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>}
            <button type="button" onClick={handleResend} disabled={resendLoading} className="auth-btn auth-btn-primary" style={{ marginBottom: 10 }}>
              {resendLoading ? "Sending..." : resendSent ? "Sent! Check your inbox" : "Resend verification email"}
            </button>
            <button type="button" onClick={onSwitchToLogin} className="auth-btn auth-btn-outline" style={{ display: "block", width: "100%" }}>
              Go to Sign In
            </button>
          </div>
        ) : success ? (
          <div className="auth-success-box">
            <strong>Account created!</strong>
            <p>You can now sign in and start using Ask AI and other free features.</p>
            <button type="button" onClick={onSwitchToLogin} className="auth-btn auth-btn-primary">
              Go to Sign In
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label className="auth-label">First name</label>
                <input
                  type="text"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="auth-input"
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Last name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="auth-input"
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  minLength={6}
                  required
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

              <p className="auth-legal">
                By creating an account, you agree to our{" "}
                <a href="/terms-of-service" target="_blank" rel="noopener noreferrer">Terms of Service</a>
                {" "}and{" "}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
              </p>

              <button type="submit" disabled={loading} className="auth-btn auth-btn-primary">
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="auth-footer">
              Already have an account?{" "}
              <button type="button" onClick={onSwitchToLogin} className="auth-switch-btn">
                Sign in
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
