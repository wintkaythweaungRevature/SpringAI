'use client';

import React from 'react';
import MemberGate from '@/components/MemberGate';
import ContentCalendar from '@/components/ContentCalendar.js';

export default function CalendarPage() {
  return (
    <MemberGate featureName="Content Calendar">
      <ContentCalendar />
    </MemberGate>
  );
}
