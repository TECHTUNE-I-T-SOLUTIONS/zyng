import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Signup | Zyng',
  description: 'Create an authorized Zyng management account.',
};

export default function AdminSignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
