'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const s: Record<string, React.CSSProperties> = {
  wrap: { padding: '4px 0' },
  card: {
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '28px 32px',
    maxWidth: '560px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  cardTitle: { margin: '0 0 6px', color: '#0f172a', fontSize: '20px', fontWeight: '700' },
  cardEmail: { margin: '0 0 20px', color: '#64748b', fontSize: '14px' },
  toast: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: '500',
  },
  section: { borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginTop: '20px' },
  sectionTitle: { margin: '0 0 10px', color: '#0f172a', fontSize: '15px', fontWeight: '700' },
  desc: { margin: '0 0 14px', color: '#64748b', fontSize: '14px', lineHeight: '1.6' },
  badgeRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  memberBadge: {
    padding: '3px 12px',
    borderRadius: '20px',
    background: '#22c55e',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '700',
  },
  freeBadge: {
    padding: '3px 12px',
    borderRadius: '20px',
    background: '#94a3b8',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '700',
  },
  warnBadge: {
    padding: '3px 12px',
    borderRadius: '20px',
    background: '#fbbf24',
    color: '#1c1917',
    fontSize: '12px',
    fontWeight: '600',
  },
  renewText: { color: '#64748b', fontSize: '13px' },
  confirmBox: { paddingTop: '4px' },
  warnMsg: {
    color: '#92400e',
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '13px',
    lineHeight: '1.5',
    marginBottom: '12px',
  },
  btnRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    marginBottom: '12px',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
  },
  btnPrimary: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnSuccess: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: '#22c55e',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnWarning: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: '#f97316',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnDanger: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: '#ef4444',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnGhost: {
    padding: '10px 18px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#475057',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};

