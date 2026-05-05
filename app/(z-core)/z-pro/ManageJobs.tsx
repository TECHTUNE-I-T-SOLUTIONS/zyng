'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/toast';
import { userService } from '@/lib/services/userService';
import { opportunityService } from '@/lib/services/opportunityService';
import Link from 'next/link';

type Props = {
  initialJobs?: any[];
  initialApplicationsMap?: Record<string, any[]>;
  initialMyApps?: any[];
  initialUser?: any;
};

export default function ManageJobs({ initialJobs, initialApplicationsMap, initialMyApps, initialUser }: Props) {
  const { show } = useToast();
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser(), enabled: !initialUser });
  const user = initialUser || me;
  const { data: jobs, isLoading } = useQuery({ queryKey: ['posted', user?.id], queryFn: () => opportunityService.listPostedBy(user?.id), enabled: !!user?.id && !initialJobs, initialData: initialJobs });
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [applications, setApplications] = useState<any[] | null>(null);
  // if server provided an applications map, use it for selected job lookups
  const serverApplicationsMap = initialApplicationsMap || {};
  const [loadingApps, setLoadingApps] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  const loadApplications = async (jobId: string) => {
    setLoadingApps(true);
    try {
      // prefer server-provided applications map when available
      if (serverApplicationsMap && serverApplicationsMap[jobId]) {
        setApplications(serverApplicationsMap[jobId]);
        setSelectedJob(jobs?.find((j: any) => j.id === jobId) || null);
      } else {
        const res = await fetch(`/api/applications?opportunity_id=${jobId}`, { credentials: 'same-origin' });
        if (!res.ok) throw new Error('Failed to load applications');
        const json = await res.json();
        setApplications(json);
        setSelectedJob(jobs?.find((j: any) => j.id === jobId) || null);
      }
    } catch (err: any) {
      console.error(err);
      show('Failed to load applications', 'error');
    } finally {
      setLoadingApps(false);
    }
  };

  

  const openDeleteModal = (jobId: string) => {
    setDeletingJobId(jobId);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setDeletingJobId(null);
    setShowDeleteModal(false);
  };

  const confirmDelete = async () => {
    if (!deletingJobId) return;
    try {
      await opportunityService.deleteOpportunity(deletingJobId);
      show('Job deleted', 'success');
      setShowDeleteModal(false);
      setDeletingJobId(null);
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      show('Failed to delete job', 'error');
      setShowDeleteModal(false);
      setDeletingJobId(null);
    }
  };

  const myAppsQuery = useQuery({ queryKey: ['my-applications', user?.id], queryFn: () => opportunityService.listMine(user?.id), enabled: !!user?.id && !initialMyApps, initialData: initialMyApps });
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const openEdit = (job: any) => {
    setEditingJob(job);
    setEditTitle(job.title || '');
    setEditCompany(job.company || '');
    setEditDescription(job.description || '');
    setEditLocation(job.location || '');
    setEditCompensation(job.compensation || '');
    setEditExternalUrl(job.external_url || '');
    setEditAcceptsApps(!!job.accepts_applications);
    setEditAppInstructions(job.application_instructions || '');
    setEditDeadline(job.apply_deadline ? new Date(job.apply_deadline).toISOString().slice(0,16) : '');
    setEditSkills((job.skills_required || []).join(', '));
    setEditAttachments(Array.isArray(job.attachments) ? [...job.attachments] : []);
    setShowEditModal(true);
  };
  const closeEdit = () => {
    setEditingJob(null);
    setShowEditModal(false);
  };

  async function uploadFileAsDataUrl(file: File) {
    const dataUrl = await new Promise<string>((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result as string);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
    const resourceType = file.type.startsWith('image/') ? 'image' : 'raw';
    const res = await fetch('/api/uploads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: file.name, dataUrl, resourceType }) });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || 'upload failed');
    return json.url || json.secure_url || json; 
  }

  // edit modal fields
  const [editTitle, setEditTitle] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCompensation, setEditCompensation] = useState('');
  const [editExternalUrl, setEditExternalUrl] = useState('');
  const [editAcceptsApps, setEditAcceptsApps] = useState(true);
  const [editAppInstructions, setEditAppInstructions] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editAttachments, setEditAttachments] = useState<any[]>([]);
  const editFileRef = React.useRef<HTMLInputElement | null>(null);

  const handleEditPick = () => editFileRef.current?.click();
  const handleEditFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files || []);
    if (!files.length) return;
    for (const f of files) {
      try {
        const url = await uploadFileAsDataUrl(f);
        setEditAttachments((s) => [...s, url]);
      } catch (err) {
        console.error('edit upload failed', err);
        show('Failed to upload file', 'error');
      }
    }
    if (editFileRef.current) editFileRef.current.value = '';
  };

  const handleSaveEdit = async () => {
    if (!editingJob) return;
    const payload: any = {
      title: editTitle || null,
      company: editCompany || null,
      description: editDescription || null,
      location: editLocation || null,
      compensation: editCompensation || null,
      external_url: editExternalUrl || null,
      accepts_applications: !!editAcceptsApps,
      application_instructions: editAppInstructions || null,
      apply_deadline: editDeadline ? new Date(editDeadline).toISOString() : null,
      skills_required: editSkills ? editSkills.split(',').map((s) => s.trim()).filter(Boolean) : null,
      attachments: editAttachments.length ? editAttachments : null,
    };
    try {
      const res = await fetch(`/api/opportunities/${editingJob.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'same-origin' });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j?.error || 'Failed to update');
      }
      show('Job updated', 'success');
      closeEdit();
      window.location.reload();
    } catch (err: any) {
      console.error('save edit failed', err);
      show('Failed to update job', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black">Manage Jobs</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 space-y-3">
          <div className="bg-muted p-3 rounded-lg border border-border">
            <div className="text-sm font-bold mb-3">Your Posted Jobs</div>
            {isLoading && <div className="text-sm text-foreground/40">Loading…</div>}
            {!isLoading && (!jobs || jobs.length === 0) && (
              <div className="text-sm text-foreground/40">You haven't posted any jobs yet.</div>
            )}
            <div className="space-y-2">
              {jobs?.map((j: any) => (
                <div key={j.id} className="flex items-center justify-between gap-2">
                  <button onClick={() => loadApplications(j.id)} className="w-full text-left p-3 rounded-lg hover:bg-background/30 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-background border border-border rounded-md overflow-hidden flex items-center justify-center">
                        {j.attachments && j.attachments.length > 0 ? (
                          <img src={typeof j.attachments[0] === 'string' ? j.attachments[0] : j.attachments[0]?.url} alt="thumb" className="object-cover w-full h-full" />
                        ) : (
                          <div className="text-foreground/30 text-xs px-1">No</div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{j.title}</div>
                        <div className="text-xs text-foreground/40">{j.company}</div>
                      </div>
                    </div>
                    <div className="text-xs text-foreground/40">{new Date(j.created_at).toLocaleDateString()}</div>
                  </button>
                  <div className="flex flex-col gap-2">
                      <button onClick={() => openEdit(j)} className="px-2 py-1 text-xs border border-border rounded-md">Edit</button>
                    <button onClick={() => openDeleteModal(j.id)} className="px-2 py-1 text-xs bg-red-600 text-white rounded-md">Del</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

          <div className="md:col-span-2 space-y-4">
            <div className="bg-muted p-4 rounded-lg border border-border min-h-[200px]">
              {!selectedJob && <div className="text-foreground/40">Select a job to review applications.</div>}
              {selectedJob && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 bg-background border border-border rounded-2xl overflow-hidden flex items-center justify-center">
                        {selectedJob.attachments && selectedJob.attachments.length > 0 ? (
                          // attachments may be stored as array of urls or objects
                          <img src={typeof selectedJob.attachments[0] === 'string' ? selectedJob.attachments[0] : selectedJob.attachments[0]?.url} alt="thumb" className="object-cover w-full h-full" />
                        ) : (
                          <div className="text-foreground/30 text-xs px-2">No media</div>
                        )}
                      </div>
                      <div>
                        <div className="text-xl font-black">{selectedJob.title}</div>
                        <div className="text-sm text-foreground/60">{selectedJob.company}</div>
                        <div className="text-xs text-foreground/40 mt-1">{selectedJob.location || ''} {selectedJob.compensation ? `• ${selectedJob.compensation}` : ''}</div>
                      </div>
                    </div>
                      <div className="text-sm text-foreground/40">Posted {new Date(selectedJob.created_at).toLocaleString()}</div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-foreground/50 mb-2">{selectedJob.description}</div>
                    {selectedJob.application_instructions && (
                      <div className="mt-2 p-3 bg-muted rounded">Instructions: {selectedJob.application_instructions}</div>
                    )}
                      <div className="mt-3 flex gap-2">
                      <Link href={`/z-pro/create-job?edit=${selectedJob.id}`} className="px-3 py-2 border border-border rounded-lg text-sm font-bold">Edit Post</Link>
                      <button onClick={() => openDeleteModal(selectedJob.id)} className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm">Delete</button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2">Applications</h4>
                    {loadingApps && <div className="text-sm text-foreground/40">Loading applications…</div>}
                    {!loadingApps && (!applications || applications.length === 0) && (
                      <div className="text-sm text-foreground/40">No applications yet.</div>
                    )}

                    <div className="space-y-3 mt-3">
                      {applications?.map((a: any) => (
                        <div key={a.id} className="p-3 bg-background/5 border border-border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-bold">{a.applicant?.full_name || a.applicant?.z_name || 'Applicant'}</div>
                              <div className="text-xs text-foreground/40">{a.applicant?.school_id ? `School ${a.applicant.school_id}` : ''} • {new Date(a.created_at).toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-black">{a.status}</div>
                            </div>
                          </div>

                          {a.cover_letter && <div className="mt-2 text-sm bg-muted p-3 rounded">{a.cover_letter}</div>}

                          <div className="mt-3 flex gap-2">
                            {a.resume_url && (
                              <a href={a.resume_url} target="_blank" rel="noreferrer" className="px-3 py-2 bg-accent text-black rounded-lg text-sm font-bold">View Resume</a>
                            )}
                            <button className="px-3 py-2 border border-border rounded-lg text-sm">Request Info</button>
                            <button className="px-3 py-2 bg-foreground text-background rounded-lg text-sm">Mark Reviewed</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-muted p-4 rounded-lg border border-border">
              <h4 className="font-black mb-3">Applications I Made</h4>
              {myAppsQuery.isLoading && <div className="text-sm text-foreground/40">Loading…</div>}
              {!myAppsQuery.isLoading && (!myAppsQuery.data || myAppsQuery.data.length === 0) && (
                <div className="text-sm text-foreground/40">You haven't applied to any jobs yet.</div>
              )}
              <div className="space-y-3">
                {myAppsQuery.data?.map((rec: any) => (
                  <div key={rec.id} className="p-3 border border-border rounded-lg bg-background/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold">{rec.opportunity?.title}</div>
                        <div className="text-xs text-foreground/40">{rec.opportunity?.company} • {new Date(rec.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="text-sm font-black">{rec.status}</div>
                    </div>
                    {rec.cover_letter && <div className="mt-2 text-sm">{rec.cover_letter}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {showEditModal && editingJob && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={closeEdit} />
              <div className="relative bg-background border border-border rounded-2xl p-6 w-full max-w-3xl z-10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-black">Edit Job</h4>
                  <button onClick={closeEdit} className="text-foreground/40">Close</button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-black">Title</label>
                    <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full p-3 bg-muted border border-border rounded" />
                  </div>
                  <div>
                    <label className="text-xs font-black">Company</label>
                    <input value={editCompany} onChange={(e) => setEditCompany(e.target.value)} className="w-full p-3 bg-muted border border-border rounded" />
                  </div>
                  <div>
                    <label className="text-xs font-black">Description</label>
                    <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full p-3 bg-muted border border-border rounded min-h-[120px]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="Location" className="p-2 bg-muted border border-border rounded" />
                    <input value={editCompensation} onChange={(e) => setEditCompensation(e.target.value)} placeholder="Compensation" className="p-2 bg-muted border border-border rounded" />
                    <input type="datetime-local" value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)} className="p-2 bg-muted border border-border rounded" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={editAcceptsApps} onChange={(e) => setEditAcceptsApps(e.target.checked)} /> Accept on-platform applications</label>
                  </div>
                  <div>
                    <label className="text-xs font-black">Application Instructions</label>
                    <textarea value={editAppInstructions} onChange={(e) => setEditAppInstructions(e.target.value)} className="w-full p-2 bg-muted border border-border rounded" />
                  </div>
                  <div>
                    <label className="text-xs font-black">External URL</label>
                    <input value={editExternalUrl} onChange={(e) => setEditExternalUrl(e.target.value)} className="w-full p-2 bg-muted border border-border rounded" />
                  </div>
                  <div>
                    <label className="text-xs font-black">Skills (comma separated)</label>
                    <input value={editSkills} onChange={(e) => setEditSkills(e.target.value)} className="w-full p-2 bg-muted border border-border rounded" />
                  </div>
                  <div>
                    <label className="text-xs font-black">Attachments</label>
                    <div className="flex items-center gap-2">
                      <input ref={editFileRef} type="file" className="hidden" onChange={handleEditFiles} multiple />
                      <button type="button" onClick={handleEditPick} className="px-3 py-2 border border-border rounded">Add Files</button>
                      <div className="flex gap-2">
                        {editAttachments.map((a: any, i: number) => (
                          <div key={i} className="px-2 py-1 border border-border rounded text-xs">
                            <span className="mr-2">{typeof a === 'string' ? a.split('/').pop() : a?.name}</span>
                            <button onClick={() => setEditAttachments((s) => s.filter((_x, idx) => idx !== i))} className="text-red-500">x</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={closeEdit} className="px-4 py-2 border border-border rounded">Cancel</button>
                    <button onClick={handleSaveEdit} className="px-4 py-2 bg-accent text-black rounded">Save</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {showDeleteModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50" onClick={cancelDelete} />
              <div className="relative bg-background border border-border rounded-2xl p-6 w-full max-w-lg z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-black">Delete Job</h4>
                    <p className="text-sm text-foreground/60">This action cannot be undone. Deleting will remove the job and its applications.</p>
                  </div>
                  <button onClick={cancelDelete} className="text-foreground/40">Cancel</button>
                </div>
                <div className="space-y-4">
                  <p className="text-sm">Are you sure you want to permanently delete this job?</p>
                  <div className="flex justify-end gap-2">
                    <button onClick={cancelDelete} className="px-4 py-2 border border-border rounded">No, keep it</button>
                    <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">Yes, delete</button>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
