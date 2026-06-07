import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Recovery | Zyng',
  description: 'Recover access to the Zyng management console.',
};

export default function AdminRecoveryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
