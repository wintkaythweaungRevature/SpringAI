import React, { useState } from 'react';
import AnimatedLineChart from './AnimatedLineChart';

const chartData = [
  { label: '1h', value: 20 },
  { label: '2h', value: 45 },
  { label: '3h', value: 30 },
  { label: '4h', value: 60 },
  { label: '5h', value: 50 },
];

const metrics = [
  { title: 'Views',      value: '12K',  icon: '👁',  color: '#3b82f6' },
  { title: 'Engagement', value: '82%',  icon: '⚡',  color: '#8b5cf6' },
  { title: 'AI Score',   value: '91%',  icon: '🤖',  color: '#06b6d4' },
  { title: 'Growth',     value: '+12%', icon: '📈',  color: '#10b981' },
];

const insights = [
  'Peak engagement at 2h',
  'Best clip detected at 1:24',
  'Suggested hashtag: #AITools',
];

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState('Views');

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0B0F14', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Sidebar ── */}
      <div style={{ width: 220, background: '#111827', padding: '24px 16px', flexShrink: 0, borderRight: '1px solid #1e293b' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 32, paddingLeft: 8 }}>Wintaibot</div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {['Dashboard', 'Analytics', 'AI Tools', 'Settings'].map((item, i) => (
            <li key={item} style={{
              padding: '9px 12px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: i === 0 ? '#1e3a5f' : 'transparent',
              color: i === 0 ? '#60a5fa' : '#94a3b8',
            }}>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, padding: '28px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Top Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {metrics.map(m => (
            <div key={m.title} style={{ background: '#111827', borderRadius: 16, padding: '16px 18px', border: '1px solid #1e293b', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: m.color, borderRadius: '16px 16px 0 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>{m.title}</span>
                <span style={{ fontSize: 18 }}>{m.icon}</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div style={{ background: '#111827', borderRadius: 18, padding: '20px 20px', border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Performance Over Time</h2>
            <div style={{ display: 'flex', gap: 6 }}>
              {['Views', 'Engagement', 'Posts'].map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={{
                  padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  background: activeTab === t ? '#3b82f6' : '#1e3a5f',
                  color: activeTab === t ? '#fff' : '#94a3b8',
                }}>{t}</button>
              ))}
            </div>
          </div>
          <AnimatedLineChart data={chartData} color="#3b82f6" title={activeTab} />
        </div>

        {/* AI Insights */}
        <div style={{ background: '#111827', borderRadius: 18, padding: '20px 20px', border: '1px solid #1e293b' }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>🤖 AI Insights</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {insights.map((ins, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500 }}>{ins}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
