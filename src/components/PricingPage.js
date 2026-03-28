import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/* ─── Plan Data ──────────────────────────────────────────────────────── */
const PLANS = [
  {
    id: 'STARTER',
    name: 'Starter',
    monthlyPrice: 19,
    yearlyPrice: 15,   // per month when billed yearly ($180/yr)
    yearlyTotal: 180,
    color: '#6366f1',
    badge: null,
    features: [
      '3 social platforms',
      '100 videos / month',
      '1,000 images / month',
      '30 scheduled posts / month',
      'AI Captions & Hashtags',
      'Thumbnail AI Picker',
      'Link-in-Bio page',
      '1 team seat',
    ],
    missing: ['Deep Analytics', 'Social AI Chat', 'Priority processing'],
  },
  {
    id: 'PRO',
    name: 'Pro',
    monthlyPrice: 39,
    yearlyPrice: 32,
    yearlyTotal: 384,
    color: '#8b5cf6',
    badge: 'Most Popular',
    features: [
      'All 8 social platforms',
      'Unlimited videos',
      'Unlimited images',
      'Unlimited scheduled posts',
      'AI Captions & Hashtags',
      'Thumbnail AI Picker',
      'Link-in-Bio page',
      'Deep Analytics & Trends',
      'Social AI Chat',
      '1 team seat',
    ],
    missing: ['Priority processing', '3 team seats'],
  },
  {
    id: 'GROWTH',
    name: 'Growth',
    monthlyPrice: 79,
    yearlyPrice: 66,
    yearlyTotal: 792,
    color: '#0ea5e9',
    badge: 'Best Value',
    features: [
      'All 8 social platforms',
      'Unlimited videos',
      'Unlimited images',
      'Unlimited scheduled posts',
      'AI Captions & Hashtags',
      'Thumbnail AI Picker',
      'Link-in-Bio page',
      'Deep Analytics & Trends',
      'Social AI Chat',
      'Priority processing',
      '3 team seats',
    ],
    missing: [],
  },
];

