import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | Zyng',
  description: 'Contact Zyng for school setup, support, partnerships, safety reports, feedback, and product questions.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
