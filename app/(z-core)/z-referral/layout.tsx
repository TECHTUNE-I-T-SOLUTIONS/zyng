import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Referrals | Zyng',
  description: 'Invite friends and manage Zyng referral codes, rewards, and alumni network growth.',
};

export default function ReferralLayout({ children }: { children: React.ReactNode }) {
  return children;
}
