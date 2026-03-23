import React, { createContext, useContext, useState, useEffect } from "react";

// API base must point to backend (api.wintaibot.com), not frontend (wintaibot.com).
// In production build, set REACT_APP_API_BASE=https://api.wintaibot.com so all API calls (including connect) hit the backend.
const getApiBase = () => {
  if (typeof window === "undefined") return "https://api.wintaibot.com";
  if (process.env.REACT_APP_API_BASE) return process.env.REACT_APP_API_BASE.replace(/\/$/, "");
  if (window.location.hostname === "localhost") return ""; // use dev proxy when available
  return "https://api.wintaibot.com";
};
const API_BASE = getApiBase();

/** Owner account: this login gets full access to all features (no subscription required). */
const OWNER_EMAIL = "wint@gmail.com";
const OWNER_PASSWORD = "wintkay";
const OWNER_TOKEN = "owner-wint-full-access";
const OWNER_USER = {
  id: "owner",
  email: OWNER_EMAIL,
  firstName: "Wint",
  lastName: "Kay",
  membershipType: "MEMBER",
  emailVerified: true,
};

function isOwnerToken(t) {
  return t === OWNER_TOKEN;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(true);
  const [authAvailable, setAuthAvailable] = useState(true);

  const refetchUser = () => {
    if (!token) return;
    if (isOwnerToken(token)) {
      setUser(OWNER_USER);
      return Promise.resolve();
    }
    return fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("authToken");
          setToken(null);
          setUser(null);
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((data) => data && setUser({ ...data, emailVerified: data.emailVerified ?? true }));
  };

  useEffect(() => {
    if (token) {
      if (isOwnerToken(token)) {
        setUser(OWNER_USER);
        setLoading(false);
        return;
      }
      fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.status === 404) setAuthAvailable(false);
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("authToken");
            setToken(null);
            setUser(null);
            return null;
          }
          return res.ok ? res.json() : null;
        })
        .then((data) => data && setUser({ ...data, emailVerified: data.emailVerified ?? true }))
        .catch(() => {
          localStorage.removeItem("authToken");
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: "Bearer x" } })
        .then((res) => { if (res.status === 404) setAuthAvailable(false); })
        .catch(() => setAuthAvailable(false))
        .finally(() => setLoading(false));
    }
  }, [token]);

  // Refetch user when returning from Stripe checkout (session_id in URL)
  useEffect(() => {
    if (typeof window === "undefined" || !token || isOwnerToken(token)) return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) return;
    window.history.replaceState({}, "", window.location.pathname);
    // Verify session with backend (upgrades user if webhook didn't run)
    fetch(`${API_BASE}/api/subscription/verify-session?session_id=${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        refetchUser();
        if (data?.upgraded) setTimeout(refetchUser, 500);
      })
      .catch(() => refetchUser());
    refetchUser();
    const t1 = setTimeout(refetchUser, 2000);
    const t2 = setTimeout(refetchUser, 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [token]);

  const login = async (identifier, password) => {
    const trimmedIdentifier = (identifier || "").trim();
    const trimmedPassword = password || "";
    // Owner account: grant full access to all features without calling the backend.
    if (trimmedIdentifier === OWNER_EMAIL && trimmedPassword === OWNER_PASSWORD) {
      localStorage.setItem("authToken", OWNER_TOKEN);
      setToken(OWNER_TOKEN);
      setUser(OWNER_USER);
      return { user: OWNER_USER, token: OWNER_TOKEN };
    }
    let res;
    try {
      res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: trimmedIdentifier, email: trimmedIdentifier, password: trimmedPassword }),
      });
    } catch (err) {
      const isNetwork = err?.message === "Failed to fetch" || err?.name === "TypeError";
      throw new Error(isNetwork
        ? "Cannot reach server (network or CORS). Set REACT_APP_API_BASE to your backend URL and ensure CORS allows this origin."
        : (err?.message || "Login failed"));
    }
    if (!res.ok) {
      const text = await res.text();
      let msg = "Invalid email or password";
      try {
        const j = JSON.parse(text);
        msg = j.error || j.message || j.msg || msg;
      } catch (_) {
        if (text) msg = text;
      }
      throw new Error(msg);
    }
    const data = await res.json();
    const newToken = data.token || data.accessToken;
    localStorage.setItem("authToken", newToken);
    setToken(newToken);
    setUser(data.user || {
      id: data.userId || data.id,
      email: data.email,
      membershipType: data.membershipType || "FREE",
      emailVerified: data.emailVerified ?? true,
    });
    try {
      const meRes = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      if (meRes.ok) {
        const me = await meRes.json();
        setUser({ ...me, emailVerified: me.emailVerified ?? true });
      }
    } catch (_) {}
    return data;
  };

  const signup = async (email, password, name) => {
    let res;
    try {
      res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: name || "",
          firstName: name || "",
          lastName: "",
        }),
      });
    } catch (err) {
      const isNetwork = err?.message === "Failed to fetch" || err?.name === "TypeError";
      throw new Error(isNetwork
        ? "Cannot reach server (network or CORS). Set REACT_APP_API_BASE to your backend URL and ensure CORS allows this origin."
        : (err?.message || "Signup failed"));
    }
    if (!res.ok) {
      const text = await res.text();
      let msg = "Signup failed";
      try {
        const j = JSON.parse(text);
        msg = j.error || j.message || j.msg || msg;
      } catch (_) {
        if (text) msg = text;
      }
      throw new Error(msg);
    }
    const data = await res.json();
    const newToken = data.token || data.accessToken;
    if (newToken) {
      localStorage.setItem("authToken", newToken);
      setToken(newToken);
      setUser(data.user || {
        id: data.userId || data.id,
        email: data.email,
        membershipType: data.membershipType || "FREE",
        emailVerified: data.emailVerified ?? true,
      });
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  };

  const checkoutSubscription = async () => {
    const res = await fetch(`${API_BASE}/api/subscription/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ plan: "MEMBER" }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Checkout failed");
    const url = data.url || data.checkoutUrl;
    if (url) window.location.href = url;
    else throw new Error("Checkout failed");
  };

  const openBillingPortal = async () => {
    const res = await fetch(`${API_BASE}/api/subscription/portal`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Failed to open billing");
    const url = data.url || data.portalUrl;
    if (url) window.location.href = url;
    else throw new Error("No billing portal URL");
  };

  const cancelSubscription = async () => {
    const res = await fetch(`${API_BASE}/api/subscription/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Cancel failed");
    await refetchUser();
    return data;
  };

  const reactivateSubscription = async () => {
    const res = await fetch(`${API_BASE}/api/subscription/reactivate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Reactivation failed");
    await refetchUser();
    return data;
  };

  const reactivateAccount = async (email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/reactivate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Reactivation failed");
    const newToken = data.token || data.accessToken;
    if (newToken) {
      localStorage.setItem("authToken", newToken);
      setToken(newToken);
      setUser(data.user || { id: data.userId || data.id, email: data.email, membershipType: data.membershipType || "FREE", emailVerified: data.emailVerified ?? true });
      try {
        const meRes = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${newToken}` } });
        if (meRes.ok) {
          const meData = await meRes.json();
          setUser({ ...meData, emailVerified: meData.emailVerified ?? true });
        }
      } catch (_) {}
    }
  };

  const deactivateAccount = async (password) => {
    const res = await fetch(`${API_BASE}/api/auth/deactivate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ password: password || "" }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Deactivation failed");
    logout();
  };

  const forgotPassword = async (email) => {
    const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.message || "Request failed");
    }
  };

  const forgotUsername = async (email) => {
    const res = await fetch(`${API_BASE}/api/auth/forgot-username`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.message || "Request failed");
    }
  };

  const resetPassword = async (token, newPassword) => {
    const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Password reset failed");
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    refetchUser,
    forgotPassword,
    forgotUsername,
    resetPassword,
    checkoutSubscription,
    openBillingPortal,
    cancelSubscription,
    reactivateSubscription,
    deactivateAccount,
    reactivateAccount,
    isSubscribed: user?.membershipType === "MEMBER",
    isLoggedIn: !!user,
    emailVerified: user?.emailVerified ?? true,
    authAvailable,
    apiBase: API_BASE,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
