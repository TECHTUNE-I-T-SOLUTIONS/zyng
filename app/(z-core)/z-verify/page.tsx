'use client';

import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Camera, FileBadge, Loader2, ShieldCheck, Square, Upload, Video } from 'lucide-react';
import { userService } from '@/lib/services/userService';
import { verificationService } from '@/lib/services/verificationService';

const challenges = [
  'Zyng verifies real campus people.',
  'My school identity belongs to me.',
  'Today I am verifying my Zyng account.',
];

export default function VerifyPage() {
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });
  const [challenge] = useState(() => challenges[Math.floor(Math.random() * challenges.length)]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const idRef = useRef<HTMLInputElement | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startCamera = async () => {
    const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setStream(media);
    if (videoRef.current) videoRef.current.srcObject = media;
  };

  const startRecording = async () => {
    if (!stream) await startCamera();
    const activeStream = stream || (videoRef.current?.srcObject as MediaStream);
    if (!activeStream) return;
    chunks.current = [];
    const mediaRecorder = new MediaRecorder(activeStream);
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.current.push(event.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks.current, { type: 'video/webm' });
      setVideoBlob(blob);
      setVideoPreview(URL.createObjectURL(blob));
    };
    mediaRecorder.start();
    setRecorder(mediaRecorder);
  };

  const stopRecording = () => {
    recorder?.stop();
    setRecorder(null);
  };

  const uploadBlob = async (blob: Blob, filename: string, resourceType: 'image' | 'video' | 'raw') => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const res = await fetch('/api/uploads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, dataUrl, resourceType }),
    });
    const json = await res.json();
    if (!res.ok || !json.url) throw new Error(json.error || 'Upload failed');
    return json.url as string;
  };

  const handleIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIdFile(file);
    if (file.type.startsWith('image/')) setIdPreview(URL.createObjectURL(file));
    else setIdPreview(file.name);
  };

  const submitVerification = async () => {
    if (!user?.id || !videoBlob) {
      setNotice('Record your live verification video first.');
      return;
    }
    setSubmitting(true);
    setNotice('');
    try {
      const videoUrl = await uploadBlob(videoBlob, `zyng-live-${user.id}.webm`, 'video');
      const idUrl = idFile
        ? await uploadBlob(idFile, `zyng-id-${user.id}-${idFile.name}`, idFile.type.startsWith('image/') ? 'image' : 'raw')
        : videoUrl;
      await verificationService.submitVerification({
        user_id: user.id,
        id_card_url: idUrl,
        video_url: videoUrl,
        challenge_phrase: challenge,
        profile_snapshot: {
          full_name: user.full_name,
          z_name: user.z_name,
          school_id: user.school_id,
          department_id: user.department_id,
          status: user.status,
        },
      });
      setNotice('Verification submitted. We will review the live video and ID evidence, then delete verification documents after review according to the security protocol.');
    } catch (err) {
      console.error(err);
      setNotice('Verification submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-accent">
            <ShieldCheck size={14} /> Live status check
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Verify Your Account</h1>
          <p className="max-w-2xl text-sm leading-7 text-foreground/60">
            Record a short live video, move your head and hand naturally, say the challenge phrase, and show your student ID if available. If you cannot show it clearly in the video, attach the ID below.
          </p>
        </header>

        <section className="rounded-[2rem] border border-border bg-muted/30 p-6">
          <div className="mb-5 rounded-2xl border border-border bg-background p-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Say this phrase</div>
            <div className="mt-2 text-xl font-black text-accent">{challenge}</div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-black">
            {videoPreview ? (
              <video src={videoPreview} controls className="aspect-video w-full object-cover" />
            ) : (
              <video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full object-cover" />
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={startCamera} className="inline-flex items-center gap-2 rounded-xl bg-muted px-5 py-3 text-xs font-black uppercase tracking-widest">
              <Camera size={16} /> Start Camera
            </button>
            {!recorder ? (
              <button onClick={startRecording} className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-xs font-black uppercase tracking-widest text-black">
                <Video size={16} /> Record
              </button>
            ) : (
              <button onClick={stopRecording} className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-xs font-black uppercase tracking-widest text-white">
                <Square size={16} /> Stop
              </button>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-border bg-muted/30 p-6">
          <h2 className="mb-2 text-xl font-black">Student ID evidence</h2>
          <p className="mb-5 text-sm leading-7 text-foreground/60">
            Use the live video first. Attach your student ID only if it was not clearly visible. Documents are used only for verification review and should be deleted after review is completed.
          </p>
          <input ref={idRef} type="file" accept="image/*,.pdf" onChange={handleIdChange} className="hidden" />
          <button onClick={() => idRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-xs font-black uppercase tracking-widest">
            <Upload size={16} /> Attach ID
          </button>
          {idPreview && (
            <div className="mt-4 rounded-2xl border border-border bg-background p-4 text-sm font-bold">
              {idPreview.startsWith('blob:') ? <img src={idPreview} alt="ID preview" className="max-h-52 rounded-xl object-contain" /> : idPreview}
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-border bg-background p-6">
          <div className="flex items-start gap-4">
            <FileBadge className="mt-1 text-accent" />
            <div className="text-sm leading-7 text-foreground/60">
              This flow captures evidence for human review and is designed to be compatible with later server-side liveness and document checks. Do not submit another person’s ID or confidential documents that are not needed for school status verification.
            </div>
          </div>
        </section>

        {notice && <div className="rounded-2xl border border-border bg-muted p-4 text-sm font-bold">{notice}</div>}
        <button onClick={submitVerification} disabled={submitting || !videoBlob} className="w-full rounded-2xl bg-accent py-4 font-black uppercase tracking-widest text-black disabled:opacity-50">
          {submitting ? <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={18} /> Submitting...</span> : 'Submit Verification'}
        </button>
      </div>
    </div>
  );
}
