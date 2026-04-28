import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PlatformIcon from './PlatformIcon';

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [String(parsed)];
    } catch {
      return raw.split(',').map((t) => t.trim()).filter(Boolean);
    }
  }
  return [];
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Skeleton Card ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{
      background: '#1e293b',
      borderRadius: 12,
      overflow: 'hidden',
      border: '1px solid #334155',
    }}>
      <div style={{
        height: 180,
        background: 'linear-gradient(90deg, #1e293b 25%, #2d3f55 50%, #1e293b 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
      }} />
      <div style={{ padding: '12px 14px' }}>
        <div style={{
          height: 13,
          width: '70%',
          borderRadius: 6,
          background: 'linear-gradient(90deg, #1e293b 25%, #2d3f55 50%, #1e293b 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
          marginBottom: 8,
        }} />
        <div style={{
          height: 11,
          width: '45%',
          borderRadius: 6,
          background: 'linear-gradient(90deg, #1e293b 25%, #2d3f55 50%, #1e293b 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
        }} />
      </div>
    </div>
  );
}

// ─── Asset Card ──────────────────────────────────────────────────────────────

function AssetCard({ asset, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onClick(asset)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#1e293b',
        borderRadius: 12,
        overflow: 'hidden',
        border: hovered ? '1px solid #6366f1' : '1px solid #334155',
        cursor: 'pointer',
        transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(99,102,241,0.2)' : '0 2px 8px rgba(0,0,0,0.3)',
        position: 'relative',
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', height: 180, overflow: 'hidden', background: '#0f172a' }}>
        <img
          src={asset.url}
          alt={asset.originalFilename || 'Asset'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.2s',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
          }}
          loading="lazy"
        />
        {/* Hover overlay */}
        {hovered && asset.aiDescription && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.5) 60%, transparent 100%)',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '12px',
          }}>
            <p style={{
              margin: 0,
              color: '#e2e8f0',
              fontSize: 12,
              lineHeight: 1.5,
              fontStyle: 'italic',
            }}>
              {asset.aiDescription.slice(0, 60)}{asset.aiDescription.length > 60 ? '…' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Card footer */}
      <div style={{ padding: '10px 12px' }}>
        <p style={{
          margin: 0,
          color: '#cbd5e1',
          fontSize: 13,
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {asset.originalFilename || asset.s3Key || 'Unnamed'}
        </p>
        {asset.fileSize ? (
          <p style={{ margin: '3px 0 0', color: '#64748b', fontSize: 11 }}>
            {formatFileSize(asset.fileSize)}
          </p>
        ) : null}
      </div>
    </div>
  );
}

// ─── Side Panel ──────────────────────────────────────────────────────────────

// All supported targets for ASSET_TO_POST. We INTERSECT this with the user's
// actually-connected platforms (read from /api/social/accounts) so the picker
// only offers options that can actually be posted to. `id` doubles as both the
// API platform key and the lookup key for <PlatformIcon> (real SVG logos).
const ALL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram',   color: '#E1306C' },
  { id: 'facebook',  label: 'Facebook',    color: '#1877F2' },
  { id: 'linkedin',  label: 'LinkedIn',    color: '#0A66C2' },
  { id: 'x',         label: 'X (Twitter)', color: '#000000' },
  { id: 'twitter',   label: 'X (Twitter)', color: '#000000' },
  { id: 'tiktok',    label: 'TikTok',      color: '#000000' },
  { id: 'youtube',   label: 'YouTube',     color: '#FF0000' },
  { id: 'threads',   label: 'Threads',     color: '#000000' },
  { id: 'pinterest', label: 'Pinterest',   color: '#BD081C' },
];

