import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recover Account | Zyng',
  description: 'Recover access to your Zyng account securely.',
};

export default function RecoverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
