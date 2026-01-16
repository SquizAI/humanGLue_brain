import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js Middleware
 *
 * This middleware runs on the edge before requests reach pages/API routes.
 * We explicitly exclude certain paths from middleware processing.
 */
export function middleware(request: NextRequest) {
  // Get the pathname
  const { pathname } = request.nextUrl

  // Skip middleware for Netlify functions - they handle their own auth
  if (pathname.startsWith('/.netlify/functions')) {
    return NextResponse.next()
  }

  // Skip middleware for static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname.includes('.') // files with extensions
  ) {
    return NextResponse.next()
  }

  // For all other routes, continue normally
  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - Netlify functions (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$|\\.netlify/functions).*)',
  ],
}
