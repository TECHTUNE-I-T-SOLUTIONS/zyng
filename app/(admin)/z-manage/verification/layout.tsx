import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verification | Zyng Manage',
  description: 'Review Zyng school, alumni, user, and community verification requests.',
};

export default function AdminVerificationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
