import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketplace | Zyng',
  description: 'Browse and share campus marketplace listings for your verified Zyng community.',
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
