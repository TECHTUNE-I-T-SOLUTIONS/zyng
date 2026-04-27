'use client';

import { useQuery } from '@tanstack/react-query';
import { referralService } from '@/lib/services/referralService';
import { userService } from '@/lib/services/userService';
import { Copy, Loader2, Megaphone } from 'lucide-react';

export default function AlumniReferralPage() {
  const { data: user } = useQuery({ queryKey: ['alumni-me'], queryFn: () => userService.getCurrentUser() });
  const { data: referrals, isLoading } = useQuery({
    queryKey: ['alumni-referrals', user?.id],
    queryFn: () => referralService.getMyReferral(user!.id),
    enabled: !!user?.id,
  });
  const code = user?.referral_code || 'ZYNG-ALUMNI-XXXX';

  return (
    <div className="space-y-8 text-white">
      <header>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic">Referral Network</h1>
        <p className="text-white/40 text-sm italic">Share your referral code and track alumni signups.</p>
      </header>
      <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-indigo-400 font-black mb-1">Your Code</div>
          <div className="text-2xl font-black">{code}</div>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-widest"><Copy size={14} /> Copy</button>
      </div>
      {isLoading ? <Loader2 className="animate-spin text-indigo-400" /> : (
        <div className="space-y-3">
          {referrals?.map((r: any) => (
            <div key={r.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
              <Megaphone className="text-indigo-400" />
              <div className="flex-1">
                <div className="font-black">{r.referral_code}</div>
                <div className="text-white/40 text-sm">{r.status}</div>
              </div>
            </div>
          )) || <div className="text-white/30 italic">No referrals yet.</div>}
        </div>
      )}
    </div>
  );
}
