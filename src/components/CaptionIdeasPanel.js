import React, { useState } from 'react';

const TONES = [
  { id: 'casual',        label: 'Casual',        emoji: '😊' },
  { id: 'professional',  label: 'Professional',  emoji: '💼' },
  { id: 'bold',          label: 'Bold',          emoji: '🔥' },
  { id: 'inspirational', label: 'Inspirational', emoji: '✨' },
  { id: 'educational',   label: 'Educational',   emoji: '📚' },
  { id: 'funny',         label: 'Funny',         emoji: '😂' },
];

/**
 * CaptionIdeasPanel
 *
 * Props:
 *   captionText  {string}   — current caption text from the parent text box
 *   platform     {string}   — platform id e.g. "instagram"
 *   apiBase      {string}   — base API URL
 *   token        {string}   — JWT bearer token
 *   onApply      {function} — called with { caption, hashtags } when user applies result
 *   toolbarLeading   {React.ReactNode} — optional node before “Get Content Ideas” (e.g. Viral Score)
 *   toolbarBetween   {React.ReactNode} — optional row below the button row, full width (e.g. score card)
 */
export default function CaptionIdeasPanel({ captionText, platform, apiBase, token, onApply, toolbarLeading, toolbarBetween }) {
  const [open,          setOpen]          = useState(false);
  const [loadingIdeas,  setLoadingIdeas]  = useState(false);
  const [ideas,         setIdeas]         = useState([]);
  const [selectedIdea,  setSelectedIdea]  = useState(null);
  const [selectedTone,  setSelectedTone]  = useState('casual');
  const [loadingGen,    setLoadingGen]    = useState(false);
  const [result,        setResult]        = useState(null); // { caption, hashtags }
  const [error,         setError]         = useState('');

  const fetchIdeas = async () => {
    if (!captionText?.trim()) { setError('Write something in the caption box first.'); return; }
    setLoadingIdeas(true); setIdeas([]); setSelectedIdea(null); setResult(null); setError('');
    try {
      const res = await fetch(`${apiBase}/api/video/content-ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: captionText, platform: platform || 'social media' }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to generate ideas');
      setIdeas(data.ideas || []);
      setOpen(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingIdeas(false);
    }
  };

  const generateCaption = async () => {
    if (!selectedIdea) { setError('Select a content idea first.'); return; }
    setLoadingGen(true); setResult(null); setError('');
    try {
      const res = await fetch(`${apiBase}/api/video/generate-from-idea`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          originalText: captionText,
          idea: selectedIdea,
          tone: selectedTone,
          platform: platform || 'social media',
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to generate caption');
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingGen(false);
    }
  };

  const ideasButton = (
    <button
      type="button"
      onClick={ideas.length > 0 ? () => setOpen(o => !o) : fetchIdeas}
      disabled={loadingIdeas}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 14px', borderRadius: 20, border: '1.5px solid #c7d2fe',
        background: '#eef2ff', color: '#4f46e5', fontSize: 12, fontWeight: 700,
        cursor: loadingIdeas ? 'wait' : 'pointer', opacity: loadingIdeas ? 0.7 : 1,
      }}
    >
      {loadingIdeas ? '⏳ Thinking…' : '✨ Get Content Ideas'}
    </button>
  );

  return (
    <div style={{ marginTop: toolbarLeading ? 0 : 8 }}>
      {toolbarLeading ? (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
            {toolbarLeading}
            {ideasButton}
          </div>
          {toolbarBetween ? <div style={{ width: '100%' }}>{toolbarBetween}</div> : null}
        </>
      ) : (
        ideasButton
      )}

      {error && (
        <div style={{ marginTop: 6, fontSize: 12, color: '#dc2626' }}>⚠️ {error}</div>
      )}

      {/* Panel */}
      {open && ideas.length > 0 && (
        <div style={{
          marginTop: 10, background: '#f8fafc', border: '1.5px solid #e2e8f0',
          borderRadius: 14, padding: '16px', animation: 'fadeIn 0.15s ease',
        }}>

          {/* Ideas list */}
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
            💡 Pick a content angle
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {ideas.map((idea, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setSelectedIdea(idea); setResult(null); }}
                style={{
                  textAlign: 'left', padding: '8px 12px', borderRadius: 10,
                  border: `1.5px solid ${selectedIdea === idea ? '#6366f1' : '#e2e8f0'}`,
                  background: selectedIdea === idea ? '#eef2ff' : '#fff',
                  color: selectedIdea === idea ? '#4338ca' : '#334155',
                  fontSize: 13, fontWeight: selectedIdea === idea ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.12s',
                }}
              >
                {selectedIdea === idea ? '● ' : '○ '}{idea}
              </button>
            ))}
          </div>

          {/* Tone picker */}
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
            🎭 Tone
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {TONES.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTone(t.id)}
                style={{
                  padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600,
                  background: selectedTone === t.id ? '#6366f1' : '#f1f5f9',
                  color: selectedTone === t.id ? '#fff' : '#475569',
                  transition: 'all 0.12s',
                }}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>

          {/* Generate button */}
          <button
            type="button"
            onClick={generateCaption}
            disabled={loadingGen || !selectedIdea}
            style={{
              width: '100%', padding: '10px', borderRadius: 10, border: 'none',
              background: selectedIdea ? '#6366f1' : '#e2e8f0',
              color: selectedIdea ? '#fff' : '#94a3b8',
              fontSize: 13, fontWeight: 700, cursor: selectedIdea ? 'pointer' : 'not-allowed',
              opacity: loadingGen ? 0.7 : 1,
            }}
          >
            {loadingGen ? '⏳ Generating…' : '✨ Generate Caption'}
          </button>

          {/* Result */}
          {result && (
            <div style={{ marginTop: 14, background: '#fff', border: '1.5px solid #c7d2fe', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Generated Caption
              </div>
              <p style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.6, margin: '0 0 8px' }}>
                {result.caption}
              </p>
              {result.hashtags && (
                <p style={{ fontSize: 12, color: '#6366f1', margin: '0 0 12px' }}>{result.hashtags}</p>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => { onApply({ caption: result.caption, hashtags: result.hashtags }); setOpen(false); }}
                  style={{
                    flex: 1, padding: '8px', borderRadius: 8, border: 'none',
                    background: '#6366f1', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  ✅ Use this caption
                </button>
                <button
                  type="button"
                  onClick={() => { onApply({ caption: `${result.caption}\n${result.hashtags || ''}`.trim(), hashtags: result.hashtags }); setOpen(false); }}
                  style={{
                    flex: 1, padding: '8px', borderRadius: 8, border: '1.5px solid #6366f1',
                    background: '#fff', color: '#6366f1', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  ➕ Append to caption
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
