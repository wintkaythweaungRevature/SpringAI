import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AccountSettings() {
  const { user, openBillingPortal, deactivateAccount, logout } = useAuth();
  const [loading, setLoading] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");

  const handleBilling = async () => {
    setLoading("billing");
    try {
      await openBillingPortal();
    } catch (e) {
      alert(e.message || "Failed to open billing portal. Subscribe first to manage invoices.");
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
      alert(e.message || "Deactivation failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Account Settings</h2>
        <p style={styles.email}>{user?.email}</p>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Billing & Invoices</h3>
          <p style={styles.desc}>
            View invoice history, update payment method, or cancel your subscription.
          </p>
          <button
            onClick={handleBilling}
            disabled={loading}
            style={{ ...styles.btn, ...styles.btnPrimary }}
          >
            {loading === "billing" ? "Opening..." : "Manage Billing & Invoices"}
          </button>
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Deactivate Account</h3>
          <p style={styles.desc}>
            Permanently deactivate your account. You will need to sign up again to use the service.
          </p>
          {!confirmDeactivate ? (
            <button
              onClick={() => setConfirmDeactivate(true)}
              style={{ ...styles.btn, ...styles.btnDanger }}
            >
              Deactivate Account
            </button>
          ) : (
            <div style={styles.deactivateBox}>
              <p style={styles.warning}>
                This action cannot be undone. Enter your password to confirm:
              </p>
              <input
                type="password"
                placeholder="Your password"
                value={deactivatePassword}
                onChange={(e) => setDeactivatePassword(e.target.value)}
                style={styles.input}
              />
              <div style={styles.deactivateActions}>
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
                  disabled={loading || !deactivatePassword}
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
  container: { padding: "24px", maxWidth: "480px", margin: "0 auto" },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    padding: "24px",
  },
  title: { margin: "0 0 8px 0", color: "#333", fontSize: "24px" },
  email: { margin: "0 0 24px 0", color: "#666", fontSize: "14px" },
  section: { marginBottom: "28px" },
  sectionTitle: { margin: "0 0 8px 0", color: "#333", fontSize: "16px" },
  desc: { margin: "0 0 12px 0", color: "#666", fontSize: "14px", lineHeight: 1.5 },
  btn: {
    padding: "10px 18px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
  },
  btnPrimary: { backgroundColor: "#007bff", color: "#fff" },
  btnSecondary: { backgroundColor: "#e9ecef", color: "#495057" },
  btnDanger: { backgroundColor: "#dc3545", color: "#fff" },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    marginBottom: "12px",
  },
  deactivateBox: { padding: "12px 0" },
  warning: { color: "#856404", marginBottom: "12px", fontSize: "14px" },
  deactivateActions: { display: "flex", gap: "12px" },
};
