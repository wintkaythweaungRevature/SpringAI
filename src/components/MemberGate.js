import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Login from "./Login";
import Signup from "./Signup";

/**
 * Wraps AI content. If user is not logged in or not subscribed,
 * shows login/signup prompt instead.
 */
export default function MemberGate({ children, featureName = "this feature" }) {
  const { user, loading, isSubscribed, logout, authAvailable } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  // Backend auth not deployed - allow access
  if (authAvailable === false) return children;

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.banner}>
          <h3>👑 Members Only</h3>
          <p>Sign in or create an account to use {featureName}.</p>
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
      <div style={styles.container}>
        <div style={styles.banner}>
          <h3>📋 Subscription Required</h3>
          <p>
            Hi {user.name || user.email}, your subscription is inactive. Please
            contact support to activate your membership.
          </p>
          <button onClick={logout} style={styles.logoutBtn}>
            Log out
          </button>
        </div>
      </div>
    );
  }

  return children;
}

const styles = {
  container: {
    padding: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    minHeight: "200px",
  },
  banner: {
    backgroundColor: "#fff9e6",
    border: "1px solid #ffc107",
    borderRadius: "12px",
    padding: "24px",
    maxWidth: "420px",
  },
  loading: { textAlign: "center", color: "#666" },
  logoutBtn: {
    marginTop: "12px",
    padding: "8px 16px",
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
