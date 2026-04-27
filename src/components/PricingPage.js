import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PromoCodeRedeem from './PromoCodeRedeem';

/* ─── Plan Data ──────────────────────────────────────────────────────── */
const PLANS = [
  {
    id: 'STARTER',
    name: 'Starter',
    monthlyPrice: 19,
    yearlyPrice: 15,
    yearlyTotal: 180,
    color: '#6366f1',
    badge: null,
    icon: '🚀',
    tagline: 'Perfect for solo creators',
    seats: 1,
    features: [
      { text: '3 connected platforms', included: true },
      { text: '100 videos / month', included: true },
      { text: '1,000 images / month', included: true },
      { text: '30 scheduled posts / month', included: true },
      { text: 'Basic AI Idea Generator', included: true },
      { text: 'Brand Kit (colors + logo)', included: true },
      { text: 'Viral Hook Generator', included: true },
      { text: 'DocuWizard & Resume tools', included: true },
      { text: '1 seat (solo)', included: true },
    ],
  },
  {
    id: 'PRO',
    name: 'Pro',
    monthlyPrice: 39,
    yearlyPrice: 32,
    yearlyTotal: 384,
    color: '#8b5cf6',
    badge: 'Most Popular',
    icon: '⚡',
    tagline: 'For agencies & serious creators',
    seats: 3,
    features: [
      { text: '5 connected platforms', included: true },
      { text: 'Unlimited videos', included: true },
      { text: 'Unlimited images to post', included: true },
      { text: 'Unlimited scheduled posts', included: true },
      { text: '100 AI-generated images / mo', included: true },
      { text: 'Full AI Idea Generator', included: true },
      { text: 'Brand Kit (colors + logo)', included: true },
      { text: 'Viral Hook Generator', included: true },
      { text: 'EchoScribe transcription', included: true },
      { text: 'Messages & Auto Reply', included: true },
      { text: 'Growth Planner & Deep Analytics', included: true },
      { text: 'Social AI Chat (RAG)', included: true },
      { text: '🏢 Organization management', included: true },
      { text: '📁 Multiple workspaces', included: true },
      { text: '🔐 Per-member feature permissions', included: true },
      { text: '👥 Up to 3 org members', included: true },
    ],
  },
  {
    id: 'GROWTH',
    name: 'Growth',
    monthlyPrice: 79,
    yearlyPrice: 64,
    yearlyTotal: 768,
    color: '#f59e0b',
    badge: 'For Growing Teams',
    icon: '🔥',
    tagline: 'Maximum power for teams',
    seats: 5,
    features: [
      { text: 'Unlimited connected accounts', included: true },
      { text: 'Unlimited videos', included: true },
      { text: 'Unlimited AI-generated images', included: true },
      { text: 'Unlimited scheduled posts', included: true },
      { text: 'Full AI Idea Generator', included: true },
      { text: 'Brand Kit (colors + logo)', included: true },
      { text: 'Viral Hook Generator', included: true },
      { text: 'Video trimming tool', included: true },
      { text: 'EchoScribe transcription', included: true },
      { text: 'Messages & Auto Reply', included: true },
      { text: 'Growth Planner & Deep Analytics', included: true },
      { text: 'Social AI Chat (RAG)', included: true },
      { text: 'Priority processing queue', included: true },
      { text: 'Fastest upload & AI speeds', included: true },
      { text: '🏢 Organization management', included: true },
      { text: '📁 Unlimited workspaces', included: true },
      { text: '🔐 Granular permissions per workspace', included: true },
      { text: '👥 Up to 5 org members', included: true },
    ],
  },
  {
    id: 'AGENCY',
    name: 'Agency',
    monthlyPrice: 149,
    yearlyPrice: 119,
    yearlyTotal: 1428,
    color: '#10b981',
    badge: 'Best for Agencies',
    icon: '🏢',
    tagline: 'For agencies managing many client brands',
    seats: 'Unlimited',
    features: [
      { text: '✨ EVERYTHING in Growth, plus:', included: true },
      { text: '♾️ Unlimited client workspaces', included: true },
      { text: '👥 Unlimited team seats', included: true },
      { text: '📄 Branded PDF reports per client (coming soon)', included: true },
      { text: '🎨 Custom logo + colors per client workspace', included: true },
      { text: '🔐 Client-facing read-only role', included: true },
      { text: '⚡ Priority support', included: true },
      { text: '📊 Client portal access (coming soon)', included: true },
    ],
  },
];

