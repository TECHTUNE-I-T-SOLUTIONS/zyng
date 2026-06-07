import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alumni Pro | Zyng',
  description: 'Use Zyng alumni professional tools for matching, referrals, opportunities, and portfolio growth.',
};

export default function AlumniProLayout({ children }: { children: React.ReactNode }) {
  return children;
}
