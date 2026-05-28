'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/lib/services/userService';
import { zyngMatchService, getPreferredPersona } from '@/lib/services/zyngMatchService';
import { zingService } from '@/lib/services/zingService';
import { ArrowRight, Loader2, Search, Sparkles, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ACTIVE_PERSONA_ALERT, getPersonaDisplay, hasActivePersona } from '@/lib/persona-utils';
import { useToast } from '@/components/toast';

export default function AlumniConnectPage() {
  const [search, setSearch] = useState('');
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const normalizedSearch = search.trim().toLowerCase();

  const { data: user, isLoading: loadingMe } = useQuery({
    queryKey: ['alumni-connect-me'],
    queryFn: () => userService.getCurrentUser(),
  });

  const { data: alumni, isLoading } = useQuery({
    queryKey: ['alumni-connect-matches', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user) return [];
      const suggestions = await zyngMatchService.getSuggestedZyngers(user, { onlyAlumni: true, limit: 24 });
      return suggestions.filter((candidate: any) => hasActivePersona(candidate));
    },
  });

  const requestMutation = useMutation({
    mutationFn: async (candidate: any) => {
      if (!hasActivePersona(user)) {
        toast.show(ACTIVE_PERSONA_ALERT, 'error');
        throw new Error(ACTIVE_PERSONA_ALERT);
      }
      const ok = window.confirm('This Zynger is an alumni. Please connect with respect, stay curious, and use the conversation as a chance to learn from their experience.');
      if (!ok) throw new Error('Connection cancelled');
      const existingName = candidate.name || candidate.z_name || 'there';
      const intro = `Hi ${existingName}, I found your alumni profile and would like to zync. We seem to have a strong professional overlap.`;
      return zingService.sendZingRequest(candidate.id, intro);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['zing-chats'] });
      await queryClient.invalidateQueries({ queryKey: ['alumni-connect-matches', user?.id] });
      router.push('/z-alumni/messages');
    },
  });

  const filteredAlumni = useMemo(() => {
    return (alumni || []).filter((candidate: any) => {
      const persona = getPreferredPersona(candidate.personas);
      const display = getPersonaDisplay(candidate);
      const haystack = [
        candidate.full_name,
        candidate.z_name,
        candidate.bio,
        persona?.name,
        ...(candidate.sharedSkills || []),
        ...(candidate.sharedHobbies || []),
      ].join(' ').toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [alumni, normalizedSearch]);

  if (loadingMe || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-300">
          <Sparkles size={12} /> Alumni Connect
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Find alumni matches</h1>
          <p className="text-white/40 text-sm italic mt-2 max-w-2xl">
            Discover alumni who share skills, hobbies, and campus background. Send a Zync request when you want to start the conversation.
          </p>
        </div>

        <div className="relative max-w-xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alumni by name, skill, hobby, or bio..."
            className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] pl-14 pr-6 py-4 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
      </header>

      {filteredAlumni.length === 0 ? (
        <div className="bg-white/5 border border-white/5 rounded-[2rem] p-10 text-center text-white/40">
          No alumni matches found for your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredAlumni.map((candidate: any) => {
            const persona = getPreferredPersona(candidate.personas);
            const display = getPersonaDisplay(candidate);
            return (
              <article key={candidate.id} className="bg-white/5 border border-white/5 rounded-[2rem] p-6 hover:border-indigo-500/30 transition-all hover:bg-white/10">
                <div className="flex items-start gap-4 mb-5">
                  <img
                    src={display.avatar}
                    alt={display.name}
                    className="w-14 h-14 rounded-2xl object-cover bg-black border border-white/10"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-black text-lg truncate">{display.name}</h2>
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">Alumni</span>
                    </div>
                    <p className="text-xs text-white/40 mt-1 line-clamp-2">{candidate.bio || 'Professional profile available through the alumni network.'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-2">Shared skills</div>
                    <div className="flex flex-wrap gap-2">
                      {(candidate.sharedSkills || []).slice(0, 3).map((skill: string) => (
                        <span key={skill} className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest">{skill}</span>
                      ))}
                      {(!candidate.sharedSkills || candidate.sharedSkills.length === 0) && (
                        <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">No direct skill overlap</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-2">Shared hobbies</div>
                    <div className="flex flex-wrap gap-2">
                      {(candidate.sharedHobbies || []).slice(0, 3).map((hobby: string) => (
                        <span key={hobby} className="px-2.5 py-1 rounded-full bg-white/5 text-white/70 border border-white/10 text-[10px] font-black uppercase tracking-widest">{hobby}</span>
                      ))}
                      {(!candidate.sharedHobbies || candidate.sharedHobbies.length === 0) && (
                        <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">No direct hobby overlap</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/25">Match score</div>
                      <div className="text-xl font-black text-indigo-300">{candidate.score}</div>
                    </div>
                    <button
                      onClick={() => requestMutation.mutate(candidate)}
                      disabled={requestMutation.isPending}
                      className="inline-flex items-center gap-2 bg-indigo-500 text-white px-4 py-2.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-400 transition-all disabled:opacity-50"
                    >
                      Request Zync <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!filteredAlumni.length && (
        <div className="text-center text-white/40 text-sm italic">Try a different search term or revisit the page after your profile is updated.</div>
      )}
    </div>
  );
}
