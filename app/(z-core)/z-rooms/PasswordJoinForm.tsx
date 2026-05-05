'use client'

import { useState } from 'react';
import { Key } from 'lucide-react';

export default function PasswordJoinForm({ roomId, onClose, onJoined, joinMutation }: any) {
  const [password, setPassword] = useState('');
  return (
    <div className="space-y-4">
      <input 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password" 
        placeholder="Access Code" 
        className="w-full bg-muted border border-border rounded-2xl py-4 px-6 text-center text-lg font-black tracking-widest focus:outline-none focus:border-indigo-500 transition-all"
      />
      <div className="flex gap-2">
        <button onClick={async () => {
          try {
            await joinMutation.mutateAsync({ roomId, password });
            onJoined?.();
          } catch (err: any) {
            alert(err?.message || 'Failed to join room');
          }
        }} className="flex-1 w-full bg-indigo-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20">
          Join Private Room
        </button>
        <button onClick={() => onClose?.()} className="flex-1 w-full bg-muted border border-border py-4 rounded-2xl font-black uppercase tracking-widest text-xs">
          Cancel
        </button>
      </div>
    </div>
  );
}
