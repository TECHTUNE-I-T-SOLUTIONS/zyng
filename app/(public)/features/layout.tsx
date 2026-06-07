import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features | Zyng',
  description: 'Explore Zyng features including personas, campus feeds, rooms, marketplace, jobs, events, referrals, messaging, and alumni networking.',
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
