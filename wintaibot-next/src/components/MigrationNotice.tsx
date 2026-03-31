'use client';

import React from 'react';

export default function MigrationNotice({ title }: { title: string }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: 20,
        color: '#334155',
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 8, color: '#0f172a' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 14 }}>
        This page is now available in Next routing. Full feature parity migration from the React app is in progress.
      </p>
    </div>
  );
}
