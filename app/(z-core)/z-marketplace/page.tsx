'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { campusService } from '@/lib/services/campusService';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, Plus, Loader2 } from 'lucide-react';

export default function MarketplacePage() {
  const [category, setCategory] = useState('All');
  const { data: items, isLoading } = useQuery({
    queryKey: ['marketplace', category],
    queryFn: () => campusService.getMarketplaceItems(undefined, category),
  });

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">MARKETPLACE</h1>
            <p className="text-foreground/40 font-medium italic">Buy and sell within your campus.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-accent transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search items..." 
                className="bg-muted border border-border rounded-2xl pl-12 pr-6 py-3 w-full md:w-64 focus:outline-none focus:border-accent transition-all text-sm"
              />
            </div>
            <button className="bg-accent text-black px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all text-xs uppercase tracking-widest">
              <Plus size={20} />
              SELL
            </button>
          </div>
        </header>

        <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Gadgets', 'Books', 'Furniture', 'Electronics', 'Clothing'].map((cat) => (
            <button 
              key={cat} 
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap px-6 py-2 rounded-full border transition-all text-xs font-black uppercase tracking-widest ${
                category === cat 
                  ? 'bg-accent text-black border-accent' 
                  : 'border-border hover:border-accent hover:text-accent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
          </div>
        ) : !items || items.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 border border-dashed border-border rounded-[3rem]">
            <p className="text-foreground/40 font-bold italic">No items found in {category}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -8 }}
                className="bg-muted border border-border rounded-[2rem] overflow-hidden flex flex-col group cursor-pointer"
              >
                <div className="aspect-square relative overflow-hidden bg-background/50">
                  {item.images && item.images[0] ? (
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground/10">
                      <ShoppingBag size={48} />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-border/50">
                    {item.condition || 'Used'}
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-[10px] text-accent font-black uppercase tracking-widest mb-1">{item.category}</div>
                  <h3 className="font-bold mb-4 line-clamp-1">{item.title}</h3>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="text-lg font-black text-foreground">
                      {item.price ? `₦${Number(item.price).toLocaleString()}` : 'Free'}
                    </div>
                    <button className="p-2 bg-background border border-border rounded-xl hover:bg-accent hover:text-black transition-all">
                      <ShoppingBag size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
