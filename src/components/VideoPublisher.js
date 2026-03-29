import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMediaQuery } from '../hooks/useMediaQuery';
import PlatformIcon from './PlatformIcon';
import VideoTrimmer from './VideoTrimmer';
import PostDetailModal from './PostDetailModal';

/* ─── Constants ─────────────────────────────────────────────── */
const PLATFORMS = [
  { id: 'youtube',   label: 'YouTube',    emoji: '▶️',  color: '#FF0000', maxLen: 5000,  logo: 'youtube',   supports: ['video'] },
  { id: 'instagram', label: 'Instagram',  emoji: '📸',  color: '#E1306C', maxLen: 2200,  logo: 'instagram', supports: ['video', 'image'] },
  { id: 'tiktok',    label: 'TikTok',     emoji: '🎵',  color: '#010101', maxLen: 2200,  logo: 'tiktok',    supports: ['video'] },
  { id: 'linkedin',  label: 'LinkedIn',   emoji: '💼',  color: '#0A66C2', maxLen: 3000,  logo: 'linkedin',  supports: ['video', 'image', 'text'] },
  { id: 'facebook',  label: 'Facebook',   emoji: '👍',  color: '#1877F2', maxLen: 63206, logo: 'facebook',  supports: ['video', 'image', 'text'] },
  { id: 'x',         label: 'X (Twitter)',emoji: '🐦',  color: '#000000', maxLen: 280,   logo: 'x',         supports: ['video', 'image', 'text'] },
  { id: 'threads',   label: 'Threads',    emoji: '🧵',  color: '#101010', maxLen: 500,   logo: 'threads',   supports: ['video', 'image', 'text'] },
  { id: 'pinterest', label: 'Pinterest',  emoji: '📌',  color: '#E60023', maxLen: 500,   logo: 'pinterest', supports: ['image'] },
];

const PLATFORM_ID_TO_BACKEND = {
  youtube:   'YouTube',
  instagram: 'Instagram Post',
  tiktok:    'TikTok',
  linkedin:  'LinkedIn',
  facebook:  'Facebook',
  x:         'X (Twitter)',
  threads:   'Threads',
  pinterest: 'Pinterest',
};

const STEPS = ['upload', 'processing', 'review', 'publishing', 'analytics'];

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 * 1024; // 2GB
const ACCEPTED_FORMATS = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/mov'];
const ACCEPTED_EXTENSIONS = ['.mp4', '.mov', '.avi', '.webm'];

const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
const ACCEPTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

const POST_TYPES = [
  { id: 'video', label: 'Video',  icon: '📹' },
  { id: 'image', label: 'Image',  icon: '🖼️' },
  { id: 'text',  label: 'Text',   icon: '✍️' },
];

/* ── Video Frame Scrubber ─────────────────────────────────────────────────── */
function VideoFramePicker({ videoFile, onFrameSelected, thumbnailUrl }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [preview, setPreview] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [objUrl, setObjUrl] = useState(null);

  useEffect(() => {
    const url = URL.createObjectURL(videoFile);
    setObjUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.92);
  };

  const handleScrub = (e) => {
    const t = parseFloat(e.target.value);
    setCurrentTime(t);
    if (videoRef.current) videoRef.current.currentTime = t;
  };

  const handleSeeked = () => {
    setPreview(captureFrame());
  };

  const handleUseFrame = () => {
    const dataUrl = captureFrame();
    if (!dataUrl) return;
    setCapturing(true);
    // Convert dataURL → Blob → File
    fetch(dataUrl)
      .then(r => r.blob())
      .then(blob => {
        const file = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
        onFrameSelected(file, dataUrl);
        setSaved(true);
        setCapturing(false);
      })
      .catch(() => setCapturing(false));
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Hidden video + canvas for frame capture */}
      <video
        ref={videoRef}
        src={objUrl}
        onLoadedMetadata={e => setDuration(e.target.duration)}
        onSeeked={handleSeeked}
        style={{ display: 'none' }}
        crossOrigin="anonymous"
        preload="metadata"
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Preview frame */}
      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#0f172a', aspectRatio: '16/9' }}>
        {preview ? (
          <img src={preview} alt="frame preview" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 13 }}>
            Drag the slider to preview frames
          </div>
        )}
        {duration > 0 && (
          <div style={{ position: 'absolute', bottom: 8, right: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 6 }}>
            {fmt(currentTime)} / {fmt(duration)}
          </div>
        )}
      </div>

      {/* Scrubber */}
      {duration > 0 && (
        <input
          type="range" min={0} max={duration} step={0.1}
          value={currentTime}
          onChange={handleScrub}
          style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
        />
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleUseFrame}
          disabled={capturing || !preview}
          style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: (!preview || capturing) ? 0.5 : 1 }}
        >
          {capturing ? 'Saving…' : '📌 Use this frame'}
        </button>
        {(saved || thumbnailUrl) && (
          <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>✅ Thumbnail saved!</span>
        )}
      </div>

      {/* Current saved thumbnail */}
      {thumbnailUrl && (
        <div style={{ fontSize: 11, color: '#64748b' }}>
          Current thumbnail: <img src={thumbnailUrl} alt="thumbnail" style={{ height: 40, borderRadius: 4, verticalAlign: 'middle', marginLeft: 6, border: '1px solid #e2e8f0' }} />
        </div>
      )}
    </div>
  );
}

