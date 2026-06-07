import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jobs | Zyng',
  description: 'Explore campus jobs, internships, referrals, alumni opportunities, and professional openings on Zyng.',
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
