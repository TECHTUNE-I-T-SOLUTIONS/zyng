import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Z-Sights | Zyng',
  description: 'Explore student projects, innovations, portfolios, and creative work shared on Zyng.',
};

export default function SightsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
