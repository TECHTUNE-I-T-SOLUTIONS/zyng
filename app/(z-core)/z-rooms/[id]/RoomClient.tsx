'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef, useEffect } from 'react';
import { zingService } from '@/lib/services/zingService';

export default function RoomClient({ roomId }: { roomId: string }) {
  const { data: room, isLoading } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => zingService.getRoomById(roomId),
  });
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  const sendMutation = useMutation({
    mutationFn: (content: string) => zingService.sendMessage(roomId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room', roomId] });
      setMessage('');
    }
  });
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room?.zing_messages]);

  if (isLoading) return <div>Loading...</div>;
  if (!room) return <div>Room not found</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <header className="mb-4">
        <h2 className="text-2xl font-black">{room.name}</h2>
        <div className="text-sm text-foreground/50">{room.description}</div>
      </header>

      <section className="bg-muted border border-border rounded-xl p-4 h-[60vh] overflow-y-auto">
        {Array.isArray(room.zing_messages) && room.zing_messages.length > 0 ? (
          room.zing_messages
            .slice()
            .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map((m: any) => (
              <div key={m.id} className="mb-3">
                <div className="text-xs text-foreground/50 font-bold">{m.sender?.z_name || 'Someone'}</div>
                <div className="text-sm">{m.content}</div>
                <div className="text-[10px] text-foreground/40">{new Date(m.created_at).toLocaleString()}</div>
              </div>
            ))
        ) : (
          <div className="text-center text-foreground/40">No messages yet</div>
        )}
        <div ref={endRef} />
      </section>

      <footer className="mt-4 flex gap-2">
        <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a message" className="flex-1 px-4 py-2 rounded-lg border border-border" />
        <button onClick={() => sendMutation.mutate(message)} disabled={!message || (sendMutation as any).isLoading} className="px-4 py-2 bg-accent text-black rounded-lg font-black">Send</button>
      </footer>

      <aside className="mt-6">
        <h4 className="font-black">Members ({room.zing_room_members?.length || 0})</h4>
        <ul className="mt-2 space-y-2">
          {Array.isArray(room.zing_room_members) && room.zing_room_members.map((m: any) => (
            <li key={m.id} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/20" />
              <div className="text-sm font-bold">{m.user?.z_name || 'Member'}</div>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
