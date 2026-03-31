'use client';

import React from 'react';
import MemberGate from '@/components/MemberGate';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export default function AnalyticsPage() {
  return (
    <MemberGate featureName="Analytics">
      <AnalyticsDashboard />
    </MemberGate>
  );
}
