import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendar',
  description: 'Scheduled and published posts.',
};

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
