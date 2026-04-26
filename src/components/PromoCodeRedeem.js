import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Compact promo-code redeem input. Drop into the pricing page, account settings, or signup
 * flow. Calls /api/promo/validate as the user types (debounced) and /api/promo/redeem when
 * they click Apply.
 *
 * Props:
 *   onRedeemed(result) — fired on successful redemption. Result shape:
 *     { ok: true, code, kind, expiresAt, displayDiscount }
 */
export default function PromoCodeRedeem({ onRedeemed }) {
  const { apiBase, token } = useAuth();
  const base = apiBase || 'https://api.wintaibot.com';
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  });

  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [validation, setValidation] = useState(null); // { valid, displayDiscount, reason }
  const [redeeming, setRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(null); // { ok, displayDiscount, ... }
  const [validateTimer, setValidateTimer] = useState(null);

  const onChange = (e) => {
    const v = e.target.value.toUpperCase();
    setCode(v);
    setValidation(null);
    if (validateTimer) clearTimeout(validateTimer);
    if (!v.trim()) return;
    const tid = setTimeout(async () => {
      try {
        const res = await fetch(`${base}/api/promo/validate`, {
          method: 'POST', headers: authHeaders(), body: JSON.stringify({ code: v }),
        });
        const data = await res.json().catch(() => ({}));
        setValidation(data);
      } catch {}
    }, 350);
    setValidateTimer(tid);
  };

  const apply = async () => {
    if (!code.trim() || !validation?.valid) return;
    setRedeeming(true);
    try {
      const res = await fetch(`${base}/api/promo/redeem`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        // PERCENT_OFF / FIXED_OFF codes return a Stripe Checkout URL — full-page redirect
        // so the user lands on the discounted price page in one click. FREE codes don't
        // include checkoutUrl; we fall through to the in-place success badge for those.
        if (data.checkoutUrl) {
          if (typeof onRedeemed === 'function') onRedeemed(data);
          window.location.href = data.checkoutUrl;
          return;
        }
        setRedeemed(data);
        if (typeof onRedeemed === 'function') onRedeemed(data);
      } else {
        setValidation({ valid: false, reason: data.reason || 'Could not apply code.' });
      }
    } catch (e) {
      setValidation({ valid: false, reason: 'Network error.' });
    } finally {
      setRedeeming(false);
    }
  };

  if (redeemed) {
    return (
      <div style={s.successBox}>
        <span style={{ fontSize: 18 }}>🎉</span>
        <span><strong>{redeemed.displayDiscount}</strong></span>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" style={s.toggleBtn} onClick={() => setOpen(true)}>
        🎟 Have a promo code?
      </button>
    );
  }

  return (
    <div style={s.wrap}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Enter code (e.g. BETA50)"
          value={code}
          onChange={onChange}
          style={s.input}
          autoFocus
        />
        <button
          type="button"
          onClick={apply}
          disabled={!validation?.valid || redeeming}
          style={{ ...s.applyBtn, opacity: (!validation?.valid || redeeming) ? 0.5 : 1 }}
        >
          {redeeming ? '⏳' : 'Apply'}
        </button>
      </div>
      {validation && validation.valid && (
        <div style={s.validHint}>✓ <strong>{validation.displayDiscount}</strong></div>
      )}
      {validation && !validation.valid && code.trim() && (
        <div style={s.invalidHint}>✗ {validation.reason}</div>
      )}
    </div>
  );
}

const s = {
  toggleBtn: {
    background: 'transparent', border: '1px dashed rgba(99,102,241,0.4)',
    color: '#818cf8', padding: '8px 14px', borderRadius: 8,
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  wrap: { display: 'flex', flexDirection: 'column', gap: 6 },
  input: {
    flex: 1, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1',
    fontSize: 14, fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    letterSpacing: '0.05em', textTransform: 'uppercase',
  },
  applyBtn: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
    border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
    cursor: 'pointer',
  },
  validHint:   { fontSize: 12, color: '#16a34a' },
  invalidHint: { fontSize: 12, color: '#dc2626' },
  successBox: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)',
    color: '#15803d', padding: '8px 14px', borderRadius: 8, fontSize: 13,
  },
};
