import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Login from "./Login";
import Signup from "./Signup";

/**
 * Gate for Ask AI (free feature): requires login + verified email.
 * No subscription required.
 */
export default function AskAIGate({ children, featureName = "Ask AI" }) {
  const { user, loading, emailVerified, logout, authAvailable } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (authAvailable === false) return children;
  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: "20px", display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: "420px" }}>
          <h3 style={{ marginBottom: "8px" }}>Sign in to use {featureName}</h3>
          <p style={{ color: "#666", marginBottom: "16px" }}>
            Create an account or log in to use {featureName}. It's free!
          </p>
          {showLogin ? (
            <Login onSwitchToSignup={() => setShowLogin(false)} />
          ) : (
            <Signup onSwitchToLogin={() => setShowLogin(true)} />
          )}
        </div>
      </div>
    );
  }

  if (!emailVerified) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h3>Please verify your email</h3>
        <p style={{ color: "#666", marginTop: "8px" }}>
          We sent a verification link to {user.email}. Click the link in that email to verify your account and use {featureName}.
        </p>
        <button
          onClick={logout}
          style={{
            marginTop: "16px",
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
    );
  }

  return children;
}
