import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { filterEnabledPlatforms } from '../config/disabledPlatforms';
import PlatformIcon from './PlatformIcon';
import ProfileAvatar from './ProfileAvatar';
import UpgradeModal from './UpgradeModal';

const PLATFORMS = filterEnabledPlatforms([
  { id: 'youtube',   label: 'YouTube',    emoji: '▶️',  color: '#FF0000', desc: 'Upload videos & Shorts', logo: 'youtube' },
  { id: 'instagram', label: 'Instagram',  emoji: '📸',  color: '#E1306C', desc: 'Reels & Posts', logo: 'instagram' },
  { id: 'tiktok',    label: 'TikTok',     emoji: '🎵',  color: '#010101', desc: 'Short-form videos', logo: 'tiktok' },
  { id: 'linkedin',  label: 'LinkedIn',   emoji: '💼',  color: '#0A66C2', desc: 'Professional videos', logo: 'linkedin' },
  { id: 'facebook',  label: 'Facebook',   emoji: '👍',  color: '#1877F2', desc: 'Page videos & Reels', logo: 'facebook' },
  { id: 'x',         label: 'X (Twitter)',emoji: '🐦',  color: '#000000', desc: 'Video tweets', logo: 'x' },
  { id: 'threads',   label: 'Threads',    emoji: '🧵',  color: '#101010', desc: 'Text + video posts', logo: 'threads' },
  { id: 'pinterest', label: 'Pinterest',  emoji: '📌',  color: '#E60023', desc: 'Video pins', logo: 'pinterest' },
]);

