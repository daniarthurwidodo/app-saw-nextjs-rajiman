import { NextRequest } from 'next/server';
import { logRequest } from '@/lib/logger-middleware';

// This middleware will log all requests
export function middleware(request: NextRequest) {
  logRequest(request);
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
