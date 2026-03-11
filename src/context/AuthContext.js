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
  const [authAvailable, setAuthAvailable] = useState(true); // false = backend not deployed, allow access

  useEffect(() => {
    if (token) {
      fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.status === 404) {
            setAuthAvailable(false);
            return null;
          }
          return res.ok ? res.json() : null;
        })
        .then((data) => setUser(data))
        .catch(() => {
          localStorage.removeItem("authToken");
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      // Quick check: 404 = auth backend not deployed, allow access without login
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
    localStorage.setItem("authToken", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const signup = async (email, password, name) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Signup failed");
    }
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("authToken", data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  };

  const isSubscribed = user?.subscriptionActive === true;

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isSubscribed,
    isLoggedIn: !!user,
    authAvailable, // false = backend not deployed, MemberGate allows access
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
