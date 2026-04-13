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

/** Paid tiers from API / Stripe; must match header plan badges (MEMBER = legacy single paid tier). */
const PAID_MEMBERSHIP_TYPES = new Set(["MEMBER", "STARTER", "PRO", "GROWTH"]);

function isPaidMembershipType(mt) {
  return !!(mt && PAID_MEMBERSHIP_TYPES.has(mt));
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(true);
  const [authAvailable, setAuthAvailable] = useState(true);
  const [team, setTeam] = useState(null);

  // ── Organization / Workspace state ──────────────────────────────────────
  const [activeOrg, setActiveOrg] = useState(null);
  const [userWorkspaces, setUserWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [workspacePermissions, setWorkspacePermissions] = useState(null);
  const [isOrgOwner, setIsOrgOwner] = useState(false);

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
        .then((data) => {
          if (data) {
            setUser({ ...data, emailVerified: data.emailVerified ?? true });
            fetchOrg(token);
            fetchWorkspaces(token);
          }
        })
        .catch(() => {
          localStorage.removeItem("authToken");
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      // No session: do not call /api/auth/me — a probe with a fake token always gets 401 and
      // clutters DevTools ("Failed to load resource"). authAvailable stays true; 404 is still
      // handled when restoring a real token or after login.
      setLoading(false);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

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
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Team API methods ───────────────────────────────────── */
  const fetchTeam = async () => {
    if (!token || isOwnerToken(token)) return null;
    try {
      const res = await fetch(`${API_BASE}/api/team`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404 || res.status === 204) { setTeam(null); return null; }
      if (!res.ok) return null;
      const data = await res.json().catch(() => ({}));
      const t = data?.team ?? data ?? null;
      setTeam(t);
      return t;
    } catch {
      return null;
    }
  };

  const createTeam = async (name) => {
    const res = await fetch(`${API_BASE}/api/team`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Failed to create team");
    const t = data?.team ?? data;
    setTeam(t);
    return t;
  };

  const inviteMember = async (email) => {
    const res = await fetch(`${API_BASE}/api/team/invite`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Invite failed");
    return data;
  };

  const removeMember = async (userId) => {
    const res = await fetch(`${API_BASE}/api/team/members/${encodeURIComponent(userId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.message || "Remove failed");
    }
  };

  const leaveTeam = async () => {
    const res = await fetch(`${API_BASE}/api/team/leave`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.message || "Failed to leave team");
    }
    setTeam(null);
  };

  // Derive isOrgOwner whenever user or activeOrg changes
  useEffect(() => {
    if (!activeOrg || !user) { setIsOrgOwner(false); return; }
    setIsOrgOwner(String(activeOrg.ownerId) === String(user.id));
  }, [activeOrg, user]);

  /* ── Organization / Workspace API methods ──────────────────────────────── */

  const fetchOrg = async (tok) => {
    const t = tok || token;
    if (!t || isOwnerToken(t)) return null;
    try {
      const res = await fetch(`${API_BASE}/api/org`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.status === 204 || res.status === 404) { setActiveOrg(null); setIsOrgOwner(false); return null; }
      if (!res.ok) return null;
      const data = await res.json().catch(() => null);
      if (!data) return null;
      setActiveOrg(data);
      return data;
    } catch { return null; }
  };

  const fetchWorkspaces = async (tok) => {
    const t = tok || token;
    if (!t || isOwnerToken(t)) return [];
    try {
      const res = await fetch(`${API_BASE}/api/workspace`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) return [];
      const data = await res.json().catch(() => []);
      const list = Array.isArray(data) ? data : [];
      setUserWorkspaces(list);
      // Restore last active workspace from localStorage
      const savedId = localStorage.getItem("wint_active_workspace");
      const savedWs = savedId ? list.find((w) => String(w.id) === savedId) : null;
      const defaultWs = savedWs || list[0] || null;
      if (defaultWs) {
        setActiveWorkspaceId(defaultWs.id);
        localStorage.setItem("wint_active_workspace", String(defaultWs.id));
      }
      return list;
    } catch { return []; }
  };

  const switchWorkspace = async (wsId) => {
    setActiveWorkspaceId(wsId);
    localStorage.setItem("wint_active_workspace", String(wsId));
    // Fetch own permissions in this workspace
    if (!token || isOwnerToken(token)) { setWorkspacePermissions(null); return; }
    try {
      const res = await fetch(`${API_BASE}/api/workspace/${wsId}/my-permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const perms = await res.json().catch(() => null);
        setWorkspacePermissions(perms);
      }
    } catch { setWorkspacePermissions(null); }
  };

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
        body: JSON.stringify({ email: trimmedIdentifier, password: trimmedPassword }),
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
      id: data.userId ?? data.id,
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
    // Load org + workspaces after login
    fetchOrg(newToken);
    fetchWorkspaces(newToken);
    return data;
  };

  const signup = async (email, password, firstName, lastName, username) => {
    let res;
    try {
      res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName: firstName || "",
          lastName: lastName || "",
          ...(username ? { username } : {}),
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
      if (res.status === 503 && /verification email/i.test(msg)) {
        msg = `${msg} If this keeps happening, please contact support.`;
      }
      throw new Error(msg);
    }
    const data = await res.json();
    const newToken = data.token || data.accessToken;
    if (newToken) {
      localStorage.setItem("authToken", newToken);
      setToken(newToken);
      setUser(data.user || {
        id: data.userId ?? data.id,
        email: data.email,
        membershipType: data.membershipType || "FREE",
        emailVerified: data.emailVerified ?? true,
      });
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("wint_active_workspace");
    setToken(null);
    setUser(null);
    setActiveOrg(null);
    setUserWorkspaces([]);
    setActiveWorkspaceId(null);
    setWorkspacePermissions(null);
    setIsOrgOwner(false);
  };

  const checkoutSubscription = async () => {
    const res = await fetch(`${API_BASE}/api/subscription/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ plan: "STARTER", billingInterval: "MONTHLY" }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Checkout failed");
    if (data.updated) {
      await refetchUser();
      return;
    }
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

  const resendVerification = async (email) => {
    const res = await fetch(`${API_BASE}/api/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Resend failed");
  };

  const activeWorkspace = userWorkspaces.find((w) => w.id === activeWorkspaceId) || null;

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
    resendVerification,
    checkoutSubscription,
    openBillingPortal,
    cancelSubscription,
    reactivateSubscription,
    deactivateAccount,
    reactivateAccount,
    // Team
    team,
    fetchTeam,
    createTeam,
    inviteMember,
    removeMember,
    leaveTeam,
    // Organization / Workspace
    activeOrg,
    fetchOrg,
    userWorkspaces,
    fetchWorkspaces,
    activeWorkspaceId,
    activeWorkspace,
    workspacePermissions,
    isOrgOwner,
    switchWorkspace,
    isSubscribed: isPaidMembershipType(user?.membershipType),
    isLoggedIn: !!user,
    emailVerified: user?.emailVerified ?? true,
    authAvailable,
    apiBase: API_BASE,
    authHeaders: () => {
      const headers = { Authorization: `Bearer ${token}` };
      if (activeWorkspaceId) headers["X-Workspace-Id"] = String(activeWorkspaceId);
      return headers;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/**
 * Returns true if the current user has access to the given workspace permission key.
 * Solo users (no org) always get full access.
 * Org owners and admins always get full access.
 * Regular members are gated by their workspace permissions JSON.
 */
export function useWorkspacePermission(permKey) {
  const { workspacePermissions, activeOrg } = useAuth();
  if (!activeOrg) return true;           // solo user — no org, full access
  if (!workspacePermissions) return true; // owner / admin / pre-load
  return workspacePermissions[permKey] === true;
}
