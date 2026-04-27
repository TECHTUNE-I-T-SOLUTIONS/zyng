'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/db/supabase';
import { motion } from 'framer-motion';
import { 
  FileWarning, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  Loader2,
  MessageSquare
} from 'lucide-react';

export default function AdminContentPage() {
  const { data: reports, isLoading, refetch } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*, reporter:users(z_name), admin:admins(email)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    const { error } = await supabase
      .from('reports')
      .update({ status, reviewed_by: 'MOCK_ADMIN_ID' }) // Should be real admin ID
      .eq('id', reportId);
    if (!error) refetch();
  };

  const handleDeleteContent = async (targetType: string, targetId: string) => {
    if (confirm(`Are you sure you want to delete this ${targetType}?`)) {
      const table = targetType === 'post' ? 'posts' : 'replies';
      const { error } = await supabase.from(table).delete().eq('id', targetId);
      if (!error) refetch();
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black tracking-tighter uppercase">Content Moderation</h1>
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Review reported Zyngs and Comments</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-accent" />
        </div>
      ) : !reports || reports.length === 0 ? (
        <div className="text-center py-20 bg-neutral-900 border border-dashed border-white/10 rounded-[2.5rem]">
          <p className="text-white/20 font-bold italic">Queue is clean. No active reports.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report) => (
            <motion.div 
              key={report.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`bg-neutral-900 border p-6 rounded-3xl flex items-center justify-between transition-all ${
                report.status === 'pending' ? 'border-red-500/20' : 'border-white/5 opacity-50'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-2xl ${report.status === 'pending' ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-white/20'}`}>
                  <FileWarning size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded text-white/40 border border-white/10">
                      {report.target_type}
                    </span>
                    <h3 className="font-bold text-sm">{report.reason}</h3>
                  </div>
                  <div className="text-[10px] font-black text-white/20 uppercase tracking-tighter">
                    Reported by @{report.reporter?.z_name || 'Anonymous'} • {new Date(report.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                   onClick={() => window.open(`/z-${report.target_type}/${report.target_id}`, '_blank')}
                   className="p-3 bg-white/5 rounded-xl hover:text-accent transition-all"
                   title="View Content"
                >
                  <ExternalLink size={18} />
                </button>
                
                {report.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleResolveReport(report.id, 'dismissed')}
                      className="p-3 bg-white/5 rounded-xl hover:text-green-500 transition-all"
                      title="Dismiss Report"
                    >
                      <CheckCircle size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteContent(report.target_type, report.target_id)}
                      className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                      title="Delete Content"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
