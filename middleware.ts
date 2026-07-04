/** @format */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from '@/src/lib/auth/admin-session';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';

  // Support admin.nngtw.com by internally mapping requests to the `/admin` path,
  // but do NOT short-circuit auth. We prefix the pathname with `/admin` when
  // the request comes from the admin subdomain and use the adjusted `url`
  // for routing/rewrites while still executing the full authentication checks.
  const isAdminSubdomain = host.startsWith('admin.nngtw.com');
  const url = request.nextUrl.clone();
  if (isAdminSubdomain && !url.pathname.startsWith('/admin')) {
    url.pathname = '/admin' + (url.pathname === '/' ? '' : url.pathname);
  }

  const { pathname } = url;

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

    // If we're on the admin subdomain, rewrite internally so the app resolves
    // the `/admin/login` route from the app directory. Otherwise continue.
    if (isAdminSubdomain) {
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  // Any other admin page requires authentication
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Authenticated users: if request came from the admin subdomain, rewrite to
  // the internal `/admin...` path (preserving subpaths). Otherwise continue.
  if (isAdminSubdomain) {
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico).*)'],
};
