import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications | Zyng',
  description: 'View Zyng notifications for comments, replies, messages, events, opportunities, and community activity.',
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
