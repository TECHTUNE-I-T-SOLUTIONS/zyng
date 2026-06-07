import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Alumni Post | Zyng',
  description: 'Share an alumni broadcast, opportunity, insight, or update with your Zyng community.',
};

export default function AlumniCreateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