/* ─── Comparison table rows ─────────────────────────────────────────── */
const COMPARE_ROWS = [
  { label: 'Connected accounts',                 starter: '3',          pro: '5',          growth: 'Unlimited' },
  { label: 'Videos to post / month',            starter: '100',        pro: 'Unlimited',  growth: 'Unlimited' },
  { label: 'Images to post / month',            starter: '1,000',      pro: 'Unlimited',  growth: 'Unlimited' },
  { label: 'AI-generated images / mo',          starter: '—',          pro: '100',        growth: 'Unlimited' },
  { label: 'Scheduled posts / month',           starter: '30',         pro: 'Unlimited',  growth: 'Unlimited' },
  { label: 'Content Calendar',                  starter: true,         pro: true,         growth: true },
  { label: 'Video Publisher',                   starter: true,         pro: true,         growth: true },
  { label: 'AI Captions & Hashtags',            starter: true,         pro: true,         growth: true },
  { label: 'Image Generator',                   starter: true,         pro: true,         growth: true },
  { label: 'Link-in-Bio page',                  starter: true,         pro: true,         growth: true },
  { label: 'Brand Kit (colors + logo)',          starter: true,         pro: true,         growth: true },
  { label: 'Viral Hook Generator',              starter: true,         pro: true,         growth: true },
  { label: 'DocuWizard & Resume tools',         starter: true,         pro: true,         growth: true },
  { label: 'EchoScribe transcription',          starter: false,        pro: true,         growth: true },
  { label: 'Messages & Auto Reply',             starter: false,        pro: true,         growth: true },
  { label: 'Growth Planner',                    starter: false,        pro: true,         growth: true },
  { label: 'Social AI Chat',                    starter: false,        pro: true,         growth: true },
  { label: 'Video trimming tool',               starter: false,        pro: false,        growth: true },
  { label: 'Priority processing',               starter: false,        pro: false,        growth: true },
  { label: '🏢 Organization management',        starter: false,        pro: true,         growth: true },
  { label: '📁 Workspaces',                     starter: false,        pro: 'Multiple',   growth: 'Unlimited' },
  { label: '🔐 Per-member permissions',         starter: false,        pro: true,         growth: true },
  { label: '👥 Org members',                    starter: '1 (solo)',   pro: '3 members',  growth: '5 members' },
  { label: 'Annual (billed yearly)',            starter: '$15/mo ($180/yr)', pro: '$32/mo ($384/yr)', growth: '$64/mo ($768/yr)' },
];

function CellValue({ val, planColor }) {
  if (val === true)  return <span style={{ color: '#22c55e', fontSize: 18, fontWeight: 700 }}>✓</span>;
  if (val === false) return <span style={{ color: '#cbd5e1', fontSize: 16 }}>—</span>;
  return <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{val}</span>;
}

