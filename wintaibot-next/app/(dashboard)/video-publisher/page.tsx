import type { Metadata } from 'next';
import MemberGate from '@/components/MemberGate';
import VideoPublisher from '@/components/VideoPublisher';

export const metadata: Metadata = {
  title: 'Video Publisher',
  description:
    'Upload once, publish everywhere. Connect YouTube, Instagram, TikTok, and more. Get AI captions and hashtags per platform, schedule posts, and see viral trends.',
  openGraph: {
    title: 'Video Publisher – One Video, Every Platform | W!ntAi',
    description:
      'Upload once, publish everywhere. Connect YouTube, Instagram, TikTok. AI captions, hashtags, and scheduling per platform.',
  },
};

export default function VideoPublisherPage() {
  return (
    <MemberGate featureName="Video Publisher">
      <VideoPublisher />
    </MemberGate>
  );
}
