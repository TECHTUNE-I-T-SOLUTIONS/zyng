'use client';

import { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { campusService } from '@/lib/services/campusService';
import { userService } from '@/lib/services/userService';
import { zingService } from '@/lib/services/zingService';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, Plus, Loader2, X, Image as ImageIcon, MessageCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/utils';

const CATEGORIES = ['All', 'Gadgets', 'Books', 'Furniture', 'Electronics', 'Clothing', 'Services', 'Vehicles'];
const ITEM_CATEGORIES = CATEGORIES.filter(c => c !== 'All');

export default function MarketplacePage() {
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: items, isLoading } = useQuery({
    queryKey: ['marketplace', category],
    queryFn: () => campusService.getMarketplaceItems(undefined, category),
  });

  // Client-side search filter
  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (!searchQuery.trim()) return items;
    const lowerQuery = searchQuery.toLowerCase();
    return items.filter((item: any) => 
      item.title?.toLowerCase().includes(lowerQuery) || 
      item.description?.toLowerCase().includes(lowerQuery)
    );
  }, [items, searchQuery]);

  const [showSellModal, setShowSellModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [itemCategory, setItemCategory] = useState(ITEM_CATEGORIES[0]);
  
  // Multi-image upload
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);
  
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    // Check total size (2MB max)
    const MAX_SIZE = 2 * 1024 * 1024;
    const currentSize = selectedImages.reduce((acc, file) => acc + file.size, 0);
    const newFilesSize = files.reduce((acc, file) => acc + file.size, 0);
    
    if (currentSize + newFilesSize > MAX_SIZE) {
      setErrorMsg('Total image size cannot exceed 2MB');
      return;
    }
    setErrorMsg('');

    const newSelected = [...selectedImages, ...files];
    setSelectedImages(newSelected);
    setImagePreviews(newSelected.map(file => URL.createObjectURL(file)));
  };

  const removeImage = (index: number) => {
    const newSelected = [...selectedImages];
    newSelected.splice(index, 1);
    setSelectedImages(newSelected);
    setImagePreviews(newSelected.map(file => URL.createObjectURL(file)));
  };

  const handleSell = async () => {
    if (!title.trim() || !user?.id) return;
    setUploading(true);
    setErrorMsg('');
    try {
      const imageUrls: string[] = [];
      for (const file of selectedImages) {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        const res = await fetch('/api/uploads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, dataUrl }),
        });
        const json = await res.json();
        if (res.ok && json.url) imageUrls.push(json.url);
      }

      await campusService.createMarketplace({
        title: title.trim(),
        description: description || null,
        price: price ? Number(price) : null,
        media_url: imageUrls.length > 0 ? imageUrls[0] : null,
        images: imageUrls.length > 0 ? imageUrls : null,
        category: itemCategory || null,
        created_by: user.id,
        school_id: user.school_id || null,
      });
      setShowSellModal(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to post item');
    } finally {
      setUploading(false);
    }
  };

  const contactSeller = async (sellerId: string, itemTitle: string) => {
    if (!user) return alert("Please login to contact seller.");
    if (user.id === sellerId) return alert("This is your own item.");
    try {
      const chat = await zingService.sendZingRequest(sellerId, `Hi, is "${itemTitle}" still available?`);
      router.push(`/z-messages?userId=${sellerId}&chatId=${chat.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to start conversation.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">MARKETPLACE</h1>
            <p className="text-foreground/40 font-medium italic">Buy and sell within your campus.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-accent transition-colors" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
          {CATEGORIES.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap px-6 py-2 rounded-full border transition-all text-xs font-black uppercase tracking-widest ${
                category === cat 
                  ? 'bg-accent text-black border-accent shadow-md shadow-accent/20' 
                  : 'border-border hover:border-accent hover:text-accent bg-muted/50'
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
        ) : !filteredItems || filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 border border-dashed border-border rounded-[3rem]">
            <p className="text-foreground/40 font-bold italic">No items found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredItems.map((item: any, i: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-muted/30 border border-border rounded-2xl overflow-hidden flex flex-col group hover:shadow-xl hover:border-accent/40 transition-all"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                  {item.images && item.images[0] ? (
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground/10">
                      <ShoppingBag size={40} />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-md text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider text-accent shadow-sm">
                    {item.category}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-sm mb-1 line-clamp-2 leading-tight">{item.title}</h3>
                  <div className="text-lg font-black text-foreground mb-4">
                    {item.price ? `₦${Number(item.price).toLocaleString()}` : 'Contact for price'}
                  </div>
                  
                  <div className="mt-auto flex flex-col gap-2">
                    <button 
                      onClick={() => contactSeller(item.created_by, item.title)}
                      className="w-full py-2 bg-foreground text-background rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-accent hover:text-black transition-all"
                    >
                      <MessageCircle size={14} /> Contact Seller
                    </button>
                    <Link 
                      href={`/z-marketplace/${slugify(`${item.title}-${item.id}`)}`}
                      className="w-full py-2 bg-transparent border border-border rounded-xl text-xs font-black text-center uppercase flex items-center justify-center gap-2 hover:bg-muted transition-all text-foreground/70"
                    >
                      <Eye size={14} /> View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Sell Modal */}
      {showSellModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowSellModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm overflow-y-auto"></div>
          <div className="relative w-full max-w-2xl bg-background border border-border p-6 md:p-8 rounded-[2rem] z-10 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black uppercase tracking-tighter">List an Item</h2>
              <button title="Close modal" aria-label="Close modal" onClick={() => setShowSellModal(false)} className="p-2 bg-muted rounded-xl hover:bg-muted/80"><X size={20}/></button>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold rounded-xl">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">Images (Max 2MB total)</label>
                 <div className="bg-muted border border-border border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition" onClick={() => fileRef.current?.click()}>
                   <ImageIcon size={32} className="text-foreground/20 mb-2" />
                   <span className="text-sm font-bold">Click to add images</span>
                </div>
                 <input ref={fileRef} title="Upload item images" aria-label="Upload item images" type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                
                {imagePreviews.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-4">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group">
                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          title="Remove image"
                          aria-label="Remove image"
                          onClick={(e) => { e.stopPropagation(); removeImage(i); }} 
                          className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">Title</label>
                <input title="Item title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-muted border border-border rounded-2xl p-3 focus:border-accent outline-none" placeholder="Enter item title" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">Category</label>
                <select title="Item category" value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} className="w-full bg-muted border border-border rounded-2xl p-3 focus:border-accent outline-none appearance-none">
                  {ITEM_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">Price (₦)</label>
                <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" className="w-full bg-muted border border-border rounded-2xl p-3 focus:border-accent outline-none" placeholder="Leave blank if free" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">Description</label>
                <textarea title="Item description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-muted border border-border rounded-2xl p-3 h-32 focus:border-accent outline-none" placeholder="Describe the item" />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button disabled={uploading} onClick={handleSell} className="bg-accent text-black px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100">
                {uploading ? <><Loader2 size={18} className="animate-spin" /> POSTING...</> : 'POST ITEM'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