export default function SocialConnect({ onConnectionChange }) {
  const { apiBase, token, authHeaders } = useAuth();
  const base = apiBase || 'https://api.wintaibot.com';
  const [upgradeModal, setUpgradeModal] = useState(null); // { reason, suggestPlan }

  // Account-pool model: instead of `connected = ['youtube', 'facebook']`, we keep
  // a map { youtube: [{id, username, ...}, ...], facebook: [], ... } so the UI can
  // render one card per connected account + empty slots for "Add another account".
  const [accountsByPlatform, setAccountsByPlatform] = useState({}); // { youtube: [...], facebook: [...], ... }
  const [limitPerPlatform, setLimitPerPlatform] = useState(1);      // 1 / 3 / -1 (unlimited)
  const [planName, setPlanName]                 = useState('FREE');
  const [loading, setLoading]                   = useState(true);
  const [connecting, setConnecting]             = useState(null);
  const [disconnectingId, setDisconnectingId]   = useState(null);
  const [message, setMessage]                   = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${base}/api/social/accounts`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const pool = data.accounts || {};
        setAccountsByPlatform(pool);
        setLimitPerPlatform(typeof data.limitPerPlatform === 'number' ? data.limitPerPlatform : 1);
        setPlanName(data.planName || 'FREE');
        // Back-compat: onConnectionChange still wants a list of platforms-with-at-least-one-account.
        const connectedPlatforms = Object.keys(pool).filter(p => (pool[p] || []).length > 0);
        if (onConnectionChange) onConnectionChange(connectedPlatforms);
      }
    } catch (e) {
      console.error('Failed to fetch social accounts', e);
    } finally {
      setLoading(false);
    }
  }, [base, token, onConnectionChange]);

  useEffect(() => {
    fetchStatus();

    // Handle OAuth callback from popup via postMessage (popup closes itself, sends message to main window)
    const handleOAuthMessage = (event) => {
      const normalize = (o) => o.replace(/^https?:\/\/(www\.)?/, '');
      if (normalize(event.origin) !== normalize(window.location.origin)) return;
      if (event.data?.type !== 'wintaibot:social_connect') return;
      const { result, platform, msg } = event.data;
      if (result === 'success') {
        setMessage({ type: 'success', text: `✅ ${platform} connected successfully!` });
        fetchStatus();
      } else {
        const detail = msg ? `: ${decodeURIComponent(msg)}` : '';
        setMessage({ type: 'error', text: `❌ Failed to connect ${platform}${detail}` });
      }
      setTimeout(() => setMessage(null), 6000);
    };
    window.addEventListener('message', handleOAuthMessage);

    // Fallback: handle direct redirect (non-popup OAuth) via URL params
    const params = new URLSearchParams(window.location.search);
    const connectResult = params.get('social_connect');
    const platform = params.get('platform');
    if (connectResult && platform) {
      if (connectResult === 'success') {
        setMessage({ type: 'success', text: `✅ ${platform} connected successfully!` });
        fetchStatus();
      } else {
        const detail = params.get('msg') ? `: ${decodeURIComponent(params.get('msg'))}` : '';
        setMessage({ type: 'error', text: `❌ Failed to connect ${platform}${detail}` });
      }
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setMessage(null), 6000);
    }

    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [fetchStatus]);

  const handleConnect = async (platformId) => {
    setConnecting(platformId);
    try {
      const res = await fetch(`${base}/api/social/connect/${platformId}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          setUpgradeModal({ reason: data.error, suggestPlan: 'PRO' });
        } else {
          setMessage({ type: 'error', text: `❌ ${data.error || `Failed to start ${platformId} connection`}` });
          setTimeout(() => setMessage(null), 6000);
        }
        return;
      }

      // Open OAuth URL in popup
      const popup = window.open(data.url, 'oauth_popup',
        'width=600,height=700,scrollbars=yes,resizable=yes');

      if (!popup || popup.closed) {
        // Popup was blocked — fall back to redirect
        setMessage({ type: 'error', text: '⚠️ Popup was blocked. Please allow popups and try again, or click the link below.' });
        setTimeout(() => setMessage(null), 8000);
        window.location.href = data.url;
        return;
      }

      // Poll for popup close as fallback (postMessage is primary)
      const interval = setInterval(() => {
        if (popup.closed) {
          clearInterval(interval);
          setConnecting(null);
          fetchStatus();
        }
      }, 1000);
    } catch (e) {
      setMessage({ type: 'error', text: `❌ Network error connecting ${platformId}` });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setConnecting(null);
    }
  };

  const debugTikTokUrl = async () => {
    try {
      const res = await fetch(`${base}/api/social/debug/tiktok-url`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.error) {
        alert(`TikTok config error:\n${data.error}\n(${data.type})`);
      } else {
        alert(`TikTok OAuth URL check:\n\n${data.rawUrl}\n\nstarts with https: ${data.startsWithHttps}\nhas client_key: ${data.containsClientKey}\nhas redirect_uri: ${data.containsRedirectUri}\nhas scope: ${data.containsScope}\nhas state: ${data.containsState}`);
      }
    } catch (e) {
      alert('Debug failed: ' + e.message);
    }
  };

  /**
   * Account-pool disconnect: the UI knows the specific token id, so we pass it
   * as a query param. The backend deletes only that one row, leaving the user's
   * other accounts on the same platform intact.
   */
  const handleDisconnect = async (platformId, tokenId, label) => {
    if (!tokenId) return;
    setDisconnectingId(tokenId);
    try {
      const res = await fetch(`${base}/api/social/disconnect/${platformId}?tokenId=${tokenId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (res.ok) {
        // Re-fetch the pool so limits, counts, and per-workspace membership all refresh.
        await fetchStatus();
        setMessage({ type: 'success', text: `Disconnected ${label || platformId}` });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (e) {
      setMessage({ type: 'error', text: `Failed to disconnect ${platformId}` });
    } finally {
      setDisconnectingId(null);
    }
  };

  // Effective per-platform cap for rendering. -1 means unlimited; we still cap visual
  // slots at 6 for a sane layout (users on Growth can scroll horizontally if they really
  // have more than 6 on one platform — rare in practice).
  const effectiveCap = limitPerPlatform === -1 ? 6 : Math.max(1, limitPerPlatform);
  const totalConnected = Object.values(accountsByPlatform).reduce((sum, a) => sum + (a?.length || 0), 0);

  return (
    <div style={s.page}>
      {upgradeModal && (
        <UpgradeModal
          reason={upgradeModal.reason}
          feature="more platforms"
          suggestPlan={upgradeModal.suggestPlan}
          onClose={() => setUpgradeModal(null)}
        />
      )}
      {/* Header card */}
      <div style={s.headerCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={s.headerIcon}>📡</div>
          <div>
            <div style={s.headerTitle}>Connected Accounts</div>
            <div style={s.headerSub}>
              {totalConnected} account{totalConnected === 1 ? '' : 's'} connected
              {' · '}
              {limitPerPlatform === -1 ? 'Unlimited per platform' : `${limitPerPlatform} per platform on ${planName}`}
            </div>
          </div>
          <div style={s.headerBadge}>{totalConnected}</div>
        </div>
      </div>

      {/* Status message */}
      {message && (
        <div style={{ ...s.toast, background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
          borderColor: message.type === 'success' ? '#bbf7d0' : '#fecaca',
          color: message.type === 'success' ? '#15803d' : '#dc2626' }}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div style={s.loadingCard}>
          <div style={{ fontSize: '24px' }}>⏳</div>
          <div style={{ fontSize: '14px', color: '#64748b' }}>Loading connected accounts...</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {PLATFORMS.map(p => {
            const pAccounts = accountsByPlatform[p.id] || [];
            const isConnecting = connecting === p.id;
            const canAddMore  = limitPerPlatform === -1 || pAccounts.length < limitPerPlatform;
            // Tease the Pro upgrade by always reserving 3 slots per platform on FREE/STARTER
            // (1 usable + 2 locked). Users see the multi-account capability even before
            // they've connected their first account. Pro/Growth don't need the tease.
            const isLimitedPlan = planName === 'FREE' || planName === 'STARTER';
            const targetSlotCount = isLimitedPlan ? 3 : Math.max(pAccounts.length + 1, effectiveCap);
            const usedSlots = pAccounts.length + (canAddMore ? 1 : 0);
            const lockedSlotsToShow = isLimitedPlan ? Math.max(0, targetSlotCount - usedSlots) : 0;

            return (
              <div key={p.id} style={s.platformGroup}>
                {/* Platform title strip */}
                <div style={s.platformStrip}>
                  <div style={{ ...s.platformIcon, background: p.color + '15', width: 36, height: 36 }}>
                    <PlatformIcon platform={p} size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={s.platformName}>{p.label}</div>
                    <div style={s.platformDesc}>
                      {pAccounts.length} of {limitPerPlatform === -1 ? '∞' : limitPerPlatform} connected
                    </div>
                  </div>
                </div>

                {/* Account slot grid */}
                <div style={s.grid}>
                  {pAccounts.map(acct => {
                    const isDisc = disconnectingId === acct.id;
                    return (
                      <div key={acct.id}
                           style={{ ...s.card, ...s.cardConnected, borderColor: p.color + '40' }}>
                        <div style={s.cardHeader}>
                          {/* Avatar — real profile image fetched from the platform, falls back
                              to the platform icon if the image URL is missing or failed to load. */}
                          <ProfileAvatar
                            imageUrl={acct.profileImageUrl}
                            platform={p}
                            size={40}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ ...s.platformName, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {acct.username || p.label}
                            </div>
                            <div style={s.platformDesc}>{p.label}</div>
                          </div>
                          <div style={{ ...s.statusDot, background: '#22c55e' }} />
                        </div>
                        <div style={{ ...s.statusBadge, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                          ✓ Connected
                        </div>
                        <button
                          style={{ ...s.disconnectBtn, opacity: isDisc ? 0.6 : 1 }}
                          onClick={() => handleDisconnect(p.id, acct.id, acct.username || p.label)}
                          disabled={isDisc}
                        >
                          {isDisc ? 'Disconnecting…' : 'Disconnect'}
                        </button>
                      </div>
                    );
                  })}

                  {/* "+ Add" slot — renders only when user has headroom in their plan */}
                  {canAddMore && (
                    <div style={{ ...s.card, ...s.cardAdd, borderColor: p.color + '55' }}>
                      <div style={s.cardHeader}>
                        <div style={{ ...s.platformIcon, background: p.color + '15' }}>
                          <PlatformIcon platform={p} size={28} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={s.platformName}>{p.label}</div>
                          <div style={s.platformDesc}>
                            {pAccounts.length === 0 ? 'Not connected' : 'Add another account'}
                          </div>
                        </div>
                        <div style={{ ...s.statusDot, background: '#e2e8f0' }} />
                      </div>
                      <div style={{ ...s.statusBadge, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
                        {pAccounts.length === 0 ? 'Not connected' : '+ Additional account'}
                      </div>
                      <button
                        style={{ ...s.connectBtn, borderColor: p.color, color: p.color, opacity: isConnecting ? 0.6 : 1 }}
                        onClick={() => handleConnect(p.id)}
                        disabled={isConnecting}
                      >
                        {isConnecting ? 'Opening…' : (pAccounts.length === 0 ? `Connect ${p.label}` : `+ Add ${p.label}`)}
                      </button>
                    </div>
                  )}

                  {/* Locked slots — upsell tease for FREE/STARTER plans.
                      Always rendered (not gated on hitting the cap) so users see the
                      "3 possible slots, 2 locked behind Pro" visual from the start. */}
                  {Array.from({ length: lockedSlotsToShow }).map((_, idx) => (
                    <div key={`lock-${p.id}-${idx}`}
                         style={{ ...s.card, ...s.cardLocked }}
                         title="Upgrade to Pro to connect up to 3 accounts per platform"
                         onClick={() => setUpgradeModal({
                           reason: `Connect up to 3 ${p.label} accounts`,
                           suggestPlan: 'PRO',
                         })}>
                      <div style={s.cardHeader}>
                        <div style={{ ...s.platformIcon, background: '#f1f5f9' }}>
                          <span style={{ fontSize: 22 }}>🔒</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ ...s.platformName, color: '#94a3b8' }}>Pro only</div>
                          <div style={s.platformDesc}>Connect more {p.label} accounts</div>
                        </div>
                      </div>
                      <div style={{ ...s.statusBadge, background: '#f8fafc', color: '#94a3b8', border: '1px dashed #cbd5e1' }}>
                        🔒 Unlock with Pro
                      </div>
                      <button
                        style={{ ...s.connectBtn, borderColor: '#cbd5e1', color: '#94a3b8' }}
                      >
                        Upgrade to unlock
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const s = {
  page:        { padding: '4px 0', fontFamily: "'Inter',-apple-system,sans-serif" },
  headerCard:  { background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', borderRadius: '16px', padding: '24px', marginBottom: '20px', color: '#fff' },
  headerIcon:  { fontSize: '32px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: '18px', fontWeight: 800, marginBottom: '4px' },
  headerSub:   { fontSize: '13px', opacity: 0.8 },
  headerBadge: { fontSize: '22px', fontWeight: 800, background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '8px 16px' },
  progressBar: { height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', marginTop: '16px', overflow: 'hidden' },
  progressFill:{ height: '100%', background: '#fff', borderRadius: '3px', transition: 'width 0.4s ease' },
  toast:       { borderRadius: '10px', border: '1px solid', padding: '12px 16px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' },
  loadingCard: { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' },
  platformGroup:{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '14px 16px 16px', border: '1px solid rgba(255,255,255,0.06)' },
  platformStrip:{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', padding: '2px 4px' },
  card:        { background: '#fff', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '10px', transition: 'all 0.2s' },
  cardConnected:{ boxShadow: '0 4px 16px rgba(34,197,94,0.1)' },
  cardAdd:     { borderStyle: 'dashed', background: '#fafbff' },
  cardLocked:  { opacity: 0.55, cursor: 'help', background: '#f8fafc' },
  cardHeader:  { display: 'flex', alignItems: 'center', gap: '10px' },
  platformIcon:{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  platformName:{ fontWeight: 700, fontSize: '14px', color: '#1e293b' },
  platformDesc:{ fontSize: '11px', color: '#64748b', marginTop: '1px' },
  statusDot:   { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  statusBadge: { borderRadius: '8px', padding: '6px 10px', fontSize: '12px', fontWeight: 600, textAlign: 'center' },
  connectBtn:  { padding: '10px', borderRadius: '8px', border: '1.5px solid', background: 'transparent', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' },
  disconnectBtn:{ padding: '10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#ef4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
  infoCard:    { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  infoTitle:   { fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' },
  infoGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' },
  infoStep:    { display: 'flex', gap: '10px', alignItems: 'flex-start' },
  metaUriHint: {
    marginTop: '4px', padding: '10px 12px', borderRadius: '10px', background: '#eff6ff', border: '1px solid #bfdbfe',
    display: 'flex', flexDirection: 'column', gap: '6px',
  },
  metaUriLabel: { fontSize: '11px', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.04em' },
  metaUriCode: {
    fontSize: '11px', wordBreak: 'break-all', color: '#1e3a8a', background: '#fff', padding: '8px 10px',
    borderRadius: '6px', border: '1px solid #93c5fd', fontFamily: 'ui-monospace, monospace',
  },
  metaUriSub: { fontSize: '11px', color: '#64748b', lineHeight: 1.45 },
};
