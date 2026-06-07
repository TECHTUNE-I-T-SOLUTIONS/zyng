import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Zyng Manage',
  description: 'Monitor Zyng system status, community activity, and management controls.',
};

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
