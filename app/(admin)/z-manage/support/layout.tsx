import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support | Zyng Manage',
  description: 'Manage Zyng support requests, feedback, contact submissions, and operational follow-up.',
};

export default function AdminSupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
