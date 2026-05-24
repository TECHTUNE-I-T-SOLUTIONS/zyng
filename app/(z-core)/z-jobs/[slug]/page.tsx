import { campusServiceAdmin } from '@/lib/services/campusService.server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import AttachmentViewer from '../[id]/AttachmentViewer';
import { notFound } from 'next/navigation';
import { Briefcase, MapPin, Building, Clock, Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const job = (await campusServiceAdmin.getOpportunityById(slug)) || (await campusServiceAdmin.getOpportunityBySlug(slug));
  if (!job) return { title: 'Opportunity Not Found' };
  return {
    title: `${job.title} on Zyng`,
    description: job.description?.substring(0, 160) || 'Check out this opportunity on Zyng.',
  };
}

export default async function JobDetailsPage(props: Props) {
  const { slug } = await props.params;
  const id = slug;
  const job = (await campusServiceAdmin.getOpportunityById(id)) || (await campusServiceAdmin.getOpportunityBySlug(id));
  if (!job) return notFound();

  let currentUserId: string | null = null;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value || null;
    if (token) {
      const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || '');
      const { payload } = await jwtVerify(token, secret);
      currentUserId = (payload.sub as string) || null;
    }
  } catch (err) { }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between">
        <Link href="/z-jobs" className="p-2 bg-muted rounded-xl hover:bg-muted/80 transition flex items-center gap-2 text-sm font-bold">
          <ArrowLeft size={16} /> Back
        </Link>
        <button className="p-2 bg-muted rounded-xl hover:bg-muted/80 transition flex items-center gap-2 text-sm font-bold">
          <Share2 size={16} /> Share
        </button>
      </div>

      <div className="max-w-3xl mx-auto space-y-6 p-6">
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
              <a href={job.external_url} target="_blank" rel="noreferrer" className="px-6 py-3 bg-accent text-black rounded-xl font-black hover:scale-105 transition-all">Apply Now</a>
            ) : job.accepts_applications ? (
              <a href={`/z-jobs/${slug}/apply`} className="px-6 py-3 bg-accent text-black rounded-xl font-black hover:scale-105 transition-all">Apply Now</a>
            ) : (
              <button disabled className="px-6 py-3 bg-foreground/10 text-foreground rounded-xl font-black">Closed</button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
