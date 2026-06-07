import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alumni Profile | Zyng',
  description: 'Manage your alumni profile, skills, school identity, portfolio, and Zyng account details.',
};

export default function AlumniProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
