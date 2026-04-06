import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Growth',
  description: 'Follower trends, posting patterns, and analytics.',
};

export default function TrendsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
