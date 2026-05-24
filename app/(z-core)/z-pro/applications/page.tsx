import { headers } from 'next/headers';
export const dynamic = 'force-dynamic';
import { jwtVerify } from 'jose';
import { applicationServiceAdmin } from '@/lib/services/applicationService.server';
import { slugify } from '@/lib/utils';

export default async function PosterApplicationsPage() {
  try {
    const hd = await headers();
    const cookie = hd.get('cookie') || '';
    const match = cookie.match(/sb-access-token=([^;]+)/);
    if (!match) return <div className="p-6">Not authenticated</div>;

    const token = decodeURIComponent(match[1]);
    const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || '');
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.sub as string;
    if (!userId) return <div className="p-6">Not authenticated</div>;

    const apps = await applicationServiceAdmin.listForPoster(userId);

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-black mb-4">Applications to Your Opportunities</h2>
        {(!apps || apps.length === 0) ? (
          <div className="text-foreground/60">No applications yet.</div>
        ) : (
          <div className="space-y-4">
            {apps.map((a: any) => (
              <div key={a.id} className="p-4 bg-muted border border-border rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-black">{a.opportunity?.title || 'Opportunity'}</div>
                    <div className="text-sm text-foreground/60">Applicant: {a.applicant?.full_name || a.applicant?.z_name || a.applicant?.id}</div>
                    <div className="text-sm text-foreground/40">Submitted: {new Date(a.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">Status: {a.status}</div>
                    <a href={`/z-jobs/${slugify(a.opportunity?.title || '')}`} className="text-sm text-accent mt-2">View Job</a>
                  </div>
                </div>
                {a.cover_letter && (
                  <div className="mt-3 text-sm bg-background/5 p-3 rounded">{a.cover_letter}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (err) {
    console.error('poster apps error', err);
    return <div className="p-6">Error loading applications</div>;
  }
}
