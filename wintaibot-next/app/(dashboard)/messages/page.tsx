'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import MessagesInbox from '@/components/MessagesInbox.js';
import MemberGate from '@/components/MemberGate';
import ProGate from '@/components/ProGate.js';

const MessagesInboxAny = MessagesInbox as React.ComponentType<any>;

export default function MessagesPage() {
  const router = useRouter();

  return (
    <MemberGate featureName="Messages">
      <ProGate featureName="Messages">
        <MessagesInboxAny
          onOpenVideoPublisher={() => router.push('/video-publisher')}
          onOpenConnectedAccounts={() => router.push('/social-connect')}
          onOpenAutoReply={() => router.push('/auto-reply')}
        />
      </ProGate>
    </MemberGate>
  );
}
