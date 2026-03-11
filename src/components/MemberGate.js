import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Login from "./Login";
import Signup from "./Signup";

export default function MemberGate({ children, featureName = "this feature" }) {
  const { user, loading, isSubscribed, logout, authAvailable } = useAuth();
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
          <h3 style={{ marginBottom: "8px" }}>Members Only</h3>
          <p style={{ color: "#666", marginBottom: "16px" }}>
            Sign in or register to use {featureName}.
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

  if (!isSubscribed) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h3>Subscription Required</h3>
        <p>Hi {user.name || user.email}, your subscription is inactive.</p>
        <button
          onClick={logout}
          style={{
            marginTop: "12px",
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
