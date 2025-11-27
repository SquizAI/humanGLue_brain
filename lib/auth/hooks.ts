/**
 * Client-side Authentication Hooks
 * For use in Client Components
 */

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: 'admin' | 'org_admin' | 'team_lead' | 'member'
  organization_id?: string
  is_instructor: boolean
  created_at: string
}

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  error: Error | null
}

/**
 * Main authentication hook
 * Returns current user, session, profile, loading state, and error
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    console.log('[useAuth] Starting auth initialization')
    const supabase = createClient()
    let mounted = true

    // Set a maximum timeout for auth loading
    // If auth doesn't load within 5 seconds, assume no session and stop loading
    const maxLoadTimeout = setTimeout(() => {
      console.log('[useAuth] Max load timeout reached - stopping loading state')
      if (mounted) {
        setState(prev => ({ ...prev, loading: false }))
      }
    }, 5000)

    const getProfile = async (userId: string) => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (profileError) throw profileError

        const { data: instructorProfile } = await supabase
          .from('instructor_profiles')
          .select('id')
          .eq('user_id', userId)
          .single()

        return {
          ...(profile as UserProfile),
          is_instructor: !!instructorProfile,
        }
      } catch (error) {
        console.error('[useAuth] Error fetching profile:', error)
        return null
      }
    }

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) throw error

        if (session?.user && mounted) {
          const profile = await getProfile(session.user.id)

          if (mounted) {
            clearTimeout(maxLoadTimeout)
            setState({
              user: session.user,
              profile,
              session,
              loading: false,
              error: null,
            })
          }
        } else if (mounted) {
          clearTimeout(maxLoadTimeout)
          setState(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        console.error('[useAuth] Session init error:', error)
        if (mounted) {
          clearTimeout(maxLoadTimeout)
          setState(prev => ({
            ...prev,
            loading: false,
            error: error as Error
          }))
        }
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[useAuth] Auth state changed:', _event, session?.user?.id)

      if (session?.user && mounted) {
        // Only fetch profile if we don't have it or if the user changed
        setState(prev => ({ ...prev, loading: true }))
        const profile = await getProfile(session.user.id)

        if (mounted) {
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            error: null,
          })
        }
      } else if (mounted) {
        setState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          error: null,
        })
      }
    })

    return () => {
      mounted = false
      clearTimeout(maxLoadTimeout)
      subscription.unsubscribe()
    }
  }, [])

  return state
}

/**
 * Hook for getting current user only
 */
export function useUser() {
  const { user, profile, loading, error } = useAuth()
  return { user, profile, loading, error }
}

/**
 * Hook for getting current session only
 */
export function useSession() {
  const { session, loading, error } = useAuth()
  return { session, loading, error }
}

/**
 * Hook for role-based access control
 * Maps database roles to application roles
 */
export function useRole() {
  const { profile, loading, error } = useAuth()

  const isAdmin = profile?.role === 'admin'
  const isOrgAdmin = profile?.role === 'org_admin'
  const isInstructor = profile?.is_instructor === true
  const isClient = !isAdmin && !isOrgAdmin && !isInstructor

  // Application role (simplified)
  let role: 'admin' | 'instructor' | 'client' | null = null
  if (profile) {
    if (isAdmin) role = 'admin'
    else if (isInstructor) role = 'instructor'
    else role = 'client'
  }

  return {
    role,
    isAdmin,
    isOrgAdmin,
    isInstructor,
    isClient,
    loading,
    error,
  }
}

/**
 * Sign out helper
 */
export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