export default function AccountSettings() {
  const {
    user,
    isSubscribed,
    checkoutSubscription,
    cancelSubscription,
    reactivateSubscription,
    openBillingPortal,
    deactivateAccount,
    logout,
  } = useAuth();

  const [loading, setLoading] = useState<string | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [confirmCancelSub, setConfirmCancelSub] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const isMember = isSubscribed;
  const cancelAtPeriodEnd = user?.cancelAtPeriodEnd === true;
  const periodEnd = user?.subscriptionPeriodEnd;

  const showMessage = (msg: string, isError = false) => {
    setMessage({ text: msg, error: isError });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUpgrade = async () => {
    setLoading('upgrade');
    try {
      await checkoutSubscription();
    } catch (e) {
      showMessage((e as Error).message || 'Checkout failed', true);
    } finally {
      setLoading(null);
    }
  };

  const handleCancelSub = async () => {
    if (!confirmCancelSub) {
      setConfirmCancelSub(true);
      return;
    }
    setLoading('cancel-sub');
    try {
      await cancelSubscription();
      setConfirmCancelSub(false);
      showMessage('Subscription will cancel at the end of the current period.');
    } catch (e) {
      showMessage((e as Error).message || 'Could not cancel subscription', true);
    } finally {
      setLoading(null);
    }
  };

  const handleReactivateSub = async () => {
    setLoading('reactivate-sub');
    try {
      await reactivateSubscription();
      showMessage('Subscription reactivated! Your membership will continue.');
    } catch (e) {
      showMessage((e as Error).message || 'Could not reactivate subscription', true);
    } finally {
      setLoading(null);
    }
  };

  const handleBilling = async () => {
    setLoading('billing');
    try {
      await openBillingPortal();
    } catch (e) {
      showMessage((e as Error).message || 'Failed to open billing portal.', true);
    } finally {
      setLoading(null);
    }
  };

  const handleDeactivate = async () => {
    if (!confirmDeactivate) {
      setConfirmDeactivate(true);
      return;
    }
    setLoading('deactivate');
    try {
      await deactivateAccount(deactivatePassword);
      logout();
    } catch (e) {
      showMessage((e as Error).message || 'Deactivation failed', true);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <h2 style={s.cardTitle}>Account Settings</h2>
        <p style={s.cardEmail}>{user?.email}</p>

        {message && (
          <div
            style={{
              ...s.toast,
              background: message.error ? '#fef2f2' : '#f0fdf4',
              color: message.error ? '#b91c1c' : '#15803d',
              borderColor: message.error ? '#fecaca' : '#bbf7d0',
            }}
          >
            {message.error ? '⚠ ' : '✓ '}
            {message.text}
          </div>
        )}

        <div style={s.section}>
          <h3 style={s.sectionTitle}>Subscription</h3>
          <div style={s.badgeRow}>
            <span style={isMember ? s.memberBadge : s.freeBadge}>
              {isMember ? 'Member' : 'Free'}
            </span>
            {isMember && cancelAtPeriodEnd && (
              <span style={s.warnBadge}>
                Cancels {periodEnd ? `on ${periodEnd}` : 'at period end'}
              </span>
            )}
            {isMember && !cancelAtPeriodEnd && periodEnd && (
              <span style={s.renewText}>Renews {periodEnd}</span>
            )}
          </div>

          {!isMember && (
            <div style={{ marginTop: 12 }}>
              <p style={s.desc}>
                Upgrade (from $19/month; annual options) to unlock Image Generator, Transcription,
                DocuWizard, Reply Enchanter, and Resume Worlock.
              </p>
              <button onClick={handleUpgrade} disabled={!!loading} style={s.btnSuccess}>
                {loading === 'upgrade' ? 'Redirecting...' : 'Upgrade — plans from $19/mo'}
              </button>
            </div>
          )}

          {isMember && !cancelAtPeriodEnd && (
            <div style={{ marginTop: 12 }}>
              {!confirmCancelSub ? (
                <button
                  onClick={() => setConfirmCancelSub(true)}
                  disabled={!!loading}
                  style={s.btnWarning}
                >
                  Cancel Subscription
                </button>
              ) : (
                <div style={s.confirmBox}>
                  <p style={s.warnMsg}>
                    Your subscription will cancel at period end
                    {periodEnd ? ` (${periodEnd})` : ''}. You keep access until then.
                  </p>
                  <div style={s.btnRow}>
                    <button
                      onClick={() => setConfirmCancelSub(false)}
                      style={s.btnGhost}
                    >
                      Keep Subscription
                    </button>
                    <button
                      onClick={handleCancelSub}
                      disabled={loading === 'cancel-sub'}
                      style={s.btnWarning}
                    >
                      {loading === 'cancel-sub' ? 'Cancelling...' : 'Confirm Cancel'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isMember && cancelAtPeriodEnd && (
            <div style={{ marginTop: 12 }}>
              <p style={s.desc}>
                Your subscription ends soon. Reactivate to keep your membership.
              </p>
              <button
                onClick={handleReactivateSub}
                disabled={loading === 'reactivate-sub'}
                style={s.btnSuccess}
              >
                {loading === 'reactivate-sub' ? 'Reactivating...' : 'Reactivate Subscription'}
              </button>
            </div>
          )}
        </div>

        <div style={s.section}>
          <h3 style={s.sectionTitle}>Billing &amp; Invoices</h3>
          <p style={s.desc}>
            View invoice history, update payment method, or manage your subscription in Stripe&apos;s billing portal.
            W!ntAi does not store your bank account or full card details; only Stripe processes that information.
          </p>
          <button onClick={handleBilling} disabled={!!loading} style={s.btnPrimary}>
            {loading === 'billing' ? 'Opening...' : 'Manage Billing & Invoices'}
          </button>
        </div>

        <div style={s.section}>
          <h3 style={s.sectionTitle}>Deactivate Account</h3>
          <p style={s.desc}>
            Deactivate your account. You can reactivate it anytime by logging in with your
            credentials.
          </p>
          {!confirmDeactivate ? (
            <button onClick={() => setConfirmDeactivate(true)} style={s.btnDanger}>
              Deactivate Account
            </button>
          ) : (
            <div style={s.confirmBox}>
              <p style={s.warnMsg}>
                Enter your password to confirm account deactivation. You can reactivate later by
                signing in.
              </p>
              <input
                type="password"
                placeholder="Your password"
                value={deactivatePassword}
                onChange={(e) => setDeactivatePassword(e.target.value)}
                style={s.input}
              />
              <div style={s.btnRow}>
                <button
                  onClick={() => {
                    setConfirmDeactivate(false);
                    setDeactivatePassword('');
                  }}
                  style={s.btnGhost}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeactivate}
                  disabled={loading === 'deactivate' || !deactivatePassword}
                  style={s.btnDanger}
                >
                  {loading === 'deactivate' ? 'Deactivating...' : 'Confirm Deactivate'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
