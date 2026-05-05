import { SignJWT, jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/sb-refresh-token=([^;\s]+)/);
    if (!match) return NextResponse.json({ error: 'No refresh token' }, { status: 401 });

    const refresh = decodeURIComponent(match[1]);
    const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || '');

    try {
      const { payload } = await jwtVerify(refresh, secret);
      const userId = payload.sub as string;
      if (!userId) return NextResponse.json({ error: 'Invalid refresh' }, { status: 401 });

      // issue new access token
      const accessToken = await new SignJWT({ sub: userId, role: (payload as any).role || 'authenticated' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(secret);

      // rotate refresh token (optional): issue a new refresh token
      const newRefresh = await new SignJWT({ sub: userId, type: 'refresh' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30d')
        .sign(secret);

      const response = NextResponse.json({ success: true });

      response.cookies.set('sb-access-token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 2 // 2 hours
      });

      response.cookies.set('sb-refresh-token', newRefresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });

      return response;
    } catch (err) {
      return NextResponse.json({ error: 'Refresh verification failed' }, { status: 401 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Refresh failed' }, { status: 500 });
  }
}
