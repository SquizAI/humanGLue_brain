/**
 * Supabase Browser Client
 * For use in Client Components
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

let client: ReturnType<typeof createSupabaseClient> | null = null

// Custom storage that reads from cookies (set by server) but writes to localStorage
const cookieStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null

    // Try localStorage first
    const localValue = localStorage.getItem(key)
    if (localValue) return localValue

    // Fall back to reading from cookie
    const cookieName = key.replace('sb-', 'sb-').replace('-auth-token', '-auth-token')
    const match = document.cookie.match(new RegExp(`${cookieName}=base64-([^;]+)`))
    if (match) {
      try {
        const decoded = atob(match[1])
        // Store in localStorage for future reads
        localStorage.setItem(key, decoded)
        return decoded
      } catch (e) {
        console.error('Failed to decode cookie:', e)
      }
    }
    return null
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value)
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key)
    }
  },
}

export function createClient() {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  client = createSupabaseClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: cookieStorage,
      storageKey: `sb-egqqdscvxvtwcdwknbnt-auth-token`,
    },
  })

  // Handle refresh token errors by clearing the session
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED') {
      console.log('[Supabase] Token refreshed successfully')
    } else if (event === 'SIGNED_OUT') {
      console.log('[Supabase] User signed out')
      // Clear localStorage on sign out
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb-egqqdscvxvtwcdwknbnt-auth-token')
      }
    }
  })

  // Add global error handler for auth errors
  const originalSignInWithPassword = client.auth.signInWithPassword.bind(client.auth)
  client.auth.signInWithPassword = async (credentials: any) => {
    try {
      return await originalSignInWithPassword(credentials)
    } catch (error: any) {
      // If refresh token error, clear the session
      if (error?.message?.includes('refresh') || error?.message?.includes('Invalid Refresh Token')) {
        console.warn('[Supabase] Clearing invalid session')
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sb-egqqdscvxvtwcdwknbnt-auth-token')
        }
        await client?.auth.signOut()
      }
      throw error
    }
  }

  return client
}
