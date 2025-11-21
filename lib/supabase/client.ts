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

  return client
}
