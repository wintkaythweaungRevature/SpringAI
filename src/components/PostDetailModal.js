import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import PlatformIcon from './PlatformIcon';
import { fireToast } from './Toast';

function firstNonEmptyStr(...vals) {
  for (const v of vals) {
    if (v != null && String(v).trim() !== '') return String(v).trim();
  }
  return '';
}

function scheduledIsoFromPost(post) {
  const raw = post?.job && typeof post.job === 'object' ? post.job : null;
  const candidates = [
    post?.scheduledAt,
    post?.scheduled_at,
    post?.scheduledTime,
    post?.scheduled_for,
    raw?.scheduledAt,
    post?.publishAt,
    post?.publish_at,
  ];
  for (const v of candidates) {
    if (v == null || (typeof v === 'string' && v.trim() === '')) continue;
    try {
      const d = new Date(v);
      if (Number.isFinite(d.getTime())) return d.toISOString();
    } catch {
      /* ignore */
    }
  }
  return '';
}

/** Prefer job API for unpublished queue items when job id exists. */
export function resolveEditTarget(post) {
  if (!post) return null;
  const status = String(post?.status || '').toUpperCase();
  const terminal = status === 'SUCCESS' || status === 'PUBLISHED' || status === 'COMPLETED';
  const jobId = post?.jobId ?? post?.job?.id ?? post?.job_id;
  const postId = post?.id ?? post?.postId;
  if (jobId && !terminal) {
    return { kind: 'job', id: String(jobId) };
  }
  if (postId != null && String(postId).trim() !== '') {
    return { kind: 'post', id: String(postId) };
  }
  if (jobId) {
    return { kind: 'job', id: String(jobId) };
  }
  return null;
}

function buildPatchUrl(apiBase, target) {
  const b = (apiBase || 'https://api.wintaibot.com').replace(/\/$/, '');
  if (target.kind === 'job') {
    return `${b}/api/social/post/jobs/${encodeURIComponent(target.id)}`;
  }
  return `${b}/api/social/post/${encodeURIComponent(target.id)}`;
}

function isPublishedPost(post) {
  const s = String(post?.status || '').toUpperCase();
  return s === 'SUCCESS' || s === 'PUBLISHED' || s === 'COMPLETED';
}

function toDatetimeLocalValue(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

/** Combine fixed calendar date (YYYY-MM-DD) + time (HH:mm) into ISO UTC. */
function combineDateAndTimeToIso(dateYmd, timeHm) {
  if (!dateYmd || !timeHm) return null;
  const d = new Date(`${dateYmd}T${timeHm}:00`);
  return Number.isFinite(d.getTime()) ? d.toISOString() : null;
}

function splitDatetimeLocal(dlv) {
  if (!dlv || !String(dlv).includes('T')) return { date: '', time: '12:00' };
  const [d, t] = String(dlv).split('T');
  return { date: d || '', time: (t || '12:00').slice(0, 5) };
}

function looksLikePresignedAwsUrl(u) {
  return typeof u === 'string' && /X-Amz-Algorithm|X-Amz-Credential/i.test(u);
}

function looksLikeS3HttpUrl(u) {
  return typeof u === 'string' && /^https?:\/\//i.test(u) && /\.s3[.-][a-z0-9-]+\.amazonaws\.com\//i.test(u);
}

/** YouTube watch / youtu.be → 11-char video id */
function youtubeVideoIdFromPost(post) {
  if (String(post?.platform || '').toLowerCase() !== 'youtube') return null;
  const pid = post?.platformPostId ?? post?.platform_post_id;
  if (!pid || typeof pid !== 'string') return null;
  let s = pid.trim();
  const m1 = s.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[&?/]|$)/);
  if (m1) return m1[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  return null;
}

