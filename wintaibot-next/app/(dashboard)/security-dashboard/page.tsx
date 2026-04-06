'use client';

import React, { useEffect, useState } from 'react';

type GuardReport = {
  agent?: string;
  generatedAt?: string;
  securityScore?: number;
  summary?: {
    securityScore?: number;
    secretCritical?: number;
    secretHigh?: number;
    heuristicHigh?: number;
    npmCritical?: number;
    npmHigh?: number;
  };
  pillars?: Record<string, { note?: string; checklist?: string[]; heuristicHits?: number; secretFindings?: number }>;
  npmAudit?: { label: string; critical?: number; high?: number; skipped?: boolean }[];
  secretScan?: { findings?: { severity: string; path: string; line: number; title: string }[] };
  codeHeuristics?: { findings?: { severity: string; path: string; line: number; title: string }[] };
  handoff?: { nextAgent?: string; instruction?: string };
};

export default function SecurityDashboardPage() {
  const [data, setData] = useState<GuardReport | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/security-report.json', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('No report file yet');
        return r.json();
      })
      .then((j) => {
        if (!cancelled) setData(j);
      })
      .catch(() => {
        if (!cancelled) setErr('missing');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const score = data?.securityScore ?? data?.summary?.securityScore ?? null;

  return (
    <div
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '24px 20px 48px',
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#e2e8f0',
      }}
    >
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px', color: '#f8fafc' }}>
        Security dashboard
      </h1>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 28, lineHeight: 1.55 }}>
        Local snapshot from <strong>SecurityGuard</strong>. Run{' '}
        <code style={{ background: '#1e293b', padding: '2px 8px', borderRadius: 6 }}>npm run security:guard</code> at
        the repo root to generate <code style={{ background: '#1e293b', padding: '2px 8px', borderRadius: 6 }}>public/security-report.json</code>, then refresh.
      </p>

      {err && (
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.9)',
            border: '1px solid #475569',
            borderRadius: 14,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8 }}>No report loaded</div>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
            From the monorepo root: <strong>npm run security:guard</strong> — then reload this page. CI artifacts use the
            same JSON shape (see <strong>SecurityGuard</strong> workflow).
          </p>
        </div>
      )}

      {data && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 12,
              marginBottom: 28,
            }}
          >
            <div style={scoreCard}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>SECURITY SCORE</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#38bdf8' }}>{score ?? '—'}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>/ 100</div>
            </div>
            <div style={scoreCard}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>SECRET CRITICAL</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{data.summary?.secretCritical ?? 0}</div>
            </div>
            <div style={scoreCard}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>SECRET HIGH</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{data.summary?.secretHigh ?? 0}</div>
            </div>
            <div style={scoreCard}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>HEURISTIC HIGH</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{data.summary?.heuristicHigh ?? 0}</div>
            </div>
            <div style={scoreCard}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>NPM CRIT / HIGH</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>
                {data.summary?.npmCritical ?? 0} / {data.summary?.npmHigh ?? 0}
              </div>
            </div>
          </div>

          <h2 style={h2}>Security pillars (checklist)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.pillars &&
              Object.entries(data.pillars).map(([k, v]) => (
                <div key={k} style={pillarCard}>
                  <div style={{ fontWeight: 700, textTransform: 'capitalize', marginBottom: 6 }}>{k.replace(/([A-Z])/g, ' $1')}</div>
                  {v.note && <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 8px', lineHeight: 1.5 }}>{v.note}</p>}
                  {v.checklist?.map((c) => (
                    <div key={c} style={{ fontSize: 12, color: '#cbd5e1', marginLeft: 8 }}>
                      • {c}
                    </div>
                  ))}
                </div>
              ))}
          </div>

          <h2 style={h2}>npm audit (lockfile)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(data.npmAudit || []).map((a) => (
              <div key={a.label} style={pillarCard}>
                <strong>{a.label}</strong>
                {a.skipped ? (
                  <span style={{ color: '#94a3b8', marginLeft: 8 }}>skipped</span>
                ) : (
                  <span style={{ color: '#94a3b8', marginLeft: 8 }}>
                    critical {a.critical ?? 0}, high {a.high ?? 0}
                  </span>
                )}
              </div>
            ))}
          </div>

          <h2 style={h2}>Top secret findings</h2>
          <FindingList items={data.secretScan?.findings?.slice(0, 25)} />
          <h2 style={h2}>Code heuristics (XSS / eval / SQL smell)</h2>
          <FindingList items={data.codeHeuristics?.findings?.slice(0, 25)} />

          {data.handoff && (
            <div style={{ ...pillarCard, marginTop: 24, borderColor: '#6366f1' }}>
              <div style={{ fontWeight: 700, color: '#a5b4fc', marginBottom: 8 }}>Handoff → {data.handoff.nextAgent}</div>
              <p style={{ fontSize: 13, color: '#cbd5e1', margin: 0, lineHeight: 1.55 }}>{data.handoff.instruction}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FindingList({ items }: { items?: { severity: string; path: string; line: number; title: string }[] }) {
  if (!items?.length) {
    return <p style={{ color: '#64748b', fontSize: 13 }}>None in this report slice.</p>;
  }
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {items.map((f, i) => (
        <li
          key={`${f.path}-${f.line}-${i}`}
          style={{
            fontSize: 12,
            padding: '10px 12px',
            borderRadius: 10,
            background: 'rgba(30, 41, 59, 0.65)',
            marginBottom: 8,
            border: '1px solid #334155',
          }}
        >
          <span style={{ color: '#f87171', fontWeight: 700 }}>[{f.severity}]</span>{' '}
          <span style={{ color: '#e2e8f0' }}>{f.path}</span>
          {f.line ? <span style={{ color: '#64748b' }}> :{f.line}</span> : null}
          <div style={{ color: '#94a3b8', marginTop: 4 }}>{f.title}</div>
        </li>
      ))}
    </ul>
  );
}

const scoreCard: React.CSSProperties = {
  background: 'rgba(30, 41, 59, 0.75)',
  border: '1px solid #334155',
  borderRadius: 14,
  padding: 16,
};

const h2: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: '#f1f5f9',
  margin: '28px 0 12px',
};

const pillarCard: React.CSSProperties = {
  background: 'rgba(30, 41, 59, 0.6)',
  border: '1px solid #334155',
  borderRadius: 12,
  padding: 14,
};
