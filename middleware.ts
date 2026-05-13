import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './lib/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Basic-auth gate on /admin/*
  if (pathname.startsWith('/admin')) {
    return adminAuthMiddleware(req);
  }
  return intlMiddleware(req);
}

function adminAuthMiddleware(req: NextRequest): NextResponse {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return new NextResponse(
      'Admin disabled — set ADMIN_PASSWORD env to enable',
      { status: 503 },
    );
  }
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Basic ')) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Ditaket Admin"' },
    });
  }
  let user = '';
  let pass = '';
  try {
    const decoded = atob(auth.slice('Basic '.length));
    const idx = decoded.indexOf(':');
    user = decoded.slice(0, idx);
    pass = decoded.slice(idx + 1);
  } catch {
    /* fall through to 401 */
  }
  if (user !== 'admin' || pass !== expected) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Ditaket Admin"' },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Locale routing for content paths (excluding static assets + api)
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Admin gate
    '/admin/:path*',
  ],
};
