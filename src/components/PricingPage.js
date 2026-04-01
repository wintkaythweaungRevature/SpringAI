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
      'Unlimited images to post',
      'Unlimited scheduled posts',
      '100 AI-generated images / month',
      'AI Captions & Hashtags',
      'Deep Analytics & Trends',
      'Social AI Chat',
    ],
    missing: ['Priority processing'],
  },
  {
    id: 'GROWTH',
    name: 'Growth',
    monthlyPrice: 79,
    yearlyPrice: 64,
    yearlyTotal: 768,
    color: '#0ea5e9',
    badge: 'Best Value',
    features: [
      'All 8 social platforms',
      'Unlimited videos to post',
      'Unlimited images to post',
      'Unlimited scheduled posts',
      'Unlimited AI-generated images',
      'AI Captions & Hashtags',
      'Deep Analytics & Trends',
      'Social AI Chat',
      'Priority processing',
      'Video trimming tool',
    ],
    missing: [],
  },
];

/* ─── PricingPage ────────────────────────────────────────────────────── */
export default function PricingPage({ onClose }) {
  const { apiBase, authHeaders, user, refetchUser, isSubscribed } = useAuth();
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(null); // plan ID being processed
  const [currentPlan, setCurrentPlan] = useState(null);
  const [starterTrialEligible, setStarterTrialEligible] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  /** Logged-out: show trial marketing. Logged-in paid: never. Logged-in free: API says who still qualifies. */
  const showStarterTrialCopy =
    !user || (!isSubscribed && starterTrialEligible !== false);

  useEffect(() => {
    if (!user) {
      setStarterTrialEligible(null);
      return;
    }
    fetch(`${apiBase}/api/subscription/current`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        setCurrentPlan(d?.plan);
        if (typeof d?.starterTrialEligible === 'boolean') {
          setStarterTrialEligible(d.starterTrialEligible);
        }
      })
      .catch(() => {});
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshCurrentPlan = () => {
    if (!user) return;
    fetch(`${apiBase}/api/subscription/current`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        setCurrentPlan(d?.plan);
        if (typeof d?.starterTrialEligible === 'boolean') {
          setStarterTrialEligible(d.starterTrialEligible);
        }
      })
      .catch(() => {});
  };

  const handleSubscribe = async (planId) => {
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
      if (!res.ok) { setError(data.error || 'Checkout failed.'); return; }
      if (data.updated) {
        setSuccessMsg(data.message || 'Your subscription was updated.');
        if (typeof refetchUser === 'function') refetchUser();
        refreshCurrentPlan();
        return;
      }
      const url = data.url || data.checkoutUrl;
      if (url) window.location.href = url;
      else setError('No checkout URL returned.');
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
            <p style={s.subtitle}>
              {showStarterTrialCopy
                ? 'Starter includes 7-day free trial · Cancel anytime.'
                : user
                  ? 'Change your plan or billing cycle · Cancel anytime.'
                  : 'Pick a plan that fits you · Cancel anytime.'}
            </p>
          </div>
          {onClose && (
            <button style={s.closeBtn} onClick={onClose} aria-label="Close">✕</button>
          )}
        </div>

        {/* Billing cycle — segmented control (clearer than a small toggle) */}
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
                Yearly <span style={s.saveBadge}>Save ~20%</span>
              </span>
              <span style={s.segmentSub}>One payment per year</span>
            </button>
          </div>
        </div>

        {successMsg && (
          <div style={s.successBanner}>{successMsg}</div>
        )}
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

                {yearly ? (
                  <div style={s.yearlyNote}>
                    ${plan.yearlyTotal}/year total · saves ${(plan.monthlyPrice - plan.yearlyPrice) * 12}/yr vs monthly
                  </div>
                ) : (
                  <div style={s.monthlyNote}>Billed monthly · shown as $/mo</div>
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
                    {loading === plan.id
                      ? 'Redirecting...'
                      : plan.id === 'STARTER' && showStarterTrialCopy
                        ? (yearly ? 'Start trial — yearly' : 'Start 7-Day Free Trial')
                        : (yearly ? `Get ${plan.name} — yearly` : `Get ${plan.name} — monthly`)}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p style={s.footer}>
          {showStarterTrialCopy ? (
            <>7-day free trial · No charge until trial ends · Cancel anytime · Powered by <strong>Stripe</strong></>
          ) : (
            <>Billed through Stripe · Cancel anytime · Powered by <strong>Stripe</strong></>
          )}
        </p>
        <p style={{ ...s.footer, marginTop: 10, fontSize: 13, color: '#64748b', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
          W!ntAi never stores your bank account or card numbers. Payment details are handled only by Stripe.
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
  billingWrap: {
    marginBottom: 28,
    padding: '16px 18px',
    background: '#f8fafc',
    borderRadius: 16,
    border: '1px solid #e2e8f0',
  },
  billingTitle: {
    margin: '0 0 12px',
    fontSize: 12,
    fontWeight: 800,
    color: '#64748b',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  segmentRow: {
    display: 'flex',
    gap: 10,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  segmentBtn: (active) => ({
    flex: '1 1 160px',
    maxWidth: 280,
    padding: '12px 14px',
    borderRadius: 14,
    border: active ? '2px solid #6366f1' : '1px solid #cbd5e1',
    background: active ? '#fff' : '#f1f5f9',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'center',
    boxShadow: active ? '0 4px 14px rgba(99,102,241,0.2)' : 'none',
    transition: 'border 0.15s, box-shadow 0.15s, background 0.15s',
  }),
  segmentMain: {
    display: 'block',
    fontSize: 16,
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: 4,
  },
  segmentSub: {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    color: '#64748b',
    lineHeight: 1.35,
  },
  saveBadge: {
    background: '#dcfce7', color: '#16a34a', fontSize: 11, fontWeight: 700,
    padding: '2px 8px', borderRadius: 99, marginLeft: 6, verticalAlign: 'middle',
  },
  errorBanner: {
    background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626',
    borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14,
  },
  successBanner: {
    background: '#f0fdf4', border: '1px solid #86efac', color: '#166534',
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
    fontSize: 12, color: '#16a34a', fontWeight: 600, marginBottom: 4, lineHeight: 1.4,
  },
  monthlyNote: {
    fontSize: 12, color: '#64748b', fontWeight: 500, marginBottom: 4,
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
