import React, { createContext, useContext, useState, useEffect } from "react";

const API_BASE =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? ""
    : "https://api.wintaibot.com";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(true);
  const [authAvailable, setAuthAvailable] = useState(true);

  useEffect(() => {
    if (token) {
      fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.status === 404) setAuthAvailable(false);
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

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Login failed");
    }
    const data = await res.json();
    const token = data.token || data.accessToken;
    localStorage.setItem("authToken", token);
    setToken(token);
    setUser(data.user || {
      id: data.userId || data.id,
      email: data.email,
      membershipType: data.membershipType || "FREE",
      emailVerified: data.emailVerified ?? true,
    });
    // Fetch full profile if /me available
    try {
      const meRes = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (meRes.ok) {
        const me = await meRes.json();
        setUser({ ...me, emailVerified: me.emailVerified ?? true });
      }
    } catch (_) {}
    return data;
  };

  const signup = async (email, password, name) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        name,
        firstName: name || "",
        lastName: "",
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Signup failed");
    }
    const data = await res.json();
    const token = data.token || data.accessToken;
    if (token) {
      localStorage.setItem("authToken", token);
      setToken(token);
      setUser(data.user || { id: data.id, email: data.email, membershipType: data.membershipType || "FREE", emailVerified: true });
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
    if (!res.ok) throw new Error("Checkout failed");
    const data = await res.json();
    if (data.checkoutUrl) window.location.href = data.checkoutUrl;
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    checkoutSubscription,
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
