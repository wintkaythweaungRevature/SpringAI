import type { Metadata } from 'next';
import { Suspense } from 'react';
import MemberGate from '@/components/MemberGate';
import VideoPublisher from '@/components/VideoPublisher';

export const metadata: Metadata = {
  title: 'Video & social publishing',
  description:
    'Social media management: upload once and publish to your connected accounts with AI captions, thumbnails, and per-platform scheduling.',
  openGraph: {
    title: 'Video & social publishing | W!ntAi',
    description:
      'Social media management — multi-platform video publishing, captions, and scheduling from one workspace.',
  },
};

export default function VideoPublisherPage() {
  return (
    <MemberGate featureName="Video Publisher">
      <Suspense fallback={null}>
        <VideoPublisher />
      </Suspense>
    </MemberGate>
  );
}
