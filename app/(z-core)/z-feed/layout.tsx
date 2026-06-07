import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campus Feed | Zyng',
  description: 'Read the latest Zyng posts, campus trends, comments, reactions, and real-time community updates.',
};

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
