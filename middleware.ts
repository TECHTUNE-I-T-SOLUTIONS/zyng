import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Example token-based check (in reality, you'd use supabase auth)
  const token = request.cookies.get('sb-access-token');
  const userStatus = request.cookies.get('user-status')?.value; // 'regular' or 'alumni'
  const isAdmin = request.cookies.get('is-admin')?.value === 'true';

  // 1. Protect Admin Routes
  if (pathname.startsWith('/z-manage') && !pathname.startsWith('/z-manage-auth')) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/z-manage-auth/login', request.url));
    }
  }

  // 2. Protect Alumni vs Regular Routes
  if (token) {
    if (userStatus === 'alumni') {
      // Alumnis cannot access regular z-core
      if (pathname.startsWith('/z-feed') || pathname.startsWith('/z-rooms') || pathname.startsWith('/z-events')) {
        return NextResponse.redirect(new URL('/z-alumni/dashboard', request.url));
      }
    } else if (userStatus === 'regular') {
      // Regular users cannot access alumni core
      if (pathname.startsWith('/z-alumni')) {
        return NextResponse.redirect(new URL('/z-feed', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/z-feed/:path*',
    '/z-rooms/:path*',
    '/z-events/:path*',
    '/z-alumni/:path*',
    '/z-manage/:path*',
  ],
};
