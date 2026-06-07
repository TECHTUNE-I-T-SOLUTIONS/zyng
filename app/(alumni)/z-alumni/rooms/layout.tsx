import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alumni Rooms | Zyng',
  description: 'Join alumni rooms for private groups, mentorship, school communities, and professional discussions.',
};

export default function AlumniRoomsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
