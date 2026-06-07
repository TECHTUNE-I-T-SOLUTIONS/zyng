import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ | Zyng Help',
  description: 'Find answers about Zyng accounts, school identity, personas, alumni access, privacy, communities, and core platform features.',
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
