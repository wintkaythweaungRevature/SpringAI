'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ProGate({ featureName = 'this feature', children }) {
  const { user, apiBase, token } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      return;
    }
    fetch(`${apiBase}/api/subscription/current`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setPlan(d?.plan))
      .catch(() => setPlan(null))
      .finally(() => setLoading(false));
  }, [user, apiBase, token]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading...</div>;
  if (plan === 'STARTER') {
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{ color: '#1e293b', marginBottom: 8, fontSize: 22 }}>{featureName} requires Pro</h2>
        <p style={{ color: '#64748b', marginBottom: 28, lineHeight: 1.6 }}>
          Your Starter plan does not include <strong>{featureName}</strong>. Upgrade to Pro to unlock
          Messages, Auto Reply, Trends, Social AI, EchoScribe and more.
        </p>
        <button
          style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 32px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
          onClick={() => {
            if (typeof window !== 'undefined') window.location.href = '/pricing';
          }}
        >
          Upgrade to Pro - $39/mo
        </button>
      </div>
    );
  }
  return children;
}
