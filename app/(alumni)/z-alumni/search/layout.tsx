import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alumni Search | Zyng',
  description: 'Search alumni profiles, students, opportunities, posts, and community content on Zyng.',
};

export default function AlumniSearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
