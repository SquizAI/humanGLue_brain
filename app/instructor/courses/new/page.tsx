'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit } from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'

export default function CreateCoursePage() {
  const router = useRouter()

  // Trust middleware protection - no need for client-side auth checks
  // Middleware already validates access before page loads
  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-black">
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
              Back to Courses
            </motion.button>

            <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Create New Course</h1>
            <p className="text-gray-400 mb-8 font-diatype">Build engaging learning experiences for your students</p>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
              <Edit className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-gendy">Coming Soon</h3>
              <p className="text-gray-400 font-diatype">
                Course creation tools are currently in development.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
