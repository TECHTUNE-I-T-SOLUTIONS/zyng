import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Zyng | Campus and Alumni Networks',
  description: 'Learn about Zyng, the school-first social and professional network for students, graduates, alumni, staff, and approved campus communities.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
