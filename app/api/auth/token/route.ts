import { SignJWT } from 'jose';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId, role } = await request.json();
    
    // Supabase JWT Secret from env
    const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET);
    
    // Sign the custom JWT to enable RLS
    const token = await new SignJWT({ 
      sub: userId,
      role: role || 'authenticated'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(secret);

    const response = NextResponse.json({ success: true });
    
    // Set cookie for middleware and browser
    response.cookies.set('sb-access-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2 // 2 hours
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Token signing failed' }, { status: 500 });
  }
}
