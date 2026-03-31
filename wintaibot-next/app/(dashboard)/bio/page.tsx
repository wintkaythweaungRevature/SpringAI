'use client';

import React from 'react';
import MemberGate from '@/components/MemberGate';
import LinkInBioBuilder from '@/components/LinkInBioBuilder.js';

export default function LinkInBioPage() {
  return (
    <MemberGate featureName="Link In Bio">
      <LinkInBioBuilder />
    </MemberGate>
  );
}
