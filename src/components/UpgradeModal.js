import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * UpgradeModal — shown when a user hits a plan limit.
 *
 * Props:
 *   reason    {string}  — e.g. "You've used 10/10 videos this month."
 *   feature   {string}  — e.g. "Deep Analytics" (optional label for gated features)
 *   onClose   {fn}      — called when user dismisses
 *   suggestPlan {string} — 'PRO' | 'GROWTH' (optional; auto-selects a plan card)
 */
export default function UpgradeModal({ reason, feature, onClose, suggestPlan }) {
  const { apiBase, authHeaders, user, refetchUser, isSubscribed } = useAuth();
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [starterTrialEligible, setStarterTrialEligible] = useState(null);

  const showStarterTrialCopy = !isSubscribed && starterTrialEligible !== false;

  useEffect(() => {
    if (!user) return;
    fetch(`${apiBase}/api/subscription/current`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        if (typeof d?.starterTrialEligible === 'boolean') {
          setStarterTrialEligible(d.starterTrialEligible);
        }
      })
      .catch(() => {});
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const plans = [
    {
      id: 'STARTER', name: 'Starter', monthlyPrice: 19, yearlyPrice: 15, color: '#6366f1',
      highlight: ['5 platforms', '10 videos/mo', 'AI Captions', 'Thumbnail Picker', 'Link-in-Bio'],
    },
    {
      id: 'PRO', name: 'Pro', monthlyPrice: 39, yearlyPrice: 32, color: '#8b5cf6',
      badge: 'Popular',
      highlight: ['8 platforms', '30 videos/mo', 'Deep Analytics', 'Social AI Chat', 'Unlimited schedule'],
    },
    {
      id: 'GROWTH', name: 'Growth', monthlyPrice: 79, yearlyPrice: 66, color: '#0ea5e9',
      highlight: ['8 platforms', 'Unlimited videos', 'Priority processing', 'Video trimming', 'All features'],
    },
  ];

  const handleUpgrade = async (planId) => {
    if (!user) { setError('Please log in first.'); return; }
    setLoading(planId);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${apiBase}/api/subscription/checkout`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, billingInterval: yearly ? 'YEARLY' : 'MONTHLY' }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Checkout failed.'); setLoading(null); return; }
      if (data.updated) {
        setSuccessMsg(data.message || 'Subscription updated.');
        if (typeof refetchUser === 'function') refetchUser();
        setLoading(null);
        return;
      }
      const url = data.url || data.checkoutUrl;
      if (url) window.location.href = url;
      else { setError('No checkout URL returned.'); setLoading(null); }
    } catch {
      setError('Network error. Try again.');
      setLoading(null);
    }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>

        <button style={s.closeBtn} onClick={onClose} aria-label="Close">✕</button>

        {/* Icon + title */}
        <div style={s.iconRing}>🔒</div>
        <h2 style={s.title}>
          {feature ? `Unlock ${feature}` : 'Upgrade Your Plan'}
        </h2>

        {reason && <p style={s.reason}>{reason}</p>}

        <div style={s.billingWrap}>
          <p style={s.billingTitle}>Billing cycle</p>
          <div style={s.segmentRow} role="group" aria-label="Choose monthly or yearly billing">
            <button
              type="button"
              style={s.segmentBtn(!yearly)}
              onClick={() => setYearly(false)}
              aria-pressed={!yearly}
            >
              <span style={s.segmentMain}>Monthly</span>
              <span style={s.segmentSub}>Pay each month</span>
            </button>
            <button
              type="button"
              style={s.segmentBtn(yearly)}
              onClick={() => setYearly(true)}
              aria-pressed={yearly}
            >
              <span style={s.segmentMain}>
                Yearly <span style={s.savePill}>Save ~20%</span>
              </span>
              <span style={s.segmentSub}>One payment per year</span>
            </button>
          </div>
        </div>

        {successMsg && <div style={s.okBox}>{successMsg}</div>}
        {error && <div style={s.errBox}>{error}</div>}

        {/* Plan cards */}
        <div style={s.cards}>
          {plans.map(plan => {
            const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
            const isSuggested = suggestPlan === plan.id || (!suggestPlan && plan.id === 'PRO');
            return (
              <div key={plan.id} style={{
                ...s.card,
                border: isSuggested ? `2px solid ${plan.color}` : '1.5px solid #e2e8f0',
                boxShadow: isSuggested ? `0 4px 20px ${plan.color}28` : 'none',
              }}>
                {plan.badge && (
                  <div style={{ ...s.cardBadge, background: plan.color }}>{plan.badge}</div>
                )}
                <div style={s.planNameRow}>
                  <span style={{ ...s.planDot, background: plan.color }} />
                  <span style={s.planName}>{plan.name}</span>
                </div>
                <div style={s.priceRow}>
                  <span style={s.dollar}>$</span>
                  <span style={s.price}>{price}</span>
                  <span style={s.per}>/mo</span>
                </div>
                {yearly ? (
                  <div style={s.yearlyHint}>
                    Billed annually (${(plan.yearlyPrice * 12).toLocaleString()}/yr)
                  </div>
                ) : (
                  <div style={s.monthlyHint}>Billed monthly</div>
                )}
                <ul style={s.feats}>
                  {plan.highlight.map(f => (
                    <li key={f} style={s.feat}><span style={s.checkmark}>✓</span>{f}</li>
                  ))}
                </ul>
                <button
                  style={{ ...s.ctaBtn, background: plan.color, opacity: loading === plan.id ? 0.7 : 1 }}
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading === plan.id}
                >
                  {loading === plan.id
                    ? '...'
                    : plan.id === 'STARTER' && showStarterTrialCopy
                      ? (yearly ? 'Start trial — yearly' : 'Start Free Trial')
                      : (yearly ? `Get ${plan.name} — yearly` : `Get ${plan.name} — monthly`)}
                </button>
              </div>
            );
          })}
        </div>

        <p style={s.footNote}>
          {showStarterTrialCopy
            ? 'Starter includes 7-day free trial · Cancel anytime · Secured by Stripe'
            : 'Billed through Stripe · Cancel anytime · Secured by Stripe'}
        </p>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
  },
  modal: {
    background: '#fff', borderRadius: 20, padding: '36px 28px 28px',
    maxWidth: 860, width: '100%', maxHeight: '90vh', overflowY: 'auto',
    position: 'relative', boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
    textAlign: 'center',
  },
  closeBtn: {
    position: 'absolute', top: 14, right: 14, background: '#f1f5f9',
    border: 'none', borderRadius: 8, padding: '4px 10px', cursor: 'pointer',
    fontSize: 15, color: '#64748b',
  },
  iconRing: {
    width: 56, height: 56, borderRadius: '50%', background: '#f1f5f9',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 26, margin: '0 auto 12px',
  },
  title: { margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#1e293b' },
  reason: { color: '#64748b', fontSize: 14, margin: '0 0 16px' },
  billingWrap: {
    marginBottom: 20,
    padding: '14px 16px',
    background: '#f8fafc',
    borderRadius: 16,
    border: '1px solid #e2e8f0',
    textAlign: 'center',
  },
  billingTitle: {
    margin: '0 0 10px',
    fontSize: 11,
    fontWeight: 800,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  segmentRow: { display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
  segmentBtn: (active) => ({
    flex: '1 1 140px',
    maxWidth: 260,
    padding: '10px 12px',
    borderRadius: 12,
    border: active ? '2px solid #6366f1' : '1px solid #cbd5e1',
    background: active ? '#fff' : '#f1f5f9',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: active ? '0 3px 12px rgba(99,102,241,0.18)' : 'none',
  }),
  segmentMain: {
    display: 'block',
    fontSize: 15,
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: 3,
  },
  segmentSub: { display: 'block', fontSize: 11, fontWeight: 500, color: '#64748b', lineHeight: 1.35 },
  savePill: {
    background: '#dcfce7', color: '#16a34a', fontSize: 10, fontWeight: 700,
    padding: '2px 6px', borderRadius: 99, marginLeft: 4,
  },
  yearlyHint: { fontSize: 11, color: '#16a34a', fontWeight: 600, marginBottom: 8, marginTop: -4 },
  monthlyHint: { fontSize: 11, color: '#64748b', fontWeight: 500, marginBottom: 8, marginTop: -4 },
  errBox: {
    background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626',
    borderRadius: 8, padding: '8px 12px', marginBottom: 16, fontSize: 13,
  },
  okBox: {
    background: '#f0fdf4', border: '1px solid #86efac', color: '#166534',
    borderRadius: 8, padding: '8px 12px', marginBottom: 16, fontSize: 13,
  },
  cards: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 14, marginBottom: 20,
  },
  card: {
    borderRadius: 14, padding: '20px 16px', background: '#fff',
    position: 'relative', textAlign: 'left',
  },
  cardBadge: {
    position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
    color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 99,
  },
  planNameRow: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 },
  planDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  planName: { fontWeight: 700, fontSize: 15, color: '#1e293b' },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: 1, marginBottom: 10 },
  dollar: { fontSize: 14, fontWeight: 600, color: '#334155' },
  price: { fontSize: 30, fontWeight: 800, color: '#0f172a', lineHeight: 1 },
  per: { fontSize: 12, color: '#94a3b8', marginLeft: 2 },
  feats: { listStyle: 'none', padding: 0, margin: '0 0 14px' },
  feat: { fontSize: 12.5, color: '#334155', padding: '2px 0', display: 'flex', alignItems: 'center', gap: 6 },
  checkmark: { color: '#22c55e', fontWeight: 700, flexShrink: 0 },
  ctaBtn: {
    width: '100%', border: 'none', borderRadius: 8, padding: '10px',
    color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
  },
  footNote: { fontSize: 12, color: '#94a3b8', margin: 0 },
};
