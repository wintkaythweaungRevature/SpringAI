import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Login from "./Login";
import Signup from "./Signup";

const MEMBER_MESSAGE =
  "This feature requires a member subscription ($5.99/month). Please upgrade to continue.";

/**
 * Gate for member-only features: requires login + verified email + MEMBER subscription.
 */
export default function MemberGate({ children, featureName = "this feature" }) {
  const { user, loading, isSubscribed, emailVerified, checkoutSubscription, logout, authAvailable } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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

  if (!emailVerified) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h3>Please verify your email</h3>
        <p style={{ color: "#666", marginTop: "8px" }}>
          We sent a verification link to {user.email}. Verify your email first, then you can upgrade to access {featureName}.
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

  if (!isSubscribed) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h3>Member subscription required</h3>
        <p style={{ color: "#666", marginTop: "8px" }}>{MEMBER_MESSAGE}</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "20px", flexWrap: "wrap" }}>
          <button
            onClick={async () => {
              setCheckoutLoading(true);
              try {
                await checkoutSubscription();
              } catch (e) {
                alert(e.message || "Checkout failed");
              } finally {
                setCheckoutLoading(false);
              }
            }}
            disabled={checkoutLoading}
            style={{
              padding: "12px 24px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: checkoutLoading ? "not-allowed" : "pointer",
            }}
          >
            {checkoutLoading ? "Redirecting..." : "Upgrade ($5.99/month)"}
          </button>
          <button
            onClick={logout}
            style={{
              padding: "12px 24px",
              backgroundColor: "#6c757d",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </div>
      </div>
    );
  }

  return children;
}