/* ─── PricingPage ────────────────────────────────────────────────────── */
export default function PricingPage({ onClose }) {
  const { apiBase, authHeaders, user, refetchUser, isSubscribed } = useAuth();
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [starterTrialEligible, setStarterTrialEligible] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showTable, setShowTable] = useState(false);
  // Pending promo discount — null when none, or { pending: true, code, percentOff,
  // durationLabel, expiresAt }. Fetched on mount + after a code is redeemed.
  const [pendingDiscount, setPendingDiscount] = useState(null);

  const showStarterTrialCopy = !user || (!isSubscribed && starterTrialEligible !== false);

  // Compute the discounted price for a given base price using the pending discount.
  // Returns { discounted: number, originalKept: boolean } — when the user has a
  // PERCENT_OFF code applied, every plan card shows ~~$39~~ $19.50.
  const applyDiscount = (basePrice) => {
    if (!pendingDiscount?.pending) return { discounted: basePrice, originalKept: false };
    if (pendingDiscount.percentOff) {
      const d = basePrice * (1 - pendingDiscount.percentOff / 100);
      return { discounted: Math.round(d * 100) / 100, originalKept: true };
    }
    if (pendingDiscount.fixedOffCents) {
      const d = Math.max(0, basePrice - pendingDiscount.fixedOffCents / 100);
      return { discounted: Math.round(d * 100) / 100, originalKept: true };
    }
    return { discounted: basePrice, originalKept: false };
  };

  // Re-fetch the user's pending discount — called on mount + every time a code is redeemed.
  const loadPendingDiscount = () => {
    if (!user) { setPendingDiscount(null); return; }
    fetch(`${apiBase}/api/promo/my-pending-discount`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(d => setPendingDiscount(d || null))
      .catch(() => setPendingDiscount(null));
  };

  useEffect(() => {
    if (!user) { setStarterTrialEligible(null); return; }
    fetch(`${apiBase}/api/subscription/current`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => {
        setCurrentPlan(d?.plan);
        if (typeof d?.starterTrialEligible === 'boolean') setStarterTrialEligible(d.starterTrialEligible);
      })
      .catch(() => {});
    loadPendingDiscount();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubscribe = async (planId) => {
    if (!user) { setError('Please log in first.'); return; }
    setLoading(planId); setError(''); setSuccessMsg('');
    try {
      const billingInterval = yearly ? 'YEARLY' : 'MONTHLY';
      const res = await fetch(`${apiBase}/api/subscription/checkout`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planId,
          planType: planId,
          billingInterval,
          interval: billingInterval,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const backendMsg = (data && (data.error || data.message)) ? String(data.error || data.message) : '';
        setError(backendMsg || `Checkout failed (${res.status}).`);
        return;
      }
      if (data.updated) {
        setSuccessMsg(data.message || 'Plan updated!');
        if (typeof refetchUser === 'function') refetchUser();
        return;
      }
      const url = data.url || data.checkoutUrl;
      if (url) window.location.href = url;
      else setError('No checkout URL returned.');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(null); }
  };

  return (
    <div style={s.overlay}>
      <div style={s.modal}>

        {/* ── Header ── */}
        <div style={s.header}>
          <div>
            <h2 style={s.title}>Choose Your Plan</h2>
            <p style={s.subtitle}>
              {showStarterTrialCopy
                ? '7-day free trial on Starter · Cancel anytime'
                : 'Upgrade, downgrade, or manage billing · Cancel anytime'}
            </p>
          </div>
          {onClose && <button style={s.closeBtn} onClick={onClose}>✕</button>}
        </div>

        {/* ── Billing toggle ── */}
        <div style={s.billingWrap}>
          <div style={s.segmentRow}>
            <button style={s.segBtn(!yearly)} onClick={() => setYearly(false)}>
              <span style={s.segMain}>Monthly</span>
              <span style={s.segSub}>Pay each month</span>
            </button>
            <button style={s.segBtn(yearly)} onClick={() => setYearly(true)}>
              <span style={s.segMain}>Yearly <span style={s.saveBadge}>Save ~20%</span></span>
              <span style={s.segSub}>One payment per year</span>
            </button>
          </div>
        </div>

        {/* ── Promo code redeem ── FREE codes activate immediately; PERCENT_OFF/FIXED_OFF
             stay "queued" so the discount applies to whichever plan the user picks below. */}
        {user && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <PromoCodeRedeem onRedeemed={(r) => {
              if (r?.kind === 'FREE' && typeof refetchUser === 'function') {
                refetchUser();
              } else {
                // PERCENT_OFF / FIXED_OFF — re-fetch the pending discount so the plan
                // cards below update to show struck-through prices in real time.
                loadPendingDiscount();
              }
            }} />
          </div>
        )}

        {/* Banner shown when user has a pending discount — explains it applies to any plan. */}
        {pendingDiscount?.pending && (
          <div style={{
            margin: '0 auto 20px', maxWidth: 720,
            background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
            border: '1.5px solid #10b981',
            borderRadius: 12, padding: '12px 18px',
            color: '#065f46', fontSize: 14, fontWeight: 600,
            textAlign: 'center',
          }}>
            🎟 Code <code style={{ background: '#065f46', color: '#fff', padding: '2px 8px', borderRadius: 6 }}>{pendingDiscount.code}</code>{' '}
            applied — {pendingDiscount.percentOff
              ? `${pendingDiscount.percentOff}% off`
              : `$${(pendingDiscount.fixedOffCents || 0) / 100} off`}{' '}
            {pendingDiscount.durationLabel}. Pick any plan below — discount applies automatically at checkout.
          </div>
        )}

        {successMsg && <div style={s.successBanner}>{successMsg}</div>}
        {error      && <div style={s.errorBanner}>{error}</div>}

        {/* Responsive grid override: inline style sets 4-col desktop default; this
            <style> block tiers it down — 2 cols on tablet (<1200px), 1 col on mobile (<700px). */}
        <style>{`
          @media (max-width: 1200px) {
            .pricing-cards-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          }
          @media (max-width: 700px) {
            .pricing-cards-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* ── Plan cards ── */}
        <div className="pricing-cards-grid" style={s.cardsRow}>
          {PLANS.map(plan => {
            const basePrice = yearly ? plan.yearlyPrice : plan.monthlyPrice;
            const { discounted, originalKept } = applyDiscount(basePrice);
            const isCurrent = currentPlan === plan.id;
            const isPro = plan.id === 'PRO';
            return (
              <div key={plan.id} style={{
                ...s.card,
                border: isPro ? `2px solid ${plan.color}` : '1.5px solid #e2e8f0',
                boxShadow: isPro ? `0 6px 28px ${plan.color}33` : '0 1px 6px rgba(0,0,0,0.07)',
                transform: isPro ? 'translateY(-6px)' : 'none',
                position: 'relative',
              }}>
                {plan.badge && (
                  <div style={{ ...s.planBadge, background: plan.color }}>{plan.badge}</div>
                )}
                {/* Discount chip — small green ribbon on plans when a code is applied. */}
                {originalKept && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    background: '#10b981', color: '#fff',
                    fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 8,
                  }}>
                    {pendingDiscount.percentOff ? `−${pendingDiscount.percentOff}%` : 'CODE APPLIED'}
                  </div>
                )}

                <div style={{ ...s.planIcon, background: plan.color + '18', color: plan.color }}>
                  {plan.icon}
                </div>
                <h3 style={s.planName}>{plan.name}</h3>
                <p style={s.planTagline}>{plan.tagline}</p>

                <div style={s.priceRow}>
                  {originalKept ? (
                    <>
                      <span style={{ fontSize: 18, color: '#94a3b8', textDecoration: 'line-through', marginRight: 8 }}>
                        ${basePrice}
                      </span>
                      <span style={{ ...s.priceDollar, color: '#10b981' }}>$</span>
                      <span style={{ ...s.priceNumber, color: '#10b981' }}>{discounted}</span>
                    </>
                  ) : (
                    <>
                      <span style={s.priceDollar}>$</span>
                      <span style={s.priceNumber}>{basePrice}</span>
                    </>
                  )}
                  <span style={s.pricePer}>/mo</span>
                </div>
                <div style={s.priceNote}>
                  {originalKept
                    ? `Discount: ${pendingDiscount.durationLabel}`
                    : yearly
                      ? `$${plan.yearlyTotal}/yr · save $${(plan.monthlyPrice - plan.yearlyPrice) * 12}/yr`
                      : 'Billed monthly'}
                </div>

                {/* Feature list */}
                <ul style={s.featureList}>
                  {plan.features.filter(f => f.included).map(f => (
                    <li key={f.text} style={s.featureItem}>
                      <span style={{
                        color: '#22c55e',
                        marginRight: 8, flexShrink: 0, fontWeight: 700, fontSize: 14,
                      }}>
                        ✓
                      </span>
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button style={s.ctaBtnCurrent} disabled>Current Plan</button>
                ) : (
                  <button
                    style={{ ...s.ctaBtn, background: plan.color, opacity: loading === plan.id ? 0.7 : 1 }}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={!!loading}
                  >
                    {loading === plan.id
                      ? 'Redirecting...'
                      : plan.id === 'STARTER' && showStarterTrialCopy
                        ? 'Start 7-Day Free Trial'
                        : `Get ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Comparison table toggle ── */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <button style={s.compareToggle} onClick={() => setShowTable(v => !v)}>
            {showTable ? '▲ Hide comparison table' : '▼ See full feature comparison'}
          </button>
        </div>

        {showTable && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={{ ...s.th, textAlign: 'left', width: '40%' }}>Feature</th>
                  <th style={{ ...s.th, color: '#6366f1' }}>🚀 Starter<br /><span style={s.thPrice}>$19/mo</span></th>
                  <th style={{ ...s.th, color: '#8b5cf6', background: 'rgba(139,92,246,0.06)' }}>⚡ Pro<br /><span style={s.thPrice}>$39/mo</span></th>
                  <th style={{ ...s.th, color: '#f59e0b' }}>🔥 Growth<br /><span style={s.thPrice}>$79/mo</span></th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) => (
                  <tr key={row.label} style={{ background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                    <td style={s.tdLabel}>{row.label}</td>
                    <td style={s.td}><CellValue val={row.starter} /></td>
                    <td style={{ ...s.td, background: 'rgba(139,92,246,0.04)' }}><CellValue val={row.pro} /></td>
                    <td style={s.td}><CellValue val={row.growth} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Footer ── */}
        <p style={s.footer}>
          {showStarterTrialCopy
            ? '7-day free trial · No charge until trial ends · Cancel anytime · Powered by Stripe'
            : 'Billed through Stripe · Cancel anytime · Powered by Stripe'}
        </p>
        <p style={{ ...s.footer, marginTop: 8, fontSize: 12, borderTop: 'none', paddingTop: 0 }}>
          W!ntAi never stores card numbers. Payment details handled only by Stripe.
        </p>
        <p style={{ ...s.footer, marginTop: 8, fontSize: 12, borderTop: 'none', paddingTop: 0 }}>
          <a href="/privacy-policy" style={s.legalLink}>Privacy Policy</a>
          {' · '}
          <a href="/terms-of-service" style={s.legalLink}>Terms of Service</a>
          {' · '}
          <a href="/refund-policy" style={s.legalLink}>Refund Policy</a>
        </p>
      </div>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────── */
const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px', overflowY: 'auto',
  },
  modal: {
    background: '#fff', borderRadius: 20, padding: '32px',
    // Wider so 4 plan cards (Starter / Pro / Growth / Agency) fit side-by-side.
    maxWidth: 1480, width: '100%', maxHeight: '92vh', overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20,
  },
  title: { margin: 0, fontSize: 26, fontWeight: 800, color: '#1e293b' },
  subtitle: { margin: '4px 0 0', color: '#64748b', fontSize: 14 },
  closeBtn: {
    background: '#f1f5f9', border: 'none', borderRadius: 8,
    padding: '6px 12px', cursor: 'pointer', fontSize: 16, color: '#64748b',
  },
  billingWrap: {
    marginBottom: 28, padding: '14px 16px',
    background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0',
  },
  segmentRow: { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' },
  segBtn: (active) => ({
    flex: '1 1 150px', maxWidth: 260, padding: '11px 14px', borderRadius: 12,
    border: active ? '2px solid #6366f1' : '1px solid #cbd5e1',
    background: active ? '#fff' : '#f1f5f9', cursor: 'pointer',
    fontFamily: 'inherit', textAlign: 'center',
    boxShadow: active ? '0 4px 14px rgba(99,102,241,0.18)' : 'none',
    transition: 'all 0.15s',
  }),
  segMain: { display: 'block', fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 2 },
  segSub: { display: 'block', fontSize: 11, fontWeight: 500, color: '#64748b' },
  saveBadge: {
    background: '#dcfce7', color: '#16a34a', fontSize: 10, fontWeight: 700,
    padding: '2px 7px', borderRadius: 99, marginLeft: 5, verticalAlign: 'middle',
  },
  errorBanner: {
    background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626',
    borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 14,
  },
  successBanner: {
    background: '#f0fdf4', border: '1px solid #86efac', color: '#166534',
    borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 14,
  },
  cardsRow: {
    // 4 columns at desktop (Starter / Pro / Growth / Agency). Responsive media query
    // in the JSX <style> block collapses to 2 columns at <1100px and 1 at <700px.
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 20,
    marginBottom: 24,
    alignItems: 'stretch',
  },
  card: {
    // 4-card layout — slightly slimmer padding so each card has breathing room without
    // becoming oversized. Min-height keeps cards aligned even with different bullet counts.
    borderRadius: 18,
    padding: '32px 22px 24px',
    position: 'relative',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 480,
  },
  planBadge: {
    position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
    color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 14px',
    borderRadius: 99, whiteSpace: 'nowrap',
  },
  planIcon: {
    width: 42, height: 42, borderRadius: 12, display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 10,
  },
  planName: { margin: '0 0 2px', fontSize: 20, fontWeight: 800, color: '#1e293b' },
  planTagline: { margin: '0 0 10px', fontSize: 12, color: '#94a3b8', fontWeight: 500 },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: 1, marginBottom: 2 },
  priceDollar: { fontSize: 17, fontWeight: 600, color: '#334155' },
  priceNumber: { fontSize: 38, fontWeight: 800, color: '#0f172a', lineHeight: 1 },
  pricePer: { fontSize: 13, color: '#94a3b8', marginLeft: 2 },
  priceNote: { fontSize: 11, color: '#64748b', marginBottom: 14 },
  featureList: { listStyle: 'none', padding: 0, margin: '0 0 18px', flex: 1 },
  featureItem: {
    fontSize: 13, color: '#334155', padding: '3.5px 0',
    display: 'flex', alignItems: 'flex-start',
  },
  ctaBtn: {
    width: '100%', border: 'none', borderRadius: 10, padding: '12px',
    color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'opacity 0.15s',
  },
  ctaBtnCurrent: {
    width: '100%', border: 'none', borderRadius: 10, padding: '12px',
    background: '#e2e8f0', color: '#64748b', fontWeight: 700, fontSize: 14, cursor: 'default',
  },
  compareToggle: {
    background: 'none', border: '1px solid #e2e8f0', borderRadius: 8,
    color: '#6366f1', padding: '8px 20px', cursor: 'pointer',
    fontSize: 13, fontWeight: 600,
  },
  tableWrap: { overflowX: 'auto', marginBottom: 20, borderRadius: 12, border: '1px solid #e2e8f0' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    padding: '12px 14px', textAlign: 'center', fontWeight: 700,
    background: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontSize: 14,
  },
  thPrice: { fontWeight: 500, fontSize: 11, color: '#94a3b8' },
  tdLabel: {
    padding: '10px 14px', color: '#334155', fontWeight: 500,
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '10px 14px', textAlign: 'center',
    borderBottom: '1px solid #f1f5f9',
  },
  footer: {
    textAlign: 'center', fontSize: 12, color: '#94a3b8',
    borderTop: '1px solid #f1f5f9', paddingTop: 14, marginTop: 8,
  },
  legalLink: { color: '#64748b', fontWeight: 600 },
};
