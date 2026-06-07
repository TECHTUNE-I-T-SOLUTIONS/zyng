import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alumni Referrals | Zyng',
  description: 'Manage alumni referral codes, invitations, and network growth on Zyng.',
};

export default function AlumniReferralLayout({ children }: { children: React.ReactNode }) {
  return children;
}
