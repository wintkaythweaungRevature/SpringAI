import React, { useState } from 'react';
import UrlRepurposer from './UrlRepurposer';
import VideoRecycler from './VideoRecycler';

const TABS = [
  { id: 'url',   label: '🔗 URL Repurposer',   desc: 'Turn any article or web page into platform-optimised posts' },
  { id: 'video', label: '🎬 Video Repurposer',  desc: 'Repurpose YouTube, TikTok or Instagram videos into social content' },
];

export default function Repurposer() {
  const [active, setActive] = useState('url');

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '24px 16px', fontFamily: 'inherit' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>
          ♻️ Repurposer
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          Transform any content — articles or videos — into ready-to-post content for every platform.
        </p>
      </div>

      {/* Tab switcher */}
      <div style={{
        display: 'flex', gap: 0,
        background: '#f1f5f9',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
        border: '1.5px solid #e2e8f0',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 9,
              border: 'none',
              cursor: 'pointer',
              background: active === tab.id
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'transparent',
              color: active === tab.id ? '#fff' : '#475569',
              fontSize: 13,
              fontWeight: 700,
              transition: 'all 0.15s',
              boxShadow: active === tab.id ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
              textAlign: 'center',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active sub-description */}
      <div style={{
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 16,
        paddingLeft: 2,
      }}>
        {TABS.find(t => t.id === active)?.desc}
      </div>

      {/* Content */}
      <div style={{ padding: 0 }}>
        {active === 'url'   && <UrlRepurposer />}
        {active === 'video' && <VideoRecycler />}
      </div>
    </div>
  );
}
