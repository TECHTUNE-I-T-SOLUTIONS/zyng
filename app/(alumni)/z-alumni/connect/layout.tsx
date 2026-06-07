import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alumni Connect | Zyng',
  description: 'Find and connect with students, graduates, and verified alumni in the Zyng network.',
};

export default function AlumniConnectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
