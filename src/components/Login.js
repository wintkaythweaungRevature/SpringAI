import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function Login({ onSuccess, onSwitchToSignup, onForgotPassword }) {
  const { login, reactivateAccount } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReactivate, setShowReactivate] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowReactivate(false);
    setLoading(true);
    try {
      await login(identifier, password);
      onSuccess?.();
    } catch (err) {
      const msg = err.message || "Login failed";
      setError(msg);
      if (msg.toLowerCase().includes("deactivated")) setShowReactivate(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    setError("");
    setLoading(true);
    try {
      await reactivateAccount(identifier, password);
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Reactivation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-wrap">
      <div className="auth-form-card">
        <div className="auth-form-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h2 className="auth-form-title">Welcome back</h2>
        <p className="auth-form-sub">Sign in to your Wintaibot account</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Email or Username</label>
            <input
              type="text"
              placeholder="Email or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="auth-input"
              required
              autoComplete="username"
            />
          </div>
          <div className="auth-field">
            <div className="auth-label-row">
              <label className="auth-label">Password</label>
              <button
                type="button"
                onClick={() => onForgotPassword?.("password")}
                className="auth-forgot-link"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="button"
            onClick={() => onForgotPassword?.("username")}
            className="auth-forgot-username-link"
          >
            Forgot your username?
          </button>

          {error && (
            <div className="auth-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {showReactivate && (
            <div className="auth-reactivate-box">
              <p>Your account was deactivated. Would you like to reactivate it?</p>
              <button type="button" onClick={handleReactivate} disabled={loading} className="auth-btn auth-btn-success">
                {loading ? "Reactivating..." : "Reactivate Account"}
              </button>
            </div>
          )}

          <button type="submit" disabled={loading} className="auth-btn auth-btn-primary">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <button type="button" onClick={onSwitchToSignup} className="auth-switch-btn">
            Sign up free
          </button>
        </p>
      </div>
    </div>
  );
}
