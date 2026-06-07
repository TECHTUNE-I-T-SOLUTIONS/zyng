import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alumni Events | Zyng',
  description: 'Discover alumni events, mentorship sessions, meetups, and school network gatherings on Zyng.',
};

export default function AlumniEventsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
