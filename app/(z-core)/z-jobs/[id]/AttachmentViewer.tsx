'use client';
import Image from 'next/image';
import { X } from 'lucide-react';
import { useState } from 'react';

interface Attachment {
  id?: string;
  url?: string;
  filename?: string;
}

interface Props {
  attachments: Attachment[];
}

export default function AttachmentViewer({ attachments }: Props) {
  const [preview, setPreview] = useState<string | null>(null);

  const normalizeAttachment = (att: Attachment | string) => {
    if (typeof att === 'string') {
      return { url: att, filename: att.split('/').pop() || 'File' };
    }

    return {
      url: att.url || '',
      filename: att.filename || att.url?.split('/').pop() || 'File',
      id: att.id,
    };
  };

  const isImage = (url: string) => /\.(png|jpe?g|gif|webp|svg)$/i.test(url);
  const isVideo = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);

  return (
    <div className="grid grid-cols-2 gap-4">
      {attachments.map((att, index) => {
        const normalized = normalizeAttachment(att);
        const key = normalized.id || `${normalized.url || 'attachment'}-${index}`;

        return (
        <div key={key} className="relative group rounded-lg overflow-hidden border border-border bg-muted">
          {normalized.url && isImage(normalized.url) ? (
            <Image
              src={normalized.url}
              loading="eager"
              alt={normalized.filename ?? 'attachment'}
              width={200}
              height={200}
              className="object-cover w-full h-full transition-transform group-hover:scale-105"
              onClick={() => setPreview(normalized.url)}
            />
          ) : normalized.url && isVideo(normalized.url) ? (
            <video
              src={normalized.url}
              controls
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-foreground/60">
              <span>{normalized.filename ?? 'File'}</span>
            </div>
          )}
        </div>
        );
      })}

      {preview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setPreview(null)}>
          <button aria-label="Close preview" title="Close preview" className="absolute top-4 right-4 p-2 bg-white rounded-full" onClick={() => setPreview(null)}>
            <X size={24} className="text-black" />
          </button>
          <Image src={preview} alt="preview" width={800} height={800} className="max-w-full max-h-full" />
        </div>
      )}
    </div>
  );
}
