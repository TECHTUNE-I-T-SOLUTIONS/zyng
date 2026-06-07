import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Messages | Zyng',
  description: 'Message Zyngers, alumni, classmates, and campus connections safely inside Zyng.',
};

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
