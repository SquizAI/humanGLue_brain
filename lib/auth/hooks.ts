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

    // Get initial session by decoding cookie directly
    const initAuth = async () => {
      console.log('[useAuth] initAuth called')
      try {
        // Try to get user from cookie directly first
        let userId: string | null = null
        let userEmail: string | null = null

        if (typeof window !== 'undefined') {
          const match = document.cookie.match(/sb-egqqdscvxvtwcdwknbnt-auth-token=base64-([^;]+)/)
          if (match) {
            try {
              const decoded = JSON.parse(atob(match[1]))
              userId = decoded.user?.id
              userEmail = decoded.user?.email
              console.log('[useAuth] Decoded user from cookie:', userId)
            } catch (e) {
              console.error('[useAuth] Failed to decode cookie:', e)
            }
          }
        }

        if (userId) {
          // Fetch profile using direct API call
          const decoded = JSON.parse(atob(document.cookie.match(/sb-egqqdscvxvtwcdwknbnt-auth-token=base64-([^;]+)/)![1]))
          const accessToken = decoded.access_token
          const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL!

          const profileRes = await fetch(
            `${url}/rest/v1/profiles?id=eq.${userId}&select=*`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'apikey': apiKey,
              },
            }
          )
          const profiles = await profileRes.json()
          const profile = profiles[0]

          console.log('[useAuth] Profile:', profile)

          if (!profile) throw new Error('Profile not found')

          // Check if user has instructor profile
          const instructorRes = await fetch(
            `${url}/rest/v1/instructor_profiles?user_id=eq.${userId}&select=id`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'apikey': apiKey,
              },
            }
          )
          const instructorProfiles = await instructorRes.json()
          const instructorProfile = instructorProfiles[0]

          const userProfile: UserProfile = {
            ...profile,
            is_instructor: !!instructorProfile,
          }

          setState({
            user: { id: userId, email: userEmail } as User,
            profile: userProfile,
            session: null,
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
        console.error('[useAuth] Error:', error)
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
            .from('profiles')
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
            ...(profile as UserProfile),
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
