import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Applications | Zyng Pro',
  description: 'Manage opportunity applications and candidate activity in Zyng Pro.',
};

export default function ApplicationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
