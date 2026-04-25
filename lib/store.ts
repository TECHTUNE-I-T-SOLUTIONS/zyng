'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Persona {
  id: string;
  display_name: string;
  avatar_url: string;
  reputation_score: number;
}

interface ZyngState {
  user: any | null;
  activePersona: Persona | null;
  campusId: string | null;
  setUser: (user: any) => void;
  setActivePersona: (persona: Persona | null) => void;
  setCampus: (campusId: string) => void;
  logout: () => void;
}

export const useZyngStore = create<ZyngState>()(
  persist(
    (set) => ({
      user: null,
      activePersona: null,
      campusId: 'unilorin', // Default for MVP
      setUser: (user) => set({ user }),
      setActivePersona: (persona) => set({ activePersona: persona }),
      setCampus: (campusId) => set({ campusId }),
      logout: () => set({ user: null, activePersona: null }),
    }),
    {
      name: 'zyng-storage',
    }
  )
);
