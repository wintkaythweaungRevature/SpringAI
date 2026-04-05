import React, { useEffect, useState } from "react";
import { FaGift } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import Login from "./Login";
import Signup from "./Signup";
import VerifyEmailBlock from "./VerifyEmailBlock";
import "./MemberGate.css";

const BENEFITS = [
  "Unlimited AI content, captions & hashtags",
  "Deep analytics, trends & SEO-style insights",
  "Priority support when you need it most",
];

const MINI_PLANS = [
  { name: "Starter", monthly: 19, note: "Includes 7-day trial (if eligible)" },
  { name: "Pro", monthly: 39, note: "Most popular" },
  { name: "Growth", monthly: 79, note: "Best value" },
];

const UPGRADE_PLANS = [
  {
    name: "Pro",
    price: "$39",
    badge: "⭐ Most Popular",
    gradient: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    features: [
      "All 8 social platforms",
      "Unlimited videos & images",
      "Deep Analytics & Trends",
      "Social AI Chat",
      "Messages & Auto Reply",
      "Growth Planner & EchoScribe",
    ],
    cta: "Get Pro",
  },
  {
    name: "Growth",
    price: "$79",
    badge: "🚀 Best Value",
    gradient: "linear-gradient(135deg,#d97706,#b45309)",
    features: [
      "Everything in Pro",
      "Unlimited AI-generated images",
      "Priority processing",
      "Video trimming tool",
      "Priority support",
      "Early access to new features",
    ],
    cta: "Get Growth",
  },
];

/**
 * Gate for member-only features: requires login + verified email + paid subscription.
 */
export default function MemberGate({ children, featureName = "this feature" }) {
  const {
    user,
    loading,
    isSubscribed,
    emailVerified,
    logout,
    resendVerification,
    authAvailable,
    checkoutSubscription,
    token,
    apiBase,
  } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [starterTrialEligible, setStarterTrialEligible] = useState(null);

  useEffect(() => {
    if (!token || !user || !apiBase) return;
    fetch(`${apiBase}/api/subscription/current`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (typeof d?.starterTrialEligible === "boolean") {
          setStarterTrialEligible(d.starterTrialEligible);
        }
      })
      .catch(() => {});
  }, [token, user, apiBase]);

  const showStarterTrialCopy = starterTrialEligible !== false;

  const checkoutMemberLegacy = async () => {
    const res = await fetch(`${apiBase}/api/subscription/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plan: "MEMBER" }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Checkout failed");
    const url = data.url || data.checkoutUrl;
    if (url) window.location.href = url;
    else throw new Error("No checkout URL returned");
  };

  const runCheckout = async (fn) => {
    setCheckoutLoading(true);
    try {
      await fn();
    } catch (e) {
      alert(e?.message || "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else if (typeof window !== "undefined") {
      window.location.assign("/");
    }
  };

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
      <VerifyEmailBlock
        email={user.email}
        featureName={featureName}
        onResend={resendVerification}
        onLogout={logout}
      />
    );
  }

  if (!isSubscribed) {
    return (
      <div style={{
        minHeight: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(180deg,#0c1222 0%,#0f172a 60%,#0c1222 100%)',
        padding: '40px 20px',
      }}>
        {/* Icon + title */}
        <div style={{
          width: 56, height: 56, borderRadius: 16, marginBottom: 16,
          background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.2))',
          border: '1px solid rgba(99,102,241,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fcd34d', fontSize: 26,
        }}>
          <FaGift />
        </div>

        <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 800, margin: '0 0 8px', textAlign: 'center' }}>
          Unlock <span style={{ color: '#818cf8' }}>{featureName}</span>
        </h2>
        <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 10px', textAlign: 'center', maxWidth: 400, lineHeight: 1.6 }}>
          Join premium members to unlock advanced AI tools, analytics, and your full growth stack.
        </p>

        {showStarterTrialCopy && (
          <div style={{
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 8, padding: '8px 16px', marginBottom: 20, fontSize: 13,
            color: '#10b981', fontWeight: 600,
          }}>
            🎁 7-day free trial available — no charge today
          </div>
        )}

        {/* Pro + Growth plan cards */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: 620, marginBottom: 20 }}>
          {UPGRADE_PLANS.map((p) => (
            <div key={p.name} style={{
              flex: '1 1 260px', maxWidth: 290,
              background: '#111827', borderRadius: 18,
              border: '1px solid #1e293b', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ background: p.gradient, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{p.name}</span>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                    background: 'rgba(255,255,255,0.2)', color: '#fff',
                  }}>{p.badge}</span>
                </div>
                <div style={{ color: '#fff' }}>
                  <span style={{ fontSize: 30, fontWeight: 800 }}>{p.price}</span>
                  <span style={{ fontSize: 13, opacity: 0.8 }}>/mo</span>
                </div>
              </div>
              <div style={{ padding: '16px 20px', flex: 1 }}>
                {p.features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                    <span style={{ color: '#10b981', fontSize: 14, marginTop: 1, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '0 20px 20px' }}>
                <button
                  type="button"
                  disabled={checkoutLoading}
                  onClick={() => runCheckout(checkoutSubscription)}
                  style={{
                    width: '100%', padding: '11px', border: 'none', borderRadius: 10,
                    background: p.gradient, color: '#fff',
                    fontWeight: 700, fontSize: 14, cursor: checkoutLoading ? 'not-allowed' : 'pointer',
                    opacity: checkoutLoading ? 0.7 : 1,
                  }}
                >{checkoutLoading ? 'Redirecting…' : `${p.cta} →`}</button>
              </div>
            </div>
          ))}
        </div>

        {/* Starter trial link */}
        {showStarterTrialCopy && (
          <button
            type="button"
            onClick={() => runCheckout(checkoutSubscription)}
            disabled={checkoutLoading}
            style={{
              background: 'none', border: '1px solid #334155', borderRadius: 8,
              color: '#94a3b8', padding: '8px 20px', cursor: 'pointer', fontSize: 13,
              marginBottom: 12,
            }}
          >
            {checkoutLoading ? 'Redirecting…' : 'Or start with Starter — $19/mo (7-day free trial)'}
          </button>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          <button type="button" onClick={goBack} style={{
            background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 13,
          }}>← Go back</button>
          <span style={{ color: '#334155' }}>|</span>
          <button type="button" onClick={logout} style={{
            background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 13,
          }}>Log out</button>
        </div>

        <p style={{ fontSize: 11, color: '#334155', marginTop: 16, textAlign: 'center', maxWidth: 360 }}>
          AI-generated suggestions may contain mistakes. Double-check important business or legal details.
        </p>
      </div>
    );
  }

  return children;
}
