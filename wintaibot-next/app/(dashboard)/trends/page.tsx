'use client';

import React from 'react';
import MemberGate from '@/components/MemberGate';
import DeepAnalytics from '@/components/DeepAnalytics.js';
import ProGate from '@/components/ProGate.js';

export default function TrendsPage() {
  return (
    <MemberGate featureName="Growth Planner">
      <ProGate featureName="Growth Planner">
        <DeepAnalytics />
      </ProGate>
    </MemberGate>
  );
}
