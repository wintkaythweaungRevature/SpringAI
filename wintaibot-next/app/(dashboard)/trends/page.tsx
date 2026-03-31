'use client';

import React from 'react';
import MemberGate from '@/components/MemberGate';
import DeepAnalytics from '@/components/DeepAnalytics.js';
import ProGate from '@/components/ProGate.js';

export default function TrendsPage() {
  return (
    <MemberGate featureName="Trends">
      <ProGate featureName="Trends">
        <DeepAnalytics />
      </ProGate>
    </MemberGate>
  );
}
