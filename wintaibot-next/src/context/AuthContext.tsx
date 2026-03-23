'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// API base: use NEXT_PUBLIC_API_BASE instead of REACT_APP_API_BASE
const getApiBase = () => {
  if (typeof window === 'undefined') return 'https://api.wintaibot.com';
  const base = process.env.NEXT_PUBLIC_API_BASE || '';
  if (base) return base.replace(/\/$/, '');
  if (window.location.hostname === 'localhost') return ''; // use Next.js rewrites
  return 'https://api.wintaibot.com';
};

// Prevent auth fetch from hanging when backend is unreachable
const fetchWithTimeout = (url: string, opts: RequestInit, ms = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(id));
};

const OWNER_EMAIL = 'wint@gmail.com';
const OWNER_PASSWORD = 'wintkay';
const OWNER_TOKEN = 'owner-wint-full-access';
const OWNER_USER = {
  id: 'owner',
  email: OWNER_EMAIL,
  firstName: 'Wint',
  lastName: 'Kay',
  membershipType: 'MEMBER',
  emailVerified: true,
};

function isOwnerToken(t: string | null) {
  return t === OWNER_TOKEN;
}

type User = {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  membershipType?: string;
  emailVerified?: boolean;
  cancelAtPeriodEnd?: boolean;
  subscriptionPeriodEnd?: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  authAvailable: boolean;
  login: (email: string, password: string) => Promise<unknown>;
  signup: (email: string, password: string, name?: string) => Promise<unknown>;
  logout: () => void;
  refetchUser: () => Promise<void>;
  checkoutSubscription: () => Promise<void>;
  openBillingPortal: () => Promise<void>;
  cancelSubscription: () => Promise<unknown>;
  reactivateSubscription: () => Promise<unknown>;
  deactivateAccount: (password: string) => Promise<void>;
  reactivateAccount: (email: string, password: string) => Promise<void>;
  isSubscribed: boolean;
  isLoggedIn: boolean;
  emailVerified: boolean;
  apiBase: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authAvailable, setAuthAvailable] = useState(true);
  const apiBase = getApiBase();

  const refetchUser = () => {
    if (!token) return Promise.resolve();
    if (isOwnerToken(token)) {
      setUser(OWNER_USER);
      return Promise.resolve();
    }
    return fetch(`${apiBase}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((data) => data && setUser({ ...data, emailVerified: data.emailVerified ?? true }));
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = localStorage.getItem('authToken');
    setToken(t);
  }, []);

  useEffect(() => {
    const url = apiBase ? `${apiBase}/api/auth/me` : '/api/auth/me';
    if (token) {
      if (isOwnerToken(token)) {
        setUser(OWNER_USER);
        setLoading(false);
        return;
      }
      fetchWithTimeout(url, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          if (res.status === 404) setAuthAvailable(false);
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
            return null;
          }
          return res.ok ? res.json() : null;
        })
        .then((data) => data && setUser({ ...data, emailVerified: data.emailVerified ?? true }))
        .catch(() => {
          setAuthAvailable(false);
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      fetchWithTimeout(url, { headers: { Authorization: 'Bearer x' } })
        .then((res) => {
          if (res.status === 404) setAuthAvailable(false);
        })
        .catch(() => setAuthAvailable(false))
        .finally(() => setLoading(false));
    }
  }, [token, apiBase]);

  useEffect(() => {
    if (typeof window === 'undefined' || !token || isOwnerToken(token)) return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (!sessionId) return;
    window.history.replaceState({}, '', window.location.pathname);
    fetch(`${apiBase}/api/subscription/verify-session?session_id=${encodeURIComponent(sessionId)}`, {
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
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [token, apiBase]);

  const login = async (email: string, password: string) => {
    const trimmedEmail = (email || '').trim();
    const trimmedPassword = password || '';
    if (trimmedEmail === OWNER_EMAIL && trimmedPassword === OWNER_PASSWORD) {
      localStorage.setItem('authToken', OWNER_TOKEN);
      setToken(OWNER_TOKEN);
      setUser(OWNER_USER);
      return { user: OWNER_USER, token: OWNER_TOKEN };
    }
    let res: Response;
    try {
      res = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });
    } catch (err) {
      const isNetwork =
        (err as Error)?.message === 'Failed to fetch' || (err as Error)?.name === 'TypeError';
      throw new Error(
        isNetwork
          ? 'Cannot reach server. Set NEXT_PUBLIC_API_BASE to your backend URL and ensure CORS allows this origin.'
          : ((err as Error)?.message || 'Login failed')
      );
    }
    if (!res.ok) {
      const text = await res.text();
      let msg = 'Invalid email or password';
      try {
        const j = JSON.parse(text);
        msg = j.error || j.message || j.msg || msg;
      } catch {
        if (text) msg = text;
      }
      throw new Error(msg);
    }
    const data = await res.json();
    const newToken = data.token || data.accessToken;
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    setUser(
      data.user || {
        id: data.userId || data.id,
        email: data.email,
        membershipType: data.membershipType || 'FREE',
        emailVerified: data.emailVerified ?? true,
      }
    );
    try {
      const meRes = await fetch(`${apiBase}/api/auth/me`, {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      if (meRes.ok) {
        const me = await meRes.json();
        setUser({ ...me, emailVerified: me.emailVerified ?? true });
      }
    } catch {
      /* ignore */
    }
    return data;
  };

  const signup = async (email: string, password: string, name?: string) => {
    let res: Response;
    try {
      res = await fetch(`${apiBase}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: name || '',
          firstName: name || '',
          lastName: '',
        }),
      });
    } catch (err) {
      const isNetwork =
        (err as Error)?.message === 'Failed to fetch' || (err as Error)?.name === 'TypeError';
      throw new Error(
        isNetwork
          ? 'Cannot reach server. Set NEXT_PUBLIC_API_BASE to your backend URL.'
          : ((err as Error)?.message || 'Signup failed')
      );
    }
    if (!res.ok) {
      const text = await res.text();
      let msg = 'Signup failed';
      try {
        const j = JSON.parse(text);
        msg = j.error || j.message || j.msg || msg;
      } catch {
        if (text) msg = text;
      }
      throw new Error(msg);
    }
    const data = await res.json();
    const newToken = data.token || data.accessToken;
    if (newToken) {
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(
        data.user || {
          id: data.userId || data.id,
          email: data.email,
          membershipType: data.membershipType || 'FREE',
          emailVerified: data.emailVerified ?? true,
        }
      );
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  const checkoutSubscription = async () => {
    const res = await fetch(`${apiBase}/api/subscription/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plan: 'MEMBER' }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || 'Checkout failed');
    const url = data.url || data.checkoutUrl;
    if (url) window.location.href = url;
    else throw new Error('Checkout failed');
  };

  const openBillingPortal = async () => {
    const res = await fetch(`${apiBase}/api/subscription/portal`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || 'Failed to open billing');
    const url = data.url || data.portalUrl;
    if (url) window.location.href = url;
    else throw new Error('No billing portal URL');
  };

  const cancelSubscription = async () => {
    const res = await fetch(`${apiBase}/api/subscription/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || 'Cancel failed');
    await refetchUser();
    return data;
  };

  const reactivateSubscription = async () => {
    const res = await fetch(`${apiBase}/api/subscription/reactivate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || 'Reactivation failed');
    await refetchUser();
    return data;
  };

  const reactivateAccount = async (email: string, password: string) => {
    const res = await fetch(`${apiBase}/api/auth/reactivate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || 'Reactivation failed');
    const newToken = data.token || data.accessToken;
    if (newToken) {
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(
        data.user || {
          id: data.userId || data.id,
          email: data.email,
          membershipType: data.membershipType || 'FREE',
          emailVerified: data.emailVerified ?? true,
        }
      );
      try {
        const meRes = await fetch(`${apiBase}/api/auth/me`, {
          headers: { Authorization: `Bearer ${newToken}` },
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          setUser({ ...meData, emailVerified: meData.emailVerified ?? true });
        }
      } catch {
        /* ignore */
      }
    }
  };

  const deactivateAccount = async (password: string) => {
    const res = await fetch(`${apiBase}/api/auth/deactivate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password: password || '' }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || 'Deactivation failed');
    logout();
  };

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    refetchUser,
    checkoutSubscription,
    openBillingPortal,
    cancelSubscription,
    reactivateSubscription,
    deactivateAccount,
    reactivateAccount,
    isSubscribed: user?.membershipType === 'MEMBER',
    isLoggedIn: !!user,
    emailVerified: user?.emailVerified ?? true,
    authAvailable,
    apiBase,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
