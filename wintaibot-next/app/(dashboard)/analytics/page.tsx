import { redirect } from 'next/navigation';

/** Analytics is the default dashboard at `/`; keep old URL working. */
export default function AnalyticsPage() {
  redirect('/');
}
