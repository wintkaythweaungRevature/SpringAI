import React, { useState, useRef, useEffect, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   VideoTrimmer — Growth-exclusive video trimming modal
   Uses browser MediaRecorder API (no external dependencies).
   Works best in Chrome / Edge.  Safari falls back gracefully.
───────────────────────────────────────────────────────────────────────────── */

function fmt(sec) {
  if (!isFinite(sec) || isNaN(sec)) return '0:00.0';
  const m  = Math.floor(sec / 60);
  const s  = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 10);
  return `${m}:${s.toString().padStart(2, '0')}.${ms}`;
}

export default function VideoTrimmer({ videoFile, onApply, onCancel }) {
  const videoRef   = useRef(null);
  const rafRef     = useRef(null);
  const [objUrl,     setObjUrl]     = useState(null);
  const [duration,   setDuration]   = useState(0);
  const [startTime,  setStartTime]  = useState(0);
  const [endTime,    setEndTime]    = useState(0);
  const [currentTime,setCurrentTime]= useState(0);
  const [playing,    setPlaying]    = useState(false);
  const [trimming,   setTrimming]   = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [error,      setError]      = useState('');

  /* Create object URL for the raw file */
  useEffect(() => {
    const url = URL.createObjectURL(videoFile);
    setObjUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  /* Track playhead with rAF for smooth scrubber updates */
  useEffect(() => {
    const tick = () => {
      if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* Auto-stop at endTime during preview */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const check = () => {
      if (video.currentTime >= endTime && !video.paused) {
        video.pause();
        setPlaying(false);
      }
    };
    video.addEventListener('timeupdate', check);
    return () => video.removeEventListener('timeupdate', check);
  }, [endTime]);

  const handleMetadata = () => {
    const dur = videoRef.current?.duration ?? 0;
    setDuration(dur);
    setEndTime(dur);
  };

  /* Scrubber click on the timeline bar */
  const handleTimelineClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const t = Math.max(0, Math.min(duration, ratio * duration));
    if (videoRef.current) videoRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      if (v.currentTime < startTime || v.currentTime >= endTime) v.currentTime = startTime;
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const clampStart = (val) => {
    const v = Math.max(0, Math.min(val, endTime - 0.5));
    setStartTime(v);
    if (videoRef.current) videoRef.current.currentTime = v;
  };

  const clampEnd = (val) => {
    const v = Math.max(startTime + 0.5, Math.min(val, duration));
    setEndTime(v);
  };

  const trimDuration = endTime - startTime;

  /* ── Core trim via MediaRecorder ────────────────────────────────────────── */
  const doTrim = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    // Pause before trimming
    video.pause();
    setPlaying(false);
    setTrimming(true);
    setProgress(0);
    setError('');

    // Pick best supported mime type
    const mimeType =
      MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus'
      : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') ? 'video/webm;codecs=vp8,opus'
      : MediaRecorder.isTypeSupported('video/webm') ? 'video/webm'
      : null;

    if (!mimeType) {
      setError('Your browser does not support video trimming. Please use Chrome or Edge.');
      setTrimming(false);
      return;
    }

    let stream;
    try {
      stream = video.captureStream ? video.captureStream() : video.mozCaptureStream?.();
    } catch (e) {
      setError('Could not capture video stream. Please use Chrome or Edge.');
      setTrimming(false);
      return;
    }
    if (!stream) {
      setError('Video capture not supported in this browser. Please use Chrome or Edge.');
      setTrimming(false);
      return;
    }

    let recorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType });
    } catch (e) {
      setError('MediaRecorder init failed: ' + e.message);
      setTrimming(false);
      return;
    }

    const chunks = [];
    recorder.ondataavailable = (e) => { if (e.data?.size > 0) chunks.push(e.data); };

    recorder.onstop = () => {
      const ext  = 'webm';
      const type = 'video/webm';
      const blob = new Blob(chunks, { type });
      const baseName = videoFile.name.replace(/\.[^/.]+$/, '');
      const trimmedFile = new File([blob], `${baseName}_trimmed.${ext}`, { type });
      setTrimming(false);
      onApply(trimmedFile);
    };

    /* Seek to start, then start recording + playback */
    video.currentTime = startTime;
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      recorder.start(100);
      video.play().catch(() => {});

      let progressInterval = setInterval(() => {
        const elapsed = (video.currentTime - startTime);
        setProgress(Math.min(99, Math.round((elapsed / trimDuration) * 100)));
      }, 200);

      const stopCheck = () => {
        if (video.currentTime >= endTime) {
          video.removeEventListener('timeupdate', stopCheck);
          clearInterval(progressInterval);
          video.pause();
          setProgress(100);
          if (recorder.state === 'recording') recorder.stop();
        }
      };
      video.addEventListener('timeupdate', stopCheck);
    };
    video.addEventListener('seeked', onSeeked, { once: true });
  }, [videoFile, startTime, endTime, trimDuration, onApply]);

  const startPct = duration > 0 ? (startTime  / duration) * 100 : 0;
  const endPct   = duration > 0 ? (endTime    / duration) * 100 : 100;
  const curPct   = duration > 0 ? (currentTime/ duration) * 100 : 0;

  return (
    <div style={s.overlay}>
      <div style={s.modal}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <span style={s.scissors}>✂️</span>
            <div>
              <div style={s.title}>Trim Video</div>
              <div style={s.subtitle}>{videoFile.name}</div>
            </div>
          </div>
          <span style={s.growthBadge}>⚡ Growth</span>
        </div>

        {/* Video preview */}
        <div style={s.videoWrap}>
          {objUrl && (
            <video
              ref={videoRef}
              src={objUrl}
              style={s.video}
              onLoadedMetadata={handleMetadata}
              preload="metadata"
              crossOrigin="anonymous"
            />
          )}
          {/* Play/Pause overlay */}
          <button style={s.playBtn} onClick={togglePlay} disabled={trimming}>
            {playing ? '⏸' : '▶'}
          </button>
        </div>

        {/* ── Timeline ── */}
        <div style={s.timelineSection}>
          {/* Time labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
            <span>0:00</span>
            <span style={{ color: '#6366f1', fontWeight: 700 }}>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>

          {/* Timeline bar */}
          <div style={s.timelineBar} onClick={handleTimelineClick}>
            {/* Greyed out before start */}
            <div style={{ ...s.tlExcluded, left: 0, width: `${startPct}%` }} />
            {/* Active region */}
            <div style={{ ...s.tlActive, left: `${startPct}%`, width: `${endPct - startPct}%` }} />
            {/* Greyed out after end */}
            <div style={{ ...s.tlExcluded, left: `${endPct}%`, width: `${100 - endPct}%` }} />
            {/* Playhead */}
            <div style={{ ...s.playhead, left: `${curPct}%` }} />
            {/* Start handle */}
            <div style={{ ...s.handle, left: `${startPct}%`, background: '#22c55e' }} title="Drag start" />
            {/* End handle */}
            <div style={{ ...s.handle, left: `${endPct}%`, background: '#ef4444', transform: 'translateX(-50%) scaleY(1.2)' }} title="Drag end" />
          </div>

          {/* Trim start / end sliders */}
          <div style={s.sliderRow}>
            <div style={s.sliderGroup}>
              <label style={s.sliderLabel}>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>▶ Start</span>
                <span style={s.timeTag}>{fmt(startTime)}</span>
              </label>
              <input
                type="range" min={0} max={duration} step={0.1}
                value={startTime}
                onChange={e => clampStart(parseFloat(e.target.value))}
                style={{ ...s.slider, accentColor: '#22c55e' }}
                disabled={trimming}
              />
            </div>
            <div style={s.sliderGroup}>
              <label style={s.sliderLabel}>
                <span style={{ color: '#ef4444', fontWeight: 700 }}>⏹ End</span>
                <span style={s.timeTag}>{fmt(endTime)}</span>
              </label>
              <input
                type="range" min={0} max={duration} step={0.1}
                value={endTime}
                onChange={e => clampEnd(parseFloat(e.target.value))}
                style={{ ...s.slider, accentColor: '#ef4444' }}
                disabled={trimming}
              />
            </div>
          </div>

          {/* Duration info */}
          <div style={s.durationRow}>
            <div style={s.durationChip}>
              <span style={{ color: '#94a3b8' }}>Original:</span>&nbsp;
              <strong>{fmt(duration)}</strong>
            </div>
            <div style={{ ...s.durationChip, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <span style={{ color: '#16a34a' }}>Trimmed:</span>&nbsp;
              <strong style={{ color: '#16a34a' }}>{fmt(trimDuration)}</strong>
            </div>
            <div style={s.durationChip}>
              <span style={{ color: '#94a3b8' }}>Saved:</span>&nbsp;
              <strong>{fmt(duration - trimDuration)}</strong>
            </div>
          </div>
        </div>

        {/* Progress bar (during trimming) */}
        {trimming && (
          <div style={s.progressWrap}>
            <div style={s.progressLabel}>
              Trimming… {progress}% — playback runs in real time, please wait
            </div>
            <div style={s.progressTrack}>
              <div style={{ ...s.progressFill, width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Error */}
        {error && <div style={s.errorBox}>{error}</div>}

        {/* Action buttons */}
        <div style={s.footer}>
          <button style={s.cancelBtn} onClick={onCancel} disabled={trimming}>
            Cancel
          </button>
          <button style={s.previewBtn} onClick={togglePlay} disabled={trimming || duration === 0}>
            {playing ? '⏸ Pause' : '▶ Preview Trim'}
          </button>
          <button
            style={{ ...s.applyBtn, opacity: trimming || trimDuration < 0.5 ? 0.6 : 1 }}
            onClick={doTrim}
            disabled={trimming || trimDuration < 0.5}
          >
            {trimming ? `Trimming… ${progress}%` : '✂️ Apply Trim'}
          </button>
        </div>

      </div>
    </div>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const s = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 2000,
    background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px',
  },
  modal: {
    background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '720px',
    boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
    display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  scissors: { fontSize: '28px' },
  title: { fontSize: '18px', fontWeight: 800, color: '#0f172a' },
  subtitle: { fontSize: '12px', color: '#94a3b8', marginTop: '2px', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  growthBadge: {
    background: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
    color: '#fff', borderRadius: '99px', padding: '4px 12px',
    fontSize: '12px', fontWeight: 700,
  },
  videoWrap: {
    position: 'relative', background: '#0f172a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '240px', maxHeight: '340px',
  },
  video: {
    maxWidth: '100%', maxHeight: '340px', display: 'block',
    objectFit: 'contain',
  },
  playBtn: {
    position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%',
    width: '44px', height: '44px', fontSize: '18px', color: '#fff',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(4px)',
  },
  timelineSection: { padding: '20px 24px 0' },
  timelineBar: {
    position: 'relative', height: '36px', borderRadius: '8px',
    background: '#e2e8f0', cursor: 'crosshair', overflow: 'visible',
    marginBottom: '14px',
  },
  tlActive: {
    position: 'absolute', top: 0, bottom: 0,
    background: 'linear-gradient(90deg,#22c55e22,#6366f133)',
    border: '2px solid #6366f1', borderRadius: '4px',
  },
  tlExcluded: {
    position: 'absolute', top: 0, bottom: 0,
    background: 'rgba(148,163,184,0.35)',
  },
  playhead: {
    position: 'absolute', top: '-4px', bottom: '-4px',
    width: '3px', background: '#f59e0b', borderRadius: '2px',
    transform: 'translateX(-50%)', pointerEvents: 'none',
    boxShadow: '0 0 6px rgba(245,158,11,0.6)',
  },
  handle: {
    position: 'absolute', top: '-6px', bottom: '-6px',
    width: '12px', borderRadius: '4px',
    transform: 'translateX(-50%)',
    cursor: 'ew-resize', boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
  },
  sliderRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' },
  sliderGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  sliderLabel: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' },
  timeTag: { background: '#f1f5f9', borderRadius: '6px', padding: '2px 8px', fontSize: '12px', fontWeight: 700, color: '#334155', fontFamily: 'monospace' },
  slider: { width: '100%', cursor: 'pointer' },
  durationRow: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  durationChip: {
    flex: 1, minWidth: '100px', padding: '8px 12px', borderRadius: '10px',
    background: '#f8fafc', border: '1px solid #e2e8f0',
    fontSize: '13px', textAlign: 'center',
  },
  progressWrap: { padding: '0 24px 16px' },
  progressLabel: { fontSize: '12px', color: '#64748b', marginBottom: '6px' },
  progressTrack: { height: '8px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: '99px', transition: 'width 0.2s' },
  errorBox: {
    margin: '0 24px 12px', padding: '10px 14px', borderRadius: '8px',
    background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', fontSize: '13px',
  },
  footer: {
    display: 'flex', gap: '10px', justifyContent: 'flex-end',
    padding: '16px 24px', borderTop: '1px solid #f1f5f9', background: '#f8fafc',
  },
  cancelBtn: {
    padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
    background: '#fff', color: '#64748b', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
  },
  previewBtn: {
    padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #6366f1',
    background: '#fff', color: '#6366f1', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
  },
  applyBtn: {
    padding: '10px 24px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
  },
};
