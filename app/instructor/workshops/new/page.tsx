'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar } from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'

export default function ScheduleWorkshopPage() {
  const router = useRouter()
  const { userData } = useChat()

  useEffect(() => {
    if (!userData?.isInstructor) {
      router.push('/login')
    }
  }, [userData, router])

  if (!userData?.isInstructor) {
    return null
  }

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <motion.button
              whileHover={{ x: -4 }}
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 font-diatype"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Workshops
            </motion.button>

            <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Schedule Workshop</h1>
            <p className="text-gray-400 mb-8 font-diatype">Plan a live learning session for your students</p>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
              <Calendar className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-gendy">Coming Soon</h3>
              <p className="text-gray-400 font-diatype">
                Workshop scheduling tools are currently in development.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
