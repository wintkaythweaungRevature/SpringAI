'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') || '');
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420, border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, background: '#fff' }}>
        <h2 style={{ marginTop: 0 }}>Set new password</h2>
        {!token ? (
          <p>Invalid or expired reset link.</p>
        ) : success ? (
          <p>Password reset successfully. You can now sign in.</p>
        ) : (
          <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
            <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: '10px 12px' }} />
            <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: '10px 12px' }} />
            {error && <div style={{ color: '#b91c1c', fontSize: 13 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', padding: '10px 12px' }}>
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
