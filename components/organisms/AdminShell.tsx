'use client'

import { useState, useEffect, ReactNode } from 'react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { LoadingSpinner, PageSkeleton } from '@/components/atoms/LoadingSpinner'
import { useChat } from '@/lib/contexts/ChatContext'
import { signOut } from '@/lib/auth/hooks'

interface AdminShellProps {
  children: ReactNode
  loading?: boolean
  title?: string
  description?: string
}

export function AdminShell({ children, loading = false, title, description }: AdminShellProps) {
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (!authLoading && userData?.isAdmin) {
      setShowContent(true)
      return
    }
    // Trust middleware after timeout
    const timeout = setTimeout(() => {
      setShowContent(true)
    }, 1500)
    return () => clearTimeout(timeout)
  }, [authLoading, userData])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      await signOut()
      localStorage.removeItem('humanglue_user')
      localStorage.removeItem('demoUser')
      document.cookie = 'demoUser=; path=/; max-age=0'
      localStorage.removeItem('sb-egqqdscvxvtwcdwknbnt-auth-token')
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/login'
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {!showContent ? (
          // Auth loading - show skeleton with sidebar visible
          <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner variant="neural" size="xl" text="Authenticating..." />
          </div>
        ) : loading ? (
          // Content loading - show skeleton
          <PageSkeleton />
        ) : (
          // Content ready
          children
        )}
      </div>
    </div>
  )
}

// Export a simpler content-only loader for use inside pages
export function AdminContentLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <LoadingSpinner variant="neural" size="lg" text={text} />
    </div>
  )
}
