/**
 * Next.js Middleware for Authentication and Authorization
 *
 * Security Features:
 * - Session refresh and validation
 * - Role-based access control (RBAC)
 * - Secure cookie management
 * - Automatic redirects for unauthorized access
 * - Auth callback handling
 *
 * Note: RLS policies must be enabled on profiles table
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Define route access rules
const ROUTE_RULES = {
  // Public routes (no auth required)
  public: ['/', '/login', '/signup', '/reset-password', '/about', '/pricing', '/contact', '/solutions', '/purpose', '/results'],

  // Auth routes (redirect to dashboard if already logged in)
  authPages: ['/login', '/signup'],

  // Protected routes by role
  admin: ['/admin'],
  instructor: ['/instructor'],
  client: ['/client'],

  // Routes accessible by any authenticated user
  authenticated: ['/dashboard', '/profile', '/settings'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files, API routes, and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/fonts') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|otf|ttf|woff|woff2|json)$/)
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Get user session and refresh if needed
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Helper function to redirect with return URL
  const redirectToLogin = () => {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  const redirectToDashboard = () => {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Check if route is public
  const isPublicRoute = ROUTE_RULES.public.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  // Handle auth callback routes (allow through)
  if (pathname.startsWith('/auth/callback') || pathname.startsWith('/update-password')) {
    return response
  }

  // If no user and route is not public, redirect to login
  if (!user && !isPublicRoute) {
    return redirectToLogin()
  }

  // If user is logged in and trying to access auth pages, redirect to dashboard
  if (user && ROUTE_RULES.authPages.includes(pathname)) {
    return redirectToDashboard()
  }

  // If user exists and route requires role check
  if (user) {
    // Use the existing supabase client which already has auth context from cookies
    // Fetch user roles from user_roles junction table (RLS policies allow authenticated users to read their own roles)
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    console.log('[Middleware Roles]', {
      userRoles,
      rolesError: rolesError?.message,
      userId: user.id
    })

    // Extract role names from the array of role records
    const roles = userRoles?.map(r => r.role) || []

    // Determine application role (priority: admin > instructor > client)
    let appRole: 'admin' | 'instructor' | 'client' = 'client'
    if (roles.includes('admin')) {
      appRole = 'admin'
    } else if (roles.includes('instructor')) {
      appRole = 'instructor'
    } else if (roles.includes('expert')) {
      appRole = 'instructor' // Treat expert as instructor for dashboard purposes
    }
    // else defaults to 'client'

    console.log('[Middleware] User accessing:', pathname, '| User roles:', roles, '| App role:', appRole)

    // Check admin routes
    if (ROUTE_RULES.admin.some(route => pathname.startsWith(route))) {
      console.log('[Middleware] Admin route detected, user role:', appRole)
      if (appRole !== 'admin') {
        console.log('[Middleware] Redirecting non-admin user to /dashboard')
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      console.log('[Middleware] Admin user allowed to proceed')
    }

    // Check instructor routes
    if (ROUTE_RULES.instructor.some(route => pathname.startsWith(route))) {
      if (appRole !== 'instructor' && appRole !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Check client routes
    if (ROUTE_RULES.client.some(route => pathname.startsWith(route))) {
      if (appRole !== 'client' && appRole !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     * - fonts
     * - static assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|otf|ttf|woff|woff2|json)$).*)',
  ],
}
