'use client';

import { useQuery } from '@tanstack/react-query';
import { campusService } from '@/lib/services/campusService';
import { MessageCircle, Loader2 } from 'lucide-react';

export default function AlumniRoomsPage() {
  const { data: rooms, isLoading } = useQuery({
    queryKey: ['alumni-rooms'],
    queryFn: () => campusService.getRooms(),
  });

  return (
    <div className="space-y-8 text-white">
      <header>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic">Rooms</h1>
        <p className="text-white/40 text-sm italic">Private discussions for alumni communities.</p>
      </header>
      {isLoading ? <Loader2 className="animate-spin text-indigo-400" /> : (
        <div className="space-y-4">
          {rooms?.map((room: any) => (
            <div key={room.id} className="bg-white/5 border border-white/5 rounded-[2rem] p-6 flex items-center gap-4">
              <MessageCircle className="text-indigo-400" />
              <div>
                <div className="font-black">{room.name}</div>
                <div className="text-white/40 text-sm">{room.description || 'Alumni room'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
