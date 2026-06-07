import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events | Zyng',
  description: 'Discover campus events, alumni sessions, meetups, rooms, and school community gatherings on Zyng.',
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
