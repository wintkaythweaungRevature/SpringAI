import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { filterEnabledPlatforms } from '../config/disabledPlatforms';
import PlatformIcon from './PlatformIcon';

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

export default function SocialConnect() {
  const { apiBase, token } = useAuth();
  const base = apiBase || 'https://api.wintaibot.com';

  const [connected, setConnected]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [connecting, setConnecting]     = useState(null);
  const [disconnecting, setDisconnecting] = useState(null);
  const [message, setMessage]           = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${base}/api/social/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConnected(data.connected || []);
      }
    } catch (e) {
      console.error('Failed to fetch social status', e);
    } finally {
      setLoading(false);
    }
  }, [base, token]);

  useEffect(() => {
    fetchStatus();

    // Handle OAuth callback from popup via postMessage (popup closes itself, sends message to main window)
    const handleOAuthMessage = (event) => {
      if (event.origin !== window.location.origin) return;
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
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: `❌ ${data.error || `Failed to start ${platformId} connection`}` });
        setTimeout(() => setMessage(null), 6000);
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
        headers: { Authorization: `Bearer ${token}` },
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

  const handleDisconnect = async (platformId) => {
    setDisconnecting(platformId);
    try {
      const res = await fetch(`${base}/api/social/disconnect/${platformId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setConnected(prev => prev.filter(p => p !== platformId));
        setMessage({ type: 'success', text: `Disconnected from ${platformId}` });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (e) {
      setMessage({ type: 'error', text: `Failed to disconnect ${platformId}` });
    } finally {
      setDisconnecting(null);
    }
  };

  const connectedCount = connected.length;

  return (
    <div style={s.page}>
      {/* Header card */}
      <div style={s.headerCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={s.headerIcon}>📡</div>
          <div>
            <div style={s.headerTitle}>Connected Accounts</div>
            <div style={s.headerSub}>
              {connectedCount} of {PLATFORMS.length} connected
            </div>
          </div>
          <div style={s.headerBadge}>
            {connectedCount}/{PLATFORMS.length}
          </div>
        </div>
        <div style={s.progressBar}>
          <div style={{ ...s.progressFill, width: `${(connectedCount / PLATFORMS.length) * 100}%` }} />
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
        <div style={s.grid}>
          {PLATFORMS.map(p => {
            const isConnected = connected.includes(p.id);
            const isConnecting = connecting === p.id;
            const isDisconnecting = disconnecting === p.id;
            return (
              <div key={p.id} style={{ ...s.card, ...(isConnected ? { ...s.cardConnected, borderColor: p.color + '40' } : {}) }}>
                {/* Platform header */}
                <div style={s.cardHeader}>
                  <div style={{ ...s.platformIcon, background: p.color + '15' }}>
                    <PlatformIcon platform={p} size={28} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={s.platformName}>{p.label}</div>
                    <div style={s.platformDesc}>{p.desc}</div>
                  </div>
                  <div style={{ ...s.statusDot, background: isConnected ? '#22c55e' : '#e2e8f0' }} />
                </div>

                {/* Status */}
                <div style={{ ...s.statusBadge, background: isConnected ? '#f0fdf4' : '#f8fafc',
                  color: isConnected ? '#15803d' : '#64748b',
                  border: `1px solid ${isConnected ? '#bbf7d0' : '#e2e8f0'}` }}>
                  {isConnected ? '✓ Connected' : 'Not connected'}
                </div>

                {/* Action button */}
                {isConnected ? (
                  <button
                    style={{ ...s.disconnectBtn, opacity: isDisconnecting ? 0.6 : 1 }}
                    onClick={() => handleDisconnect(p.id)}
                    disabled={isDisconnecting}
                  >
                    {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <button
                      style={{ ...s.connectBtn, borderColor: p.color, color: p.color,
                        opacity: isConnecting ? 0.6 : 1 }}
                      onClick={() => handleConnect(p.id)}
                      disabled={isConnecting}
                    >
                      {isConnecting ? 'Opening...' : `Connect ${p.label}`}
                    </button>
                    {p.id === 'tiktok' && (
                      <button
                        style={{ fontSize: 10, background: 'none', border: '1px dashed #cbd5e1', borderRadius: 6, padding: '3px 8px', color: '#94a3b8', cursor: 'pointer' }}
                        onClick={debugTikTokUrl}
                      >
                        🔍 Debug TikTok URL
                      </button>
                    )}
                  </div>
                )}
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
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' },
  card:        { background: '#fff', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.2s' },
  cardConnected:{ boxShadow: '0 4px 16px rgba(34,197,94,0.1)' },
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
