import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alumni Notifications | Zyng',
  description: 'View alumni notifications for messages, comments, opportunities, events, and Zyng activity.',
};

export default function AlumniNotificationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
