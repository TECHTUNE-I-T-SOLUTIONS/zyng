import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Personas | Zyng',
  description: 'Create and manage Zyng personas for semi-anonymous participation across campus spaces.',
};

export default function PersonasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
