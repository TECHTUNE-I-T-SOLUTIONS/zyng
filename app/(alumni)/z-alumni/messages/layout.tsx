import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alumni Messages | Zyng',
  description: 'Message students, graduates, and alumni connections inside Zyng.',
};

export default function AlumniMessagesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
