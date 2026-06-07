import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | Zyng',
  description: 'Manage your Zyng profile, school identity, personas, posts, skills, hobbies, and account settings.',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
