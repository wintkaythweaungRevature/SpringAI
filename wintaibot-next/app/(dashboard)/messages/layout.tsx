import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inbox',
  description: 'Comments and messages from connected accounts.',
};

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
