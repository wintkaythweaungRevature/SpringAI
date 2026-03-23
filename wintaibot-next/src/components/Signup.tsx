'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import './Auth.css';

export default function Signup({
  onSuccess,
  onSwitchToLogin,
}: {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}) {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(email, password, name);
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError((err as Error).message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-wrap">
      <div className="auth-form-card">
        <div className="auth-form-icon">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>
        <h2 className="auth-form-title">Create an account</h2>
        <p className="auth-form-sub">Free to start — no credit card required</p>

        {success ? (
          <div className="auth-success-box">
            <strong>Account created!</strong>
            <p>You can now sign in and start using Ask AI and other free features.</p>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="auth-btn auth-btn-primary"
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label className="auth-label">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input"
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  minLength={6}
                  required
                />
              </div>

              {error && (
                <div className="auth-error">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="auth-btn auth-btn-primary"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="auth-footer">
              Already have an account?{' '}
              <button type="button" onClick={onSwitchToLogin} className="auth-switch-btn">
                Sign in
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