function youtubeEmbedUrl(post) {
  const id = youtubeVideoIdFromPost(post);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

function rawPreviewRef(post, mediaUrlEdit) {
  return (
    firstNonEmptyStr(
      mediaUrlEdit,
      post?.thumbnailUrl,
      post?.mediaUrl,
      post?.videoUrl,
      post?.imageUrl,
      post?.fileUrl,
      post?.assetUrl,
      post?.url,
    ) || ''
  );
}

/**
 * Post detail + edit modal: caption, hashtags, schedule, media; DELETE / PATCH to API.
 *
 * feedbackContext (optional) — specializes the modal for approval outcomes:
 *   { kind: 'CHANGES_REQUESTED', note, approverEmail }
 *     → amber banner showing the approver's note, save button becomes "Save & Resubmit for Approval".
 *       On save, the modal PATCHes the post then POSTs to /api/approve/send/{postId} with the
 *       original approver email, re-triggering the approval flow.
 *   { kind: 'REJECTED', note, approverEmail }
 *     → red banner with rejection note; body fields become read-only.
 *       Primary action is "Duplicate as draft" (clones via POST /api/social/post/{id}/duplicate).
 */
export default function PostDetailModal({ post, onClose, platform, onSaved, feedbackContext = null }) {
  const { token, apiBase } = useAuth();
  const base =
    (apiBase || (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE) || '').replace(/\/$/, '') ||
    'https://api.wintaibot.com';

  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [publishType, setPublishType] = useState('text');
  const [scheduledDateOnly, setScheduledDateOnly] = useState('');
  const [scheduledTimeOnly, setScheduledTimeOnly] = useState('12:00');
  const [mediaUrlEdit, setMediaUrlEdit] = useState('');
  // --- new state ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [publishNow, setPublishNow] = useState(false);
  // -----------------
  const [displayPreviewUrl, setDisplayPreviewUrl] = useState('');
  const [previewHint, setPreviewHint] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef(null);

  const p = platform || {
    id: String(post.platform || 'unknown').toLowerCase(),
    label: post.platform || 'Unknown',
    color: '#64748b',
    emoji: '📤',
    logo: null,
  };

  const target = useMemo(() => resolveEditTarget(post), [post]);
  const readOnly = isPublishedPost(post);
  const canMutate = !!target && !readOnly;

  const syncFromPost = useCallback(() => {
    if (!post) return;
    const cap = post.caption != null ? String(post.caption) : '';
    setCaption(cap);
    let ht = post.hashtags;
    if (Array.isArray(ht)) ht = ht.join(' ');
    else if (ht == null) ht = '';
    setHashtags(String(ht));
    const mt = String(post.mediaType || post.publishType || 'text').toLowerCase();
    setPublishType(
      mt === 'video' ? 'video'
      : mt === 'image' ? 'image'
      : mt === 'story' ? 'story'
      : 'text'
    );
    const sched = scheduledIsoFromPost(post);
    const dlv = toDatetimeLocalValue(sched) || toDatetimeLocalValue(post?.createdAt);
    const { date, time } = splitDatetimeLocal(dlv);
    setScheduledDateOnly(date);
    setScheduledTimeOnly(time);
    setMediaUrlEdit(
      firstNonEmptyStr(post?.mediaUrl, post?.videoUrl, post?.imageUrl, post?.thumbnailUrl, post?.url) || ''
    );
    setSelectedFile(null);
    setFilePreview('');
    setPublishNow(false);
    setDisplayPreviewUrl('');
    setPreviewHint('');
    setErrMsg('');
  }, [post]);

  useEffect(() => {
    syncFromPost();
  }, [syncFromPost]);

  // Revoke object URL when filePreview changes or component unmounts
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (filePreview) URL.revokeObjectURL(filePreview);
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
    setMediaUrlEdit(''); // file takes priority
  };

  const handleRemoveFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setSelectedFile(null);
    setFilePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const rawPreview = selectedFile ? filePreview : rawPreviewRef(post, mediaUrlEdit);

  useEffect(() => {
    let cancelled = false;
    // If a local file is selected, skip the presign flow
    if (selectedFile) return;
    const yt = youtubeEmbedUrl(post);
    if (yt) {
      setDisplayPreviewUrl('');
      setPreviewHint('');
      return () => { cancelled = true; };
    }
    if (!rawPreview) {
      setDisplayPreviewUrl('');
      setPreviewHint('');
      return () => { cancelled = true; };
    }
    if (looksLikePresignedAwsUrl(rawPreview)) {
      setDisplayPreviewUrl(rawPreview);
      setPreviewHint('');
      return () => { cancelled = true; };
    }
    const needsPresign =
      !/^https?:\/\//i.test(rawPreview) || looksLikeS3HttpUrl(rawPreview);
    if (!needsPresign || !token) {
      setDisplayPreviewUrl(rawPreview);
      setPreviewHint('');
      return () => { cancelled = true; };
    }
    (async () => {
      try {
        const r = await fetch(
          `${base}/api/social/post/media/preview-url?ref=${encodeURIComponent(rawPreview)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await r.json().catch(() => ({}));
        if (cancelled) return;
        if (r.ok && data.url) {
          setDisplayPreviewUrl(data.url);
          setPreviewHint('');
        } else {
          setDisplayPreviewUrl(rawPreview);
          setPreviewHint(
            data.error ||
              'Could not unlock this file for preview. Check AWS/S3 or use a presigned link.',
          );
        }
      } catch {
        if (!cancelled) {
          setDisplayPreviewUrl(rawPreview);
          setPreviewHint('Preview request failed.');
        }
      }
    })();
    return () => { cancelled = true; };
  }, [rawPreview, token, base, post, selectedFile]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!post) return null;

  const status = post.status || '—';
  const statusOk =
    status === 'SUCCESS' || status === 'PUBLISHED' || status === 'COMPLETED';
  const statusColor = statusOk ? '#16a34a' : status === 'FAILED' ? '#dc2626' : '#d97706';
  const statusBg = statusOk ? '#f0fdf4' : status === 'FAILED' ? '#fef2f2' : '#fffbeb';

  const created = post.createdAt || post.created_at;
  let createdStr = '';
  try {
    createdStr = created
      ? new Date(created).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
      : '';
  } catch {
    createdStr = String(created || '');
  }

  const scheduledDisplay = scheduledIsoFromPost(post);
  let scheduledStr = '';
  try {
    scheduledStr = scheduledDisplay
      ? new Date(scheduledDisplay).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
      : '';
  } catch {
    scheduledStr = scheduledDisplay || '';
  }

  const ytEmbed = youtubeEmbedUrl(post);
  const previewUrl = selectedFile ? filePreview : (displayPreviewUrl || rawPreview);
  const isVideo = publishType === 'video' || String(post?.mediaType || '').toLowerCase() === 'video'
    || (selectedFile && selectedFile.type.startsWith('video/'));

  const handleSave = async () => {
    setErrMsg('');
    setSuccessMsg('');
    if (!token) {
      setErrMsg('You are not logged in. Please refresh and try again.');
      return;
    }
    if (!target) {
      setErrMsg('Cannot save: this post is missing an ID. Please try deleting and re-scheduling it.');
      return;
    }
    if (readOnly) {
      setErrMsg('This post has already been published and cannot be edited.');
      return;
    }
    if (!publishNow) {
      if (!scheduledDateOnly) {
        setErrMsg('Please select a scheduled date before saving.');
        return;
      }
      if (!scheduledTimeOnly) {
        setErrMsg('Please enter a valid time before saving.');
        return;
      }
    }
    setSaving(true);
    try {
      const url = buildPatchUrl(base, target);
      const scheduledAt = publishNow ? null : combineDateAndTimeToIso(scheduledDateOnly, scheduledTimeOnly);

      let res;
      if (selectedFile) {
        // multipart/form-data — let browser set Content-Type with boundary
        const fd = new FormData();
        fd.append('caption', caption.trim());
        fd.append('hashtags', hashtags.trim());
        fd.append('publishType', publishType || 'text');
        if (publishNow) {
          fd.append('publishNow', 'true');
        } else if (scheduledAt) {
          fd.append('scheduledAt', scheduledAt);
        }
        fd.append('file', selectedFile);
        res = await fetch(url, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
      } else {
        const body = {
          caption: caption.trim(),
          hashtags: hashtags.trim(),
          publishType: publishType || 'text',
        };
        if (publishNow) {
          body.publishNow = true;
        } else if (scheduledAt) {
          body.scheduledAt = scheduledAt;
        }
        if (mediaUrlEdit.trim()) body.mediaUrl = mediaUrlEdit.trim();
        res = await fetch(url, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrMsg(data.error || data.message || `Update failed (${res.status}). Please try again.`);
        return;
      }

      // CHANGES_REQUESTED flow: after saving edits, immediately re-fire the approval email
      // to the same approver so the post goes back to PENDING_APPROVAL. Best-effort — the save
      // already succeeded, so any resubmit failure shows as a warning toast but doesn't block.
      if (feedbackContext?.kind === 'CHANGES_REQUESTED') {
        const approver = feedbackContext.approverEmail;
        if (approver && post?.id != null) {
          try {
            const resRes = await fetch(`${base}/api/approve/send/${post.id}`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ memberEmail: approver, memberName: approver }),
            });
            if (resRes.ok) {
              fireToast({ kind: 'success', message: `Resubmitted to ${approver}` });
            } else {
              fireToast({ kind: 'warning', message: `Saved, but resubmit to ${approver} failed — open the post and try again.` });
            }
          } catch {
            fireToast({ kind: 'warning', message: 'Saved, but network error on resubmit.' });
          }
        } else {
          // Earlier bug: when approverEmail was missing we'd silently skip the resubmit so
          // the user thought "Save & Resubmit" had re-sent the email — it hadn't. Surface it
          // instead so they know to send for approval manually from the post's menu.
          fireToast({
            kind: 'warning',
            message: 'Saved, but the original approver is unknown. Open "Send for Approval" from the post menu to resubmit.',
          });
        }
      } else {
        setSuccessMsg(publishNow ? '🚀 Post sent for immediate publishing!' : '✅ Changes saved successfully!');
      }

      if (typeof onSaved === 'function') onSaved();
      setTimeout(() => onClose(), 1200);
    } catch (e) {
      setErrMsg((e && e.message) || 'Network error — check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  /** Clone this post into a brand-new PENDING draft. Used by the REJECTED feedback modal. */
  const handleDuplicate = async () => {
    if (!post?.id || duplicating) return;
    setDuplicating(true);
    try {
      const body = {};
      if (post.scheduledAt) body.scheduledAt = post.scheduledAt;
      const res = await fetch(`${base}/api/social/post/${post.id}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        fireToast({ kind: 'error', message: data.error || `Duplicate failed (${res.status})` });
        return;
      }
      fireToast({ kind: 'success', message: 'Post duplicated as a fresh draft — edit and resubmit when ready.' });
      if (typeof onSaved === 'function') onSaved();
      onClose();
    } catch {
      fireToast({ kind: 'error', message: 'Network error — duplicate failed.' });
    } finally {
      setDuplicating(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !canMutate || !target) return;
    if (!window.confirm('Delete this scheduled post? This cannot be undone.')) return;
    setDeleting(true);
    setErrMsg('');
    try {
      const url = buildPatchUrl(base, target);
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrMsg(data.error || data.message || `Delete failed (${res.status})`);
        return;
      }
      if (typeof onSaved === 'function') onSaved();
      onClose();
    } catch (e) {
      setErrMsg((e && e.message) || 'Network error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10060,
        background: 'rgba(15, 23, 42, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        boxSizing: 'border-box',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-detail-title"
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          maxWidth: 'min(560px, 100%)',
          width: '100%',
          maxHeight: 'min(90vh, 800px)',
          overflow: 'auto',
          padding: '22px 24px 24px',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${p.color || '#6366f1'}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <PlatformIcon platform={p} size={26} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 id="post-detail-title" style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a', lineHeight: 1.25 }}>
                {p.label || post.platform}
              </h2>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginTop: 4, textTransform: 'capitalize' }}>
                {publishType || 'text'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: 20,
                background: statusBg,
                color: statusColor,
              }}
            >
              {String(status).toUpperCase()}
            </span>
            <button
              type="button"
              onClick={onClose}
              style={{
                border: 'none',
                background: '#f1f5f9',
                color: '#475569',
                width: 40,
                height: 40,
                borderRadius: 10,
                fontSize: 18,
                cursor: 'pointer',
                lineHeight: 1,
                flexShrink: 0,
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Approval feedback banner (only when feedbackContext is set) ── */}
        {feedbackContext?.kind === 'CHANGES_REQUESTED' && (
          <div style={{
            marginBottom: 14,
            background: '#fffbeb',
            border: '1.5px solid #fcd34d',
            borderLeft: '4px solid #f59e0b',
            borderRadius: 12,
            padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 16 }}>📝</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#92400e' }}>
                Changes requested
                {feedbackContext.approverEmail ? ` by ${feedbackContext.approverEmail}` : ''}
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.6, fontStyle: feedbackContext.note ? 'normal' : 'italic' }}>
              {feedbackContext.note
                ? `"${feedbackContext.note}"`
                : 'No note provided. Edit the post and resubmit for approval.'}
            </div>
            <div style={{ marginTop: 8, fontSize: 11.5, color: '#92400e' }}>
              Edit below and click <strong>Save & Resubmit</strong> — the approver will get a fresh link.
            </div>
          </div>
        )}
        {feedbackContext?.kind === 'REJECTED' && (
          <div style={{
            marginBottom: 14,
            background: '#fef2f2',
            border: '1.5px solid #fca5a5',
            borderLeft: '4px solid #ef4444',
            borderRadius: 12,
            padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 16 }}>❌</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#991b1b' }}>
                Rejected
                {feedbackContext.approverEmail ? ` by ${feedbackContext.approverEmail}` : ''}
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#7f1d1d', lineHeight: 1.6, fontStyle: feedbackContext.note ? 'normal' : 'italic' }}>
              {feedbackContext.note
                ? `"${feedbackContext.note}"`
                : 'No reason provided.'}
            </div>
            <div style={{ marginTop: 8, fontSize: 11.5, color: '#991b1b' }}>
              This post won't publish. Use <strong>Duplicate as draft</strong> to keep the work or <strong>Delete</strong> to remove it.
            </div>
          </div>
        )}

        {/* ── Banners ── */}
        {!canMutate && !readOnly && (
          <div style={{ marginBottom: 12, fontSize: 13, color: '#b45309', background: '#fffbeb', padding: '10px 12px', borderRadius: 10, border: '1px solid #fcd34d' }}>
            This item has no post or job id — editing may not be available.
          </div>
        )}
        {errMsg && (
          <div style={{ marginBottom: 12, fontSize: 13, color: '#b91c1c', background: '#fef2f2', padding: '12px 14px', borderRadius: 10, border: '1px solid #fecaca', fontWeight: 600, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span>⚠️</span><span>{errMsg}</span>
          </div>
        )}
        {successMsg && (
          <div style={{ marginBottom: 12, fontSize: 13, color: '#15803d', background: '#f0fdf4', padding: '12px 14px', borderRadius: 10, border: '1px solid #bbf7d0', fontWeight: 700 }}>
            {successMsg}
          </div>
        )}

        {/* ── Caption ── */}
        <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Caption
        </div>
        {readOnly ? (
          <div
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: '#1e293b',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: '#f8fafc',
              borderRadius: 10,
              padding: '12px 14px',
              border: '1px solid #e2e8f0',
              marginBottom: 14,
              minHeight: 48,
            }}
          >
            {caption.trim() ? caption : '(no caption)'}
          </div>
        ) : (
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={5}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              fontSize: 14,
              lineHeight: 1.6,
              color: '#1e293b',
              background: '#fff',
              borderRadius: 10,
              padding: '12px 14px',
              border: '1px solid #cbd5e1',
              marginBottom: 14,
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
            placeholder="Caption and main text…"
          />
        )}

        {/* ── Hashtags ── */}
        <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Hashtags
        </div>
        {readOnly ? (
          <div style={{ fontSize: 13, color: '#334155', marginBottom: 14, lineHeight: 1.5 }}>{hashtags || '—'}</div>
        ) : (
          <input
            type="text"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              marginBottom: 14,
            }}
            placeholder="#marketing #brand"
          />
        )}

        {/* ── Edit-only fields ── */}
        {!readOnly && (
          <>
            {/* Post type */}
            <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Post type
            </div>
            <select
              value={publishType}
              onChange={(e) => setPublishType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                marginBottom: 14,
                background: '#fff',
              }}
            >
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="story">Story</option>
            </select>

            {/* Media file upload */}
            <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Replace media (optional)
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {selectedFile ? (
              <div style={{ marginBottom: 10 }}>
                {/* preview thumbnail */}
                <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#0f172a', marginBottom: 8 }}>
                  {selectedFile.type.startsWith('video/') ? (
                    <video
                      src={filePreview}
                      controls
                      playsInline
                      preload="metadata"
                      style={{ width: '100%', maxHeight: 180, display: 'block' }}
                    />
                  ) : (
                    <img
                      src={filePreview}
                      alt="preview"
                      style={{ width: '100%', maxHeight: 180, objectFit: 'contain', display: 'block' }}
                    />
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#475569' }}>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📎 {selectedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 8,
                      border: '1px solid #fecaca',
                      background: '#fef2f2',
                      color: '#b91c1c',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    × Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%',
                  padding: '14px 12px',
                  borderRadius: 10,
                  border: '2px dashed #cbd5e1',
                  background: '#f8fafc',
                  color: '#64748b',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: 10,
                  textAlign: 'center',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#eef2ff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
              >
                📁 Click to upload image or video
              </button>
            )}

            {/* Media URL — hidden while a file is selected */}
            {!selectedFile && (
              <>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Media URL (optional)
                </div>
                <input
                  type="url"
                  value={mediaUrlEdit}
                  onChange={(e) => setMediaUrlEdit(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    fontSize: 12,
                    marginBottom: 10,
                  }}
                  placeholder="https://… (or upload a file above)"
                />
              </>
            )}

            {/* Publish Now toggle */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                border: `1.5px solid ${publishNow ? '#6366f1' : '#e2e8f0'}`,
                background: publishNow ? '#eef2ff' : '#f8fafc',
                cursor: 'pointer',
                marginBottom: 14,
                transition: 'all 0.15s',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={publishNow}
                onChange={(e) => setPublishNow(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#6366f1', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: publishNow ? '#4338ca' : '#1e293b' }}>
                  ⚡ Publish immediately
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                  Skip the schedule — send this post right now
                </div>
              </div>
            </label>

            {/* Date + Time — hidden when publishNow */}
            {!publishNow && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 160px', minWidth: 140 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    Scheduled date
                  </div>
                  <input
                    type="date"
                    value={scheduledDateOnly}
                    onChange={(e) => setScheduledDateOnly(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      background: '#fff',
                      color: '#1e293b',
                    }}
                  />
                </div>
                <div style={{ flex: '0 0 auto', minWidth: 120 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    Time
                  </div>
                  <input
                    type="time"
                    value={scheduledTimeOnly}
                    onChange={(e) => setScheduledTimeOnly(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Remote media preview (only when no local file) ── */}
        {!selectedFile && (
          <>
            {previewHint && (
              <div style={{ marginBottom: 10, fontSize: 12, color: '#b45309', background: '#fffbeb', padding: '8px 10px', borderRadius: 8 }}>
                {previewHint}
              </div>
            )}
            {(ytEmbed || previewUrl) && (
              <div style={{ marginBottom: 14, borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#0f172a' }}>
                {ytEmbed ? (
                  <iframe
                    title="YouTube preview"
                    src={ytEmbed}
                    style={{ width: '100%', height: 220, border: 'none', display: 'block' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : isVideo ? (
                  <video
                    key={previewUrl}
                    src={previewUrl}
                    controls
                    playsInline
                    preload="metadata"
                    style={{ width: '100%', maxHeight: 220, display: 'block' }}
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt=""
                    style={{ width: '100%', maxHeight: 220, objectFit: 'contain', display: 'block' }}
                  />
                )}
              </div>
            )}
          </>
        )}

        {/* ── Engagement (published posts only) ── */}
        {readOnly && (
          <>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Engagement
            </div>
            {!statusOk && (
              <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', marginBottom: 10 }}>
                Metrics appear once the post is live on the platform.
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
              {[
                ['👁', 'Views', post.impressions ?? 0],
                ['❤️', 'Likes', post.likes ?? 0],
                ['💬', 'Comments', post.recentComments ?? post.comments ?? 0],
                ['↗', 'Shares', post.shares ?? 0],
              ].map(([icon, label, val]) => (
                <div key={label} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 16 }}>{icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{val}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{label}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Meta row ── */}
        <div style={{ display: 'grid', gap: 6, fontSize: 13, color: '#475569', marginBottom: 16, paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
          <div>
            <strong style={{ color: '#64748b' }}>Created</strong> · {createdStr || '—'}
          </div>
          <div>
            <strong style={{ color: '#64748b' }}>Scheduled</strong> · {scheduledStr || '—'}
          </div>
        </div>

        {/* ── Error message from backend ── */}
        {post.errorMessage && (
          <div
            style={{
              marginBottom: 14,
              padding: '10px 12px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 10,
              fontSize: 13,
              color: '#991b1b',
              lineHeight: 1.5,
            }}
          >
            <strong>Error</strong>
            <br />
            {post.errorMessage}
          </div>
        )}

        {/* ── Action buttons ── */}
        {canMutate && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                background: '#fff',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                color: '#475569',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving || duplicating}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                border: '1px solid #fecaca',
                background: deleting ? '#fee2e2' : '#fef2f2',
                fontWeight: 700,
                fontSize: 14,
                cursor: deleting ? 'wait' : 'pointer',
                color: '#b91c1c',
              }}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
            {feedbackContext?.kind === 'REJECTED' ? (
              <button
                type="button"
                onClick={handleDuplicate}
                disabled={duplicating || deleting}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  border: 'none',
                  background: duplicating ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: duplicating ? 'wait' : 'pointer',
                  color: '#fff',
                }}
              >
                {duplicating ? 'Duplicating…' : '📋 Duplicate as draft'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || deleting}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  border: 'none',
                  background: saving ? '#93c5fd' : publishNow ? '#7c3aed' : '#2563eb',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: saving ? 'wait' : 'pointer',
                  color: '#fff',
                }}
              >
                {saving
                  ? 'Saving…'
                  : feedbackContext?.kind === 'CHANGES_REQUESTED'
                    ? '📤 Save & Resubmit for Approval'
                    : publishNow ? '⚡ Publish Now' : 'Save changes'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
