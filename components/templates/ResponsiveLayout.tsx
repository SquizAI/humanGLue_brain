'use client'

import { ReactNode, useState, useEffect } from 'react'
import { PageLayout } from './PageLayout'
import { MobileLayout } from './MobileLayout'

interface ResponsiveLayoutProps {
  children: ReactNode
  backgroundState?: 'default' | 'welcoming' | 'exploring' | 'analyzing' | 'presenting'
  heroBackgroundImage?: string
}

export function ResponsiveLayout({ children, backgroundState = 'default', heroBackgroundImage }: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Initial check
    checkMobile()
    
    // Add resize listener
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Don't render until we know if it's mobile or not (prevents hydration mismatch)
  if (isMobile === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-blue-500 rounded-full" />
        </div>
      </div>
    )
  }

  // Use mobile layout for mobile devices
  if (isMobile) {
    return (
      <MobileLayout backgroundState={backgroundState}>
        {children}
      </MobileLayout>
    )
  }

  // Use desktop layout for larger screens
  return (
    <PageLayout backgroundState={backgroundState} heroBackgroundImage={heroBackgroundImage}>
      {children}
    </PageLayout>
  )
} 