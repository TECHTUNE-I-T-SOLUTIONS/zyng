import { campusServiceAdmin } from '@/lib/services/campusService.server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import AttachmentViewer from './AttachmentViewer';
import { notFound } from 'next/navigation';
import { Briefcase, MapPin, Building, Clock, X } from 'lucide-react';

type Props = { params: { id: string } };

export default async function JobDetailsPage(props: Props) {
  // `props.params` may be a Promise in some Next.js runtime versions — await to unwrap safely
  // See: https://nextjs.org/docs/messages/sync-dynamic-apis
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const params = await (props.params as unknown as Promise<{ id: string }>);
  const id = params?.id;
  const job = await campusServiceAdmin.getOpportunityById(id);
  if (!job) return notFound();

  // determine current user from sb-access-token cookie (server-side)
  let currentUserId: string | null = null;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value || null;
    if (token) {
      const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || '');
      const { payload } = await jwtVerify(token, secret);
      currentUserId = (payload.sub as string) || null;
    }
  } catch (err) {
    // ignore invalid token
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-accent">Opportunity</div>
            <h1 className="text-3xl font-black mt-3">{job.title}</h1>
            <div className="mt-2 text-sm text-foreground/40">{job.company || 'Posted by member'}</div>
          </div>
        </header>

        <section className="bg-muted border border-border rounded-[2rem] p-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-background border border-border flex items-center justify-center text-accent">
              <Briefcase size={34} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-6 mb-3 text-sm text-foreground/40">
                <div className="flex items-center gap-2"><Building size={14} /> {job.company || 'Alumni Network'}</div>
                <div className="flex items-center gap-2"><MapPin size={14} /> {job.location || 'Remote / On-site'}</div>
                <div className="flex items-center gap-2"><Clock size={14} /> {job.apply_deadline ? new Date(job.apply_deadline).toLocaleString() : 'No deadline'}</div>
              </div>

              <div className="text-sm text-foreground/80 whitespace-pre-wrap">{job.description}</div>

              {Array.isArray(job.skills_required) && job.skills_required.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {job.skills_required.map((s: string) => (
                    <div key={s} className="px-3 py-1 rounded-full bg-background/60 text-[12px] font-bold border border-border">{s}</div>
                  ))}
                </div>
              )}

              {Array.isArray(job.attachments) && job.attachments.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-black mb-2">Attachments</h4>
                  {/* AttachmentViewer is a client component that opens modal */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <AttachmentViewer attachments={job.attachments} />
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="flex items-center justify-between">
          <div>
            <div className="text-sm text-foreground/40">Posted</div>
            <div className="font-black">{new Date(job.created_at).toLocaleString()}</div>
          </div>
            <div className="flex gap-2">
            {job.external_url ? (
              <a href={job.external_url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-accent text-black rounded-xl font-black">Apply</a>
            ) : job.accepts_applications ? (
              <a href={`/z-jobs/${job.id}/apply`} className="px-4 py-2 bg-accent text-black rounded-xl font-black">Apply</a>
            ) : (
              <button disabled className="px-4 py-2 bg-foreground/10 text-foreground rounded-xl font-black">Applications Closed</button>
            )}
            {currentUserId && currentUserId === job.created_by ? (
              <a href="/z-pro" className="px-4 py-2 border border-border rounded-xl font-bold">Edit</a>
            ) : null}
          </div>
        </footer>
      </div>
    </div>
  );
}
