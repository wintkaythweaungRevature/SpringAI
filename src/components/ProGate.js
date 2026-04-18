import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Blocks STARTER plan users from Pro-only features.
 * Must be nested inside MemberGate (user is already logged in + subscribed).
 * Shows Pro + Growth upgrade cards for Starter users.
 */
export default function ProGate({ featureName = 'this feature', children }) {
  const { user, apiBase, authHeaders, activeWorkspaceId } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-fetch plan whenever the active workspace changes — a free-tier member viewing
  // a workspace whose owner has Pro/Growth should inherit that plan inside the workspace.
  // authHeaders() already sends X-Workspace-Id; backend /api/subscription/current reads it.
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    fetch(`${apiBase}/api/subscription/current`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setPlan(d?.plan?.toUpperCase()))
      .catch(() => setPlan(null))
      .finally(() => setLoading(false));
  }, [user, activeWorkspaceId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: 14 }}>
      Loading...
    </div>
  );

  // STARTER plan → show Pro + Growth upgrade
  if (plan === 'STARTER') {
    return <UpgradeWall featureName={featureName} currentPlan="STARTER" />;
  }

  return children;
}

// ── Shared upgrade wall component ────────────────────────────────────────────
export function UpgradeWall({ featureName, currentPlan }) {
  const navigate = () => window.dispatchEvent(new CustomEvent('wintaibot:go', { detail: 'pricing' }));

  const plans = [
    {
      name: 'Pro',
      price: '$39',
      badge: '⭐ Most Popular',
      badgeColor: '#6366f1',
      gradient: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
      features: [
        '5 social platforms',
        'Unlimited videos & images',
        'Deep Analytics & Trends',
        'Social AI Chat',
        'Messages & Auto Reply',
        'Growth Planner',
        'EchoScribe transcription',
      ],
      cta: 'Upgrade to Pro',
      plan: 'PRO',
    },
    {
      name: 'Growth',
      price: '$79',
      badge: '🚀 Best Value',
      badgeColor: '#f59e0b',
      gradient: 'linear-gradient(135deg,#d97706,#b45309)',
      features: [
        'Everything in Pro',
        'Unlimited AI-generated images',
        'Priority processing',
        'Video trimming tool',
        'Priority support',
        'Fastest response times',
        'Early access to new features',
      ],
      cta: 'Upgrade to Growth',
      plan: 'GROWTH',
    },
  ];

  return (
    <div style={{
      minHeight: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(180deg,#0c1222 0%,#0f172a 100%)',
      padding: '40px 20px',
    }}>
      {/* Lock icon + title */}
      <div style={{
        width: 56, height: 56, borderRadius: 16, marginBottom: 16,
        background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
      }}>🔒</div>

      <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 800, margin: '0 0 8px', textAlign: 'center' }}>
        Unlock <span style={{ color: '#818cf8' }}>{featureName}</span>
      </h2>
      <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 32px', textAlign: 'center', maxWidth: 380, lineHeight: 1.6 }}>
        {currentPlan === 'STARTER'
          ? 'Your Starter plan doesn\'t include this feature. Upgrade to Pro or Growth to continue.'
          : 'This feature requires the Growth plan. Upgrade to unlock everything.'}
      </p>

      {/* Plan cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: 620, marginBottom: 24 }}>
        {(currentPlan === 'STARTER' ? plans : plans.slice(1)).map(p => (
          <div key={p.name} style={{
            flex: '1 1 260px', maxWidth: 290,
            background: '#111827', borderRadius: 18,
            border: '1px solid #1e293b', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Card header */}
            <div style={{ background: p.gradient, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{p.name}</span>
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                  background: 'rgba(255,255,255,0.2)', color: '#fff',
                }}>{p.badge}</span>
              </div>
              <div style={{ color: '#fff' }}>
                <span style={{ fontSize: 30, fontWeight: 800 }}>{p.price}</span>
                <span style={{ fontSize: 13, opacity: 0.8 }}>/mo</span>
              </div>
            </div>

            {/* Features */}
            <div style={{ padding: '16px 20px', flex: 1 }}>
              {p.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <span style={{ color: '#10b981', fontSize: 14, marginTop: 1, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ padding: '0 20px 20px' }}>
              <button onClick={navigate} style={{
                width: '100%', padding: '11px', border: 'none', borderRadius: 10,
                background: p.gradient, color: '#fff',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}>{p.cta} →</button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={navigate} style={{
        background: 'none', border: '1px solid #334155', borderRadius: 8,
        color: '#64748b', padding: '8px 20px', cursor: 'pointer', fontSize: 13,
      }}>View full pricing comparison</button>
    </div>
  );
}