function validateVideo(file) {
  if (!file) return null;
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  const isValidType = file.type.startsWith('video/') && (ACCEPTED_FORMATS.includes(file.type) || ACCEPTED_EXTENSIONS.includes(ext));
  if (!isValidType) {
    return `❌ "${file.name}" is not supported. Please use MP4, MOV, AVI, or WebM.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(0);
    return `❌ File is too large (${sizeMB} MB). Maximum allowed size is 2GB (2,048 MB).`;
  }
  return null;
}

function validateImage(file) {
  if (!file) return null;
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  const isValid = ACCEPTED_IMAGE_FORMATS.includes(file.type) || ACCEPTED_IMAGE_EXTENSIONS.includes(ext);
  if (!isValid) return `❌ "${file.name}" is not supported. Please use JPG, PNG, GIF, or WebP.`;
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    return `❌ Image is too large (${sizeMB} MB). Maximum allowed size is 20 MB.`;
  }
  return null;
}

/* ─── Component ─────────────────────────────────────────────── */
export default function VideoPublisher({ onNavigateToSocialConnect }) {
  const { apiBase, token, logout, user } = useAuth();
  const isGrowth = user?.membershipType === 'GROWTH';
  const base = apiBase || 'https://api.wintaibot.com';
  const isMobile = useMediaQuery('(max-width: 768px)');

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
  const [canSkipProcessing, setCanSkipProcessing] = useState(false);
  const [contentIdea, setContentIdea] = useState(null);
  const [publishError, setPublishError] = useState(null); // { message, platforms, requiresReconnect, requiresReLogin }
  const [fileError, setFileError] = useState(null);
  // { [pid]: { state: 'queued'|'publishing'|'done'|'failed', error: null|string } }
  const [publishingStatus, setPublishingStatus] = useState({});
  const [postType, setPostType]       = useState('video'); // 'video' | 'image' | 'text'
  const [publishType, setPublishType] = useState('reels'); // 'reels' | 'story' (for Instagram/Facebook)
  const [imageFile, setImageFile]     = useState(null);
  const [textCaption, setTextCaption] = useState('');
  const [dashStats, setDashStats]     = useState(null);
  const [dashHistory, setDashHistory] = useState([]);
  const [dashLoading, setDashLoading] = useState(false);
  const [retryingId, setRetryingId]   = useState(null);
  const [historyDetailPost, setHistoryDetailPost] = useState(null);
  const [videoDurationSec, setVideoDurationSec] = useState(0);
  // Thumbnail picker state
  const [uploadedVideoId, setUploadedVideoId] = useState(null);
  const [frames, setFrames]             = useState([]);
  const [framesLoading, setFramesLoading] = useState(false);
  const [selectedFrameKey, setSelectedFrameKey] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [thumbnailMode, setThumbnailMode] = useState('scrub'); // 'scrub' | 'ai'
  const [showTrimmer, setShowTrimmer] = useState(false); // Growth-only trim modal
  const [captionOptions, setCaptionOptions] = useState({}); // { [pid]: [{id,label,text}] }
  const [selectedOptionIdx, setSelectedOptionIdx] = useState({}); // { [pid]: number }
  const [captionHistory, setCaptionHistory] = useState({}); // { [pid]: string[] }
  const [showCaptionGuide, setShowCaptionGuide] = useState(() => {
    try { return localStorage.getItem('wintaibot_caption_guide_seen') !== '1'; } catch (_) { return true; }
  });
  const fileRef    = useRef();
  const imageRef   = useRef();
  const skippedRef = useRef(false);
  const publishErrorsRef = useRef({});

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

  const loadDashboard = () => {
    if (!token) return;
    setDashLoading(true);
    Promise.all([
      fetch(`${base}/api/social/post/stats`,   { headers: authHeaders() }).then(r => r.ok ? r.json() : null),
      fetch(`${base}/api/social/post/history?limit=10`, { headers: authHeaders() }).then(r => r.ok ? r.json() : []),
    ]).then(([stats, history]) => {
      if (stats)   setDashStats(stats);
      if (history) setDashHistory(history);
    }).catch(() => {}).finally(() => setDashLoading(false));
  };

  useEffect(() => { loadDashboard(); }, [base, token]); // eslint-disable-line

  const handleRetry = async (id) => {
    setRetryingId(id);
    try {
      const res = await fetch(`${base}/api/social/post/retry/${id}`, {
        method: 'POST', headers: authHeaders(),
      });
      if (res.ok) loadDashboard();
    } catch (_) {}
    finally { setRetryingId(null); }
  };

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

  const createOptionsForPlatform = (pid, baseCaption = '') => {
    const text = String(baseCaption || '').trim() || mockCaption(pid, video?.name);
    return buildCaptionOptions(pid, text);
  };

  const seedCaptionStudio = (generated) => {
    const nextOptions = {};
    const nextSelected = {};
    const nextHistory = {};
    Object.entries(generated || {}).forEach(([pid, variant]) => {
      const options = createOptionsForPlatform(pid, variant?.caption || '');
      nextOptions[pid] = options;
      nextSelected[pid] = 0;
      nextHistory[pid] = [];
    });
    setCaptionOptions(nextOptions);
    setSelectedOptionIdx(nextSelected);
    setCaptionHistory(nextHistory);
  };

  const regenerateCaptionOptions = (pid, style = 'balanced', tone = 'casual') => {
    const current = variants[pid]?.caption || '';
    const options = buildCaptionOptions(pid, current || mockCaption(pid, video?.name), { style, tone });
    setCaptionOptions(prev => ({ ...prev, [pid]: options }));
    setSelectedOptionIdx(prev => ({ ...prev, [pid]: 0 }));
  };

  const pushCaptionHistory = (pid, previousCaption) => {
    if (typeof previousCaption !== 'string' || !previousCaption.trim()) return;
    setCaptionHistory(prev => ({
      ...prev,
      [pid]: [...(prev[pid] || []), previousCaption],
    }));
  };

  const applyCaptionText = (pid, nextCaption, trackHistory = true) => {
    if (!variants[pid]) return;
    const prevCaption = variants[pid].caption || '';
    if (trackHistory && prevCaption !== nextCaption) pushCaptionHistory(pid, prevCaption);
    setVariants(prev => ({ ...prev, [pid]: { ...prev[pid], caption: nextCaption } }));
  };

  const selectCaptionOption = (pid, optionIndex) => {
    const options = captionOptions[pid] || [];
    const option = options[optionIndex];
    if (!option) return;
    setSelectedOptionIdx(prev => ({ ...prev, [pid]: optionIndex }));
    applyCaptionText(pid, option.text, true);
  };

  const undoCaptionEdit = (pid) => {
    const stack = captionHistory[pid] || [];
    if (stack.length === 0) return;
    const previous = stack[stack.length - 1];
    setCaptionHistory(prev => ({ ...prev, [pid]: stack.slice(0, -1) }));
    setVariants(prev => ({ ...prev, [pid]: { ...prev[pid], caption: previous } }));
  };

  const resetCaptionToSelectedOption = (pid) => {
    const idx = selectedOptionIdx[pid] ?? 0;
    const option = (captionOptions[pid] || [])[idx];
    if (!option) return;
    applyCaptionText(pid, option.text, true);
  };

  const applyCaptionRewrite = (pid, action) => {
    const current = variants[pid]?.caption || '';
    if (!current.trim()) return;
    const rewritten = rewriteCaption(current, action, pid);
    applyCaptionText(pid, rewritten, true);
  };

  const dismissCaptionGuide = () => {
    setShowCaptionGuide(false);
    try { localStorage.setItem('wintaibot_caption_guide_seen', '1'); } catch (_) {}
  };

  useEffect(() => {
    if (step !== 'review') return;
    if (!activeVariant || !variants[activeVariant]) return;
    if (!captionOptions[activeVariant] || captionOptions[activeVariant].length === 0) {
      const options = createOptionsForPlatform(activeVariant, variants[activeVariant].caption || '');
      setCaptionOptions(prev => ({ ...prev, [activeVariant]: options }));
      setSelectedOptionIdx(prev => ({ ...prev, [activeVariant]: 0 }));
      setCaptionHistory(prev => ({ ...prev, [activeVariant]: prev[activeVariant] || [] }));
    }
  }, [step, activeVariant, variants, captionOptions]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const switchPostType = (type) => {
    setPostType(type);
    setVideo(null);
    setImageFile(null);
    setTextCaption('');
    setFileError(null);
    setVariants({});
    setPublished([]);
    setStep('upload');
    // Keep only platforms that support the new type
    setSelected(prev => prev.filter(id => {
      const p = PLATFORMS.find(x => x.id === id);
      return p && p.supports.includes(type);
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (!f) return;
    if (postType === 'image') {
      const err = validateImage(f);
      if (err) { setFileError(err); setImageFile(null); }
      else { setFileError(null); setImageFile(f); }
    } else {
      const err = validateVideo(f);
      if (err) { setFileError(err); setVideo(null); }
      else { setFileError(null); setVideo(f); }
    }
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const err = validateVideo(f);
    if (err) { setFileError(err); setVideo(null); }
    else { setFileError(null); setVideo(f); }
  };

  const handleImageFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const err = validateImage(f);
    if (err) { setFileError(err); setImageFile(null); }
    else { setFileError(null); setImageFile(f); }
  };

  const applyIdeaForNextVideo = (idea) => {
    setStep('upload');
    setVideo(null);
    setVariants({});
    setPublished([]);
    setScheduledTimes({});
    setProcessLog([]);
    setContentIdea(idea);
  };

  const usePlaceholders = () => {
    skippedRef.current = true;
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
    seedCaptionStudio(generated);
    setProcessing(false);
    setStep('review');
    setProcessLog(prev => [...prev, '⏭️ Skipped — using template captions. Edit before publishing.']);
  };

  /* ── Image / Text quick path — skip video pipeline ────────── */
  const runImageOrTextProcessing = () => {
    const generated = {};
    const sourceName = postType === 'image' ? (imageFile?.name || 'image') : 'post';
    for (const pid of selectedPlatforms) {
      generated[pid] = {
        caption: textCaption.trim() || mockCaption(pid, sourceName),
        hashtags: mockHashtags(pid),
        clipNote: '',
        status: 'draft',
        variantId: null,
      };
    }
    setVariants(generated);
    setActiveVariant(selectedPlatforms[0]);
    seedCaptionStudio(generated);
    setStep('review');
  };

  /* ── AI processing — async upload + poll ───────────────────── */
  const runProcessing = async () => {
    if (postType === 'image' || postType === 'text') {
      runImageOrTextProcessing();
      return;
    }
    skippedRef.current = false;
    setCanSkipProcessing(false);
    setStep('processing');
    setProcessing(true);
    const skipTimer = setTimeout(() => setCanSkipProcessing(true), 3000);
    const logs = [];
    const log = (msg) => { logs.push(msg); setProcessLog([...logs]); };

    try {
      log('🎬 Uploading video to server...');
      const formData = new FormData();
      formData.append('file', video);
      if (contentIdea) formData.append('prompt', contentIdea);

      const res = await fetch(`${base}/api/video-content/upload?async=true`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 504) throw new Error('Upload timed out. Try a smaller video or check your connection.');
        if (res.status === 500) throw new Error(err.error || err.message || 'Server error. Try again or use Skip below.');
        throw new Error(err.error || err.message || 'Upload failed');
      }

      const data = await res.json();
      const videoId = data.videoId ?? data.id;
      setUploadedVideoId(videoId);

      log('🎙️ Transcribing audio with Whisper...');
      log('📝 Generating captions & hashtags with GPT-4...');

      // Poll until variants ready (max 2 min, every 3 sec)
      let pollData = null;
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 3000));
        try {
          const pollRes = await fetch(`${base}/api/video-content/videos/${videoId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (pollRes.ok) {
            pollData = await pollRes.json();
            if (pollData.variants && pollData.variants.length > 0) break;
            if (pollData.status === 'FAILED') {
              log('⚠️ Processing failed. Using template captions.');
              break;
            }
          }
        } catch (_) {}
      }

      log('📦 Packaging content variants...');

      if (pollData?.durationSeconds) setVideoDurationSec(pollData.durationSeconds);

      const generated = {};
      for (const pid of selectedPlatforms) {
        const aiVariant = pollData?.variants?.find(v => v.platform === PLATFORM_ID_TO_BACKEND[pid]);
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

      if (!skippedRef.current) {
        setVariants(generated);
        setActiveVariant(selectedPlatforms[0]);
        seedCaptionStudio(generated);
        log('✅ All variants ready!');
      }
    } catch (e) {
      if (skippedRef.current) return;
      log(`❌ ${e.message} Using template captions — edit before publishing.`);
      const generated = {};
      for (const pid of selectedPlatforms) {
        generated[pid] = {
          caption: mockCaption(pid, video?.name),
          hashtags: mockHashtags(pid),
          clipNote: mockClipNote(pid),
          status: 'draft',
        };
      }
      if (!skippedRef.current) {
        setVariants(generated);
        setActiveVariant(selectedPlatforms[0]);
        seedCaptionStudio(generated);
      }
    } finally {
      clearTimeout(skipTimer);
      if (!skippedRef.current) {
        setProcessing(false);
        setStep('review');
      }
    }
  };

  /**
   * Poll GET /variants/{id}/publish-status every 5s until PUBLISHED or APPROVED (failed).
   * Returns 'PUBLISHED', 'FAILED', or 'TIMEOUT'.
   */
  const pollPublishStatus = async (variantId, pid) => {
    for (let i = 0; i < 40; i++) { // 40 × 5s = 3 min 20s max
      await new Promise(r => setTimeout(r, 5000));
      try {
        const res = await fetch(api(`/variants/${variantId}/publish-status`), {
          headers: authHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'PUBLISHED') return 'PUBLISHED';
          if (data.status === 'APPROVED') {
            // Backend reset it = publish failed
            publishErrorsRef.current[variantId] = data.error || 'Publish failed';
            return 'FAILED';
          }
          // Still PUBLISHING — keep polling
        }
      } catch (_) { /* network blip — keep polling */ }
    }
    return 'TIMEOUT';
  };

  const loadFrames = async (videoId) => {
    if (!videoId || framesLoading) return;
    setFramesLoading(true);
    setFrames([]);
    try {
      const res = await fetch(api(`/videos/${videoId}/frames?count=9`), { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setFrames(data);
      }
    } catch (_) {}
    finally { setFramesLoading(false); }
  };

  const pickThumbnail = async (videoId, frame) => {
    setSelectedFrameKey(frame.s3Key);
    try {
      const res = await fetch(api(`/videos/${videoId}/thumbnail`), {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ s3Key: frame.s3Key }),
      });
      if (res.ok) {
        const data = await res.json();
        setThumbnailUrl(data.thumbnailUrl);
      }
    } catch (_) {}
  };

  const uploadFrameThumbnail = async (videoId, imageFile, previewDataUrl) => {
    setThumbnailUrl(previewDataUrl); // show preview immediately
    try {
      const form = new FormData();
      form.append('file', imageFile, 'thumbnail.jpg');
      const res = await fetch(api(`/videos/${videoId}/thumbnail/upload`), {
        method: 'POST',
        headers: authHeaders(),
        body: form,
      });
      if (res.ok) {
        const data = await res.json();
        setThumbnailUrl(data.thumbnailUrl || previewDataUrl);
      }
    } catch (_) {}
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
    if (!token) {
      setPublishError({ message: 'Your session expired. Log out and log in again.', platforms: [], requiresReconnect: false, requiresReLogin: true });
      return;
    }
    const toPublish = selectedPlatforms.filter(pid => variants[pid]);
    publishErrorsRef.current = {};

    // Init per-platform status and go to publishing step immediately
    const initStatus = {};
    toPublish.forEach(pid => { initStatus[pid] = { state: 'queued', error: null }; });
    setPublishingStatus(initStatus);
    setStep('publishing');

    const successPlatforms = [];

    for (const pid of toPublish) {
      const variant = variants[pid];
      const scheduledAt = scheduledTimes[pid];
      const hasSchedule = scheduledAt && String(scheduledAt).trim() !== '';
      const hashtags = variant.hashtags?.join ? variant.hashtags.join(' ') : (variant.hashtags || '');

      setPublishingStatus(prev => ({ ...prev, [pid]: { state: 'publishing', error: null } }));

      try {
        if (hasSchedule && variant.variantId) {
          // ── Schedule for later via backend variant (fast) ──
          const ok = await scheduleVariant(variant.variantId, pid, scheduledAt);
          if (ok) {
            successPlatforms.push(pid);
            setPublishingStatus(prev => ({ ...prev, [pid]: { state: 'done', error: null } }));
          } else {
            setPublishingStatus(prev => ({ ...prev, [pid]: { state: 'failed', error: 'Schedule failed' } }));
          }
        } else if (variant.variantId) {
          // ── Async publish via variant (202 + poll) ──
          const res = await fetch(api(`/publish/${pid}/variant`), {
            method: 'POST',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ variantId: variant.variantId, caption: variant.caption, hashtags, publishType }),
          });
          const data = await res.json().catch(() => ({}));

          if (res.status === 202 || res.ok) {
            // Backend accepted — now poll for result
            const result = await pollPublishStatus(variant.variantId, pid);
            if (result === 'PUBLISHED') {
              successPlatforms.push(pid);
              setPublishingStatus(prev => ({ ...prev, [pid]: { state: 'done', error: null } }));
            } else {
              const err = publishErrorsRef.current[variant.variantId] || (result === 'TIMEOUT' ? 'Timed out waiting for Meta' : 'Publish failed');
              setPublishingStatus(prev => ({ ...prev, [pid]: { state: 'failed', error: err } }));
            }
          } else if (res.status === 409 && data.status === 'PUBLISHED') {
            successPlatforms.push(pid);
            setPublishingStatus(prev => ({ ...prev, [pid]: { state: 'done', error: null } }));
          } else if (res.status === 409 && data.status === 'PUBLISHING') {
            // Already in-flight from a previous click — poll it
            const result = await pollPublishStatus(variant.variantId, pid);
            if (result === 'PUBLISHED') {
              successPlatforms.push(pid);
              setPublishingStatus(prev => ({ ...prev, [pid]: { state: 'done', error: null } }));
            } else {
              const err = publishErrorsRef.current[variant.variantId] || 'Still publishing — check back later';
              setPublishingStatus(prev => ({ ...prev, [pid]: { state: 'failed', error: err } }));
            }
          } else if (res.status === 401) {
            setPublishingStatus(prev => ({ ...prev, [pid]: { state: 'failed', error: 'Session expired — log out and in again' } }));
          } else if (data.requiresConnect) {
            setPublishingStatus(prev => ({ ...prev, [pid]: { state: 'failed', error: `Connect your ${pid} account in Connected Accounts` } }));
          } else {
            setPublishingStatus(prev => ({ ...prev, [pid]: { state: 'failed', error: data.error || 'Publish failed' } }));
          }
        } else if (postType === 'image' || postType === 'text') {
          // ── Image / Text publish via /api/social/post/{platform} ──
          const fd = new FormData();
          if (postType === 'image' && imageFile) fd.append('file', imageFile);
          fd.append('caption', variant.caption || '');
          fd.append('hashtags', hashtags);
          const res = await fetch(`${base}/api/social/post/${pid}`, {
            method: 'POST',
            headers: authHeaders(),
            body: fd,
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok) {
            successPlatforms.push(pid);
            setPublishingStatus(prev => ({ ...prev, [pid]: { state: 'done', error: null } }));
          } else {
            setPublishingStatus(prev => ({ ...prev, [pid]: { state: 'failed', error: data.error || 'Publish failed' } }));
          }
        } else {
          // ── Fallback: no variantId — upload file directly (sync, fast platforms) ──
          const fd = new FormData();
          fd.append('file', video);
          fd.append('caption', variant.caption || '');
          fd.append('hashtags', hashtags);
          fd.append('postType', publishType);
          const res = await fetch(api(`/publish/${pid}`), {
            method: 'POST',
            headers: authHeaders(),
            body: fd,
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok) {
            successPlatforms.push(pid);
            setPublishingStatus(prev => ({ ...prev, [pid]: { state: 'done', error: null } }));
          } else {
            setPublishingStatus(prev => ({ ...prev, [pid]: { state: 'failed', error: data.error || 'Publish failed' } }));
          }
        }
      } catch (e) {
        setPublishingStatus(prev => ({ ...prev, [pid]: { state: 'failed', error: `Network error: ${e.message}` } }));
      }
    }

    setPublished(successPlatforms);
    if (successPlatforms.length > 0) loadDashboard();
  };

  /* ── render sections ── */
  return (
    <div style={s.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Video Trimmer modal (Growth only) ── */}
      {showTrimmer && video && (
        <VideoTrimmer
          videoFile={video}
          onApply={(trimmedFile) => {
            setVideo(trimmedFile);
            setShowTrimmer(false);
          }}
          onCancel={() => setShowTrimmer(false)}
        />
      )}

      {/* ── Publish error modal ── */}
      {publishError && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px',
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '24px', maxWidth: '420px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '12px' }}>⚠️ Some platforms failed</div>
            <pre style={{ fontSize: '13px', color: '#475569', whiteSpace: 'pre-wrap', margin: '0 0 20px', fontFamily: 'inherit' }}>
              {publishError.message}
            </pre>
            {publishError.requiresReLogin && logout && (
              <button
                type="button"
                onClick={() => { setPublishError(null); logout(); window.location.href = '/'; }}
                style={{ ...s.btnPrimary, width: '100%', marginBottom: '10px' }}
              >
                Log out & Sign in again →
              </button>
            )}
            {publishError.requiresReconnect && !publishError.requiresReLogin && onNavigateToSocialConnect && (
              <button
                type="button"
                onClick={() => { setPublishError(null); onNavigateToSocialConnect(); }}
                style={{ ...s.btnPrimary, width: '100%', marginBottom: '10px' }}
              >
                Go to Connected Accounts →
              </button>
            )}
            <button
              type="button"
              onClick={() => setPublishError(null)}
              style={{ ...s.btnOutline, width: '100%' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── Stepper ── */}
      <div style={{ ...s.stepper, ...(isMobile ? { flexWrap: 'wrap', gap: '12px', padding: '12px 16px', justifyContent: 'center' } : {}) }}>
        {['Upload', 'Processing', 'Review & Schedule', 'Publishing', 'Analytics'].map((label, i) => {
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
                <span style={{ ...s.stepLabel, ...(active ? { color: '#2563eb', fontWeight: 700 } : {}), ...(isMobile ? { fontSize: '10px' } : {}) }}>
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
        <div style={{ ...s.layout, ...(isMobile ? { flexDirection: 'column', flexWrap: 'wrap' } : {}) }}>
          {/* Left */}
          <div style={{ ...s.left, ...(isMobile ? { width: '100%', minWidth: 0 } : {}) }}>

            {/* ── Post type selector ── */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {POST_TYPES.map(pt => (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => switchPostType(pt.id)}
                  style={{
                    flex: 1, padding: '10px 8px', borderRadius: '10px', border: `2px solid ${postType === pt.id ? '#6366f1' : '#e2e8f0'}`,
                    background: postType === pt.id ? '#eef2ff' : '#fff',
                    color: postType === pt.id ? '#4f46e5' : '#64748b',
                    fontWeight: postType === pt.id ? 700 : 500,
                    fontSize: '13px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{pt.icon}</span>
                  {pt.label}
                </button>
              ))}
            </div>

            <div style={s.sectionTitle}>
              {postType === 'video' ? '🎬 Upload Video' : postType === 'image' ? '🖼️ Upload Image' : '✍️ Write Your Post'}
            </div>

            {/* Publish type selector — only for video when Instagram or Facebook selected */}
            {postType === 'video' && (selectedPlatforms.includes('instagram') || selectedPlatforms.includes('facebook')) && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                {[
                  { id: 'reels', icon: '🎬', label: 'Reels / Feed', desc: 'Regular post on feed' },
                  { id: 'story', icon: '⏱️', label: 'Story',        desc: 'Disappears in 24h'   },
                ].map(pt => (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => setPublishType(pt.id)}
                    style={{
                      flex: 1, padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                      border: `2px solid ${publishType === pt.id ? '#6366f1' : '#e2e8f0'}`,
                      background: publishType === pt.id ? '#eef2ff' : '#fff',
                      color: publishType === pt.id ? '#4f46e5' : '#64748b',
                      fontWeight: publishType === pt.id ? 700 : 500, fontSize: '13px',
                      display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{pt.icon}</span>
                    <span>
                      <div style={{ fontWeight: 700 }}>{pt.label}</div>
                      <div style={{ fontSize: '11px', opacity: 0.7 }}>{pt.desc}</div>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {contentIdea && (
              <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '1px solid #93c5fd', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <span><strong>💡 Next idea:</strong> {contentIdea}</span>
                <button type="button" onClick={() => setContentIdea(null)} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #93c5fd', background: '#fff', fontSize: '12px', cursor: 'pointer', color: '#64748b' }}>Clear</button>
              </div>
            )}

            {/* ── Video drop zone ── */}
            {postType === 'video' && (
              <div
                style={{ ...s.dropZone, ...(dragOver ? s.dropOver : {}) }}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current.click()}
              >
                <input ref={fileRef} type="file" accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,.mp4,.mov,.avi,.webm" style={{ display: 'none' }} onChange={handleFile} />
                {video ? (
                  <>
                    <div style={{ fontSize: '36px' }}>🎥</div>
                    <div style={s.fileName}>{video.name}</div>
                    <div style={s.fileSize}>{(video.size / 1024 / 1024).toFixed(1)} MB</div>
                    <div style={s.changeFile}>Click to change</div>
                    {/* Growth-only trim button */}
                    {isGrowth && (
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setShowTrimmer(true); }}
                        style={{
                          marginTop: '10px',
                          padding: '7px 18px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 10px rgba(99,102,241,0.35)',
                        }}
                      >
                        ✂️ Trim Video
                        <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.25)', borderRadius: '99px', padding: '1px 7px', fontWeight: 700 }}>
                          Growth
                        </span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '40px' }}>📹</div>
                    <div style={s.dropTitle}>Drop your video here</div>
                    <div style={s.dropSub}>MP4, MOV, AVI, WebM · Max 2GB</div>
                  </>
                )}
              </div>
            )}

            {/* ── Image drop zone ── */}
            {postType === 'image' && (
              <div
                style={{ ...s.dropZone, ...(dragOver ? s.dropOver : {}) }}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => imageRef.current.click()}
              >
                <input ref={imageRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp" style={{ display: 'none' }} onChange={handleImageFile} />
                {imageFile ? (
                  <>
                    <img src={URL.createObjectURL(imageFile)} alt="preview" style={{ maxHeight: '140px', maxWidth: '100%', borderRadius: '8px', objectFit: 'cover' }} />
                    <div style={s.fileName}>{imageFile.name}</div>
                    <div style={s.fileSize}>{(imageFile.size / 1024 / 1024).toFixed(1)} MB</div>
                    <div style={s.changeFile}>Click to change</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '40px' }}>🖼️</div>
                    <div style={s.dropTitle}>Drop your image here</div>
                    <div style={s.dropSub}>JPG, PNG, GIF, WebP · Max 20MB</div>
                  </>
                )}
              </div>
            )}

            {/* ── Text area ── */}
            {postType === 'text' && (
              <div style={{ marginBottom: '16px' }}>
                <textarea
                  value={textCaption}
                  onChange={e => setTextCaption(e.target.value)}
                  placeholder="Write your post here... AI will adapt it for each platform you selected."
                  rows={6}
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '14px 16px', borderRadius: '10px',
                    border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'inherit',
                    resize: 'vertical', outline: 'none', lineHeight: 1.6,
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
                />
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px', textAlign: 'right' }}>
                  {textCaption.length} characters
                </div>
              </div>
            )}

            {/* File error + requirements panel */}
            {fileError && (
              <div style={{ marginTop: '12px', padding: '14px 16px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: '13px' }}>
                <div style={{ fontWeight: 700, marginBottom: '10px' }}>{fileError}</div>
                {postType === 'video' && (
                  <>
                    <div style={{ fontWeight: 600, marginBottom: '6px', color: '#7f1d1d' }}>✅ Accepted video requirements:</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', color: '#7f1d1d' }}>
                      <tbody>
                        <tr><td style={{ padding: '3px 8px 3px 0', fontWeight: 600 }}>Format</td><td>MP4, MOV, AVI, WebM</td></tr>
                        <tr><td style={{ padding: '3px 8px 3px 0', fontWeight: 600 }}>Max size</td><td>2 GB (2,048 MB)</td></tr>
                        <tr><td style={{ padding: '3px 8px 3px 0', fontWeight: 600 }}>Codec</td><td>H.264 or H.265</td></tr>
                        <tr><td style={{ padding: '3px 8px 3px 0', fontWeight: 600 }}>Resolution</td><td>Up to 4K (3840×2160)</td></tr>
                        <tr><td style={{ padding: '3px 8px 3px 0', fontWeight: 600 }}>Duration</td><td>3 seconds – 60 minutes</td></tr>
                        <tr><td style={{ padding: '3px 8px 3px 0', fontWeight: 600 }}>Audio</td><td>AAC recommended (optional)</td></tr>
                      </tbody>
                    </table>
                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#b91c1c' }}>💡 Tip: Compress large files with <strong>HandBrake</strong> (free).</div>
                  </>
                )}
                {postType === 'image' && (
                  <>
                    <div style={{ fontWeight: 600, marginBottom: '6px', color: '#7f1d1d' }}>✅ Accepted image requirements:</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', color: '#7f1d1d' }}>
                      <tbody>
                        <tr><td style={{ padding: '3px 8px 3px 0', fontWeight: 600 }}>Format</td><td>JPG, PNG, GIF, WebP</td></tr>
                        <tr><td style={{ padding: '3px 8px 3px 0', fontWeight: 600 }}>Max size</td><td>20 MB</td></tr>
                        <tr><td style={{ padding: '3px 8px 3px 0', fontWeight: 600 }}>Resolution</td><td>Recommended at least 1080×1080px</td></tr>
                        <tr><td style={{ padding: '3px 8px 3px 0', fontWeight: 600 }}>Aspect ratio</td><td>1:1 square, 4:5, or 16:9</td></tr>
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            )}

            <button
              style={{
                ...s.btnPrimary,
                ...((postType === 'video' && (!video || selectedPlatforms.length === 0)) ||
                    (postType === 'image' && (!imageFile || selectedPlatforms.length === 0)) ||
                    (postType === 'text'  && (!textCaption.trim() || selectedPlatforms.length === 0))
                  ? s.btnDisabled : {}),
              }}
              onClick={runProcessing}
              disabled={
                (postType === 'video' && (!video || selectedPlatforms.length === 0)) ||
                (postType === 'image' && (!imageFile || selectedPlatforms.length === 0)) ||
                (postType === 'text'  && (!textCaption.trim() || selectedPlatforms.length === 0))
              }
            >
              {postType === 'video' ? '🚀 Generate Content' : postType === 'image' ? '🖼️ Next: Review & Publish' : '✍️ Next: Review & Publish'}
            </button>

            {/* ── Dashboard ── */}
            <div style={{ marginTop: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>📊 Your Dashboard</div>
                <button type="button" onClick={loadDashboard} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#6366f1', fontWeight: 600 }}>
                  {dashLoading ? '⟳ Loading...' : '↻ Refresh'}
                </button>
              </div>

              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '18px' }}>
                {[
                  { label: 'Published',  value: dashStats?.totalPublished ?? '—', color: '#16a34a', bg: '#f0fdf4', icon: '✅' },
                  { label: 'This Week',  value: dashStats?.thisWeek       ?? '—', color: '#2563eb', bg: '#eff6ff', icon: '📅' },
                  { label: 'Failed',     value: dashStats?.totalFailed    ?? '—', color: '#dc2626', bg: '#fef2f2', icon: '❌' },
                ].map(c => (
                  <div key={c.label} style={{ background: c.bg, borderRadius: '12px', padding: '14px 10px', textAlign: 'center', border: `1px solid ${c.bg}` }}>
                    <div style={{ fontSize: '20px' }}>{c.icon}</div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: c.color, lineHeight: 1.2 }}>{c.value}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{c.label}</div>
                  </div>
                ))}
              </div>

              {/* By platform mini-bars */}
              {dashStats?.byPlatform && Object.keys(dashStats.byPlatform).length > 0 && (
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', marginBottom: '18px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '10px' }}>POSTS BY PLATFORM</div>
                  {Object.entries(dashStats.byPlatform).sort((a,b) => b[1]-a[1]).map(([pid, count]) => {
                    const p = PLATFORMS.find(x => x.id === pid);
                    const max = Math.max(...Object.values(dashStats.byPlatform));
                    return (
                      <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
                        <span style={{ width: 22, height: 22, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {p ? <PlatformIcon platform={p} size={20} /> : <span style={{ fontSize: '14px' }} aria-hidden>📤</span>}
                        </span>
                        <span style={{ fontSize: '12px', width: '70px', color: '#374151', fontWeight: 500 }}>{p?.label || pid}</span>
                        <div style={{ flex: 1, background: '#e2e8f0', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                          <div style={{ width: `${(count / max) * 100}%`, height: '100%', background: p?.color || '#6366f1', borderRadius: '4px', transition: 'width 0.4s' }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', width: '20px', textAlign: 'right' }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Recent posts */}
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#475569', marginBottom: '10px' }}>RECENT POSTS</div>
              {dashHistory.length === 0 && !dashLoading && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                  No posts yet. Publish your first post above! 🚀
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dashHistory.map(post => {
                  const p = PLATFORMS.find(x => x.id === post.platform);
                  const statusColor = post.status === 'SUCCESS' ? '#16a34a' : post.status === 'FAILED' ? '#dc2626' : '#d97706';
                  const statusBg    = post.status === 'SUCCESS' ? '#f0fdf4'  : post.status === 'FAILED' ? '#fef2f2'  : '#fffbeb';
                  const date = new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <div
                      key={post.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setHistoryDetailPost(post)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setHistoryDetailPost(post);
                        }
                      }}
                      title="View full post details"
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '11px 13px',
                        borderRadius: '10px',
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <span style={{ width: 24, height: 24, flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {p ? <PlatformIcon platform={p} size={22} /> : <span style={{ fontSize: '18px' }} aria-hidden>📤</span>}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {post.caption || '(no caption)'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                          {p?.label || post.platform} · {post.mediaType} · {date}
                        </div>
                        {post.status === 'FAILED' && post.errorMessage && (
                          <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            ⚠️ {post.errorMessage}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px', flexShrink: 0 }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '20px', background: statusBg, color: statusColor }}>
                          {post.status}
                        </span>
                        {post.status === 'FAILED' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRetry(post.id);
                            }}
                            disabled={retryingId === post.id}
                            style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '6px', border: '1px solid #dc2626', background: retryingId === post.id ? '#fee2e2' : '#fff', color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}
                          >
                            {retryingId === post.id ? '...' : '↺ Retry'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right */}
          <div style={s.right}>
            <div style={s.card}>
              <div style={s.sectionTitle}>📡 Select Platforms</div>
              <div style={{ ...s.platformGrid, ...(isMobile ? { gridTemplateColumns: 'repeat(2, 1fr)' } : {}) }}>
                {PLATFORMS.map(p => {
                  const supported = p.supports.includes(postType);
                  return (
                  <button
                    key={p.id}
                    title={!supported ? `${p.label} does not support ${postType} posts` : ''}
                    style={{
                      ...s.platformBtn,
                      ...(selectedPlatforms.includes(p.id) && supported ? { ...s.platformBtnActive, borderColor: p.color } : {}),
                      ...((!supported) ? { opacity: 0.35, cursor: 'not-allowed', filter: 'grayscale(1)' } : {}),
                    }}
                    onClick={() => supported && togglePlatform(p.id)}
                    disabled={!supported}
                  >
                    <PlatformIcon platform={p} size={28} />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{p.label}</span>
                    {!supported && <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 400 }}>Not available</span>}
                    {selectedPlatforms.includes(p.id) && supported && (
                      <span style={{ ...s.platformCheck, background: p.color }}>✓</span>
                    )}
                  </button>
                  );
                })}
              </div>
              <div style={s.platformCount}>
                {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected ·{' '}
                {postType === 'video' ? `AI will generate ${selectedPlatforms.length} unique content variants` : 'Ready to publish'}
              </div>
            </div>

            <div style={s.card}>
              <div style={s.sectionTitle}>⚡ What Happens Next</div>
              {(postType === 'video' ? [
                ['🎙️', 'Transcribe audio', 'via Whisper'],
                ['✍️', 'Write platform-specific captions', 'tone-matched per platform'],
                ['#️⃣', 'Generate hashtags', 'trending + relevant'],
                ['✂️', 'Create clip variants', 'optimized per platform format'],
                ['🖼️', 'Generate thumbnail ideas', 'high click-through'],
              ] : postType === 'image' ? [
                ['🖼️', 'Preview your image', 'confirm before publish'],
                ['✍️', 'Edit caption per platform', 'customise tone & length'],
                ['#️⃣', 'Add hashtags', 'per platform'],
                ['📤', 'Publish to selected platforms', 'Instagram, Facebook & more'],
              ] : [
                ['✍️', 'Review your text post', 'edit per platform'],
                ['#️⃣', 'Add hashtags', 'per platform'],
                ['📤', 'Publish to selected platforms', 'Facebook, X, LinkedIn & more'],
              ]).map(([icon, title, sub]) => (
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
        <div
          style={{ ...s.centerCard, ...(isMobile ? { padding: '24px 16px', margin: '0 8px' } : {}) }}
          role="status"
          aria-live="polite"
          aria-busy={processing}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }} aria-hidden>⚙️</div>
          <div style={s.processTitle}>Please wait — AI is generating captions for your video</div>
          <p style={s.processSubtitle}>
            We&apos;re uploading, transcribing audio, and generating captions and hashtags. This usually takes a little while — stay on this screen.
          </p>
          <p style={s.processSubtitleMuted}>
            <strong>Want to add your own captions instead?</strong> In a few seconds you can skip AI and go straight to the editor with simple starter text you can replace.
          </p>
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
          {processing && canSkipProcessing && (
            <div style={{ marginTop: '20px' }}>
              <button
                type="button"
                onClick={usePlaceholders}
                style={s.processSkipBtn}
              >
                ✏️ Write my own captions (skip AI)
              </button>
              <p style={s.processSkipHint}>
                Opens the next step with template captions and hashtags — edit everything before you publish.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── STEP: REVIEW & PUBLISH ── */}
      {step === 'review' && (
        <div>
        {/* Clip-limit warning banner — shown when video exceeds a platform's max duration */}
        {postType === 'video' && videoDurationSec > 0 && (() => {
          const clipped = selectedPlatforms.filter(pid => {
            const max = PLATFORM_MAX_SEC[pid];
            return max && videoDurationSec > max;
          });
          if (clipped.length === 0) return null;
          const fmt = sec => sec >= 3600 ? `${Math.floor(sec/3600)}h` : sec >= 60 ? `${Math.floor(sec/60)}m` : `${sec}s`;
          return (
            <div style={{ background: '#fffbeb', border: '1.5px solid #f59e0b', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#92400e' }}>
              <strong>⚠️ Auto-clip notice</strong> — your video is {fmt(videoDurationSec)} long.
              These platforms will be clipped automatically:
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                {clipped.map(pid => {
                  const p = PLATFORMS.find(x => x.id === pid);
                  const max = PLATFORM_MAX_SEC[pid];
                  return (
                    <span key={pid} style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '6px', padding: '2px 10px', fontWeight: 600 }}>
                      {p.label} → max {fmt(max)}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })()}
        <div style={{ ...s.layout, ...(isMobile ? { flexDirection: 'column', flexWrap: 'wrap' } : {}) }}>
          {/* Platform tabs on left */}
          <div style={{ ...s.left, ...(isMobile ? { width: '100%', minWidth: 0 } : {}) }}>
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

            {/* Schedule per platform */}
            <div style={{ ...s.card, marginTop: '16px', padding: '14px' }}>
              <div style={{ ...s.sectionTitle, marginBottom: '10px', fontSize: '14px' }}>
                📅 Schedule your posts
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px' }}>
                Choose when to publish on each platform, or leave as &quot;Publish now&quot; to post immediately.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {[
                  { label: 'Morning (9 AM)', hour: 9 },
                  { label: 'Evening (7 PM)', hour: 19 },
                  { label: 'Lunch (12 PM)', hour: 12 },
                ].map(({ label, hour }) => {
                  const d = new Date();
                  d.setDate(d.getDate() + 1);
                  d.setHours(hour, 0, 0, 0);
                  const pad = (n) => String(n).padStart(2, '0');
                  const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        const next = {};
                        selectedPlatforms.forEach(pid => { next[pid] = iso; });
                        setScheduledTimes(prev => ({ ...prev, ...next }));
                      }}
                      style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '11px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedPlatforms.map(pid => {
                  const p = PLATFORMS.find(x => x.id === pid);
                  const hasSchedule = scheduledTimes[pid] && String(scheduledTimes[pid]).trim() !== '';
                  const defaultVal = (() => {
                    const d = new Date();
                    const pad = (n) => String(n).padStart(2, '0');
                    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                  })();
                  return (
                    <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <PlatformIcon platform={p} size={20} />
                      <span style={{ fontSize: '12px', fontWeight: 600, minWidth: '70px' }}>{p.label}</span>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={!hasSchedule}
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
                        Now
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduledTimes[pid] || defaultVal}
                        onChange={e => setScheduledTimes(prev => ({ ...prev, [pid]: e.target.value || null }))}
                        disabled={!hasSchedule}
                        style={{ flex: 1, minWidth: '140px', padding: '6px 8px', borderRadius: '6px', border: '1.5px solid #e2e8f0', fontSize: '12px', opacity: hasSchedule ? 1 : 0.6 }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <button type="button" style={s.btnPrimary} onClick={scheduleAndPublishAll}>
                🚀 Schedule & Publish
              </button>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', marginBottom: 0 }}>
                Platforms with a date set will be scheduled; others publish now.
              </p>
            </div>
          </div>

          {/* Right: variant editor */}
          <div style={s.right}>
            {activeVariant && variants[activeVariant] && (() => {
              const pid = activeVariant;
              const p = PLATFORMS.find(x => x.id === pid);
              const v = variants[pid];
              const options = captionOptions[pid] || [];
              const selectedIdx = selectedOptionIdx[pid] ?? 0;
              const historyLen = (captionHistory[pid] || []).length;
              const score = scoreCaption(v.caption || '', p.maxLen);
              return (
                <div style={s.card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <PlatformIcon platform={p} size={32} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '16px' }}>{p.label}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{v.clipNote}</div>
                    </div>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', background: '#f8fafc', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>Caption Studio</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Generate options, refine in one click, publish confidently.</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <button type="button" onClick={() => regenerateCaptionOptions(pid, 'balanced', 'casual')} style={s.studioBtn}>
                          Generate 3 options
                        </button>
                        <button type="button" onClick={() => regenerateCaptionOptions(pid, 'short', 'bold')} style={s.studioBtnSecondary}>
                          Regenerate
                        </button>
                      </div>
                    </div>

                    {showCaptionGuide && (
                      <div style={{ marginTop: '10px', padding: '10px', borderRadius: '10px', background: '#eef2ff', border: '1px solid #c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ fontSize: '11px', color: '#4338ca' }}>
                          <strong>Quick start:</strong> 1) Pick an option 2) Use rewrite actions 3) Check caption score.
                        </div>
                        <button type="button" onClick={dismissCaptionGuide} style={{ border: 'none', background: 'transparent', color: '#4338ca', fontWeight: 700, cursor: 'pointer', fontSize: '11px' }}>
                          Got it
                        </button>
                      </div>
                    )}

                    {options.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px', marginTop: '10px' }}>
                        {options.map((opt, idx) => (
                          <div key={opt.id} style={{ border: `1.5px solid ${selectedIdx === idx ? '#6366f1' : '#e2e8f0'}`, borderRadius: '10px', padding: '10px', background: '#fff' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: selectedIdx === idx ? '#4f46e5' : '#64748b', marginBottom: '6px' }}>{opt.label}</div>
                            <div style={{ fontSize: '12px', color: '#334155', lineHeight: 1.45, minHeight: '54px' }}>
                              {opt.text.length > 100 ? `${opt.text.slice(0, 100)}…` : opt.text}
                            </div>
                            <button type="button" onClick={() => selectCaptionOption(pid, idx)} style={{ marginTop: '8px', width: '100%', padding: '6px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', background: selectedIdx === idx ? '#eef2ff' : '#fff', color: selectedIdx === idx ? '#4f46e5' : '#334155', fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}>
                              {selectedIdx === idx ? 'Selected' : 'Use this'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', marginTop: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Caption</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', borderRadius: '6px', padding: '2px 8px' }}>
                        {CAPTION_FORMAT_HINTS[pid] || 'Edit caption below'}
                      </span>
                      <button type="button" disabled={historyLen === 0} onClick={() => undoCaptionEdit(pid)} style={{ ...s.miniActionBtn, ...(historyLen === 0 ? s.miniActionBtnDisabled : {}) }}>
                        Undo
                      </button>
                      <button type="button" onClick={() => resetCaptionToSelectedOption(pid)} style={s.miniActionBtn}>
                        Reset
                      </button>
                    </div>
                  </div>
                  <textarea
                    style={s.textarea}
                    value={v.caption}
                    onChange={e => applyCaptionText(pid, e.target.value, false)}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: v.caption.length > p.maxLen * 0.9 ? '#ef4444' : '#94a3b8' }}>
                      {v.caption.length > p.maxLen ? `⚠️ ${v.caption.length - p.maxLen} chars over limit` : ''}
                    </span>
                    <span style={{ fontSize: '11px', color: v.caption.length > p.maxLen ? '#ef4444' : '#94a3b8' }}>
                      {v.caption.length} / {p.maxLen}
                    </span>
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Quick rewrites</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {[
                        { id: 'shorten', label: 'Shorten' },
                        { id: 'expand', label: 'Expand' },
                        { id: 'punchier', label: 'Punchier' },
                        { id: 'add-cta', label: 'Add CTA' },
                        { id: 'professional', label: 'Professional' },
                        { id: 'remove-emojis', label: 'Remove emojis' },
                      ].map(action => (
                        <button key={action.id} type="button" onClick={() => applyCaptionRewrite(pid, action.id)} style={s.quickActionBtn}>
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px', background: '#fafafa' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Caption score</span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: score.level === 'strong' ? '#dcfce7' : score.level === 'good' ? '#fef3c7' : '#fee2e2',
                        color: score.level === 'strong' ? '#166534' : score.level === 'good' ? '#92400e' : '#991b1b',
                      }}>
                        {score.label}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '6px' }}>
                      {[
                        ['Hook', score.hook],
                        ['Clarity', score.clarity],
                        ['CTA', score.cta],
                        ['Length', score.lengthFit],
                      ].map(([label, ok]) => (
                        <div key={label} style={{ fontSize: '11px', color: ok ? '#166534' : '#64748b' }}>
                          {ok ? '✅' : '◻️'} {label}
                        </div>
                      ))}
                    </div>
                    {score.tip && (
                      <div style={{ marginTop: '7px', fontSize: '11px', color: '#64748b' }}>
                        Tip: {score.tip}
                      </div>
                    )}
                  </div>

                  <div style={s.fieldLabel}>Hashtags</div>
                  <div style={s.hashtagBox}>
                    {v.hashtags.map(h => (
                      <span key={h} style={{ ...s.hashtagChip, borderColor: p.color, color: p.color, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {h}
                        <button
                          type="button"
                          onClick={() => setVariants(prev => ({ ...prev, [pid]: { ...prev[pid], hashtags: prev[pid].hashtags.filter(t => t !== h) } }))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.color, padding: '0', fontSize: '13px', lineHeight: 1, fontWeight: 700 }}
                          title="Remove tag"
                        >×</button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <input
                      type="text"
                      placeholder="+ Add tag and press Enter"
                      style={{ flex: 1, padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '12px', outline: 'none', color: '#1e293b' }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          let tag = e.target.value.trim();
                          if (!tag) return;
                          if (!tag.startsWith('#')) tag = '#' + tag;
                          if (!variants[pid].hashtags.includes(tag)) {
                            setVariants(prev => ({ ...prev, [pid]: { ...prev[pid], hashtags: [...prev[pid].hashtags, tag] } }));
                          }
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{v.hashtags.length} tags</div>

                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
                    Schedule for {p.label} is set in the panel on the left.
                  </p>
                </div>
              );
            })()}

            {/* ── Thumbnail Picker ── */}
            {postType === 'video' && video && (
              <div style={s.card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={s.sectionTitle}>🖼️ Thumbnail</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[{ id: 'scrub', label: '🎯 Scrub & Pick' }, { id: 'ai', label: '✨ AI Suggested' }].map(m => (
                      <button key={m.id} onClick={() => {
                        setThumbnailMode(m.id);
                        if (m.id === 'ai' && uploadedVideoId && frames.length === 0 && !framesLoading) {
                          loadFrames(uploadedVideoId);
                        }
                      }} style={{
                        padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                        background: thumbnailMode === m.id ? '#6366f1' : '#f1f5f9',
                        color: thumbnailMode === m.id ? '#fff' : '#64748b',
                      }}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {thumbnailMode === 'scrub' && (
                  <VideoFramePicker
                    videoFile={video}
                    thumbnailUrl={thumbnailUrl}
                    onFrameSelected={(file, preview) => {
                      if (uploadedVideoId) uploadFrameThumbnail(uploadedVideoId, file, preview);
                      else setThumbnailUrl(preview);
                    }}
                  />
                )}

                {thumbnailMode === 'ai' && (
                  <div>
                    {!uploadedVideoId && (
                      <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                        Upload your video first to generate AI-suggested frames.
                      </p>
                    )}
                    {uploadedVideoId && framesLoading && (
                      <div style={{ textAlign: 'center', padding: '24px 0', color: '#6366f1', fontSize: 13 }}>
                        ✨ AI is analyzing your video...
                      </div>
                    )}
                    {uploadedVideoId && !framesLoading && frames.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <button onClick={() => loadFrames(uploadedVideoId)} style={{
                          padding: '8px 20px', borderRadius: 8, background: '#6366f1', color: '#fff',
                          border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 13,
                        }}>Generate AI Frames</button>
                      </div>
                    )}
                    {frames.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        {frames.map(frame => (
                          <div key={frame.s3Key} onClick={() => pickThumbnail(uploadedVideoId, frame)}
                            style={{
                              position: 'relative', borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                              border: selectedFrameKey === frame.s3Key ? '2.5px solid #6366f1' : '2px solid transparent',
                              boxShadow: selectedFrameKey === frame.s3Key ? '0 0 0 3px #6366f133' : 'none',
                            }}>
                            <img src={frame.url} alt={`frame ${frame.index}`}
                              style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
                            {frame.recommended && (
                              <span style={{
                                position: 'absolute', top: 4, left: 4, background: '#6366f1', color: '#fff',
                                fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4,
                              }}>AI Pick</span>
                            )}
                            {selectedFrameKey === frame.s3Key && (
                              <span style={{
                                position: 'absolute', top: 4, right: 4, background: '#22c55e', color: '#fff',
                                fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4,
                              }}>✓ Selected</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* ── STEP: PUBLISHING ── */}
      {step === 'publishing' && (() => {
        const allDone = selectedPlatforms.filter(pid => variants[pid])
          .every(pid => publishingStatus[pid]?.state === 'done' || publishingStatus[pid]?.state === 'failed');
        const anyFailed = Object.values(publishingStatus).some(s => s?.state === 'failed');
        return (
          <div style={{ ...s.centerCard, maxWidth: '540px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚀</div>
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', color: '#1e293b' }}>
              {allDone ? 'Publishing complete!' : 'Publishing your content...'}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
              {allDone
                ? `${published.length} of ${Object.keys(publishingStatus).length} platforms succeeded`
                : 'Do not close this tab. Instagram can take up to 3 minutes.'}
            </div>

            {/* Per-platform rows */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {selectedPlatforms.filter(pid => variants[pid]).map(pid => {
                const p = PLATFORMS.find(x => x.id === pid);
                const ps = publishingStatus[pid];
                const state = ps?.state || 'queued';
                const stateIcon = state === 'done' ? '✅' : state === 'failed' ? '❌' : state === 'publishing' ? '⏳' : '⌛';
                const stateColor = state === 'done' ? '#16a34a' : state === 'failed' ? '#dc2626' : '#64748b';
                const stateLabel = state === 'done'
                  ? 'Published'
                  : state === 'failed'
                  ? (ps?.error || 'Failed')
                  : state === 'publishing'
                  ? (pid === 'instagram' ? 'Meta is processing video…' : 'Publishing…')
                  : 'Queued';
                return (
                  <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: `1.5px solid ${state === 'done' ? '#bbf7d0' : state === 'failed' ? '#fecaca' : '#e2e8f0'}`, background: state === 'done' ? '#f0fdf4' : state === 'failed' ? '#fef2f2' : '#f8fafc' }}>
                    <PlatformIcon platform={p} size={24} />
                    <span style={{ fontWeight: 600, fontSize: '13px', flex: 1 }}>{p.label}</span>
                    <span style={{ fontSize: '12px', color: stateColor, fontWeight: 500, textAlign: 'right', maxWidth: '200px' }}>
                      {stateIcon} {stateLabel}
                    </span>
                    {state === 'publishing' && (
                      <div style={{ width: '16px', height: '16px', border: '2px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                    )}
                  </div>
                );
              })}
            </div>

            {allDone && (
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button
                  type="button"
                  style={{ ...s.btnPrimary, flex: 1 }}
                  onClick={() => setStep('analytics')}
                >
                  📊 View Analytics →
                </button>
                {anyFailed && (
                  <button
                    type="button"
                    style={{ ...s.btnOutline, flex: 1 }}
                    onClick={() => setStep('review')}
                  >
                    🔄 Retry Failed
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── STEP: ANALYTICS ── */}
      {step === 'analytics' && (
        <div style={{ ...s.layout, ...(isMobile ? { flexDirection: 'column', flexWrap: 'wrap' } : {}) }}>
          <div style={{ ...s.left, ...(isMobile ? { width: '100%', minWidth: 0 } : {}) }}>
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
                onClick={() => { setStep('upload'); setVideo(null); setVariants({}); setPublished([]); setScheduledTimes({}); setProcessLog([]); setContentIdea(null); setFrames([]); setSelectedFrameKey(null); setThumbnailUrl(null); setUploadedVideoId(null); setVideoDurationSec(0); }}>
                + New Video
              </button>
            </div>
          </div>

          <div style={s.right}>
            {/* Publish stats cards */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'Total Published', value: dashStats?.totalPublished ?? '—', icon: '✅', color: '#16a34a' },
                { label: 'This Week',       value: dashStats?.thisWeek       ?? '—', icon: '📅', color: '#2563eb' },
                { label: 'This Month',      value: dashStats?.thisMonth      ?? '—', icon: '📆', color: '#7c3aed' },
                { label: 'Failed',          value: dashStats?.totalFailed    ?? '—', icon: '❌', color: '#dc2626' },
                { label: 'Platforms Used',  value: dashStats?.byPlatform ? Object.keys(dashStats.byPlatform).length : '—', icon: '📡', color: '#0891b2' },
                { label: 'Just Published',  value: published.length,                icon: '🚀', color: '#f59e0b' },
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
              {dashStats?.byPlatform && Object.keys(dashStats.byPlatform).length > 0 ? (
                Object.entries(dashStats.byPlatform).sort((a, b) => b[1] - a[1]).map(([pid, count]) => {
                  const p = PLATFORMS.find(x => x.id === pid) || { label: pid, color: '#64748b' };
                  return (
                    <div key={pid} style={s.platformRow}>
                      {p.logo && <PlatformIcon platform={p} size={24} />}
                      <span style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}>{p.label}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e' }}>{count} post{count !== 1 ? 's' : ''}</span>
                    </div>
                  );
                })
              ) : (
                <div style={{ fontSize: '13px', color: '#94a3b8', padding: '8px 0' }}>No publish history yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {historyDetailPost && (
        <PostDetailModal
          post={historyDetailPost}
          platform={PLATFORMS.find((x) => x.id === String(historyDetailPost.platform || '').toLowerCase())}
          onClose={() => setHistoryDetailPost(null)}
        />
      )}
    </div>
  );
}

/* ─── Error formatter ───────────────────────────────────────── */
function formatPublishError(platform, rawError) {
  const s = String(rawError || '').toLowerCase();
  const name = platform.charAt(0).toUpperCase() + platform.slice(1);
  if (s.includes('"code":190') || s.includes('invalid oauth') || s.includes('cannot parse access token') || (s.includes('token') && s.includes('expired'))) {
    return `${name} token expired — go to Connected Accounts and reconnect.`;
  }
  if (s.includes('"code":200') || s.includes('permissions')) {
    return `${name} lacks required permissions. Reconnect in Connected Accounts.`;
  }
  if (s.includes('no facebook pages') || s.includes('no pages found')) {
    return `${name}: No Facebook Page found. Create a Page at facebook.com/pages or link one in Connected Accounts.`;
  }
  if (s.includes('rate limit') || s.includes('too many')) {
    return `${name} rate limit hit. Try again in a few minutes.`;
  }
  const orig = String(rawError || '');
  return orig.length > 120 ? orig.substring(0, 120) + '…' : orig;
}

/* ─── Mock data generators (replace with GPT API calls) ─────── */
// Max video duration in seconds per platform (null = no limit)
const PLATFORM_MAX_SEC = {
  youtube:   null,
  instagram: 900,   // 15 min (Reels)
  tiktok:    600,   // 10 min
  linkedin:  600,   // 10 min
  facebook:  null,  // 4 hours — effectively no limit
  x:         140,   // 2 min 20 sec
  threads:   300,   // 5 min
  pinterest: 900,   // 15 min
};

const CAPTION_FORMAT_HINTS = {
  youtube:   '📋 Long description · timestamps · SEO keywords',
  instagram: '✨ Short & punchy · 3–5 lines · emojis + CTA',
  tiktok:    '🎵 1 line max · trending phrase · #fyp style',
  linkedin:  '💼 Professional · 3 bullet takeaways · question CTA',
  facebook:  '👋 Conversational · tag people · longer ok',
  x:         '🐦 Under 280 chars · punchy · thread hint',
  threads:   '🧵 Short & conversational · 1-2 sentences',
  pinterest: '📌 Keyword-rich · "Save this" · benefit-first',
};

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

function buildCaptionOptions(platform, baseCaption, prefs = {}) {
  const text = String(baseCaption || '').trim();
  const compact = text.replace(/\s+/g, ' ').trim();
  const shortVersion = compact.length > 110 ? `${compact.slice(0, 107).trim()}...` : compact;
  const cta = compact.match(/\b(comment|share|follow|save|subscribe|click|learn|watch|try)\b/i)
    ? compact
    : `${compact}${compact.endsWith('?') ? '' : ' '}Follow for more tips!`;

  const tone = prefs.tone || 'casual';
  const styled = tone === 'professional'
    ? compact.replace(/\bguys\b/gi, 'everyone').replace(/\bawesome\b/gi, 'valuable')
    : compact;

  return [
    { id: `${platform}-short`, label: 'Short', text: shortVersion || mockCaption(platform) },
    { id: `${platform}-balanced`, label: 'Balanced', text: styled || mockCaption(platform) },
    { id: `${platform}-detailed`, label: 'Detailed', text: cta || mockCaption(platform) },
  ];
}

function rewriteCaption(caption, action, platform) {
  const text = String(caption || '').trim();
  if (!text) return text;
  switch (action) {
    case 'shorten':
      return text.length > 140 ? `${text.slice(0, 137).trim()}...` : text;
    case 'expand':
      return `${text}\n\n${platform === 'linkedin' ? 'What are your thoughts on this?' : 'Save this and share with someone who needs it.'}`;
    case 'punchier':
      return text.startsWith('🔥') ? text : `🔥 ${text}`;
    case 'add-cta':
      return /\b(comment|share|follow|save|subscribe|try|watch)\b/i.test(text)
        ? text
        : `${text}\n\n👉 Follow for more.`;
    case 'professional':
      return text
        .replace(/\bgonna\b/gi, 'going to')
        .replace(/\bguys\b/gi, 'everyone')
        .replace(/\bawesome\b/gi, 'valuable');
    case 'remove-emojis':
      return text.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').replace(/\s{2,}/g, ' ').trim();
    default:
      return text;
  }
}

function scoreCaption(caption, maxLen) {
  const text = String(caption || '').trim();
  const hasHook = text.length > 0 && (text.includes('?') || /^[A-Z0-9🔥✨🎬]/.test(text));
  const hasCta = /\b(comment|share|follow|save|subscribe|click|watch|learn|try)\b/i.test(text);
  const lengthFit = text.length > 0 && text.length <= maxLen;
  const clarity = text.split(/\s+/).filter(Boolean).length >= 6;

  const score = [hasHook, hasCta, lengthFit, clarity].filter(Boolean).length;
  const level = score >= 4 ? 'strong' : score >= 3 ? 'good' : 'needs_work';
  const label = level === 'strong' ? 'Strong' : level === 'good' ? 'Good' : 'Needs work';

  let tip = '';
  if (!hasHook) tip = 'Start with a hook or question.';
  else if (!hasCta) tip = 'Add a clear call-to-action.';
  else if (!lengthFit) tip = 'Shorten to fit platform limit.';
  else if (!clarity) tip = 'Use clearer, slightly longer wording.';

  return { level, label, hook: hasHook, cta: hasCta, lengthFit, clarity, tip };
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ─── Styles ─────────────────────────────────────────────────── */
const s = {
  page:    { padding: '4px 0', fontFamily: "'Inter',-apple-system,sans-serif", maxWidth: '100%', overflowX: 'hidden' },
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
  btnOutline:  { padding: '12px', borderRadius: '10px', border: '2px solid #e2e8f0', background: 'transparent', color: '#475569', fontSize: '14px', fontWeight: 700, cursor: 'pointer' },
  btnDisabled: { opacity: 0.45, cursor: 'not-allowed' },
  studioBtn:   { padding: '7px 12px', borderRadius: '8px', border: 'none', background: '#4f46e5', color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer' },
  studioBtnSecondary: { padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontSize: '11px', fontWeight: 700, cursor: 'pointer' },
  miniActionBtn: { padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontSize: '11px', fontWeight: 600, cursor: 'pointer' },
  miniActionBtnDisabled: { opacity: 0.45, cursor: 'not-allowed' },
  quickActionBtn: { padding: '5px 10px', borderRadius: '999px', border: '1px solid #dbeafe', background: '#eff6ff', color: '#1d4ed8', fontSize: '11px', fontWeight: 700, cursor: 'pointer' },

  /* Processing */
  centerCard:    { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '40px', textAlign: 'center', maxWidth: '560px', width: '100%', boxSizing: 'border-box', margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  processTitle:  { fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '10px', lineHeight: 1.35 },
  processSubtitle: {
    fontSize: '14px', fontWeight: 500, color: '#475569', lineHeight: 1.55, margin: '0 auto 12px', maxWidth: '440px', textAlign: 'center',
  },
  processSubtitleMuted: {
    fontSize: '13px', fontWeight: 500, color: '#64748b', lineHeight: 1.55, margin: '0 auto 18px', maxWidth: '440px', textAlign: 'center',
  },
  processSkipBtn: {
    marginTop: '4px', padding: '11px 22px', borderRadius: '10px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#334155',
    fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
  },
  processSkipHint: { fontSize: '12px', color: '#94a3b8', marginTop: '10px', marginBottom: 0, lineHeight: 1.45, maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' },
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
