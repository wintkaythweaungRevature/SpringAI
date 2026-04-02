'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import MessagesInbox from '@/components/MessagesInbox.js';
import MemberGate from '@/components/MemberGate';
import ProGate from '@/components/ProGate.js';

type MessagesInboxProps = {
  onOpenVideoPublisher?: () => void;
  onOpenConnectedAccounts?: () => void;
  onOpenAutoReply?: () => void;
};

const MessagesInboxTyped = MessagesInbox as React.ComponentType<MessagesInboxProps>;

export default function MessagesPage() {
  const router = useRouter();

  return (
    <MemberGate featureName="Messages">
      <ProGate featureName="Messages">
        <MessagesInboxTyped
          onOpenVideoPublisher={() => router.push('/video-publisher')}
          onOpenConnectedAccounts={() => router.push('/social-connect')}
          onOpenAutoReply={() => router.push('/auto-reply')}
        />
      </ProGate>
    </MemberGate>
  );
}
