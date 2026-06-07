import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alumni Jobs | Zyng',
  description: 'Explore jobs, referrals, professional opportunities, and alumni-led openings on Zyng.',
};

export default function AlumniJobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
