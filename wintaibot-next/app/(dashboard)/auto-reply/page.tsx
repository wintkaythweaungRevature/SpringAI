'use client';

import React from 'react';
import MemberGate from '@/components/MemberGate';
import AutoReplySettings from '@/components/AutoReplySettings.js';
import ProGate from '@/components/ProGate.js';

export default function AutoReplyPage() {
  return (
    <MemberGate featureName="Auto Reply">
      <ProGate featureName="Auto Reply">
        <AutoReplySettings />
      </ProGate>
    </MemberGate>
  );
}
