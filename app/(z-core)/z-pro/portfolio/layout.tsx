import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio Builder | Zyng Pro',
  description: 'Build, preview, export, and share a professional portfolio from your Zyng profile.',
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
