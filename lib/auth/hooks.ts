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
    const supabase = createClient()

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) throw sessionError

        if (session?.user) {
          // Fetch user profile from database
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError) throw profileError

          // Check if user has instructor profile
          const { data: instructorProfile } = await supabase
            .from('instructor_profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .single()

          const userProfile: UserProfile = {
            ...profile,
            is_instructor: !!instructorProfile,
          }

          setState({
            user: session.user,
            profile: userProfile,
            session,
            loading: false,
            error: null,
          })
        } else {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null,
          })
        }
      } catch (error) {
        setState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          error: error as Error,
        })
      }
    }

    initAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError) throw profileError

          const { data: instructorProfile } = await supabase
            .from('instructor_profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .single()

          const userProfile: UserProfile = {
            ...profile,
            is_instructor: !!instructorProfile,
          }

          setState({
            user: session.user,
            profile: userProfile,
            session,
            loading: false,
            error: null,
          })
        } catch (error) {
          setState({
            user: session.user,
            profile: null,
            session,
            loading: false,
            error: error as Error,
          })
        }
      } else {
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
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
