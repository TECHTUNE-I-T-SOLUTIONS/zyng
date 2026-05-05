import { NextResponse } from 'next/server';
import { zingServiceServer } from '@/lib/services/zingService.server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomId, password } = body;
    if (!roomId) return NextResponse.json({ error: 'roomId required' }, { status: 400 });

    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value || null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || '');
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.sub as string;

    const member = await zingServiceServer.joinRoom({ roomId, userId, password });
    return NextResponse.json({ member });
  } catch (err: any) {
    const status = err?.status || 500;
    return NextResponse.json({ error: err?.message || 'Server error' }, { status });
  }
}
