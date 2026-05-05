import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 });
    }

    const sb = createClient(supabaseUrl, serviceKey);

    // Try reading from the view first
    const { data, error } = await sb
      .from('trending_hashtags')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (!error && Array.isArray(data)) {
      return NextResponse.json(data);
    }

    // Fallback to RPC
    const { data: rpcData, error: rpcError } = await sb.rpc('get_trending_hashtags', { p_limit: limit });
    if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });
    return NextResponse.json(rpcData || []);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
