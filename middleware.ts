/** @format */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from '@/src/lib/auth/admin-session';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';

  if (host.startsWith('admin.nngtw.com')) {
    return NextResponse.rewrite(new URL('/admin', request.url));
  }

  const { pathname } = request.nextUrl;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isAuthenticated =
    adminPassword &&
    (await verifyAdminSessionToken(adminPassword, sessionToken));

  if (pathname === '/admin/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico).*)'],
};
