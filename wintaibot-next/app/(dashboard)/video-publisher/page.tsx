import type { Metadata } from 'next';
import MemberGate from '@/components/MemberGate';
import VideoPublisher from '@/components/VideoPublisher';

export const metadata: Metadata = {
  title: 'Publish',
  description: 'Upload once and publish to your connected social accounts.',
  openGraph: {
    title: 'Publish | W!ntAi',
    description: 'Upload once and publish to your connected social accounts.',
  },
};

export default function VideoPublisherPage() {
  return (
    <MemberGate featureName="Video Publisher">
      <VideoPublisher />
    </MemberGate>
  );
}
