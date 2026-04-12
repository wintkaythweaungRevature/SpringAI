import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

/** Matches PricingPage / UpgradeModal (per-month equivalent when billed annually). */
const TIER_CATALOG = {
  STARTER: {
    name: "Starter",
    monthlyPrice: 19,
    yearlyPrice: 15,
    yearlyTotal: 180,
    tagline: "Social scheduling, AI captions & core publishing",
    features: ["10 posts/day", "3 platforms", "AI captions & video publisher", "Analytics dashboard", "7-day free trial"],
    badge: null,
    color: "#6366f1",
  },
  PRO: {
    name: "Pro",
    monthlyPrice: 39,
    yearlyPrice: 32,
    yearlyTotal: 384,
    tagline: "Deep analytics, Social AI & unlimited posts",
    features: ["Unlimited posts", "6 platforms", "100 AI-generated images/mo", "Deep Trends & Social AI", "Messages & Auto Reply"],
    badge: "Most Popular",
    color: "#8b5cf6",
  },
  GROWTH: {
    name: "Growth",
    monthlyPrice: 79,
    yearlyPrice: 64,
    yearlyTotal: 768,
    tagline: "Priority processing & full platform limits",
    features: ["Unlimited posts", "All platforms", "Unlimited AI-generated images", "Video trimming tool", "Priority processing"],
    badge: "Best Value",
    color: "#0ea5e9",
  },
};

function normalizeTierKey(plan, membershipType) {
  const p = (plan || "").toUpperCase();
  if (p === "STARTER" || p === "PRO" || p === "GROWTH") return p;
  if (p === "MEMBER" || (membershipType || "").toUpperCase() === "MEMBER") return "STARTER";
  const m = (membershipType || "").toUpperCase();
  if (m === "STARTER" || m === "PRO" || m === "GROWTH") return m;
  return null;
}

