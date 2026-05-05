'use client';

import React, { useState } from 'react';

export default function AttachmentViewer({ attachments }: { attachments: string[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  if (!attachments || attachments.length === 0) return null;

  const openItem = (a: string) => {
    setActive(a);
    setOpen(true);
  };

  return (
    <div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {attachments.map((a) => (
          <button key={a} onClick={() => openItem(a)} className="p-3 bg-background/10 rounded-lg border border-border text-left truncate">
            <div className="font-bold">{a.split('/').pop()}</div>
            <div className="text-xs text-foreground/40">Open</div>
          </button>
        ))}
      </div>

      {open && active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-4xl bg-background rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="font-bold">{active.split('/').pop()}</div>
              <button onClick={() => setOpen(false)} className="text-foreground/60">Close</button>
            </div>
            <div className="h-[70vh] overflow-auto">
              {active.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img src={active} alt="attachment" className="w-full h-full object-contain" />
              ) : active.match(/\.(pdf)$/i) ? (
                <iframe src={active} className="w-full h-full" />
              ) : (
                <div>
                  <a href={active} target="_blank" rel="noreferrer" className="text-accent">Open file</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
