import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alumni Dashboard | Zyng',
  description: 'View alumni activity, matches, opportunities, and community updates in Zyng.',
};

export default function AlumniDashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
