import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alumni Post Detail | Zyng',
  description: 'View an alumni Zyng post with reactions, comments, replies, and sharing options.',
};

export default function AlumniPostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
