/**
 * Next.js Proxy for Authentication and Authorization
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
import { getOrgByDomain } from '@/services/branding'

// Define route access rules
const ROUTE_RULES = {
  // Public routes (no auth required)
  public: ['/', '/login', '/signup', '/reset-password', '/about', '/pricing', '/contact', '/solutions', '/purpose', '/approach', '/results', '/privacy', '/terms', '/workshops', '/talent', '/apply'],

  // Auth routes (redirect to dashboard if already logged in)
  authPages: ['/login', '/signup'],

  // Protected routes by role
  admin: ['/admin'],
  instructor: ['/instructor'],
  expert: ['/expert'],

  // Routes accessible by any authenticated user
  authenticated: ['/dashboard', '/profile', '/settings', '/checkout', '/results'],
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip proxy for static files, API routes, and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/fonts') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|otf|ttf|woff|woff2|json|mp4|webm|ogg|mov)$/)
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Custom Domain Detection (Phase 5)
  // Check if request is coming from a custom domain
  const host = request.headers.get('host') || ''
  const orgId = await getOrgByDomain(host)

  if (orgId) {
    // Organization detected via custom domain
    // Inject organization ID into request headers for auto-loading
    response.headers.set('x-organization-id', orgId)
    console.log('[Proxy] Custom domain detected:', host, '-> Org ID:', orgId)
  }

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
    // Fetch all active roles for the user (multi-role support)
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

    console.log('[Proxy Roles]', {
      userRoles,
      rolesError: rolesError?.message,
      userId: user.id
    })

    // Extract active roles into array
    const activeRoles = (userRoles || []).map(r => r.role)
    const hasAdminRole = activeRoles.includes('admin')
    const hasInstructorRole = activeRoles.includes('instructor')
    const hasExpertRole = activeRoles.includes('expert')
    const hasClientRole = activeRoles.includes('client') || activeRoles.includes('user')

    console.log('[Proxy] User accessing:', pathname, '| Active roles:', activeRoles)

    // Check admin routes - allow access if user has admin role
    if (ROUTE_RULES.admin.some(route => pathname.startsWith(route))) {
      console.log('[Proxy] Admin route detected, hasAdminRole:', hasAdminRole)
      if (hasAdminRole) {
        console.log('[Proxy] Admin access granted to admin route')
        return response
      }
      // Redirect non-admin users to dashboard
      console.log('[Proxy] Non-admin user attempting to access admin route, redirecting to dashboard')
      return redirectToDashboard()
    }

    // Check instructor routes - allow access if user has instructor or admin role
    if (ROUTE_RULES.instructor.some(route => pathname.startsWith(route))) {
      console.log('[Proxy] Instructor route detected, hasInstructorRole:', hasInstructorRole, 'hasAdminRole:', hasAdminRole)
      if (hasInstructorRole || hasAdminRole) {
        console.log('[Proxy] Instructor/Admin access granted to instructor route')
        return response
      }
      // Redirect non-instructor users to dashboard
      console.log('[Proxy] Non-instructor user attempting to access instructor route, redirecting to dashboard')
      return redirectToDashboard()
    }

    // Check expert routes - allow access if user has expert or admin role
    if (ROUTE_RULES.expert.some(route => pathname.startsWith(route))) {
      console.log('[Proxy] Expert route detected, hasExpertRole:', hasExpertRole, 'hasAdminRole:', hasAdminRole)
      if (hasExpertRole || hasAdminRole) {
        console.log('[Proxy] Expert/Admin access granted to expert route')
        return response
      }
      // Redirect non-expert users to dashboard
      console.log('[Proxy] Non-expert user attempting to access expert route, redirecting to dashboard')
      return redirectToDashboard()
    }

    // Allow any authenticated user to access dashboard routes and other authenticated routes
    if (pathname.startsWith('/dashboard') || ROUTE_RULES.authenticated.some(route => pathname === route || pathname.startsWith(route + '/'))) {
      console.log('[Proxy] Allowing authenticated user to access route:', pathname)
      return response
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
    '/((?!api|_next/static|_next/image|favicon.ico|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|otf|ttf|woff|woff2|json|mp4|webm|ogg|mov)$).*)',
  ],
}
