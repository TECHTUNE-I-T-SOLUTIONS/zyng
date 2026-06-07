import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reports | Zyng',
  description: 'Review Zyng reports, safety requests, moderation status, and community trust actions.',
};

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
