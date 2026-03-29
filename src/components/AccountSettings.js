import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

/** Matches PricingPage / UpgradeModal (per-month equivalent when billed annually). */
const TIER_CATALOG = {
  STARTER: {
    name: "Starter",
    monthlyPrice: 19,
    yearlyPrice: 15,
    tagline: "Social scheduling, AI captions & core publishing",
  },
  PRO: {
    name: "Pro",
    monthlyPrice: 39,
    yearlyPrice: 32,
    tagline: "Deep analytics, Social AI & unlimited posts",
  },
  GROWTH: {
    name: "Growth",
    monthlyPrice: 79,
    yearlyPrice: 66,
    tagline: "Priority processing & full platform limits",
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
    user, token, isSubscribed, checkoutSubscription, cancelSubscription,
    reactivateSubscription, openBillingPortal, deactivateAccount, logout,
    apiBase, authHeaders, refetchUser,
  } = useAuth();

  const [loading, setLoading] = useState(null);
  const [subSnap, setSubSnap] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [confirmCancelSub, setConfirmCancelSub] = useState(false);
  const [message, setMessage] = useState(null);

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
  const apiSaysMonthly = subSnap?.billingInterval === "MONTHLY";
  const showAnnualUpsell =
    isMember &&
    !cancelAtPeriodEnd &&
    apiSaysMonthly &&
    tierKey &&
    TIER_CATALOG[tierKey];

  const annualMeta = showAnnualUpsell ? TIER_CATALOG[tierKey] : null;
  const savePct =
    annualMeta &&
    annualMeta.monthlyPrice > 0
      ? Math.max(0, Math.round((1 - annualMeta.yearlyPrice / annualMeta.monthlyPrice) * 100))
      : 0;

  const showMessage = (msg, isError = false) => {
    setMessage({ text: msg, error: isError });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUpgrade = async () => {
    setLoading("upgrade");
    try { await checkoutSubscription(); }
    catch (e) { showMessage(e.message || "Checkout failed", true); }
    finally { setLoading(null); }
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

  const handleSwitchToAnnual = async () => {
    if (!tierKey || !apiBase) return;
    setLoading("annual");
    try {
      const res = await fetch(`${apiBase}/api/subscription/checkout`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ plan: tierKey, billingInterval: "YEARLY" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || "Checkout failed");
      if (data.updated) {
        showMessage(data.message || "Your plan was updated.", false);
        if (typeof refetchUser === "function") await refetchUser();
        const r2 = await fetch(`${apiBase}/api/subscription/current`, {
          headers: { ...authHeaders(), Accept: "application/json" },
        });
        const d2 = r2.ok ? await r2.json() : null;
        setSubSnap(d2 && typeof d2 === "object" ? d2 : null);
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

  const openChangePlan = () => {
    window.dispatchEvent(new CustomEvent("wintaibot:go", { detail: "pricing" }));
  };

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
            <span style={isMember ? s.memberBadge : s.freeBadge}>
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

          {!isMember && (
            <div style={{ marginTop: 12 }}>
              <p style={s.desc}>Upgrade to a paid plan (from $19/mo; annual billing available) to unlock Image Generator, Transcription, DocuWizard, Reply Enchanter, Resume Warlock, and Video Publisher limits per tier.</p>
              <button onClick={handleUpgrade} disabled={!!loading} style={s.btnSuccess}>
                {loading === "upgrade" ? "Redirecting..." : "Upgrade — see plans from $19/mo"}
              </button>
            </div>
          )}

          {showAnnualUpsell && annualMeta && (
            <div style={s.annualCard}>
              <div style={s.annualCardHeader}>
                <span style={s.annualIcon} aria-hidden>◇</span>
                <div>
                  <div style={s.annualPlanTitle}>{annualMeta.name}</div>
                  <p style={s.annualTagline}>{annualMeta.tagline}</p>
                </div>
              </div>
              <div style={s.annualPriceRow}>
                <span style={s.annualPriceBig}>${annualMeta.yearlyPrice}</span>
                <div style={s.annualPriceSide}>
                  <span>USD / month</span>
                  <span style={s.annualBilledNote}>billed annually</span>
                </div>
              </div>
              <div style={s.annualInfoBox}>
                <span style={s.annualInfoIcon} aria-hidden>i</span>
                <div>
                  <strong style={s.annualInfoStrong}>You are on a monthly billing plan.</strong>
                  <p style={s.annualInfoSub}>Pay annually to save {savePct}%.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSwitchToAnnual}
                disabled={!!loading}
                style={s.annualCta}
              >
                {loading === "annual" ? "Redirecting…" : `Get ${annualMeta.name} annual plan`}
              </button>
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
          <p style={s.desc}>View invoice history, update payment method, or manage your subscription via Stripe.</p>
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
    background: "#22c55e", color: "#fff",
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
  annualCard: {
    marginTop: "20px",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    background: "#fafafa",
    maxWidth: "100%",
  },
  annualCardHeader: { display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "16px" },
  annualIcon: {
    fontSize: "22px",
    lineHeight: 1,
    color: "#64748b",
    marginTop: "2px",
    fontFamily: "Georgia, serif",
  },
  annualPlanTitle: { fontSize: "22px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em" },
  annualTagline: { margin: "4px 0 0", fontSize: "14px", color: "#64748b", lineHeight: 1.45 },
  annualPriceRow: { display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "16px" },
  annualPriceBig: { fontSize: "40px", fontWeight: "800", color: "#0f172a", lineHeight: 1 },
  annualPriceSide: { display: "flex", flexDirection: "column", fontSize: "13px", color: "#475569", paddingTop: "6px" },
  annualBilledNote: { color: "#94a3b8", fontSize: "12px", marginTop: "2px" },
  annualInfoBox: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    marginBottom: "16px",
  },
  annualInfoIcon: {
    width: "22px",
    height: "22px",
    borderRadius: "999px",
    border: "2px solid #94a3b8",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontStyle: "italic",
    fontFamily: "Georgia, serif",
  },
  annualInfoStrong: { display: "block", fontSize: "14px", color: "#0f172a", marginBottom: "4px" },
  annualInfoSub: { margin: 0, fontSize: "13px", color: "#64748b", lineHeight: 1.5 },
  annualCta: {
    width: "100%",
    padding: "12px 18px",
    borderRadius: "10px",
    border: "2px solid #0f172a",
    background: "#fff",
    color: "#0f172a",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
