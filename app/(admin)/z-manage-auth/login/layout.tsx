import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login | Zyng',
  description: 'Sign in to the Zyng management console.',
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
