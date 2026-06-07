import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Zyng',
  description: 'Sign in to your Zyng account to access your campus feed, personas, messages, opportunities, and alumni network.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
