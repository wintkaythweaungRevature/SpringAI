import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Signup({ onSuccess, onSwitchToLogin }) {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(email, password, name);
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Member Registration</h2>
        <p style={styles.subtitle}>Sign up to access all AI features</p>
        {success ? (
          <div style={{ padding: "16px", backgroundColor: "#d4edda", borderRadius: "8px", color: "#155724" }}>
            <strong>Registration successful!</strong>
            <p style={{ margin: "8px 0 0", fontSize: "14px" }}>
              You can now log in to use Ask AI and other features.
            </p>
            <button type="button" onClick={onSwitchToLogin} style={{ ...styles.link, marginTop: "12px", display: "block" }}>
              Go to Login
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                minLength={6}
                required
              />
              {error && <p style={styles.error}>{error}</p>}
              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? "Creating account..." : "Sign Up"}
              </button>
            </form>
            <p style={styles.footer}>
              Already a member?{" "}
              <button type="button" onClick={onSwitchToLogin} style={styles.link}>
                Log in
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "20px", display: "flex", justifyContent: "center" },
  card: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "360px",
  },
  title: { textAlign: "center", marginBottom: "8px", color: "#333" },
  subtitle: { textAlign: "center", marginBottom: "20px", color: "#666", fontSize: "14px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "16px",
  },
  error: { color: "#dc3545", fontSize: "14px", margin: 0 },
  button: {
    padding: "12px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  footer: { textAlign: "center", marginTop: "16px", fontSize: "14px", color: "#666" },
  link: {
    background: "none",
    border: "none",
    color: "#007bff",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: "14px",
  },
};
