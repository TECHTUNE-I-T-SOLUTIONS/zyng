'use client';

import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { campusService } from '@/lib/services/campusService';
import { userService } from '@/lib/services/userService';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, Plus, Loader2 } from 'lucide-react';

export default function MarketplacePage() {
  const [category, setCategory] = useState('All');
  const { data: items, isLoading } = useQuery({
    queryKey: ['marketplace', category],
    queryFn: () => campusService.getMarketplaceItems(undefined, category),
  });
  const [showSellModal, setShowSellModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [itemCategory, setItemCategory] = useState('Gadgets');
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handlePick = () => fileRef.current?.click();
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setUploading(true);
      try {
        const res = await fetch('/api/uploads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: file.name, dataUrl }) });
        const json = await res.json();
        if (res.ok && json.url) setImageUrl(json.url);
        else console.error('Upload failed', json);
      } catch (err) {
        console.error(err);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSell = async () => {
    if (!title.trim() || !user?.id) return alert('Please login and provide a title');
    try {
      await campusService.createMarketplace({
        title: title.trim(),
        description: description || null,
        price: price ? Number(price) : null,
        media_url: imageUrl || null,
        images: imageUrl ? [imageUrl] : null,
        category: itemCategory || null,
        created_by: user.id,
        school_id: user.school_id || null,
      });
      setShowSellModal(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to post item');
    }
  };

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
            <button onClick={() => setShowSellModal(true)} className="bg-accent text-black px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all text-xs uppercase tracking-widest">
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

      {/* Sell Modal */}
      {showSellModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div onClick={() => setShowSellModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
          <div className="relative w-full max-w-2xl bg-background border border-border p-8 rounded-[2rem] z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">List an Item</h2>
              <button onClick={() => setShowSellModal(false)} className="p-2 bg-muted rounded-lg">Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-foreground/30">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-muted border border-border rounded-2xl p-3" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-foreground/30">Category</label>
                <input value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} className="w-full bg-muted border border-border rounded-2xl p-3" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-foreground/30">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-muted border border-border rounded-2xl p-3 h-40" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-foreground/30">Price</label>
                <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" className="w-full bg-muted border border-border rounded-2xl p-3" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-foreground/30">Image</label>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                <div className="flex items-center gap-2">
                  <button onClick={handlePick} className="px-4 py-2 bg-muted rounded-xl">Upload</button>
                  {uploading && <div className="text-sm">Uploading...</div>}
                  {imageUrl && <div className="text-sm font-bold">Uploaded</div>}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={handleSell} className="bg-accent text-black px-6 py-3 rounded-2xl font-black hover:scale-105 transition-all">
                Post Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
