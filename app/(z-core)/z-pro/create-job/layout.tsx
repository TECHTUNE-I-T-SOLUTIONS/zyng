import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Job | Zyng Pro',
  description: 'Create and publish a job or opportunity for Zyng students and alumni.',
};

export default function CreateJobLayout({ children }: { children: React.ReactNode }) {
  return children;
}
