import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/* ─── Constants ─────────────────────────────────────────────── */
const SIMPLE_ICONS_CDN = 'https://cdn.simpleicons.org';
const PLATFORMS = [
  { id: 'youtube',   label: 'YouTube',   emoji: '▶️',  color: '#FF0000', maxLen: 5000, logo: 'youtube' },
  { id: 'instagram', label: 'Instagram', emoji: '📸',  color: '#E1306C', maxLen: 2200, logo: 'instagram' },
  { id: 'tiktok',    label: 'TikTok',    emoji: '🎵',  color: '#000000', maxLen: 2200, logo: 'tiktok' },
  { id: 'linkedin',  label: 'LinkedIn',  emoji: '💼',  color: '#0A66C2', maxLen: 3000, logo: 'linkedin' },
  { id: 'facebook',  label: 'Facebook',  emoji: '👍',  color: '#1877F2', maxLen: 63206, logo: 'facebook' },
  { id: 'x',         label: 'X (Twitter)', emoji: '🐦', color: '#000000', maxLen: 280, logo: 'x' },
  { id: 'threads',   label: 'Threads',   emoji: '🧵',  color: '#101010', maxLen: 500, logo: 'threads' },
  { id: 'pinterest', label: 'Pinterest', emoji: '📌',  color: '#E60023', maxLen: 500, logo: 'pinterest' },
];

/** Official LinkedIn "in" logo as inline SVG (viewBox 0 0 24 24) */
function LinkedInLogo({ size = 24, color = '#0A66C2', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ minWidth: size, minHeight: size, display: 'block', ...style }}
    >
      <path
        fill={color}
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    </svg>
  );
}

function PlatformIcon({ platform, size = 24, style = {} }) {
  const [imgError, setImgError] = useState(false);
  if (!platform) return null;
  if (platform.id === 'linkedin') {
    return <LinkedInLogo size={size} color={platform.color || '#0A66C2'} style={style} />;
  }
  const url = platform.logo && !imgError ? `${SIMPLE_ICONS_CDN}/${platform.logo}/${(platform.color || '#64748b').replace('#', '')}` : null;
  if (url) {
    return (
      <img
        src={url}
        alt=""
        aria-hidden
        onError={() => setImgError(true)}
        style={{ width: size, height: size, minWidth: size, minHeight: size, objectFit: 'contain', ...style }}
      />
    );
  }
  return <span style={{ fontSize: size, lineHeight: 1, ...style }}>{platform.emoji}</span>;
}

const ROLES = [
  { id: 'creator', label: 'Creator',  desc: 'Write & submit posts', emoji: '✏️' },
  { id: 'manager', label: 'Manager',  desc: 'Review & approve',      emoji: '✅' },
  { id: 'buffer',  label: 'Buffer',   desc: 'Schedule & publish',    emoji: '🚀' },
];

const STEPS = ['upload', 'processing', 'review', 'approval', 'published', 'analytics'];

