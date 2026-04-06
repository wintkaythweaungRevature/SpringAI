import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Replies',
  description: 'AI-assisted email and message replies.',
};

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
