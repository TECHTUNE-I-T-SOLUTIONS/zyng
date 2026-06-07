import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alumni Portfolio | Zyng',
  description: 'Build and manage an alumni portfolio connected to your Zyng profile and opportunities.',
};

export default function AlumniPortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