export default function AccountSettings() {
  const {
    user, token, isSubscribed, cancelSubscription,
    reactivateSubscription, openBillingPortal, deactivateAccount, logout,
    apiBase, authHeaders, refetchUser,
  } = useAuth();

  const [loading, setLoading] = useState(null);
  const [subSnap, setSubSnap] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [confirmCancelSub, setConfirmCancelSub] = useState(false);
  const [message, setMessage] = useState(null);
  const [upgradeYearly, setUpgradeYearly] = useState(false);

  const isMember = isSubscribed;
  const planBadgeLabel = (() => {
    if (!isMember) return "Free";
    const mt = user?.membershipType;
    const map = { STARTER: "Starter", PRO: "Pro", GROWTH: "Growth", MEMBER: "Starter" };
    return map[mt] || mt || "Member";
  })();
  const cancelAtPeriodEnd = user?.cancelAtPeriodEnd === true;
  const periodEnd = user?.subscriptionPeriodEnd;

  useEffect(() => {
    if (!isMember || cancelAtPeriodEnd || !apiBase || !token || user?.id === "owner") {
      setSubSnap(null);
      return undefined;
    }
    let cancelled = false;
    const ac = new AbortController();
    fetch(`${apiBase}/api/subscription/current`, {
      headers: { ...authHeaders(), Accept: "application/json" },
      signal: ac.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled) setSubSnap(d && typeof d === "object" ? d : null);
      })
      .catch(() => {
        if (!cancelled) setSubSnap(null);
      });
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [isMember, cancelAtPeriodEnd, apiBase, token, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const tierKey = normalizeTierKey(subSnap?.plan, user?.membershipType);

  /** Subscription pill — matches pricing card colors (solid fill + white text). */
  const subscriptionBadgeStyle = (() => {
    if (!isMember) return s.freeBadge;
    const key = tierKey || (user?.membershipType === "MEMBER" ? "STARTER" : null);
    const tier = key && TIER_CATALOG[key] ? TIER_CATALOG[key] : null;
    if (!tier) {
      return { ...s.memberBadge, background: "#6366f1", color: "#fff", border: "1px solid #6366f1" };
    }
    return {
      padding: "3px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "700",
      background: tier.color,
      color: "#ffffff",
      border: `1px solid ${tier.color}`,
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
    };
  })();
  const showMessage = (msg, isError = false) => {
    setMessage({ text: msg, error: isError });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCancelSub = async () => {
    if (!confirmCancelSub) { setConfirmCancelSub(true); return; }
    setLoading("cancel-sub");
    try {
      await cancelSubscription();
      setConfirmCancelSub(false);
      showMessage("Subscription will cancel at the end of the current period.");
    } catch (e) { showMessage(e.message || "Could not cancel subscription", true); }
    finally { setLoading(null); }
  };

  const handleReactivateSub = async () => {
    setLoading("reactivate-sub");
    try {
      await reactivateSubscription();
      showMessage("Subscription reactivated! Your membership will continue.");
    } catch (e) { showMessage(e.message || "Could not reactivate subscription", true); }
    finally { setLoading(null); }
  };

  const handleBilling = async () => {
    setLoading("billing");
    try { await openBillingPortal(); }
    catch (e) { showMessage(e.message || "Failed to open billing portal.", true); }
    finally { setLoading(null); }
  };

  const handleDeactivate = async () => {
    if (!confirmDeactivate) { setConfirmDeactivate(true); return; }
    setLoading("deactivate");
    try {
      await deactivateAccount(deactivatePassword);
      logout();
    } catch (e) { showMessage(e.message || "Deactivation failed", true); }
    finally { setLoading(null); }
  };

  const openChangePlan = () => {
    window.dispatchEvent(new CustomEvent("wintaibot:go", { detail: "pricing" }));
  };

  const handleUpgradeTo = async (planId) => {
    if (!apiBase) return;
    setLoading(`upgrade-${planId}`);
    try {
      const res = await fetch(`${apiBase}/api/subscription/checkout`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, billingInterval: upgradeYearly ? "YEARLY" : "MONTHLY" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || "Checkout failed");
      if (data.updated) {
        showMessage(data.message || "Plan updated!", false);
        if (typeof refetchUser === "function") await refetchUser();
        return;
      }
      const url = data.url || data.checkoutUrl;
      if (url) window.location.href = url;
      else throw new Error("Checkout failed");
    } catch (e) {
      showMessage(e.message || "Could not start checkout", true);
    } finally {
      setLoading(null);
    }
  };

  // Plans to show in upgrade section
  const upgradePlans = !isMember
    ? ["STARTER", "PRO", "GROWTH"]
    : tierKey === "STARTER"
    ? ["PRO", "GROWTH"]
    : null; // PRO/GROWTH users don't see upgrade section

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <h2 style={s.cardTitle}>Account Settings</h2>
        <p style={s.cardEmail}>{user?.email}</p>

        {/* Toast */}
        {message && (
          <div style={{
            ...s.toast,
            background: message.error ? "#fef2f2" : "#f0fdf4",
            color: message.error ? "#b91c1c" : "#15803d",
            borderColor: message.error ? "#fecaca" : "#bbf7d0",
          }}>
            {message.error ? "⚠ " : "✓ "}{message.text}
          </div>
        )}

        {/* Subscription */}
        <div style={s.section}>
          <h3 style={s.sectionTitle}>Subscription</h3>
          <div style={s.badgeRow}>
            <span style={isMember ? subscriptionBadgeStyle : s.freeBadge}>
              {planBadgeLabel}
            </span>
            {isMember && cancelAtPeriodEnd && (
              <span style={s.warnBadge}>Cancels {periodEnd ? `on ${periodEnd}` : "at period end"}</span>
            )}
            {isMember && !cancelAtPeriodEnd && periodEnd && (
              <span style={s.renewText}>Renews {periodEnd}</span>
            )}
          </div>

          {isMember && !cancelAtPeriodEnd && user?.id !== "owner" && (
            <div style={{ marginTop: 14 }}>
              <p style={s.desc}>
                Switch to another tier or change monthly vs yearly billing. You can also use Stripe for payment method and invoices.
              </p>
              <button
                type="button"
                onClick={openChangePlan}
                disabled={!!loading}
                style={s.btnPrimary}
              >
                Change plan or billing
              </button>
            </div>
          )}

          {/* ── Inline upgrade section: Free → all plans, Starter → Pro/Growth ── */}
          {upgradePlans && (
            <div style={{ marginTop: 20 }}>
              <p style={{ ...s.desc, marginBottom: 14 }}>
                {!isMember
                  ? "Choose a plan to unlock all features."
                  : "Unlock more with Pro or Growth."}
              </p>

              {/* Monthly / Yearly toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
                <div style={{ display: "flex", border: "1.5px solid #e2e8f0", borderRadius: 10, overflow: "hidden", background: "#f8fafc" }}>
                  <button
                    type="button"
                    onClick={() => setUpgradeYearly(false)}
                    style={{
                      padding: "7px 16px", border: "none", fontSize: 13, fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                      background: !upgradeYearly ? "#fff" : "transparent",
                      color: !upgradeYearly ? "#1e293b" : "#64748b",
                      boxShadow: !upgradeYearly ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    }}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpgradeYearly(true)}
                    style={{
                      padding: "7px 16px", border: "none", fontSize: 13, fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                      background: upgradeYearly ? "#fff" : "transparent",
                      color: upgradeYearly ? "#6366f1" : "#64748b",
                      boxShadow: upgradeYearly ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                      display: "flex", alignItems: "center", gap: 6,
                    }}
                  >
                    Yearly
                    <span style={{
                      background: "#dcfce7", color: "#15803d",
                      fontSize: 10, fontWeight: 700, padding: "2px 6px",
                      borderRadius: 20, whiteSpace: "nowrap",
                    }}>
                      Save ~18%
                    </span>
                  </button>
                </div>
              </div>

              {/* Plan cards */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {upgradePlans.map((planKey) => {
                  const plan = TIER_CATALOG[planKey];
                  const isRecommended = planKey === "PRO";
                  const price = upgradeYearly ? plan.yearlyPrice : plan.monthlyPrice;
                  const savingsYr = plan.monthlyPrice * 12 - plan.yearlyTotal;
                  const isLoadingThis = loading === `upgrade-${planKey}`;

                  return (
                    <div
                      key={planKey}
                      style={{
                        flex: "1 1 200px", minWidth: 180,
                        border: `2px solid ${isRecommended ? plan.color : "#e2e8f0"}`,
                        borderRadius: 14, padding: "18px 16px",
                        background: isRecommended ? `${plan.color}08` : "#fff",
                        position: "relative", display: "flex", flexDirection: "column",
                        boxShadow: isRecommended ? `0 4px 16px ${plan.color}22` : "none",
                      }}
                    >
                      {/* Badge */}
                      {plan.badge && (
                        <span style={{
                          position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
                          background: plan.color, color: "#fff",
                          fontSize: 10, fontWeight: 800, padding: "3px 10px",
                          borderRadius: 20, whiteSpace: "nowrap", letterSpacing: "0.03em",
                        }}>
                          {plan.badge}
                        </span>
                      )}

                      {/* Plan name */}
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>
                        {plan.name}
                      </div>

                      {/* Price */}
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, marginBottom: 4 }}>
                        <span style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>${price}</span>
                        <span style={{ fontSize: 13, color: "#64748b", paddingBottom: 3 }}>/mo</span>
                      </div>

                      {/* Billing note */}
                      <div style={{ fontSize: 11, color: upgradeYearly ? "#15803d" : "#94a3b8", marginBottom: 14, fontWeight: upgradeYearly ? 600 : 400 }}>
                        {upgradeYearly
                          ? `Billed $${plan.yearlyTotal}/yr · save $${savingsYr}/yr`
                          : "Billed monthly"}
                      </div>

                      {/* Features */}
                      <ul style={{ margin: "0 0 16px", padding: 0, listStyle: "none", flex: 1 }}>
                        {plan.features.map((f, i) => (
                          <li key={i} style={{ fontSize: 12, color: "#475569", marginBottom: 5, display: "flex", gap: 6 }}>
                            <span style={{ color: plan.color, fontWeight: 700, flexShrink: 0 }}>✓</span>
                            {f}
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <button
                        type="button"
                        onClick={() => handleUpgradeTo(planKey)}
                        disabled={!!loading}
                        style={{
                          width: "100%", padding: "10px 0", borderRadius: 9,
                          border: "none", cursor: !!loading ? "not-allowed" : "pointer",
                          background: isRecommended ? plan.color : "#0f172a",
                          color: "#fff", fontSize: 13, fontWeight: 700,
                          fontFamily: "inherit", opacity: !!loading ? 0.7 : 1,
                          transition: "opacity 0.15s",
                        }}
                      >
                        {isLoadingThis
                          ? "Redirecting…"
                          : planKey === "STARTER"
                          ? "Start Free Trial"
                          : `Upgrade to ${plan.name}`}
                      </button>
                    </div>
                  );
                })}
              </div>

              {upgradeYearly && (
                <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 10 }}>
                  Annual plans billed as one payment · Cancel anytime · Powered by Stripe
                </p>
              )}
              {!upgradeYearly && upgradePlans.includes("STARTER") && (
                <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 10 }}>
                  Starter includes 7-day free trial · No charge until trial ends
                </p>
              )}
            </div>
          )}

          {isMember && !cancelAtPeriodEnd && (
            <div style={{ marginTop: 12 }}>
              {!confirmCancelSub ? (
                <button onClick={() => setConfirmCancelSub(true)} disabled={!!loading} style={s.btnWarning}>
                  Cancel Subscription
                </button>
              ) : (
                <div style={s.confirmBox}>
                  <p style={s.warnMsg}>Your subscription will cancel at period end{periodEnd ? ` (${periodEnd})` : ""}. You keep access until then.</p>
                  <div style={s.btnRow}>
                    <button onClick={() => setConfirmCancelSub(false)} style={s.btnGhost}>Keep Subscription</button>
                    <button onClick={handleCancelSub} disabled={loading === "cancel-sub"} style={s.btnWarning}>
                      {loading === "cancel-sub" ? "Cancelling..." : "Confirm Cancel"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isMember && cancelAtPeriodEnd && (
            <div style={{ marginTop: 12 }}>
              <p style={s.desc}>Your subscription ends soon. Reactivate to keep your membership.</p>
              <button onClick={handleReactivateSub} disabled={loading === "reactivate-sub"} style={s.btnSuccess}>
                {loading === "reactivate-sub" ? "Reactivating..." : "Reactivate Subscription"}
              </button>
            </div>
          )}
        </div>

        {/* Billing */}
        <div style={s.section}>
          <h3 style={s.sectionTitle}>Billing &amp; Invoices</h3>
          <p style={s.desc}>
            View invoice history, update payment method, or manage your subscription in Stripe&apos;s billing portal.
            W!ntAi does not store your bank account or full card details; only Stripe processes that information.
          </p>
          <button onClick={handleBilling} disabled={!!loading} style={s.btnPrimary}>
            {loading === "billing" ? "Opening..." : "Manage Billing & Invoices"}
          </button>
        </div>

        {/* Deactivate */}
        <div style={s.section}>
          <h3 style={s.sectionTitle}>Deactivate Account</h3>
          <p style={s.desc}>Deactivate your account. You can reactivate it anytime by logging in with your credentials.</p>
          {!confirmDeactivate ? (
            <button onClick={() => setConfirmDeactivate(true)} style={s.btnDanger}>
              Deactivate Account
            </button>
          ) : (
            <div style={s.confirmBox}>
              <p style={s.warnMsg}>Enter your password to confirm account deactivation. You can reactivate later by signing in.</p>
              <input
                type="password"
                placeholder="Your password"
                value={deactivatePassword}
                onChange={(e) => setDeactivatePassword(e.target.value)}
                style={s.input}
              />
              <div style={s.btnRow}>
                <button onClick={() => { setConfirmDeactivate(false); setDeactivatePassword(""); }} style={s.btnGhost}>Cancel</button>
                <button onClick={handleDeactivate} disabled={loading === "deactivate" || !deactivatePassword} style={s.btnDanger}>
                  {loading === "deactivate" ? "Deactivating..." : "Confirm Deactivate"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  wrap: { padding: "4px 0" },
  card: {
    background: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    padding: "28px 32px",
    maxWidth: "560px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  cardTitle: { margin: "0 0 6px", color: "#0f172a", fontSize: "20px", fontWeight: "700" },
  cardEmail: { margin: "0 0 20px", color: "#64748b", fontSize: "14px" },
  toast: {
    padding: "10px 14px", borderRadius: "8px", border: "1px solid",
    marginBottom: "16px", fontSize: "14px", fontWeight: "500",
  },
  section: { borderTop: "1px solid #f1f5f9", paddingTop: "20px", marginTop: "20px" },
  sectionTitle: { margin: "0 0 10px", color: "#0f172a", fontSize: "15px", fontWeight: "700" },
  desc: { margin: "0 0 14px", color: "#64748b", fontSize: "14px", lineHeight: "1.6" },
  badgeRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" },
  memberBadge: {
    padding: "3px 12px", borderRadius: "20px",
    background: "#6366f1", color: "#fff", border: "1px solid #6366f1",
    fontSize: "12px", fontWeight: "700",
  },
  freeBadge: {
    padding: "3px 12px", borderRadius: "20px",
    background: "#94a3b8", color: "#fff",
    fontSize: "12px", fontWeight: "700",
  },
  warnBadge: {
    padding: "3px 12px", borderRadius: "20px",
    background: "#fbbf24", color: "#1c1917",
    fontSize: "12px", fontWeight: "600",
  },
  renewText: { color: "#64748b", fontSize: "13px" },
  confirmBox: { paddingTop: "4px" },
  warnMsg: { color: "#92400e", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", lineHeight: "1.5", marginBottom: "12px" },
  btnRow: { display: "flex", gap: "10px", flexWrap: "wrap" },
  input: {
    width: "100%", padding: "10px 12px", borderRadius: "8px",
    border: "1px solid #e2e8f0", fontSize: "14px",
    marginBottom: "12px", boxSizing: "border-box", outline: "none",
    fontFamily: "inherit",
  },
  btnPrimary: {
    padding: "10px 20px", borderRadius: "8px", border: "none",
    background: "#2563eb", color: "#fff",
    fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
  },
  btnSuccess: {
    padding: "10px 20px", borderRadius: "8px", border: "none",
    background: "#22c55e", color: "#fff",
    fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
  },
  btnWarning: {
    padding: "10px 20px", borderRadius: "8px", border: "none",
    background: "#f97316", color: "#fff",
    fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
  },
  btnDanger: {
    padding: "10px 20px", borderRadius: "8px", border: "none",
    background: "#ef4444", color: "#fff",
    fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
  },
  btnGhost: {
    padding: "10px 18px", borderRadius: "8px",
    border: "1px solid #e2e8f0", background: "#fff",
    color: "#475057", fontSize: "14px", fontWeight: "600",
    cursor: "pointer", fontFamily: "inherit",
  },
};