/* ─── PricingPage ────────────────────────────────────────────────────── */
export default function PricingPage({ onClose }) {
  const { apiBase, authHeaders, user } = useAuth();
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(null); // plan ID being processed
  const [currentPlan, setCurrentPlan] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    fetch(`${apiBase}/api/subscription/current`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setCurrentPlan(d?.plan))
      .catch(() => {});
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubscribe = async (planId) => {
    if (!user) { setError('Please log in first.'); return; }
    setLoading(planId);
    setError('');
    try {
      const res = await fetch(`${apiBase}/api/subscription/checkout`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, billingInterval: yearly ? 'YEARLY' : 'MONTHLY' }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Checkout failed.'); return; }
      window.location.href = data.url;
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const isCurrentPlan = (planId) => currentPlan === planId;

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h2 style={s.title}>Choose Your Plan</h2>
            <p style={s.subtitle}>Upgrade anytime. Cancel anytime.</p>
          </div>
          {onClose && (
            <button style={s.closeBtn} onClick={onClose} aria-label="Close">✕</button>
          )}
        </div>

        {/* Billing toggle */}
        <div style={s.toggleRow}>
          <span style={{ ...s.toggleLabel, opacity: yearly ? 0.5 : 1 }}>Monthly</span>
          <button
            style={{ ...s.toggle, background: yearly ? '#6366f1' : '#e2e8f0' }}
            onClick={() => setYearly(!yearly)}
            aria-label="Toggle billing period"
          >
            <div style={{ ...s.toggleThumb, transform: yearly ? 'translateX(22px)' : 'translateX(2px)' }} />
          </button>
          <span style={{ ...s.toggleLabel, opacity: yearly ? 1 : 0.5 }}>
            Yearly <span style={s.saveBadge}>Save ~20%</span>
          </span>
        </div>

        {error && <div style={s.errorBanner}>{error}</div>}

        {/* Plan cards */}
        <div style={s.cardsRow}>
          {PLANS.map(plan => {
            const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
            const isCurrent = isCurrentPlan(plan.id);
            const isPro = plan.id === 'PRO';
            return (
              <div key={plan.id} style={{
                ...s.card,
                border: isPro ? `2px solid ${plan.color}` : '1.5px solid #e2e8f0',
                boxShadow: isPro ? `0 4px 24px ${plan.color}33` : '0 1px 6px rgba(0,0,0,0.07)',
              }}>
                {plan.badge && (
                  <div style={{ ...s.planBadge, background: plan.color }}>{plan.badge}</div>
                )}

                <div style={{ ...s.planIcon, background: plan.color + '18', color: plan.color }}>
                  {plan.id === 'STARTER' ? '🚀' : plan.id === 'PRO' ? '⚡' : '🔥'}
                </div>

                <h3 style={s.planName}>{plan.name}</h3>

                <div style={s.priceRow}>
                  <span style={s.priceDollar}>$</span>
                  <span style={s.priceNumber}>{price}</span>
                  <span style={s.pricePer}>/mo</span>
                </div>

                {yearly && (
                  <div style={s.yearlyNote}>
                    ${plan.yearlyTotal}/year · saves ${(plan.monthlyPrice - plan.yearlyPrice) * 12}/yr
                  </div>
                )}

                {/* Features */}
                <ul style={s.featureList}>
                  {plan.features.map(f => (
                    <li key={f} style={s.featureItem}>
                      <span style={{ color: '#22c55e', marginRight: 8 }}>✓</span>{f}
                    </li>
                  ))}
                  {plan.missing.map(f => (
                    <li key={f} style={{ ...s.featureItem, opacity: 0.35, textDecoration: 'line-through' }}>
                      <span style={{ marginRight: 8 }}>✗</span>{f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button style={{ ...s.ctaBtn, background: '#e2e8f0', color: '#64748b', cursor: 'default' }} disabled>
                    Current Plan
                  </button>
                ) : (
                  <button
                    style={{ ...s.ctaBtn, background: plan.color, opacity: loading === plan.id ? 0.7 : 1 }}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id}
                  >
                    {loading === plan.id ? 'Redirecting...' : `Get ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p style={s.footer}>
          Upgrade anytime. Cancel anytime. Powered by <strong>Stripe</strong> — your payment info is never stored on our servers.
        </p>
      </div>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────── */
const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px', overflowY: 'auto',
  },
  modal: {
    background: '#fff', borderRadius: 20, padding: '32px',
    maxWidth: 960, width: '100%', maxHeight: '92vh', overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: { margin: 0, fontSize: 28, fontWeight: 700, color: '#1e293b' },
  subtitle: { margin: '4px 0 0', color: '#64748b', fontSize: 15 },
  closeBtn: {
    background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 12px',
    cursor: 'pointer', fontSize: 16, color: '#64748b',
  },
  toggleRow: {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, justifyContent: 'center',
  },
  toggleLabel: { fontSize: 14, fontWeight: 500, color: '#334155' },
  toggle: {
    position: 'relative', width: 48, height: 26, borderRadius: 13, border: 'none',
    cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
  },
  toggleThumb: {
    position: 'absolute', top: 3, width: 20, height: 20, borderRadius: '50%',
    background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'transform 0.2s',
  },
  saveBadge: {
    background: '#dcfce7', color: '#16a34a', fontSize: 11, fontWeight: 600,
    padding: '2px 7px', borderRadius: 99, marginLeft: 4,
  },
  errorBanner: {
    background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626',
    borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14,
  },
  cardsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20,
    marginBottom: 24,
  },
  card: {
    borderRadius: 16, padding: '28px 24px', position: 'relative', background: '#fff',
    display: 'flex', flexDirection: 'column', gap: 0,
  },
  planBadge: {
    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
    color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 99,
    whiteSpace: 'nowrap',
  },
  planIcon: {
    width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 20, marginBottom: 12,
  },
  planName: { margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#1e293b' },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 4 },
  priceDollar: { fontSize: 18, fontWeight: 600, color: '#334155' },
  priceNumber: { fontSize: 40, fontWeight: 800, color: '#0f172a', lineHeight: 1 },
  pricePer: { fontSize: 14, color: '#94a3b8', marginLeft: 2 },
  yearlyNote: {
    fontSize: 12, color: '#16a34a', fontWeight: 500, marginBottom: 4,
  },
  featureList: { listStyle: 'none', padding: 0, margin: '16px 0 20px', flex: 1 },
  featureItem: { fontSize: 13.5, color: '#334155', padding: '4px 0', display: 'flex', alignItems: 'center' },
  ctaBtn: {
    width: '100%', border: 'none', borderRadius: 10, padding: '12px',
    color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  footer: {
    textAlign: 'center', fontSize: 13, color: '#94a3b8', margin: 0,
    borderTop: '1px solid #f1f5f9', paddingTop: 16,
  },
};
