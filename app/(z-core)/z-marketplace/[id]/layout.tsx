import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketplace Listing | Zyng',
  description: 'View a Zyng marketplace listing, seller details, and contact options.',
};

export default function MarketplaceDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
