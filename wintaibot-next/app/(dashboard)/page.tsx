'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import LandingSection from '@/components/LandingSection';
import MemberGate from '@/components/MemberGate';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
        Loading…
      </div>
    );
  }

  if (!user) {
    return <LandingSection />;
  }

  return (
    <MemberGate featureName="Analytics">
      <AnalyticsDashboard />
    </MemberGate>
  );
}
