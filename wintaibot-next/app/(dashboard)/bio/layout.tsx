import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Link in Bio',
  description: 'Your public link page.',
};

export default function BioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
