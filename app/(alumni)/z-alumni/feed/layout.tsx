import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alumni Feed | Zyng',
  description: 'Read alumni broadcasts, campus updates, comments, and professional community conversations on Zyng.',
};

export default function AlumniFeedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
