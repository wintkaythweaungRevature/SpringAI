import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Social AI',
  description: 'AI chat for social content ideas.',
};

export default function SocialAILayout({ children }: { children: React.ReactNode }) {
  return children;
}
