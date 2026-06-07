import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Z-Sight Detail | Zyng',
  description: 'View a Zyng project, innovation, portfolio item, or student-created showcase.',
};

export default function SightDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
