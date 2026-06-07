import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System | Zyng Manage',
  description: 'Configure Zyng system settings, maintenance controls, and platform operations.',
};

export default function AdminSystemLayout({ children }: { children: React.ReactNode }) {
  return children;
}
