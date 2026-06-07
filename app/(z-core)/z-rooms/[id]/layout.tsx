import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Room | Zyng',
  description: 'Open a Zyng room for conversations, members, messages, and school community collaboration.',
};

export default function RoomDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
