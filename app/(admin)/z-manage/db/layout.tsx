import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Database Tools | Zyng Manage',
  description: 'Access Zyng database management and operational tools.',
};

export default function AdminDbLayout({ children }: { children: React.ReactNode }) {
  return children;
}
