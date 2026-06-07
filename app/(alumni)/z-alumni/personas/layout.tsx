import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alumni Personas | Zyng',
  description: 'Manage alumni personas for context-aware participation across Zyng communities.',
};

export default function AlumniPersonasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
