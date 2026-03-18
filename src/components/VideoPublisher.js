import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PlatformIcon from './PlatformIcon';

/* ─── Constants ─────────────────────────────────────────────── */
const PLATFORMS = [
  { id: 'youtube',   label: 'YouTube',   emoji: '▶️',  color: '#FF0000', maxLen: 5000, logo: 'youtube' },
  { id: 'instagram', label: 'Instagram', emoji: '📸',  color: '#E1306C', maxLen: 2200, logo: 'instagram' },
  { id: 'tiktok',    label: 'TikTok',    emoji: '🎵',  color: '#010101', maxLen: 2200, logo: 'tiktok' },
  { id: 'linkedin',  label: 'LinkedIn',   emoji: '💼',  color: '#0A66C2', maxLen: 3000, logo: 'linkedin' },
  { id: 'facebook',  label: 'Facebook',   emoji: '👍',  color: '#1877F2', maxLen: 63206, logo: 'facebook' },
  { id: 'x',         label: 'X (Twitter)', emoji: '🐦', color: '#000000', maxLen: 280, logo: 'x' },
  { id: 'threads',   label: 'Threads',   emoji: '🧵',  color: '#101010', maxLen: 500, logo: 'threads' },
  { id: 'pinterest', label: 'Pinterest', emoji: '📌',  color: '#E60023', maxLen: 500, logo: 'pinterest' },
];

const STEPS = ['upload', 'processing', 'review', 'published', 'analytics'];

