import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AccountSettings() {
  const {
    user,
    isSubscribed,
    checkoutSubscription,
    cancelSubscription,
    reactivateSubscription,
    openBillingPortal,
    deactivateAccount,
    logout,
  } = useAuth();

  const [loading, setLoading] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [confirmCancelSub, setConfirmCancelSub] = useState(false);
  const [message, setMessage] = useState(null);

  const isMember = isSubscribed;
  const cancelAtPeriodEnd = user?.cancelAtPeriodEnd === true;
  const periodEnd = user?.subscriptionPeriodEnd;

  const showMessage = (msg, isError = false) => {
    setMessage({ text: msg, error: isError });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUpgrade = async () => {
    setLoading("upgrade");
    try {
      await checkoutSubscription();
    } catch (e) {
      showMessage(e.message || "Checkout failed", true);
    } finally {
      setLoading(null);
    }
  };

  const handleCancelSub = async () => {
    if (!confirmCancelSub) {
      setConfirmCancelSub(true);
      return;
    }
    setLoading("cancel-sub");
    try {
      await cancelSubscription();
      setConfirmCancelSub(false);
      showMessage("Subscription will cancel at the end of the current period. You keep access until then.");
    } catch (e) {
      showMessage(e.message || "Could not cancel subscription", true);
    } finally {
      setLoading(null);
    }
  };

  const handleReactivateSub = async () => {
    setLoading("reactivate-sub");
    try {
      await reactivateSubscription();
      showMessage("Subscription reactivated! Your membership will continue.");
    } catch (e) {
      showMessage(e.message || "Could not reactivate subscription", true);
    } finally {
      setLoading(null);
    }
  };

  const handleBilling = async () => {
    setLoading("billing");
    try {
      await openBillingPortal();
    } catch (e) {
      showMessage(e.message || "Failed to open billing portal. Subscribe first to manage invoices.", true);
    } finally {
      setLoading(null);
    }
  };

  const handleDeactivate = async () => {
    if (!confirmDeactivate) {
      setConfirmDeactivate(true);
      return;
    }
    setLoading("deactivate");
    try {
      await deactivateAccount(deactivatePassword);
      logout();
    } catch (e) {
      showMessage(e.message || "Deactivation failed", true);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Account Settings</h2>
        <p style={styles.email}>{user?.email}</p>

        {message && (
          <div style={{ ...styles.messageBanner, backgroundColor: message.error ? "#f8d7da" : "#d4edda", color: message.error ? "#721c24" : "#155724" }}>
            {message.text}
          </div>
        )}

        {/* Subscription Status */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Subscription</h3>
          <div style={styles.statusBadge}>
            <span style={{ ...styles.badge, backgroundColor: isMember ? "#28a745" : "#6c757d" }}>
              {isMember ? "Member" : "Free"}
            </span>
            {isMember && cancelAtPeriodEnd && (
              <span style={{ ...styles.badge, backgroundColor: "#ffc107", color: "#333", marginLeft: "8px" }}>
                Cancels {periodEnd ? `on ${periodEnd}` : "at period end"}
              </span>
            )}
            {isMember && !cancelAtPeriodEnd && periodEnd && (
              <span style={{ color: "#666", fontSize: "13px", marginLeft: "8px" }}>
                Renews {periodEnd}
              </span>
            )}
          </div>

          {/* FREE user: show upgrade button */}
          {!isMember && (
            <div style={{ marginTop: "12px" }}>
              <p style={styles.desc}>Upgrade to Member ($5.99/month) to unlock Image Generator, Transcription, DocuWizard, Reply Enchanter, and Resume Worlock.</p>
              <button
                onClick={handleUpgrade}
                disabled={!!loading}
                style={{ ...styles.btn, ...styles.btnSuccess }}
              >
                {loading === "upgrade" ? "Redirecting..." : "Upgrade to Member ($5.99/month)"}
              </button>
            </div>
          )}

          {/* MEMBER with active (not cancelling) subscription: show cancel */}
          {isMember && !cancelAtPeriodEnd && (
            <div style={{ marginTop: "12px" }}>
              {!confirmCancelSub ? (
                <button
                  onClick={() => setConfirmCancelSub(true)}
                  disabled={!!loading}
                  style={{ ...styles.btn, ...styles.btnWarning }}
                >
                  Cancel Subscription
                </button>
              ) : (
                <div style={styles.confirmBox}>
                  <p style={styles.warning}>
                    Your subscription will be cancelled at the end of the current period
                    {periodEnd ? ` (${periodEnd})` : ""}. You can still use all member features until then.
                  </p>
                  <div style={styles.actionRow}>
                    <button
                      onClick={() => setConfirmCancelSub(false)}
                      style={{ ...styles.btn, ...styles.btnSecondary }}
                    >
                      Keep Subscription
                    </button>
                    <button
                      onClick={handleCancelSub}
                      disabled={loading === "cancel-sub"}
                      style={{ ...styles.btn, ...styles.btnWarning }}
                    >
                      {loading === "cancel-sub" ? "Cancelling..." : "Confirm Cancel"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MEMBER with cancel_at_period_end: show reactivate */}
          {isMember && cancelAtPeriodEnd && (
            <div style={{ marginTop: "12px" }}>
              <p style={styles.desc}>
                Your subscription is set to cancel{periodEnd ? ` on ${periodEnd}` : " at period end"}. Reactivate to keep your membership.
              </p>
              <button
                onClick={handleReactivateSub}
                disabled={loading === "reactivate-sub"}
                style={{ ...styles.btn, ...styles.btnSuccess }}
              >
                {loading === "reactivate-sub" ? "Reactivating..." : "Reactivate Subscription"}
              </button>
            </div>
          )}
        </section>

        {/* Billing & Invoices */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Billing & Invoices</h3>
          <p style={styles.desc}>
            View invoice history, update payment method, or manage your subscription via Stripe.
          </p>
          <button
            onClick={handleBilling}
            disabled={!!loading}
            style={{ ...styles.btn, ...styles.btnPrimary }}
          >
            {loading === "billing" ? "Opening..." : "Manage Billing & Invoices"}
          </button>
        </section>

        {/* Deactivate Account */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Deactivate Account</h3>
          <p style={styles.desc}>
            Deactivate your account. You can reactivate it anytime by logging in with your credentials.
          </p>
          {!confirmDeactivate ? (
            <button
              onClick={() => setConfirmDeactivate(true)}
              style={{ ...styles.btn, ...styles.btnDanger }}
            >
              Deactivate Account
            </button>
          ) : (
            <div style={styles.confirmBox}>
              <p style={styles.warning}>
                Enter your password to confirm account deactivation. You can reactivate later by signing in.
              </p>
              <input
                type="password"
                placeholder="Your password"
                value={deactivatePassword}
                onChange={(e) => setDeactivatePassword(e.target.value)}
                style={styles.input}
              />
              <div style={styles.actionRow}>
                <button
                  onClick={() => {
                    setConfirmDeactivate(false);
                    setDeactivatePassword("");
                  }}
                  style={{ ...styles.btn, ...styles.btnSecondary }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeactivate}
                  disabled={loading === "deactivate" || !deactivatePassword}
                  style={{ ...styles.btn, ...styles.btnDanger }}
                >
                  {loading === "deactivate" ? "Deactivating..." : "Confirm Deactivate"}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "24px", maxWidth: "520px", margin: "0 auto" },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    padding: "28px",
  },
  title: { margin: "0 0 8px 0", color: "#333", fontSize: "24px" },
  email: { margin: "0 0 20px 0", color: "#666", fontSize: "14px" },
  messageBanner: {
    padding: "10px 14px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  section: { marginBottom: "28px", borderTop: "1px solid #f0f0f0", paddingTop: "20px" },
  sectionTitle: { margin: "0 0 8px 0", color: "#333", fontSize: "16px", fontWeight: "600" },
  desc: { margin: "0 0 12px 0", color: "#666", fontSize: "14px", lineHeight: 1.5 },
  statusBadge: { display: "flex", alignItems: "center", marginBottom: "4px" },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#fff",
  },
  btn: {
    padding: "10px 18px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
  },
  btnPrimary: { backgroundColor: "#007bff", color: "#fff" },
  btnSuccess: { backgroundColor: "#28a745", color: "#fff" },
  btnWarning: { backgroundColor: "#fd7e14", color: "#fff" },
  btnSecondary: { backgroundColor: "#e9ecef", color: "#495057" },
  btnDanger: { backgroundColor: "#dc3545", color: "#fff" },
  confirmBox: { padding: "12px 0" },
  warning: { color: "#856404", marginBottom: "12px", fontSize: "14px", lineHeight: 1.5 },
  actionRow: { display: "flex", gap: "12px", flexWrap: "wrap" },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    marginBottom: "12px",
    boxSizing: "border-box",
  },
};
