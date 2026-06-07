import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alumni Marketplace | Zyng',
  description: 'Browse alumni marketplace listings, offers, and community resources on Zyng.',
};

export default function AlumniMarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
