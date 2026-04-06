import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Auto Reply',
  description: 'Automated replies for comments and messages.',
};

export default function AutoReplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
