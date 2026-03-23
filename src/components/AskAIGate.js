import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Login from "./Login";
import Signup from "./Signup";
import VerifyEmailBlock from "./VerifyEmailBlock";

/**
 * Gate for Ask AI (free feature): requires login + verified email.
 * No subscription required.
 */
export default function AskAIGate({ children, featureName = "Ask AI" }) {
  const { user, loading, emailVerified, logout, resendVerification, authAvailable } = useAuth();
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
      <VerifyEmailBlock
        email={user.email}
        featureName={featureName}
        onResend={resendVerification}
        onLogout={logout}
      />
    );
  }

  return children;
}