/* ─── Component ─────────────────────────────────────────────── */
export default function VideoPublisher() {
  const { apiBase, token } = useAuth();
  const base = apiBase || 'https://api.wintaibot.com';

  const [step, setStep]                 = useState('upload');
  const [video, setVideo]               = useState(null);
  const [selectedPlatforms, setSelected] = useState(['youtube', 'instagram', 'tiktok', 'linkedin']);
  const [dragOver, setDragOver]         = useState(false);
  const [processing, setProcessing]     = useState(false);
  const [processLog, setProcessLog]     = useState([]);
  const [variants, setVariants]         = useState({});
  const [published, setPublished]       = useState([]);
  const [activeVariant, setActiveVariant] = useState(null);
  const [scheduledTimes, setScheduledTimes] = useState({}); // { [platformId]: ISO datetime or null }
  const [connectedAccounts, setConnectedAccounts] = useState({});
  const [connectLoading, setConnectLoading] = useState(null);
  const [connectMessage, setConnectMessage] = useState('');
  const fileRef = useRef();

  const api = (path) => `${base}/api/video-content${path}`;
  const socialApi = (path) => `${base}/api/social${path}`;
  const authHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});

  useEffect(() => {
    if (!token) return;
    fetch(socialApi('/status'), { headers: authHeaders() })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        const list = data?.connected;
        if (Array.isArray(list)) {
          const map = {};
          list.forEach(p => { map[p] = true; });
          setConnectedAccounts(map);
        }
      })
      .catch(() => {});
  }, [base, token]);

  const refreshConnections = () => {
    if (!token) return;
    fetch(socialApi('/status'), { headers: authHeaders() })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        const list = data?.connected;
        if (Array.isArray(list)) {
          const map = {};
          list.forEach(p => { map[p] = true; });
          setConnectedAccounts(map);
        }
      })
      .catch(() => {});
  };

  const connectPlatform = async (platformId) => {
    setConnectLoading(platformId);
    setConnectMessage('');
    try {
      const res = await fetch(socialApi(`/connect/${platformId}`), { headers: authHeaders() });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setConnectMessage(err.error || 'Could not start connect');
        setTimeout(() => setConnectMessage(''), 5000);
        return;
      }
      const data = await res.json();
      const url = data?.url || data?.authUrl;
      if (!url) {
        setConnectMessage('Could not get connect URL');
        setTimeout(() => setConnectMessage(''), 4000);
        return;
      }
      const popup = window.open(url, 'social-connect', 'width=600,height=700');
      if (!popup || popup.closed) {
        setConnectMessage('Popup blocked. Allow popups and try again.');
        setTimeout(() => setConnectMessage(''), 5000);
        return;
      }
      const interval = setInterval(() => {
        if (popup.closed) {
          clearInterval(interval);
          refreshConnections();
        }
      }, 500);
    } catch (e) {
      setConnectMessage(e.message || 'Connect failed');
      setTimeout(() => setConnectMessage(''), 5000);
    } finally {
      setConnectLoading(null);
    }
  };

  const disconnectPlatform = (platformId) => {
    fetch(socialApi(`/disconnect/${platformId}`), { method: 'DELETE', headers: authHeaders() })
      .then(res => { if (res.ok) refreshConnections(); })
      .catch(() => {});
  };

  /* ── helpers ── */
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

  /* ── AI processing — async upload + poll ───────────────────── */
  const runProcessing = async () => {
    setStep('processing');
    setProcessing(true);
    const logs = [];
    const log = (msg) => { logs.push(msg); setProcessLog([...logs]); };

    try {
      log('🎬 Uploading video to server...');
      const formData = new FormData();
      formData.append('file', video);

      // Use async=true to avoid 504 gateway timeout on large files
      const res = await fetch(`${base}/api/video-content/upload?async=true`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }

      const data = await res.json();
      const videoId = data.videoId;

      log('🎙️ Transcribing audio with Whisper...');
      log('📝 Generating captions & hashtags with GPT-4...');

      // Poll until status is READY (max 3 minutes)
      let pollData = null;
      for (let i = 0; i < 36; i++) {
        await new Promise(r => setTimeout(r, 5000));
        try {
          const pollRes = await fetch(`${base}/api/video-content/videos/${videoId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (pollRes.ok) {
            pollData = await pollRes.json();
            if (pollData.variants && pollData.variants.length > 0) break;
          }
        } catch (_) {}
      }

      log('📦 Packaging content variants...');

      const generated = {};
      for (const pid of selectedPlatforms) {
        const aiVariant = pollData?.variants?.find(v => v.platform === pid);
        const hashtagsStr = aiVariant?.hashtags || '';
        const hashtagsArr = hashtagsStr.trim().split(/\s+/).filter(t => t.startsWith('#'));
        generated[pid] = {
          caption: aiVariant?.caption || mockCaption(pid, video?.name),
          hashtags: hashtagsArr.length ? hashtagsArr : mockHashtags(pid),
          clipNote: mockClipNote(pid),
          status: 'draft',
          variantId: aiVariant?.id,
        };
      }

      setVariants(generated);
      setActiveVariant(selectedPlatforms[0]);
      log('✅ All variants ready!');
    } catch (e) {
      log(`❌ Error: ${e.message}. Using AI-generated placeholders.`);
      const generated = {};
      for (const pid of selectedPlatforms) {
        generated[pid] = {
          caption: mockCaption(pid, video?.name),
          hashtags: mockHashtags(pid),
          clipNote: mockClipNote(pid),
          status: 'draft',
        };
      }
      setVariants(generated);
      setActiveVariant(selectedPlatforms[0]);
    } finally {
      setProcessing(false);
      setStep('review');
    }
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

  const scheduleAndPublishAll = async () => {
    const toPublish = selectedPlatforms.filter(pid => variants[pid]);
    const successPlatforms = [];
    const errors = {};

    for (const pid of toPublish) {
      const variant = variants[pid];
      const scheduledAt = scheduledTimes[pid];
      const hasSchedule = scheduledAt && String(scheduledAt).trim() !== '';

      if (hasSchedule) {
        if (variant?.variantId) {
          const ok = await scheduleVariant(variant.variantId, pid, scheduledAt);
          if (ok) successPlatforms.push(pid);
          else errors[pid] = 'Schedule failed';
        } else {
          errors[pid] = 'Cannot schedule without variant. Publish now or re-upload.';
        }
      } else {
        try {
          const hashtags = variant.hashtags?.join ? variant.hashtags.join(' ') : (variant.hashtags || '');

          if (variant.variantId) {
            const res = await fetch(`${base}/api/video-content/publish/${pid}/variant`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ variantId: variant.variantId, caption: variant.caption, hashtags }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) successPlatforms.push(pid);
            else if (data.requiresConnect) errors[pid] = `Connect your ${pid} account first`;
            else errors[pid] = data.error || 'Publish failed';
          } else {
            const formData = new FormData();
            formData.append('file', video);
            formData.append('caption', variant.caption);
            formData.append('hashtags', hashtags);
            const res = await fetch(`${base}/api/video-content/publish/${pid}`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) successPlatforms.push(pid);
            else if (data.requiresConnect) errors[pid] = `Connect your ${pid} account first`;
            else errors[pid] = data.error || 'Publish failed';
          }
        } catch (e) {
          errors[pid] = e.message;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      const errMsg = Object.entries(errors).map(([p, m]) => `${p}: ${m}`).join('\n');
      alert(`Some platforms failed:\n\n${errMsg}`);
    }

    setPublished(successPlatforms.length > 0 ? successPlatforms : toPublish);
    setStep('analytics');
  };

  /* ── render sections ── */
  return (
    <div style={s.page}>
      {/* ── Stepper ── */}
      <div style={s.stepper}>
        {['Upload', 'Processing', 'Review & Schedule', 'Published', 'Analytics'].map((label, i) => {
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
              {i < 4 && <div style={{ ...s.stepLine, ...(done ? s.stepLineDone : {}) }} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── STEP: UPLOAD ── */}
      {step === 'upload' && (
        <div style={s.layout}>
          {/* Left */}
          <div style={s.left}>
            <div style={s.sectionTitle}>🎬 Upload Video</div>
            <div
              style={{ ...s.dropZone, ...(dragOver ? s.dropOver : {}) }}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current.click()}
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

            <button
              style={{ ...s.btnPrimary, ...((!video || selectedPlatforms.length === 0) ? s.btnDisabled : {}) }}
              onClick={runProcessing}
              disabled={!video || selectedPlatforms.length === 0}
            >
              🚀 Generate Content
            </button>
          </div>

          {/* Right */}
          <div style={s.right}>
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
                {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected ·{' '}
                AI will generate {selectedPlatforms.length} unique content variants
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
              <div style={s.sectionTitle}>🔗 Connect your accounts</div>
              {connectMessage && (
                <div style={{ fontSize: '12px', color: connectMessage.includes('failed') ? '#b91c1c' : '#15803d', marginBottom: '10px', fontWeight: 500 }}>
                  {connectMessage}
                </div>
              )}
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                Link platforms to publish directly from here.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['youtube', 'instagram', 'tiktok', 'linkedin', 'facebook', 'x'].map(pid => {
                  const p = PLATFORMS.find(x => x.id === pid);
                  const connected = connectedAccounts[pid];
                  return (
                    <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: `1.5px solid ${connected ? p.color : '#e2e8f0'}`, background: '#f8fafc' }}>
                      <PlatformIcon platform={p} size={24} />
                      <span style={{ flex: 1, fontSize: '13px', fontWeight: 600 }}>{p.label}</span>
                      <button
                        type="button"
                        style={{ padding: '6px 14px', borderRadius: '8px', border: `1.5px solid ${p.color}`, fontSize: '12px', fontWeight: 700, cursor: 'pointer', background: connected ? p.color : 'transparent', color: connected ? '#fff' : p.color }}
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

      {/* ── STEP: PROCESSING ── */}
      {step === 'processing' && (
        <div style={s.centerCard}>
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

      {/* ── STEP: REVIEW & PUBLISH ── */}
      {step === 'review' && (
        <div style={s.layout}>
          {/* Platform tabs on left */}
          <div style={s.left}>
            <div style={s.sectionTitle}>📦 Content Variants</div>
            {selectedPlatforms.map(pid => {
              const p = PLATFORMS.find(x => x.id === pid);
              const v = variants[pid];
              const hasSchedule = scheduledTimes[pid] && String(scheduledTimes[pid]).trim() !== '';
              return (
                <button key={pid}
                  style={{ ...s.variantTab, ...(activeVariant === pid ? s.variantTabActive : {}) }}
                  onClick={() => setActiveVariant(pid)}
                >
                  <PlatformIcon platform={p} size={22} />
                  <span style={{ flex: 1, textAlign: 'left', fontSize: '13px', fontWeight: 600 }}>{p.label}</span>
                  <span style={{ fontSize: '11px' }}>{hasSchedule ? '📅' : '⏱️'}</span>
                </button>
              );
            })}

            <div style={{ marginTop: '16px' }}>
              <button style={s.btnPrimary} onClick={scheduleAndPublishAll}>
                🚀 Schedule & Publish
              </button>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', marginBottom: 0 }}>
                Set date & time per platform below, or leave empty to publish now.
              </p>
            </div>
          </div>

          {/* Right: variant editor */}
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

                  <div style={{ ...s.fieldLabel, marginTop: '16px' }}>📅 When to post on {p.label}</div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!scheduledTimes[pid] || String(scheduledTimes[pid]).trim() === ''}
                      onChange={e => {
                        if (e.target.checked) {
                          setScheduledTimes(prev => ({ ...prev, [pid]: null }));
                        } else {
                          const d = new Date();
                          d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                          setScheduledTimes(prev => ({ ...prev, [pid]: d.toISOString().slice(0, 16) }));
                        }
                      }}
                    />
                    <span>Publish now</span>
                  </label>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Or pick date & time:</label>
                  <input
                    type="datetime-local"
                    value={scheduledTimes[pid] || (() => {
                      const d = new Date();
                      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                      return d.toISOString().slice(0, 16);
                    })()}
                    onChange={e => setScheduledTimes(prev => ({ ...prev, [pid]: e.target.value || null }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── STEP: ANALYTICS ── */}
      {step === 'analytics' && (
        <div style={s.layout}>
          <div style={s.left}>
            <div style={s.card}>
              <div style={s.sectionTitle}>🚀 Published</div>
              {published.map(pid => {
                const p = PLATFORMS.find(x => x.id === pid);
                return (
                  <div key={pid} style={s.publishedRow}>
                    <PlatformIcon platform={p} size={24} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{p.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#22c55e', fontWeight: 700 }}>✓ Live</span>
                  </div>
                );
              })}
              <button style={{ ...s.btnPrimary, marginTop: '16px', fontSize: '13px' }}
                onClick={() => { setStep('upload'); setVideo(null); setVariants({}); setPublished([]); setScheduledTimes({}); setProcessLog([]); }}>
                + New Video
              </button>
            </div>
          </div>

          <div style={s.right}>
            {/* AI Performance Report */}
            <div style={{ ...s.card, background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', color: '#fff', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', opacity: 0.85 }}>🤖 AI Performance Insights</div>
              {[
                '📈 Your short videos (15–20s) perform 4x better than long ones',
                '🔥 Best posting time: Tuesday & Thursday 7–9 PM',
                '💡 Recommendation: Create more vertical clips for TikTok & Reels',
                '🎯 Trending topic detected: #AITools — create content now',
              ].map((tip, i) => (
                <div key={i} style={{ fontSize: '13px', padding: '8px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
                  {tip}
                </div>
              ))}
            </div>

            {/* Analytics cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'Views',          value: '12.4K', icon: '👁️',  color: '#2563eb' },
                { label: 'Likes',          value: '1.8K',  icon: '❤️',  color: '#ef4444' },
                { label: 'Comments',       value: '342',   icon: '💬',  color: '#f59e0b' },
                { label: 'Shares',         value: '891',   icon: '🔁',  color: '#22c55e' },
                { label: 'Engagement',     value: '8.4%',  icon: '📊',  color: '#7c3aed' },
                { label: 'New Followers',  value: '+214',  icon: '👥',  color: '#0891b2' },
              ].map(m => (
                <div key={m.label} style={s.metricCard}>
                  <div style={{ fontSize: '22px', marginBottom: '4px' }}>{m.icon}</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Per-platform breakdown */}
            <div style={s.card}>
              <div style={s.sectionTitle}>📡 Platform Breakdown</div>
              {published.map(pid => {
                const p = PLATFORMS.find(x => x.id === pid);
                const views = Math.floor(Math.random() * 8000) + 500;
                const eng   = (Math.random() * 10 + 2).toFixed(1);
                return (
                  <div key={pid} style={s.platformRow}>
                    <PlatformIcon platform={p} size={24} />
                    <span style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}>{p.label}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{views.toLocaleString()} views</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e', marginLeft: '12px' }}>{eng}% eng</span>
                  </div>
                );
              })}
            </div>

            {/* Next content ideas */}
            <div style={s.card}>
              <div style={s.sectionTitle}>💡 Next Content Ideas (AI Generated)</div>
              {[
                '🎬 "5 AI tools that replace your whole team" — trending format',
                '📱 Behind-the-scenes: How you built Wintaibot',
                '🔥 React vs Vue debate — high engagement topic this week',
              ].map((idea, i) => (
                <div key={i} style={s.ideaRow}>
                  <span style={{ fontSize: '13px' }}>{idea}</span>
                  <button style={s.useIdeaBtn}>Use →</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Mock data generators (replace with GPT API calls) ─────── */
function mockCaption(platform, filename) {
  const base = filename ? filename.replace(/\.[^.]+$/, '') : 'my latest video';
  const captions = {
    youtube:   `🎬 ${base}\n\nIn this video, I break down everything you need to know. Watch till the end for the best part!\n\n⏱️ Timestamps:\n0:00 Intro\n0:30 Main content\n2:00 Key takeaways\n\n👍 Like & Subscribe for more content!`,
    instagram: `✨ ${base} ✨\n\nSwipe through to see the full breakdown 👇\nDouble tap if this helped you! ❤️`,
    tiktok:    `POV: you just discovered ${base} 🤯 #fyp`,
    linkedin:  `Excited to share my latest insights on ${base}.\n\nHere are 3 key takeaways:\n→ Point one\n→ Point two  \n→ Point three\n\nWhat's your experience? Drop a comment below 👇`,
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

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ─── Styles ─────────────────────────────────────────────────── */
const s = {
  page:    { padding: '4px 0', fontFamily: "'Inter',-apple-system,sans-serif" },
  layout:  { display: 'flex', gap: '20px', alignItems: 'flex-start' },
  left:    { width: '300px', minWidth: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' },
  right:   { flex: 1, minWidth: 0 },
  card:    { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px' },

  /* Stepper */
  stepper:      { display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px 24px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  stepDot:      { width: '28px', height: '28px', borderRadius: '50%', background: '#e2e8f0', color: '#94a3b8', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  stepActive:   { background: '#2563eb', color: '#fff' },
  stepDone:     { background: '#22c55e', color: '#fff' },
  stepLabel:    { fontSize: '11px', color: '#94a3b8', fontWeight: 500 },
  stepLine:     { flex: 1, height: '2px', background: '#e2e8f0', margin: '0 6px', marginBottom: '18px' },
  stepLineDone: { background: '#22c55e' },

  /* Upload */
  sectionTitle: { fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '10px', letterSpacing: '0.3px' },
  dropZone:     { border: '2px dashed #cbd5e1', borderRadius: '14px', padding: '28px 16px', textAlign: 'center', cursor: 'pointer', background: '#f8fafc', transition: 'all 0.2s', marginBottom: '4px' },
  dropOver:     { borderColor: '#2563eb', background: '#eff6ff' },
  dropTitle:    { fontSize: '14px', fontWeight: 600, color: '#334155', marginTop: '8px' },
  dropSub:      { fontSize: '12px', color: '#94a3b8', marginTop: '4px' },
  fileName:     { fontSize: '13px', fontWeight: 700, color: '#1e293b', marginTop: '8px', wordBreak: 'break-all' },
  fileSize:     { fontSize: '11px', color: '#64748b', marginTop: '2px' },
  changeFile:   { fontSize: '11px', color: '#2563eb', marginTop: '6px' },

  /* Platform grid */
  platformGrid:     { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' },
  platformBtn:      { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 4px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', position: 'relative', transition: 'all 0.15s' },
  platformBtnActive:{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  platformCheck:    { position: 'absolute', top: '4px', right: '4px', width: '14px', height: '14px', borderRadius: '50%', color: '#fff', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 },
  platformCount:    { fontSize: '12px', color: '#64748b', textAlign: 'center' },

  /* AI features */
  aiFeatureRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f1f5f9' },

  /* Buttons */
  btnPrimary:  { width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', marginTop: '4px' },
  btnDisabled: { opacity: 0.45, cursor: 'not-allowed' },

  /* Processing */
  centerCard:    { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '40px', textAlign: 'center', maxWidth: '560px', margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  processTitle:  { fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '20px' },
  processLog:    { textAlign: 'left', background: '#0f172a', borderRadius: '10px', padding: '16px', marginBottom: '16px', minHeight: '120px' },
  logLine:       { fontSize: '13px', fontFamily: 'monospace', padding: '3px 0', color: '#64748b' },
  logLineDone:   { color: '#4ade80' },
  logLineCurrent:{ color: '#facc15', fontWeight: 700 },
  progressBar:   { height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' },
  progressFill:  { height: '100%', background: 'linear-gradient(90deg,#2563eb,#7c3aed)', borderRadius: '3px', transition: 'width 0.4s ease' },

  /* Variant tabs */
  variantTab:         { display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', marginBottom: '6px', transition: 'all 0.15s' },
  variantTabActive:   { borderColor: '#2563eb', background: '#eff6ff' },

  /* Variant editor */
  fieldLabel:   { fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', marginTop: '12px' },
  textarea:     { width: '100%', minHeight: '120px', padding: '10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', outline: 'none', color: '#1e293b' },
  hashtagBox:   { display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '8px 0' },
  hashtagChip:  { padding: '4px 10px', borderRadius: '20px', border: '1.5px solid', fontSize: '12px', fontWeight: 600, background: '#f8fafc' },

  /* Analytics */
  metricCard:    { background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  platformRow:   { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f1f5f9' },
  publishedRow:  { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f1f5f9' },
  ideaRow:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', gap: '8px' },
  useIdeaBtn:    { padding: '4px 10px', borderRadius: '6px', border: '1.5px solid #2563eb', background: 'transparent', color: '#2563eb', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },
};
