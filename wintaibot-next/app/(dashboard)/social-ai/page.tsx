'use client';

import React from 'react';
import MemberGate from '@/components/MemberGate';
import SocialAIChat from '@/components/SocialAIChat.js';
import ProGate from '@/components/ProGate.js';

export default function SocialAIPage() {
  return (
    <MemberGate featureName="Social AI">
      <ProGate featureName="Social AI">
        <SocialAIChat />
      </ProGate>
    </MemberGate>
  );
}
