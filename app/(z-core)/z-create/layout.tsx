import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Post | Zyng',
  description: 'Create a Zyng post, confession, hot take, event note, or missed connection for your campus community.',
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
