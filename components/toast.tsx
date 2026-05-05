"use client";

import React, { createContext, useCallback, useContext, useId, useState } from 'react';

type Toast = { id: string; message: string; type?: 'info' | 'success' | 'error' };

const ToastContext = createContext<{ push: (t: Toast) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Toast) => {
    setToasts((s) => [...s, t]);
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== t.id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed right-4 bottom-6 z-[9999] flex flex-col gap-3">
        {toasts.map((t) => (
          <div key={t.id} className={`px-4 py-2 rounded-lg shadow-lg text-white ${t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-green-600' : 'bg-gray-800'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  const id = useId();
  return {
    show: (message: string, type: Toast['type'] = 'info') => ctx.push({ id: `${id}-${Date.now()}`, message, type }),
  };
}

export default ToastProvider;
