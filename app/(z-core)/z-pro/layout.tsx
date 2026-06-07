import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pro Hub | Zyng',
  description: 'Manage Zyng professional tools for jobs, applications, opportunities, portfolios, and alumni matches.',
};

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return children;
}
