import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rooms | Zyng',
  description: 'Join public and private Zyng rooms for campus groups, classes, interests, events, and alumni conversations.',
};

export default function RoomsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
