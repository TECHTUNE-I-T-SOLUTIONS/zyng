import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Management | Zyng Manage',
  description: 'Manage Zyng users, account status, roles, and community access.',
};

export default function AdminUsersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
