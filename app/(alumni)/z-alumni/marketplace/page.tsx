'use client';

import { useQuery } from '@tanstack/react-query';
import { campusService } from '@/lib/services/campusService';
import { Loader2, ShoppingBag } from 'lucide-react';

export default function AlumniMarketplacePage() {
  const { data: items, isLoading } = useQuery({
    queryKey: ['alumni-marketplace'],
    queryFn: () => campusService.getMarketplaceItems(),
  });

  return (
    <div className="space-y-8 text-white">
      <header>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic">Marketplace</h1>
        <p className="text-white/40 text-sm italic">Alumni listings, services, and campus commerce.</p>
      </header>
      {isLoading ? <Loader2 className="animate-spin text-indigo-400" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items?.map((item: any) => (
            <div key={item.id} className="bg-white/5 border border-white/5 rounded-[2rem] p-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4"><ShoppingBag size={24} /></div>
              <h3 className="font-black text-xl mb-1">{item.title || item.name}</h3>
              <p className="text-white/40 text-sm">{item.description || 'Available through the alumni network.'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
