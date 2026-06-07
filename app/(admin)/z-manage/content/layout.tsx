import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Content Review | Zyng Manage',
  description: 'Review reported Zyng content, posts, comments, moderation actions, and safety signals.',
};

export default function AdminContentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
