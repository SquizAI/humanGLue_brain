'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExpertDashboard } from '@/components/portal/ExpertDashboard'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'

export default function ExpertPage() {
  const router = useRouter()
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // If auth loads quickly and user is authenticated, show content
    if (!authLoading && userData?.authenticated) {
      setShowContent(true)
      return
    }

    // If auth is still loading after 3 seconds, trust middleware and show content anyway
    const timeout = setTimeout(() => {
      console.log('[ExpertPage] Auth timeout - trusting middleware protection')
      setShowContent(true)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [authLoading, userData])

  useEffect(() => {
    if (!authLoading && userData && !userData.authenticated) {
      router.push('/login')
    }
  }, [userData, router, authLoading])

  if (!showContent) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  const handleLogout = async () => {
    try {
      // Call API logout endpoint to clear server-side session
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      // Clear any localStorage items
      localStorage.removeItem('humanglue_user')
      localStorage.removeItem('demoUser')

      // Clear demo user cookie
      document.cookie = 'demoUser=; path=/; max-age=0'

      // Clear Supabase auth token from localStorage
      localStorage.removeItem('sb-egqqdscvxvtwcdwknbnt-auth-token')

      // Redirect to login and force a full refresh
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      // Even if there's an error, redirect to login
      window.location.href = '/login'
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all">
        <ExpertDashboard />
      </div>
    </div>
  )
}
