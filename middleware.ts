/** @format */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from '@/src/lib/auth/admin-session';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';

  // Support admin.nngtw.com
  if (host.startsWith('admin.nngtw.com')) {
    return NextResponse.rewrite(new URL('/admin', request.url));
  }

  const { pathname } = request.nextUrl;

  // Only protect admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  const isAuthenticated =
    !!adminPassword &&
    (await verifyAdminSessionToken(adminPassword, sessionToken));

  // Login page
  if (pathname === '/admin/login') {
    // Already logged in → go to dashboard
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    return NextResponse.next();
  }

  // Any other admin page requires authentication
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico).*)'],
};
