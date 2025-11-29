'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { BrandingSettings } from '@/components/admin/BrandingSettings'
import { BrandingProvider } from '@/lib/contexts/BrandingContext'
import { useChat } from '@/lib/contexts/ChatContext'

export default function OrganizationBrandingPage() {
  const router = useRouter()
  const params = useParams()
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)
  const organizationId = params.id as string

  // Check admin access with timeout pattern
  useEffect(() => {
    if (!authLoading && userData?.isAdmin) {
      setShowContent(true)
      return
    }

    const timeout = setTimeout(() => {
      console.log('[OrganizationBranding] Auth timeout - trusting middleware protection')
      setShowContent(true)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [authLoading, userData])

  if (!showContent) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  return (
    <BrandingProvider>
      <div className="min-h-screen bg-gray-950">
        <DashboardSidebar onLogout={handleLogout} />

        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
          <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
            <div className="px-8 py-6">
              <Link
                href="/admin/organizations"
                className="text-gray-400 hover:text-white transition-colors mb-2 inline-block"
              >
                <span className="font-diatype">← Back to Organizations</span>
              </Link>
              <h1 className="text-3xl font-bold text-white mb-2 font-gendy">
                Organization Branding
              </h1>
              <p className="text-gray-400 font-diatype">
                Configure white-label branding for this organization
              </p>
            </div>
          </div>

          <div className="p-8">
            <BrandingSettings organizationId={organizationId} />
          </div>
        </div>
      </div>
    </BrandingProvider>
  )
}
