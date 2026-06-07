import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Event Detail | Zyng',
  description: 'View event details, attendance information, organizer context, and community activity on Zyng.',
};

export default function EventDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
