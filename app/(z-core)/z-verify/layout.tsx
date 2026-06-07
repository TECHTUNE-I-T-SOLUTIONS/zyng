import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account Verification | Zyng',
  description: 'Complete Zyng live video and student status verification.',
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
