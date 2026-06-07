import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search | Zyng',
  description: 'Search Zyng for posts, personas, hashtags, opportunities, marketplace listings, and campus content.',
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
