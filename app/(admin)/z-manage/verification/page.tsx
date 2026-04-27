'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/db/supabase';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  Check, 
  X,
  Scale,
  Loader2,
  FileText
} from 'lucide-react';

export default function AdminVerificationPage() {
  const { data: submissions, isLoading, refetch } = useQuery({
    queryKey: ['admin-verifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('verification_submissions')
        .select('*, user:users(full_name, z_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const handleVerify = async (id: string, userId: string, approve: boolean) => {
    const status = approve ? 'approved' : 'rejected';
    const { error: subError } = await supabase
      .from('verification_submissions')
      .update({ status })
      .eq('id', id);
    
    if (approve && !subError) {
      await supabase.from('users').update({ is_verified: true }).eq('id', userId);
    }
    
    if (!subError) refetch();
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black tracking-tighter uppercase">ID Verifications</h1>
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Verify Student IDs and Handle Appeals</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-accent" />
        </div>
      ) : !submissions || submissions.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/20 font-bold italic">No pending verifications.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {submissions.map((sub) => (
            <motion.div 
              key={sub.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-neutral-900 border border-white/5 rounded-[2.5rem] p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-bold text-accent">
                    {sub.user?.z_name?.[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold">@{sub.user?.z_name}</h3>
                    <div className="text-[10px] text-white/20 font-black uppercase italic">
                      Actual Name: {sub.user?.full_name || 'Hidden'}
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  sub.status === 'pending' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 
                  sub.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                  'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>
                  {sub.status}
                </div>
              </div>

              <div className="aspect-[16/10] bg-black rounded-3xl mb-8 relative overflow-hidden border border-white/10 group">
                {sub.id_card_url ? (
                  <img src={sub.id_card_url} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" alt="Student ID" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/10">
                    <FileText size={48} />
                    <span className="text-xs font-bold mt-2 uppercase tracking-widest">ID Image Not Available</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button className="bg-white text-black px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
                     <Eye size={16} /> Enlarge
                   </button>
                </div>
              </div>

              {sub.status === 'pending' && (
                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <button 
                    onClick={() => handleVerify(sub.id, sub.user_id, true)}
                    className="flex items-center justify-center gap-2 bg-green-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                  >
                    <Check size={18} /> Approve
                  </button>
                  <button 
                    onClick={() => handleVerify(sub.id, sub.user_id, false)}
                    className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-red-500 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-500/10 transition-all"
                  >
                    <X size={18} /> Reject
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
