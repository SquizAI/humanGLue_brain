'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DollarSign } from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'

export default function AdminPaymentsPage() {
  const router = useRouter()
  const { userData } = useChat()

  useEffect(() => {
    const isAdmin = userData?.isAdmin || userData?.role === 'admin' || userData?.userType === 'admin'
    if (!isAdmin) {
      router.push('/login')
    }
  }, [userData, router])

  const isAdmin = userData?.isAdmin || userData?.role === 'admin' || userData?.userType === 'admin'
  if (!isAdmin) {
    return null
  }

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="ml-[280px] transition-all duration-300">
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Payments & Billing</h1>
            <p className="text-gray-400 mb-8 font-diatype">Manage transactions and billing</p>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
              <DollarSign className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-gendy">Coming Soon</h3>
              <p className="text-gray-400 font-diatype">
                Payment management features are currently in development.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
