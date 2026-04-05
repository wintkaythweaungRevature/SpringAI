'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaGift } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import Login from './Login';
import Signup from './Signup';
import './MemberGate.css';

const BENEFITS = [
  'Unlimited AI content, captions & hashtags',
  'Deep analytics, trends & SEO-style insights',
  'Priority support when you need it most',
];

const MINI_PLANS: { name: string; monthly: number; note: string }[] = [
  { name: 'Starter', monthly: 19, note: 'Includes 7-day trial (if eligible)' },
  { name: 'Pro', monthly: 39, note: 'Most popular' },
  { name: 'Growth', monthly: 79, note: 'Best value' },
];

export default function MemberGate({
  children,
  featureName = 'this feature',
}: {
  children: React.ReactNode;
  featureName?: string;
}) {
  const {
    user,
    loading,
    isSubscribed,
    emailVerified,
    checkoutSubscription,
    logout,
    authAvailable,
    token,
    apiBase,
  } = useAuth();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [starterTrialEligible, setStarterTrialEligible] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token || !user || !apiBase) return;
    fetch(`${apiBase}/api/subscription/current`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (typeof d?.starterTrialEligible === 'boolean') {
          setStarterTrialEligible(d.starterTrialEligible);
        }
      })
      .catch(() => {});
  }, [token, user, apiBase]);

  const showStarterTrialCopy = starterTrialEligible !== false;

  const checkoutStarterMonthly = async () => {
    if (!token) {
      await checkoutSubscription();
      return;
    }
    const res = await fetch(`${apiBase}/api/subscription/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plan: 'STARTER', billingInterval: 'MONTHLY' }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || 'Checkout failed');
    const url = data.url || data.checkoutUrl;
    if (url) window.location.href = url;
    else throw new Error('No checkout URL returned');
  };

  const runCheckout = async (fn: () => Promise<void>) => {
    setCheckoutLoading(true);
    try {
      await fn();
    } catch (e) {
      alert((e as Error).message || 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (authAvailable === false) return <>{children}</>;
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: '420px' }}>
          <h3 style={{ marginBottom: '8px' }}>Members Only</h3>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            Sign in or register to use {featureName}.
          </p>
          {showLogin ? (
            <Login onSwitchToSignup={() => setShowLogin(false)} />
          ) : (
            <Signup onSwitchToLogin={() => setShowLogin(true)} />
          )}
        </div>
      </div>
    );
  }

  if (!emailVerified) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Please verify your email</h3>
        <p style={{ color: '#666', marginTop: '8px' }}>
          We sent a verification link to {user.email}. Verify your email first, then you can
          upgrade to access {featureName}.
        </p>
        <button
          onClick={logout}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Log out
        </button>
      </div>
    );
  }

  if (!isSubscribed) {
    return (
      <div className="memberGatePaywall">
        <div className="memberGatePaywallBg" aria-hidden />
        <div className="memberGatePaywallBlur" aria-hidden />
        <div className="memberGatePaywallScrim" aria-hidden />
        <div className="memberGateCard">
          <div className="memberGateIconWrap" aria-hidden>
            <FaGift />
          </div>
          <h2 className="memberGateTitle">
            Unlock Pro Features
            <span className="memberGateTitleMy">Start growing today</span>
          </h2>
          <p className="memberGateLead">
            Join premium members to unlock advanced analytics, AI tools, and more — including{' '}
            <strong style={{ color: '#f8fafc' }}>{featureName}</strong> and the rest of your growth
            stack.
          </p>
          <ul className="memberGateBullets">
            {BENEFITS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <table className="memberGatePricing" role="grid" aria-label="Plan pricing summary">
            <thead>
              <tr>
                <th scope="col">Plan</th>
                <th scope="col">From</th>
                <th scope="col">Notes</th>
              </tr>
            </thead>
            <tbody>
              {MINI_PLANS.map((p) => (
                <tr key={p.name}>
                  <td>{p.name}</td>
                  <td>${p.monthly}/mo</td>
                  <td>{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="memberGateSocial">
            Join 500+ professionals already using these tools to grow faster.
          </p>

          <div className="memberGateActions">
            {showStarterTrialCopy ? (
              <>
                <button
                  type="button"
                  className="memberGateBtnPrimary"
                  onClick={() => runCheckout(checkoutStarterMonthly)}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? 'Redirecting…' : 'Start 7-day free trial'}
                </button>
                <button
                  type="button"
                  className="memberGateBtnSecondary"
                  onClick={() => runCheckout(checkoutSubscription)}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? 'Redirecting…' : 'Upgrade now — from $19/mo'}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="memberGateBtnPrimary"
                onClick={() => runCheckout(checkoutSubscription)}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? 'Redirecting…' : 'Upgrade now — from $19/mo'}
              </button>
            )}
          </div>

          <Link className="memberGateLink" href="/pricing">
            See what&apos;s included in each plan
          </Link>

          <div className="memberGateRowBtns">
            <button type="button" className="memberGateBtnGhost" onClick={() => router.back()}>
              Go back
            </button>
            <button type="button" className="memberGateBtnGhost" onClick={logout}>
              Log out
            </button>
          </div>

          <p className="memberGateFootnote">
            AI-generated suggestions may contain mistakes. Double-check important business or legal
            details.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
