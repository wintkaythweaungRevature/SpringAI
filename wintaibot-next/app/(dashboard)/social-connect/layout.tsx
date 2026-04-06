import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accounts',
  description: 'Connect social accounts for publishing.',
};

export default function SocialConnectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
