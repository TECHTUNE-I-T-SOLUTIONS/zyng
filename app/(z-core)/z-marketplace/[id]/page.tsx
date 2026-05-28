'use client';

import { useQuery } from '@tanstack/react-query';
import { use, useState } from 'react';
import { supabase } from '@/lib/db/supabase';
import { userService } from '@/lib/services/userService';
import { zingService } from '@/lib/services/zingService';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, Loader2, MessageCircle, Share2, X } from 'lucide-react';
import Link from 'next/link';
import { extractIdFromSlug } from '@/lib/utils';

export default function MarketplaceItemPage({ params }: { params: Promise<{ id?: string }> }) {
  const router = useRouter();
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => userService.getCurrentUser() });
  const resolvedParams = use(params);
  const itemId = extractIdFromSlug(resolvedParams?.id);
  const [modal, setModal] = useState<{ title: string; message: string } | null>(null);

  const { data: item, isLoading } = useQuery({
    queryKey: ['marketplace-item', itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zing_marketplace')
        .select('*')
        .eq('id', itemId)
        .single();
      if (error) throw error;
      return data;
    }
  });

  const { data: posterPersona } = useQuery({
    queryKey: ['marketplace-poster-persona', item?.created_by],
    enabled: !!item?.created_by,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personas')
        .select('name, avatar_url, is_active, created_at')
        .eq('user_id', item.created_by)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh] bg-background">
      <Loader2 className="w-10 h-10 text-accent animate-spin" />
    </div>
  );

  if (!item) return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] bg-background p-6 text-center">
      <ShoppingBag size={48} className="text-foreground/20 mb-4" />
      <h2 className="text-2xl font-black uppercase mb-2">Item Not Found</h2>
      <p className="text-foreground/50 mb-6">This item might have been sold or removed.</p>
      <Link href="/z-marketplace" className="bg-accent text-black px-6 py-3 rounded-2xl font-black hover:scale-105 transition-all uppercase tracking-widest text-xs">
        Back to Marketplace
      </Link>
    </div>
  );

  const contactSeller = async () => {
    if (!user) {
      setModal({ title: 'Login Required', message: 'Please login to contact the seller.' });
      return;
    }
    if (user.id === item.created_by) {
      setModal({ title: 'Your Own Item', message: 'You cannot contact yourself for this listing.' });
      return;
    }
    try {
      const chat = await zingService.sendZingRequest(item.created_by, `Hi, is "${item.title}" still available?`);
      router.push(`/z-messages?userId=${item.created_by}&chatId=${chat.id}`);
    } catch (err) {
      console.error(err);
      setModal({ title: 'Conversation Error', message: 'Failed to start conversation. Please try again.' });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `Check out ${item.title} on Zyng Marketplace`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setModal({ title: 'Link Copied', message: 'The marketplace link has been copied to your clipboard.' });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 bg-muted rounded-xl hover:bg-muted/80 transition flex items-center gap-2 text-sm font-bold">
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={handleShare} className="p-2 bg-muted rounded-xl hover:bg-muted/80 transition flex items-center gap-2 text-sm font-bold">
          <Share2 size={16} /> Share
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-6 lg:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          
          {/* Images Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-[2rem] overflow-hidden border border-border">
              {item.images && item.images.length > 0 ? (
                <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-foreground/10">
                  <ShoppingBag size={80} />
                </div>
              )}
            </div>
            {item.images && item.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {item.images.slice(1).map((img: string, i: number) => (
                  <div key={i} className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-muted border border-border">
                    <img src={img} alt={`Preview ${i+1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="text-[10px] text-accent font-black uppercase tracking-widest mb-3 bg-accent/10 w-fit px-3 py-1 rounded-lg">
              {item.category || 'General'}
            </div>
            <h1 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight">{item.title}</h1>
            <div className="text-4xl font-black text-foreground mb-8">
              {item.price ? `₦${Number(item.price).toLocaleString()}` : 'Contact for price'}
            </div>

            <div className="prose prose-invert max-w-none mb-10 text-foreground/80">
              <p className="whitespace-pre-wrap">{item.description || 'No description provided.'}</p>
            </div>

            <div className="mt-auto space-y-6">
              <div className="p-6 bg-muted/30 border border-border rounded-2xl flex items-center gap-4">
                <img
                  src={posterPersona?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${posterPersona?.name || 'seller'}`}
                  alt={posterPersona?.name || 'Seller avatar'}
                  className="w-12 h-12 rounded-full object-cover border border-border bg-background"
                />
                <div>
                  <div className="text-xs uppercase tracking-widest text-foreground/40 font-black mb-1">Listed By</div>
                  <div className="font-bold text-lg">{posterPersona?.name || 'Anonymous Zynger'}</div>
                </div>
              </div>

              <button 
                onClick={contactSeller}
                className="w-full py-5 bg-foreground text-background rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-accent hover:text-black hover:scale-[1.02] transition-all shadow-xl"
              >
                <MessageCircle size={20} /> Contact Seller via Zyng
              </button>
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <button
            aria-label="Close modal overlay"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setModal(null)}
          />
          <div className="relative w-full max-w-md rounded-[2rem] border border-border bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-black uppercase tracking-tight">{modal.title}</h2>
              <button
                type="button"
                aria-label="Close modal"
                title="Close modal"
                onClick={() => setModal(null)}
                className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-foreground/60 leading-relaxed">{modal.message}</p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="px-5 py-3 rounded-2xl bg-accent text-black font-black uppercase tracking-widest text-xs"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
