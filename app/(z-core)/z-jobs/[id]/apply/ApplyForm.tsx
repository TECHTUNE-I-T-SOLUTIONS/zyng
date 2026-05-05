'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ApplyForm({ opportunity }: any) {
  const router = useRouter();
  const [useProfile, setUseProfile] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > 2 * 1024 * 1024) {
      alert('File too large (max 2MB)');
      return;
    }
    setFile(f);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let resume_url = null;
      if (!useProfile && file) {
        // upload to our uploads api
        const data = await file.arrayBuffer();
        const bytes = new Uint8Array(data);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        const base64 = btoa(binary);
        const mime = file.type;
        const res = await fetch('/api/uploads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl: `data:${mime};base64,${base64}`, mime }),
        });
        const json = await res.json();
        resume_url = json.secure_url;
      }

      // call applications API
      const resp = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity_id: opportunity.id,
          applicant_id: null,
          resume_url,
          cover_letter: cover,
        }),
      });

      if (!resp.ok) throw new Error('Failed to apply');
      router.push('/z-jobs');
    } catch (err) {
      alert((err as any).message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center gap-3">
          <input type="radio" checked={useProfile} onChange={() => setUseProfile(true)} /> Use profile resume
        </label>
        <label className="flex items-center gap-3 mt-2">
          <input type="radio" checked={!useProfile} onChange={() => setUseProfile(false)} /> Upload resume (PDF, max 2MB)
        </label>
        {!useProfile && (
          <input type="file" accept="application/pdf,application/msword" onChange={handleFile} className="mt-2" />
        )}
      </div>

      <div>
        <label className="text-sm font-bold">Cover letter (optional)</label>
        <textarea value={cover} onChange={(e) => setCover(e.target.value)} className="w-full mt-2 p-3 rounded-md bg-white/5" />
      </div>

      <div>
        <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
          {submitting ? 'Applying…' : 'Submit Application'}
        </button>
      </div>
    </div>
  );
}
