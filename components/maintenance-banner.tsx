'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { maintenanceService } from '@/lib/services/maintenanceService';

export function MaintenanceBanner() {
  const { data } = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => maintenanceService.getCurrent(),
  });

  if (!data?.is_enabled) return null;

  return (
    <motion.div
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 w-full border-b border-amber-500/20 bg-amber-500/10 text-amber-100 backdrop-blur-md pointer-events-none"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 text-[11px] leading-4 sm:text-sm sm:py-3">
        <AlertTriangle size={14} className="shrink-0 text-amber-200" />
        <div className="min-w-0">
          <div className="font-black uppercase tracking-widest text-[9px] sm:text-[10px]">{data.title}</div>
          <div className="truncate text-amber-100/80">{data.message}</div>
        </div>
      </div>
    </motion.div>
  );
}