function SidePanel({ asset, onClose, onDelete, onTagClick, deleteConfirm, setDeleteConfirm,
                    apiBase, authHeaders, userWorkspaces, activeWorkspaceId }) {
  const [copied, setCopied] = useState(false);

  // ASSET_TO_POST generation state — fetches the user's connected platforms once
  // when the side panel opens; on Generate, posts to /api/ai-agents/generate-from-asset.
  const [connected, setConnected] = useState([]);     // ids: ['linkedin','instagram',...]
  const [picked,    setPicked]    = useState([]);     // user-selected subset
  const [brief,     setBrief]     = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [genResult,  setGenResult]  = useState(null); // { taskId, ... } | { error }
  // Target workspace for the resulting drafts. Defaults to whatever the user is
  // currently sitting in; can be changed before clicking Generate so the drafts
  // land where the user actually wants them rather than wherever they happened
  // to be when they opened the asset.
  const [targetWorkspaceId, setTargetWorkspaceId] = useState(activeWorkspaceId ?? null);

  useEffect(() => {
    let live = true;
    setGenResult(null); setBrief(''); setPicked([]);
    setTargetWorkspaceId(activeWorkspaceId ?? null);
    (async () => {
      try {
        const res = await fetch(`${apiBase}/api/social/accounts`, { headers: authHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        const pool = data.accounts || {};
        if (!live) return;
        const ids = Object.keys(pool).filter(p => (pool[p] || []).length > 0);
        setConnected(ids);
        // Default-select up to 2 platforms so the user can hit Generate immediately.
        setPicked(ids.slice(0, 2));
      } catch { /* silent */ }
    })();
    return () => { live = false; };
  }, [asset?.id, apiBase, authHeaders, activeWorkspaceId]);

  const togglePlatform = (id) => {
    setPicked(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const generate = async () => {
    if (!asset?.id || picked.length === 0) return;
    setGenLoading(true); setGenResult(null);
    try {
      const res = await fetch(`${apiBase}/api/ai-agents/generate-from-asset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          mediaAssetId: asset.id,
          platforms: picked,
          brief,
          // Locks the user's pick into the task — survives later workspace switches.
          targetWorkspaceId: targetWorkspaceId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Generation failed (HTTP ${res.status})`);
      setGenResult(data);
    } catch (e) {
      setGenResult({ error: e.message || 'Generation failed' });
    } finally {
      setGenLoading(false);
    }
  };

  if (!asset) return null;

  const tags = parseTags(asset.aiTags);

  const handleCopy = () => {
    navigator.clipboard.writeText(asset.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDeleteClick = () => {
    if (deleteConfirm === asset.id) {
      onDelete(asset.id);
    } else {
      setDeleteConfirm(asset.id);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 40,
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 320,
        height: '100vh',
        background: '#0f172a',
        borderLeft: '1px solid #334155',
        zIndex: 50,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.22s ease',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #1e293b',
          position: 'sticky',
          top: 0,
          background: '#0f172a',
          zIndex: 1,
        }}>
          <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Asset Details
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: 22,
              cursor: 'pointer',
              lineHeight: 1,
              padding: '2px 6px',
              borderRadius: 6,
              transition: 'color 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = '#1e293b'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'none'; }}
          >
            ×
          </button>
        </div>

        {/* Image Preview */}
        <div style={{
          background: '#020617',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          minHeight: 200,
          maxHeight: 300,
        }}>
          <img
            src={asset.url}
            alt={asset.originalFilename}
            style={{
              maxWidth: '100%',
              maxHeight: 268,
              objectFit: 'contain',
              borderRadius: 8,
            }}
          />
        </div>

        {/* Details */}
        <div style={{ padding: '20px', flex: 1 }}>
          {/* Filename */}
          <h3 style={{
            margin: '0 0 4px',
            color: '#f1f5f9',
            fontSize: 15,
            fontWeight: 600,
            wordBreak: 'break-all',
          }}>
            {asset.originalFilename || asset.s3Key || 'Unnamed asset'}
          </h3>

          {/* Meta */}
          <div style={{ marginBottom: 16 }}>
            {asset.uploadedAt && (
              <p style={{ margin: '0 0 2px', color: '#64748b', fontSize: 12 }}>
                Uploaded {formatDate(asset.uploadedAt)}
              </p>
            )}
            {asset.fileSize ? (
              <p style={{ margin: '0 0 2px', color: '#64748b', fontSize: 12 }}>
                {formatFileSize(asset.fileSize)} &middot; {asset.mimeType || ''}
              </p>
            ) : null}
          </div>

          {/* AI Description */}
          {asset.aiDescription && (
            <div style={{ marginBottom: 16 }}>
              <p style={{
                margin: '0 0 6px',
                color: '#6366f1',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                AI Description
              </p>
              <p style={{
                margin: 0,
                color: '#cbd5e1',
                fontSize: 13,
                lineHeight: 1.6,
                background: '#1e293b',
                borderRadius: 8,
                padding: '10px 12px',
                borderLeft: '3px solid #6366f1',
              }}>
                {asset.aiDescription}
              </p>
            </div>
          )}

          {/* AI Tags */}
          {tags.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{
                margin: '0 0 8px',
                color: '#6366f1',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                AI Tags
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {tags.map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => onTagClick(tag)}
                    style={{
                      background: 'rgba(99,102,241,0.15)',
                      border: '1px solid rgba(99,102,241,0.35)',
                      color: '#a5b4fc',
                      fontSize: 12,
                      padding: '3px 10px',
                      borderRadius: 999,
                      cursor: 'pointer',
                      transition: 'background 0.15s, color 0.15s',
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.3)'; e.currentTarget.style.color = '#e0e7ff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.color = '#a5b4fc'; }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── ASSET → POST GENERATION ───────────────────────────────────── */}
          <div style={{ marginBottom: 20 }}>
            <p style={{
              margin: '0 0 8px',
              color: '#6366f1',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              ✨ Generate Post Ideas
            </p>
            <p style={{ margin: '0 0 10px', color: '#94a3b8', fontSize: 12, lineHeight: 1.5 }}>
              Pick platforms — AI will draft a post tailored to each, ready for review in your AI Workspace.
            </p>

            {connected.length === 0 ? (
              <p style={{ margin: 0, color: '#fca5a5', fontSize: 12 }}>
                Connect at least one social platform first (Settings → Connections).
              </p>
            ) : (
              <>
                {/* Workspace destination — drafts will land in the selected workspace
                    on approval, regardless of which workspace the user is in when
                    they click Approve later. */}
                {Array.isArray(userWorkspaces) && userWorkspaces.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <label style={{
                      display: 'block', fontSize: 11, color: '#94a3b8',
                      marginBottom: 4, fontWeight: 600,
                    }}>
                      Send drafts to workspace
                    </label>
                    <select
                      value={targetWorkspaceId == null ? '' : String(targetWorkspaceId)}
                      onChange={(e) => {
                        const v = e.target.value;
                        setTargetWorkspaceId(v === '' ? null : Number(v));
                      }}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: 8,
                        padding: '8px 10px',
                        color: '#e2e8f0',
                        fontSize: 12,
                        outline: 'none',
                      }}
                    >
                      {userWorkspaces.map(ws => (
                        <option key={ws.id} value={String(ws.id)}>
                          {ws.name}{ws.id === activeWorkspaceId ? ' (current)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Platform chips — same real platform logos Video Publisher uses
                    (via the shared PlatformIcon component, no emoji fallback for
                    the platforms we know). Falls back to a generic colored dot for
                    any unrecognized platform id. */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {connected.map(pid => {
                    const meta = ALL_PLATFORMS.find(p => p.id === pid) || { id: pid, label: pid, color: '#6366f1' };
                    const isPicked = picked.includes(pid);
                    return (
                      <button
                        key={pid}
                        onClick={() => togglePlatform(pid)}
                        style={{
                          background: isPicked ? `${meta.color}26` : 'rgba(30,41,59,0.6)',
                          border: `1px solid ${isPicked ? meta.color : '#334155'}`,
                          color: isPicked ? '#e0e7ff' : '#94a3b8',
                          fontSize: 12,
                          padding: '4px 10px',
                          borderRadius: 999,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <PlatformIcon platform={meta} size={14} />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>

                {/* Optional brief */}
                <textarea
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="Optional brief — e.g. 'Promote our spring sale, mention 30% off'"
                  rows={2}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    padding: '8px 10px',
                    color: '#e2e8f0',
                    fontSize: 12,
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                    marginBottom: 10,
                  }}
                />

                {/* Generate button */}
                <button
                  onClick={generate}
                  disabled={genLoading || picked.length === 0}
                  style={{
                    width: '100%',
                    background: picked.length === 0 || genLoading ? '#334155' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    border: 'none',
                    color: '#fff',
                    borderRadius: 8,
                    padding: '10px 16px',
                    cursor: picked.length === 0 || genLoading ? 'not-allowed' : 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    transition: 'all 0.15s',
                  }}
                >
                  {genLoading
                    ? '⏳ Generating drafts…'
                    : `✨ Generate for ${picked.length} platform${picked.length === 1 ? '' : 's'}`}
                </button>

                {/* Result feedback */}
                {genResult?.error && (
                  <p style={{ margin: '8px 0 0', color: '#fca5a5', fontSize: 12 }}>
                    ⚠️ {genResult.error}
                  </p>
                )}
                {genResult?.taskId && (
                  <p style={{ margin: '8px 0 0', color: '#86efac', fontSize: 12, lineHeight: 1.5 }}>
                    ✅ Drafts ready for review in <strong>AI Workspace → Pending Tasks</strong>
                    <br/><span style={{ color: '#64748b', fontSize: 11 }}>Task #{genResult.taskId}</span>
                  </p>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={handleCopy}
              style={{
                background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)',
                border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(99,102,241,0.4)'}`,
                color: copied ? '#86efac' : '#a5b4fc',
                borderRadius: 8,
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {copied ? '✓ Copied!' : '🔗 Copy URL'}
            </button>

            <button
              onClick={handleDeleteClick}
              style={{
                background: deleteConfirm === asset.id ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${deleteConfirm === asset.id ? 'rgba(239,68,68,0.6)' : 'rgba(239,68,68,0.3)'}`,
                color: '#fca5a5',
                borderRadius: 8,
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = deleteConfirm === asset.id ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.1)'; }}
            >
              {deleteConfirm === asset.id ? '⚠️ Are you sure? Click again' : '🗑 Delete Asset'}
            </button>

            {deleteConfirm === asset.id && (
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  background: 'none',
                  border: '1px solid #334155',
                  color: '#64748b',
                  borderRadius: 8,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ onUploadClick, query }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 20px',
      gap: 16,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 56, lineHeight: 1 }}>
        {query ? '🔍' : '🖼️'}
      </div>
      <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: 20, fontWeight: 600 }}>
        {query ? `No results for "${query}"` : 'No assets yet'}
      </h3>
      <p style={{ margin: 0, color: '#64748b', fontSize: 14, maxWidth: 320 }}>
        {query
          ? 'Try a different description or clear the search.'
          : 'Upload your first image to get started with AI-powered search.'}
      </p>
      {!query && (
        <button
          onClick={onUploadClick}
          style={{
            marginTop: 8,
            background: '#6366f1',
            border: 'none',
            color: '#fff',
            borderRadius: 8,
            padding: '10px 24px',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#4f46e5'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#6366f1'; }}
        >
          Upload Image
        </button>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MediaLibrary() {
  const { apiBase, authHeaders, userWorkspaces, activeWorkspaceId } = useAuth();

  const [assets, setAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState(null);
  const [resultCount, setResultCount] = useState(null);

  const fileInputRef = useRef(null);
  const searchDebounceRef = useRef(null);

  // ── Fetch assets ────────────────────────────────────────────────────────

  const fetchAssets = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const url = query && query.trim()
        ? `${apiBase}/api/media/search?q=${encodeURIComponent(query.trim())}`
        : `${apiBase}/api/media/list`;
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setAssets(list);
      setResultCount(query && query.trim() ? list.length : null);
    } catch (err) {
      setError('Failed to load assets. Please try again.');
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase, authHeaders]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial load
  useEffect(() => {
    fetchAssets('');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Debounced search ────────────────────────────────────────────────────

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchAssets(val);
    }, 300);
  };

  // ── Upload ───────────────────────────────────────────────────────────────

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image files are supported (JPEG, PNG, GIF, WebP).');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const headers = { ...authHeaders() };
      delete headers['Content-Type'];
      const res = await fetch(`${apiBase}/api/media/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || errBody.error || `Upload failed (HTTP ${res.status})`);
      }
      const newAsset = await res.json();
      setAssets((prev) => [newAsset, ...prev]);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // ── Drag & Drop ──────────────────────────────────────────────────────────

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  // ── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${apiBase}/api/media/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Delete failed (HTTP ${res.status})`);
      setAssets((prev) => prev.filter((a) => a.id !== id));
      setSelectedAsset(null);
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Delete failed.');
    }
  };

  // ── Tag click ────────────────────────────────────────────────────────────

  const handleTagClick = (tag) => {
    setSearchQuery(tag);
    setSelectedAsset(null);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    fetchAssets(tag);
  };

  // ── Responsive grid columns ──────────────────────────────────────────────

  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setColumns(1);
      else if (w < 960) setColumns(2);
      else setColumns(3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* Global keyframe animations */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#0f172a',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#f1f5f9',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>

          {/* ── Header ── */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{
              margin: '0 0 6px',
              fontSize: 28,
              fontWeight: 700,
              color: '#f8fafc',
              letterSpacing: '-0.02em',
            }}>
              🗂 Asset Library
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
              AI-powered image search — describe what you&apos;re looking for
            </p>
          </div>

          {/* ── Search Bar ── */}
          <div style={{ marginBottom: 24, position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#475569',
              fontSize: 18,
              pointerEvents: 'none',
            }}>
              🔍
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by content, color, setting, mood..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 12,
                padding: '14px 16px 14px 48px',
                color: '#f1f5f9',
                fontSize: 15,
                outline: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6366f1';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#334155';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setResultCount(null);
                  if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                  fetchAssets('');
                }}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: 18,
                  cursor: 'pointer',
                  padding: '0 4px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* Result count */}
          {resultCount !== null && !loading && (
            <p style={{
              margin: '-16px 0 20px',
              color: '#64748b',
              fontSize: 13,
            }}>
              {resultCount === 0
                ? 'No results found'
                : `${resultCount} result${resultCount === 1 ? '' : 's'} found`}
            </p>
          )}

          {/* ── Upload Zone ── */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            style={{
              border: isDragging
                ? '2px solid #6366f1'
                : '2px dashed #334155',
              borderRadius: 14,
              padding: '28px 20px',
              textAlign: 'center',
              cursor: uploading ? 'default' : 'pointer',
              marginBottom: 32,
              background: isDragging
                ? 'rgba(99,102,241,0.08)'
                : 'rgba(30,41,59,0.4)',
              transition: 'border-color 0.15s, background 0.15s',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {uploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  border: '3px solid #334155',
                  borderTopColor: '#6366f1',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                <p style={{ margin: 0, color: '#a5b4fc', fontSize: 15, fontWeight: 500 }}>
                  🤖 AI is analyzing your image...
                </p>
                <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
                  This may take a few seconds
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 36, lineHeight: 1 }}>
                  ☁️
                </div>
                <p style={{ margin: 0, color: isDragging ? '#a5b4fc' : '#94a3b8', fontSize: 15, fontWeight: 500 }}>
                  {isDragging ? 'Release to upload' : 'Drop images here or click to upload'}
                </p>
                <p style={{ margin: 0, color: '#475569', fontSize: 12 }}>
                  Supports JPEG, PNG, GIF, WebP
                </p>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />

          {/* ── Error Banner ── */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}>
              <span style={{ color: '#fca5a5', fontSize: 14 }}>⚠️ {error}</span>
              <button
                onClick={() => setError(null)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 18, padding: '0 4px', lineHeight: 1 }}
              >
                ×
              </button>
            </div>
          )}

          {/* ── Assets Grid ── */}
          {loading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: 16,
            }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : assets.length === 0 ? (
            <EmptyState
              query={searchQuery}
              onUploadClick={() => fileInputRef.current?.click()}
            />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: 16,
                animation: 'fadeIn 0.3s ease',
              }}
            >
              {assets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onClick={setSelectedAsset}
                />
              ))}
            </div>
          )}

          {/* Asset count footer */}
          {!loading && assets.length > 0 && resultCount === null && (
            <p style={{
              textAlign: 'center',
              color: '#334155',
              fontSize: 12,
              marginTop: 32,
            }}>
              {assets.length} asset{assets.length === 1 ? '' : 's'} in your library
            </p>
          )}
        </div>
      </div>

      {/* ── Side Panel ── */}
      {selectedAsset && (
        <SidePanel
          asset={selectedAsset}
          onClose={() => { setSelectedAsset(null); setDeleteConfirm(null); }}
          onDelete={handleDelete}
          onTagClick={(tag) => {
            setSelectedAsset(null);
            handleTagClick(tag);
          }}
          deleteConfirm={deleteConfirm}
          setDeleteConfirm={setDeleteConfirm}
          apiBase={apiBase}
          authHeaders={authHeaders}
          userWorkspaces={userWorkspaces}
          activeWorkspaceId={activeWorkspaceId}
        />
      )}
    </>
  );
}
