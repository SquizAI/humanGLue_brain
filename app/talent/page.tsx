'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PremiumTalentMarketplace } from '@/components/talent/PremiumTalentMarketplace'
import { useChat } from '@/lib/contexts/ChatContext'

export default function TalentPage() {
  const router = useRouter()
  const { userData } = useChat()

  // Authentication check - require login
  useEffect(() => {
    if (!userData || !userData.email) {
      // Redirect to home with message to complete assessment first
      router.push('/?message=complete-assessment')
    }
  }, [userData, router])

  // Show loading or nothing while checking auth
  if (!userData || !userData.email) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Authenticating...</div>
      </div>
    )
  }

  return <PremiumTalentMarketplace userData={userData} />
}
