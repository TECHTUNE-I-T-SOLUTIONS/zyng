import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feedback | Zyng',
  description: 'Share product feedback, ideas, bug reports, and suggestions with the Zyng team.',
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