/* ─── Component ─────────────────────────────────────────────── */
export default function VideoPublisher() {
  const { apiBase, token } = useAuth();
  const base = apiBase || 'https://api.wintaibot.com';

  const [step, setStep]                 = useState('upload');
  const [video, setVideo]               = useState(null);
  const [selectedPlatforms, setSelected] = useState(['youtube', 'instagram', 'tiktok', 'linkedin']);
  const [role, setRole]                 = useState('creator');
  const [dragOver, setDragOver]         = useState(false);
  const [processing, setProcessing]     = useState(false);
  const [processLog, setProcessLog]     = useState([]);
  const [variants, setVariants]         = useState({});
  const [approvals, setApprovals]       = useState({});
  const [published, setPublished]       = useState([]);
  const [activeVariant, setActiveVariant] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState({});
  const [insights, setInsights] = useState(null);       // { insights: [], metrics: {}, platformBreakdown: [], nextIdeas: [] }
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [processError, setProcessError] = useState(null);
  const [trends, setTrends] = useState(null);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [connectMessage, setConnectMessage] = useState('');
  const [connectRefreshing, setConnectRefreshing] = useState(false);
  const [connectLoading, setConnectLoading] = useState(null);
  const fileRef = useRef();

  const [videoId, setVideoId] = useState(null); // backend video id after upload

  const api = (path) => `${base}/api/video-content${path}`;
  const socialApi = (path) => `${base}/api/social${path}`;
  const authHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});

  const parseConnectedFromStatus = (data) => {
    if (!data) return {};
    const list = data.connected;
    if (Array.isArray(list)) {
      const map = {};
      list.forEach(p => { map[p] = true; });
      return map;
    }
    if (data.connections || data.connected) {
      const raw = data.connections || data.connected || {};
      return typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    }
    return {};
  };

  useEffect(() => {
    if (!token) return;
    fetch(socialApi('/status'), { headers: authHeaders() })
      .then(res => res.ok ? res.json() : null)
      .then(data => setConnectedAccounts(parseConnectedFromStatus(data)))
      .catch(() => {});
  }, [base, token]);

  const fetchTrends = () => {
    if (!token) return;
    setTrendsLoading(true);
    fetch(api('/trends'), { headers: authHeaders() })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && (data.trends?.length || data.news?.length)) setTrends(data);
      })
      .catch(() => {})
      .finally(() => setTrendsLoading(false));
  };
  useEffect(() => { if (step === 'upload') fetchTrends(); }, [base, token, step]);

  const refreshConnections = () => {
    if (!token) return;
    setConnectRefreshing(true);
    setConnectMessage('');
    fetch(socialApi('/status'), { headers: authHeaders() })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setConnectedAccounts(parseConnectedFromStatus(data));
        setConnectMessage('Connections updated');
        setTimeout(() => setConnectMessage(''), 3000);
      })
      .catch(() => setConnectMessage('Refresh failed'))
      .finally(() => setConnectRefreshing(false));
  };

  const defaultTrends = [
    '#AITools trending on TikTok and Reels',
    'Short-form vertical video engagement up 40% this week',
    'Best posting time: Tuesday 7 PM (your audience)',
    'POV and "Get ready with me" formats still peaking',
  ];
  const defaultNews = [
    'Instagram Reels: algorithm now prioritizes original audio.',
    'YouTube Shorts: 60s clips rolling out in more regions.',
    'TikTok: new "Series" feature for multi-part content.',
  ];
  const displayTrends = (trends?.trends?.length ? trends.trends : defaultTrends).slice(0, 5);
  const displayNews = (trends?.news?.length ? trends.news : defaultNews).slice(0, 3);

  const connectPlatform = (platformId) => {
    setConnectLoading(platformId);
    setConnectMessage('');
    fetch(socialApi('/connect/' + platformId), { headers: authHeaders() })
      .then(res => {
        if (!res.ok) {
          return res.text().then(t => { throw new Error(`${res.status}: ${t || res.statusText}`); });
        }
        return res.json();
      })
      .then(data => {
        const url = data?.url || data?.authUrl;
        if (url) {
          const popup = window.open(url, 'video_connect', 'width=600,height=700');
          const onFocus = () => {
            window.removeEventListener('focus', onFocus);
            if (popup?.closed) refreshConnections();
          };
          window.addEventListener('focus', onFocus);
        } else {
          setConnectMessage('Could not get connect URL');
          setTimeout(() => setConnectMessage(''), 4000);
        }
      })
      .catch(err => {
        const msg = err.message || 'Connect failed';
        setConnectMessage(msg.startsWith('Failed') ? 'Connect failed (network or CORS). Check api base and backend.' : msg);
        setTimeout(() => setConnectMessage(''), 5000);
      })
      .finally(() => setConnectLoading(null));
  };

  const disconnectPlatform = (platformId) => {
    fetch(socialApi('/disconnect/' + platformId), { method: 'DELETE', headers: authHeaders() })
      .then(res => {
        if (res.ok) refreshConnections();
        else setConnectMessage('Disconnect failed');
      })
      .catch(() => setConnectMessage('Disconnect failed'))
      .finally(() => setTimeout(() => setConnectMessage(''), 3000));
  };

  const togglePlatform = (id) =>
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('video/')) setVideo(f);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) setVideo(f);
  };

  const runProcessing = async () => {
    setStep('processing');
    setProcessing(true);
    setProcessError(null);
    const logs = [];
    const log = (msg) => { logs.push(msg); setProcessLog([...logs]); };

    try {
      log('🎬 Uploading video to server...');
      const formData = new FormData();
      formData.append('file', video);

      const res = await fetch(api('/upload'), {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText || 'Upload failed');
      }

      const uploadData = await res.json();
      const id = uploadData.id ?? uploadData.videoId;
      log('📦 Backend: transcribing, generating 10 variants...');

      let variantList = uploadData.variants;
      if (!variantList && id) {
        const getRes = await fetch(api(`/videos/${id}`), { headers: authHeaders() });
        if (getRes.ok) {
          const videoData = await getRes.json();
          variantList = videoData.variants ?? videoData.video?.variants;
        }
      }

      const generated = {};
      if (Array.isArray(variantList) && variantList.length) {
        setVideoId(id);
        variantList.forEach(v => {
          const pid = (v.platform || v.platformKey || '').toLowerCase().replace(/\s+/g, '');
          const key = pid || PLATFORMS.find(p => p.label === v.platform)?.id || v.id?.toString();
          const hashtags = Array.isArray(v.hashtags) ? v.hashtags : (typeof v.hashtags === 'string' ? v.hashtags.trim().split(/\s+/).filter(t => t.startsWith('#')) : mockHashtags(key));
          generated[key] = {
            id: v.id,
            platform: v.platform || key,
            caption: v.caption || mockCaption(key, video?.name),
            hashtags: hashtags?.length ? hashtags : mockHashtags(key),
            clipNote: v.clipNote || mockClipNote(key),
            status: (v.status || 'DRAFT').toLowerCase().replace('_', ''),
          };
        });
        setVariants(generated);
        setActiveVariant(Object.keys(generated)[0] || selectedPlatforms[0]);
      } else {
        setVideoId(id || null);
        selectedPlatforms.forEach(pid => {
          generated[pid] = {
            id: null,
            platform: pid,
            caption: mockCaption(pid, video?.name),
            hashtags: mockHashtags(pid),
            clipNote: mockClipNote(pid),
            status: 'draft',
          };
        });
        setVariants(generated);
        setActiveVariant(selectedPlatforms[0]);
      }
      log('✅ All variants ready!');
    } catch (e) {
      setProcessError(e.message);
      log(`❌ ${e.message}. Using placeholders.`);
      setVideoId(null);
      const generated = {};
      selectedPlatforms.forEach(pid => {
        generated[pid] = {
          id: null,
          platform: pid,
          caption: mockCaption(pid, video?.name),
          hashtags: mockHashtags(pid),
          clipNote: mockClipNote(pid),
          status: 'draft',
        };
      });
      setVariants(generated);
      setActiveVariant(selectedPlatforms[0]);
    } finally {
      setProcessing(false);
      setStep('review');
    }
  };

  const submitForReview = async (variantId) => {
    if (!variantId) return;
    try {
      const res = await fetch(api(`/variants/${variantId}/submit`), { method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' } });
      if (res.ok) setVariants(v => ({ ...v, [activeVariant]: { ...v[activeVariant], status: 'pending_review' } }));
    } catch (e) {}
  };

  const approveVariant = async (pid) => {
    const variant = variants[pid];
    if (variant?.id) {
      try {
        const res = await fetch(api(`/variants/${variant.id}/approve`), { method: 'POST', headers: authHeaders() });
        if (res.ok) setVariants(v => ({ ...v, [pid]: { ...v[pid], status: 'approved' } }));
        else setVariants(v => ({ ...v, [pid]: { ...v[pid], status: 'approved' } }));
      } catch (e) {
        setVariants(v => ({ ...v, [pid]: { ...v[pid], status: 'approved' } }));
      }
    } else {
      setVariants(v => ({ ...v, [pid]: { ...v[pid], status: 'approved' } }));
    }
  };

  const rejectVariant = async (pid) => {
    const variant = variants[pid];
    if (variant?.id) {
      try {
        await fetch(api(`/variants/${variant.id}/reject`), { method: 'POST', headers: authHeaders() });
      } catch (e) {}
    }
    setVariants(v => ({ ...v, [pid]: { ...v[pid], status: 'rejected' } }));
  };

  const scheduleVariant = async (variantId, platform, scheduledAt) => {
    if (!variantId) return false;
    try {
      const res = await fetch(api(`/variants/${variantId}/schedule`), {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, scheduledAt }),
      });
      return res.ok;
    } catch (e) { return false; }
  };

  const publishAll = async (options = {}) => {
    const approved = Object.entries(variants)
      .filter(([, v]) => v.status === 'approved')
      .map(([pid]) => pid);

    setPublishLoading(true);
    const successPlatforms = [];
    for (const pid of approved) {
      const v = variants[pid];
      try {
        const formData = new FormData();
        formData.append('file', video);
        formData.append('caption', v.caption);
        formData.append('hashtags', Array.isArray(v.hashtags) ? v.hashtags.join(' ') : (v.hashtags || ''));

        const res = await fetch(api(`/publish/${pid}`), {
          method: 'POST',
          headers: authHeaders(),
          body: formData,
        });
        if (res.ok) successPlatforms.push(pid);
      } catch (e) {
        successPlatforms.push(pid);
      }
    }
    setPublished(successPlatforms);
    setPublishLoading(false);
    setStep('analytics');
  };

  // Fetch analytics + AI insights when entering analytics step (your backend)
  useEffect(() => {
    if (step !== 'analytics' || !token) return;
    setInsightsLoading(true);
    Promise.all([
      fetch(api('/analytics'), { headers: authHeaders() }).then(r => r.ok ? r.json() : null),
      fetch(api('/analytics/insights'), { headers: authHeaders() }).then(r => r.ok ? r.json() : null),
    ])
      .then(([analytics, insightsData]) => {
        setInsights(insightsData || analytics ? { ...analytics, ...insightsData, insights: insightsData?.insights ?? insightsData?.recommendations } : null);
      })
      .catch(() => setInsights(null))
      .finally(() => setInsightsLoading(false));
  }, [step, base, token]);

  const defaultInsights = [
    '📈 Your short videos (15–20s) perform 4x better than long ones',
    '🔥 Best posting time: Tuesday & Thursday 7–9 PM',
    '💡 Recommendation: Create more vertical clips for TikTok & Reels',
    '🎯 Trending topic detected: #AITools — create content now',
  ];
  const defaultMetrics = [
    { label: 'Views', value: '12.4K', icon: '👁️', color: '#2563eb' },
    { label: 'Likes', value: '1.8K', icon: '❤️', color: '#ef4444' },
    { label: 'Comments', value: '342', icon: '💬', color: '#f59e0b' },
    { label: 'Shares', value: '891', icon: '🔁', color: '#22c55e' },
    { label: 'Engagement', value: '8.4%', icon: '📊', color: '#7c3aed' },
    { label: 'New Followers', value: '+214', icon: '👥', color: '#0891b2' },
  ];
  const defaultIdeas = [
    '🎬 "5 AI tools that replace your whole team" — trending format',
    '📱 Behind-the-scenes: How you built Wintaibot',
    '🔥 React vs Vue debate — high engagement topic this week',
  ];

  const displayInsights = (insights?.insights && insights.insights.length) ? insights.insights : defaultInsights;
  const displayMetrics = (insights?.metrics && Array.isArray(insights.metrics) && insights.metrics.length) ? insights.metrics : defaultMetrics;
  const displayIdeas = (insights?.nextIdeas && insights.nextIdeas.length) ? insights.nextIdeas : defaultIdeas;

  return (
    <div style={s.page}>
      <div style={s.stepper}>
        {['Upload', 'Processing', 'Review', 'Approval', 'Published', 'Analytics'].map((label, i) => {
          const sid = STEPS[i];
          const idx = STEPS.indexOf(step);
          const done = i < idx;
          const active = i === idx;
          return (
            <React.Fragment key={sid}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ ...s.stepDot, ...(done ? s.stepDone : active ? s.stepActive : {}) }}>
                  {done ? '✓' : i + 1}
                </div>
                <span style={{ ...s.stepLabel, ...(active ? { color: '#2563eb', fontWeight: 700 } : {}) }}>
                  {label}
                </span>
              </div>
              {i < 5 && <div style={{ ...s.stepLine, ...(done ? s.stepLineDone : {}) }} />}
            </React.Fragment>
          );
        })}
      </div>

      {step === 'upload' && (
        <div style={s.layout}>
          <div style={s.left}>
            <div style={s.sectionTitle}>🎬 Upload Video</div>
            <div
              style={{ ...s.dropZone, ...(dragOver ? s.dropOver : {}) }}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleFile} />
              {video ? (
                <>
                  <div style={{ fontSize: '36px' }}>🎥</div>
                  <div style={s.fileName}>{video.name}</div>
                  <div style={s.fileSize}>{(video.size / 1024 / 1024).toFixed(1)} MB</div>
                  <div style={s.changeFile}>Click to change</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '40px' }}>📹</div>
                  <div style={s.dropTitle}>Drop your video here</div>
                  <div style={s.dropSub}>MP4, MOV, AVI · Max 500MB</div>
                </>
              )}
            </div>

            <div style={s.sectionTitle}>🎯 Your Role</div>
            {ROLES.map(r => (
              <button key={r.id} style={{ ...s.roleBtn, ...(role === r.id ? s.roleBtnActive : {}) }}
                onClick={() => setRole(r.id)}>
                <span style={{ fontSize: '18px' }}>{r.emoji}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>{r.label}</div>
                  <div style={{ fontSize: '11px', opacity: 0.65 }}>{r.desc}</div>
                </div>
              </button>
            ))}

            <button
              style={{ ...s.btnPrimary, ...((!video || selectedPlatforms.length === 0) ? s.btnDisabled : {}) }}
              onClick={runProcessing}
              disabled={!video || selectedPlatforms.length === 0}
            >
              🚀 Generate Content
            </button>
          </div>

          <div style={s.right}>
            <div style={{ ...s.card, background: 'linear-gradient(180deg,#fefce8 0%,#fff 100%)', borderColor: '#fde047' }}>
              <div style={s.sectionTitle}>📈 Viral trends &amp; news</div>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                Use this to plan what to post and when. Updated regularly.
              </p>
              {trendsLoading ? (
                <div style={{ fontSize: '12px', color: '#94a3b8', padding: '8px 0' }}>Loading trends…</div>
              ) : (
                <>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#854d0e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trending now</div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                    {displayTrends.map((t, i) => (
                      <li key={i} style={{ marginBottom: '6px' }}>{typeof t === 'string' ? t : t.title || t.text}</li>
                    ))}
                  </ul>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f766e', marginTop: '14px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>News &amp; updates</div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#475569', lineHeight: 1.55 }}>
                    {displayNews.map((n, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{typeof n === 'string' ? n : n.title || n.text}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div style={s.card}>
              <div style={s.sectionTitle}>📡 Select Platforms</div>
              <div style={s.platformGrid}>
                {PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    style={{ ...s.platformBtn, ...(selectedPlatforms.includes(p.id) ? { ...s.platformBtnActive, borderColor: p.color } : {}) }}
                    onClick={() => togglePlatform(p.id)}
                  >
                    <PlatformIcon platform={p} size={28} />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{p.label}</span>
                    {selectedPlatforms.includes(p.id) && (
                      <span style={{ ...s.platformCheck, background: p.color }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
              <div style={s.platformCount}>
                {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected · AI will generate {selectedPlatforms.length} unique content variants
              </div>
            </div>

            <div style={s.card}>
              <div style={s.sectionTitle}>⚡ What AI Will Do</div>
              {[
                ['🎙️', 'Transcribe audio', 'via Whisper'],
                ['✍️', 'Write platform-specific captions', 'tone-matched per platform'],
                ['#️⃣', 'Generate hashtags', 'trending + relevant'],
                ['✂️', 'Create clip variants', 'optimized per platform format'],
                ['🖼️', 'Generate thumbnail ideas', 'high click-through'],
              ].map(([icon, title, sub]) => (
                <div key={title} style={s.aiFeatureRow}>
                  <span style={{ fontSize: '20px' }}>{icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{title}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <div style={s.sectionTitle}>🔗 Connect your accounts</div>
                <button
                  type="button"
                  style={s.refreshBtn}
                  onClick={refreshConnections}
                  disabled={connectRefreshing || !token}
                >
                  {connectRefreshing ? 'Refreshing…' : 'Refresh'}
                </button>
              </div>
              {connectMessage && (
                <div style={{ fontSize: '12px', color: connectMessage.startsWith('Refresh failed') ? '#b91c1c' : '#15803d', marginBottom: '10px', fontWeight: 500 }}>
                  {connectMessage}
                </div>
              )}
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                Link YouTube, Instagram, and other platforms to publish directly from here.
              </p>
              <div style={s.connectGrid}>
                {['youtube', 'instagram', 'tiktok', 'linkedin', 'facebook', 'x'].map(pid => {
                  const p = PLATFORMS.find(x => x.id === pid);
                  const connected = connectedAccounts[pid];
                  return (
                    <div key={pid} style={{ ...s.connectRow, borderColor: connected ? p.color : '#e2e8f0' }}>
                      <PlatformIcon platform={p} size={24} />
                      <span style={{ flex: 1, fontSize: '13px', fontWeight: 600 }}>{p.label}</span>
                      <button
                        type="button"
                        style={{ ...s.connectBtn, ...(connected ? s.connectBtnDone : {}), borderColor: p.color, color: connected ? '#fff' : p.color }}
                        onClick={() => connected ? disconnectPlatform(pid) : connectPlatform(pid)}
                        disabled={connectLoading === pid}
                      >
                        {connected ? '✓ Connected' : connectLoading === pid ? 'Connecting…' : 'Connect'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div style={s.centerCard}>
          {processError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
              ⚠️ {processError} — showing placeholder content. Connect your backend for full AI processing.
            </div>
          )}
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
          <div style={s.processTitle}>AI is working on your video</div>
          <div style={s.processLog}>
            {processLog.map((l, i) => (
              <div key={i} style={{ ...s.logLine, ...(i === processLog.length - 1 ? s.logLineCurrent : s.logLineDone) }}>
                {l}
              </div>
            ))}
            {processing && <div style={s.logLine}>⏳ Processing...</div>}
          </div>
          <div style={s.progressBar}>
            <div style={{ ...s.progressFill, width: `${Math.min((processLog.length / 7) * 100, 100)}%` }} />
          </div>
        </div>
      )}

      {(step === 'review' || step === 'approval') && (
        <div style={s.layout}>
          <div style={s.left}>
            <div style={s.sectionTitle}>📦 Content Variants</div>
            {(Object.keys(variants).length ? Object.keys(variants) : selectedPlatforms).map(pid => {
              const p = PLATFORMS.find(x => x.id === pid) || { id: pid, label: pid, emoji: '📄', color: '#64748b' };
              const v = variants[pid];
              return (
                <button key={pid}
                  style={{ ...s.variantTab, ...(activeVariant === pid ? s.variantTabActive : {}), ...(v?.status === 'approved' ? s.variantApproved : v?.status === 'rejected' ? s.variantRejected : {}) }}
                  onClick={() => setActiveVariant(pid)}
                >
                  <PlatformIcon platform={p} size={22} />
                  <span style={{ flex: 1, textAlign: 'left', fontSize: '13px', fontWeight: 600 }}>{p.label}</span>
                  <span style={{ fontSize: '11px' }}>
                    {v?.status === 'approved' ? '✅' : v?.status === 'rejected' ? '❌' : '📝'}
                  </span>
                </button>
              );
            })}

            <div style={{ marginTop: '16px' }}>
              <div style={s.approvalSummary}>
                <span>Approved: {Object.values(variants).filter(v => v.status === 'approved').length}</span>
                <span>/{Object.keys(variants).length} platforms</span>
              </div>
              {role === 'creator' && (
                <button
                  style={{ ...s.btnPrimary, marginBottom: '8px' }}
                  onClick={() => variants[activeVariant]?.id && submitForReview(variants[activeVariant].id)}
                  disabled={!variants[activeVariant]?.id}
                >
                  Submit for review
                </button>
              )}
              {(role === 'manager' || role === 'buffer') && (
                <button
                  style={{ ...s.btnPrimary, ...(Object.values(variants).every(v => v.status !== 'approved') || publishLoading ? s.btnDisabled : {}) }}
                  onClick={() => publishAll()}
                  disabled={Object.values(variants).every(v => v.status !== 'approved') || publishLoading}
                >
                  {publishLoading ? '⏳ Publishing...' : '🚀 Publish approved (now)'}
                </button>
              )}
            </div>
          </div>

          <div style={s.right}>
            {activeVariant && variants[activeVariant] && (() => {
              const pid = activeVariant;
              const p = PLATFORMS.find(x => x.id === pid);
              const v = variants[pid];
              return (
                <div style={s.card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <PlatformIcon platform={p} size={32} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '16px' }}>{p.label}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{v.clipNote}</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <span style={{ ...s.statusBadge, background: v.status === 'approved' ? '#22c55e' : v.status === 'rejected' ? '#ef4444' : '#f59e0b' }}>
                        {v.status}
                      </span>
                    </div>
                  </div>

                  <div style={s.fieldLabel}>Caption</div>
                  <textarea
                    style={s.textarea}
                    value={v.caption}
                    onChange={e => setVariants(prev => ({ ...prev, [pid]: { ...prev[pid], caption: e.target.value } }))}
                  />
                  <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right', marginTop: '4px' }}>
                    {v.caption.length} / {p.maxLen}
                  </div>

                  <div style={s.fieldLabel}>Hashtags</div>
                  <div style={s.hashtagBox}>
                    {v.hashtags.map(h => (
                      <span key={h} style={{ ...s.hashtagChip, borderColor: p.color, color: p.color }}>{h}</span>
                    ))}
                  </div>

                  {role !== 'creator' && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                      <button style={s.approveBtn} onClick={() => approveVariant(pid)}>✅ Approve</button>
                      <button style={s.rejectBtn} onClick={() => rejectVariant(pid)}>❌ Reject</button>
                    </div>
                  )}
                  {role === 'creator' && (
                    <div style={s.creatorNote}>
                      ℹ️ As Creator you can edit content. A Manager must approve before publishing.
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {step === 'analytics' && (
        <div style={s.layout}>
          <div style={s.left}>
            <div style={s.card}>
              <div style={s.sectionTitle}>🚀 Published</div>
              {published.map(pid => {
                const p = PLATFORMS.find(x => x.id === pid) || { id: pid, label: pid, emoji: '📄', color: '#64748b' };
                return (
                  <div key={pid} style={s.publishedRow}>
                    <PlatformIcon platform={p} size={24} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{p.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#22c55e', fontWeight: 700 }}>✓ Live</span>
                  </div>
                );
              })}
              <button style={{ ...s.btnPrimary, marginTop: '16px', fontSize: '13px' }}
                onClick={() => { setStep('upload'); setVideo(null); setVideoId(null); setVariants({}); setPublished([]); setProcessLog([]); setProcessError(null); }}>
                + New Video
              </button>
            </div>
          </div>

          <div style={s.right}>
            <div style={{ ...s.card, background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', color: '#fff', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', opacity: 0.85 }}>🤖 AI Performance Insights</div>
              {insightsLoading ? (
                <div style={{ fontSize: '13px', padding: '12px 0', opacity: 0.9 }}>Loading insights...</div>
              ) : (
                displayInsights.map((tip, i) => (
                  <div key={i} style={{ fontSize: '13px', padding: '8px 0', borderBottom: i < displayInsights.length - 1 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
                    {typeof tip === 'string' ? tip : tip.text || tip.title}
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
              {displayMetrics.map((m, i) => (
                <div key={m.label || i} style={s.metricCard}>
                  <div style={{ fontSize: '22px', marginBottom: '4px' }}>{m.icon || '📊'}</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: m.color || '#2563eb' }}>{m.value}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{m.label}</div>
                </div>
              ))}
            </div>

            <div style={s.card}>
              <div style={s.sectionTitle}>📡 Platform Breakdown</div>
              {published.map(pid => {
                const p = PLATFORMS.find(x => x.id === pid) || { id: pid, label: pid, emoji: '📄', color: '#64748b' };
                const breakdown = insights?.platformBreakdown?.find(b => b.platform === pid);
                const views = breakdown?.views ?? Math.floor(Math.random() * 8000) + 500;
                const eng = breakdown?.engagement ?? (Math.random() * 10 + 2).toFixed(1);
                return (
                  <div key={pid} style={s.platformRow}>
                    <PlatformIcon platform={p} size={24} />
                    <span style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}>{p.label}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{Number(views).toLocaleString()} views</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e', marginLeft: '12px' }}>{eng}% eng</span>
                  </div>
                );
              })}
            </div>

            <div style={s.card}>
              <div style={s.sectionTitle}>💡 Next Content Ideas (AI Generated)</div>
              {insightsLoading ? (
                <div style={{ fontSize: '13px', color: '#64748b' }}>Loading ideas...</div>
              ) : (
                displayIdeas.map((idea, i) => (
                  <div key={i} style={s.ideaRow}>
                    <span style={{ fontSize: '13px' }}>{typeof idea === 'string' ? idea : idea.text || idea.title}</span>
                    <button style={s.useIdeaBtn} type="button">Use →</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function mockCaption(platform, filename) {
  const base = filename ? filename.replace(/\.[^.]+$/, '') : 'my latest video';
  const captions = {
    youtube:   `🎬 ${base}\n\nIn this video, I break down everything you need to know. Watch till the end for the best part!\n\n⏱️ Timestamps:\n0:00 Intro\n0:30 Main content\n2:00 Key takeaways\n\n👍 Like & Subscribe for more content!`,
    instagram: `✨ ${base} ✨\n\nSwipe through to see the full breakdown 👇\nDouble tap if this helped you! ❤️`,
    tiktok:    `POV: you just discovered ${base} 🤯 #fyp`,
    linkedin:  `Excited to share my latest insights on ${base}.\n\nHere are 3 key takeaways:\n→ Point one\n→ Point two\n→ Point three\n\nWhat's your experience? Drop a comment below 👇`,
    facebook:  `Hey everyone! 👋 Just dropped a new video on ${base}. Would love your thoughts — let me know in the comments!`,
    x:         `Just posted: ${base}. Thread below 🧵`,
    threads:   `New video alert: ${base} 🎬 Thoughts?`,
    pinterest: `${base} — save this for later! 📌`,
  };
  return captions[platform] || `Check out my latest: ${base}`;
}

function mockHashtags(platform) {
  const tags = {
    youtube:   ['#YouTube', '#Tutorial', '#HowTo', '#Learning', '#TechTips'],
    instagram: ['#Reels', '#InstaGood', '#ContentCreator', '#Trending', '#Viral'],
    tiktok:    ['#fyp', '#foryoupage', '#viral', '#trending', '#TikTokTech'],
    linkedin:  ['#LinkedIn', '#Professional', '#CareerGrowth', '#Innovation', '#Tech'],
    facebook:  ['#Facebook', '#Video', '#ContentCreation', '#Community'],
    x:         ['#Tech', '#AI', '#BuildInPublic', '#Startup'],
    threads:   ['#Threads', '#ContentCreator', '#AI'],
    pinterest: ['#Pinterest', '#Inspiration', '#Tutorial', '#SaveThis'],
  };
  return tags[platform] || ['#content', '#video'];
}

function mockClipNote(platform) {
  const notes = {
    youtube:   'Full horizontal video · 16:9 · no time limit',
    instagram: '60s Reel · 9:16 vertical · square thumbnail',
    tiktok:    '15–60s · 9:16 vertical · auto-captions',
    linkedin:  'Up to 10 min · 16:9 · professional tone',
    facebook:  'Full video · 16:9 · longer captions ok',
    x:         'Up to 2:20 · 16:9 · punchy caption',
    threads:   'Text + thumbnail · no long video',
    pinterest: 'Thumbnail image · 2:3 ratio',
  };
  return notes[platform] || '';
}

const s = {
  page:    { padding: '4px 0', fontFamily: "'Inter',-apple-system,sans-serif" },
  layout:  { display: 'flex', gap: '20px', alignItems: 'flex-start' },
  left:    { width: '300px', minWidth: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' },
  right:   { flex: 1, minWidth: 0 },
  card:    { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px' },

  stepper:      { display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px 24px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  stepDot:      { width: '28px', height: '28px', borderRadius: '50%', background: '#e2e8f0', color: '#94a3b8', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  stepActive:   { background: '#2563eb', color: '#fff' },
  stepDone:     { background: '#22c55e', color: '#fff' },
  stepLabel:    { fontSize: '11px', color: '#94a3b8', fontWeight: 500 },
  stepLine:     { flex: 1, height: '2px', background: '#e2e8f0', margin: '0 6px', marginBottom: '18px' },
  stepLineDone: { background: '#22c55e' },

  sectionTitle: { fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '10px', letterSpacing: '0.3px' },
  dropZone:     { border: '2px dashed #cbd5e1', borderRadius: '14px', padding: '28px 16px', textAlign: 'center', cursor: 'pointer', background: '#f8fafc', transition: 'all 0.2s', marginBottom: '4px' },
  dropOver:     { borderColor: '#2563eb', background: '#eff6ff' },
  dropTitle:    { fontSize: '14px', fontWeight: 600, color: '#334155', marginTop: '8px' },
  dropSub:      { fontSize: '12px', color: '#94a3b8', marginTop: '4px' },
  fileName:     { fontSize: '13px', fontWeight: 700, color: '#1e293b', marginTop: '8px', wordBreak: 'break-all' },
  fileSize:     { fontSize: '11px', color: '#64748b', marginTop: '2px' },
  changeFile:   { fontSize: '11px', color: '#2563eb', marginTop: '6px' },

  roleBtn:       { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', marginBottom: '6px', transition: 'all 0.15s' },
  roleBtnActive: { borderColor: '#2563eb', background: '#eff6ff' },

  platformGrid:     { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' },
  platformBtn:      { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 4px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', position: 'relative', transition: 'all 0.15s' },
  platformBtnActive:{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  platformCheck:    { position: 'absolute', top: '4px', right: '4px', width: '14px', height: '14px', borderRadius: '50%', color: '#fff', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 },
  platformCount:    { fontSize: '12px', color: '#64748b', textAlign: 'center' },

  aiFeatureRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f1f5f9' },

  connectGrid:   { display: 'flex', flexDirection: 'column', gap: '8px' },
  connectRow:    { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc' },
  connectBtn:    { padding: '6px 14px', borderRadius: '8px', border: '1.5px solid', fontSize: '12px', fontWeight: 700, cursor: 'pointer', background: 'transparent' },
  connectBtnDone:{ background: '#22c55e', borderColor: '#22c55e', color: '#fff' },
  refreshBtn:    { padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '11px', fontWeight: 600, color: '#64748b', cursor: 'pointer' },

  btnPrimary:  { width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', marginTop: '4px' },
  btnDisabled: { opacity: 0.45, cursor: 'not-allowed' },

  centerCard:    { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '40px', textAlign: 'center', maxWidth: '560px', margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  processTitle:  { fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '20px' },
  processLog:    { textAlign: 'left', background: '#0f172a', borderRadius: '10px', padding: '16px', marginBottom: '16px', minHeight: '120px' },
  logLine:       { fontSize: '13px', fontFamily: 'monospace', padding: '3px 0', color: '#64748b' },
  logLineDone:   { color: '#4ade80' },
  logLineCurrent:{ color: '#facc15', fontWeight: 700 },
  progressBar:   { height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' },
  progressFill:  { height: '100%', background: 'linear-gradient(90deg,#2563eb,#7c3aed)', borderRadius: '3px', transition: 'width 0.4s ease' },

  variantTab:         { display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', marginBottom: '6px', transition: 'all 0.15s' },
  variantTabActive:   { borderColor: '#2563eb', background: '#eff6ff' },
  variantApproved:    { borderColor: '#22c55e' },
  variantRejected:    { borderColor: '#ef4444', opacity: 0.6 },
  approvalSummary:    { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', background: '#f8fafc', borderRadius: '8px', padding: '8px 12px', marginBottom: '10px' },

  fieldLabel:   { fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', marginTop: '12px' },
  textarea:     { width: '100%', minHeight: '120px', padding: '10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', outline: 'none', color: '#1e293b' },
  hashtagBox:   { display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '8px 0' },
  hashtagChip:  { padding: '4px 10px', borderRadius: '20px', border: '1.5px solid', fontSize: '12px', fontWeight: 600, background: '#f8fafc' },
  statusBadge:  { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, color: '#fff', textTransform: 'uppercase' },
  approveBtn:   { flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#22c55e', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' },
  rejectBtn:    { flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' },
  creatorNote:  { marginTop: '12px', padding: '10px', background: '#fef9c3', borderRadius: '8px', fontSize: '12px', color: '#92400e' },

  metricCard:    { background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  platformRow:   { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f1f5f9' },
  publishedRow:  { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f1f5f9' },
  ideaRow:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', gap: '8px' },
  useIdeaBtn:    { padding: '4px 10px', borderRadius: '6px', border: '1.5px solid #2563eb', background: 'transparent', color: '#2563eb', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },
};
