'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  Video,
  GraduationCap,
  Users,
  Zap,
  FileText,
  BarChart3,
  ArrowRight,
  TrendingUp,
  Target,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'

export default function DashboardPage() {
  const router = useRouter()
  const { userData } = useChat()

  useEffect(() => {
    if (!userData || !userData.authenticated) {
      router.push('/login')
    }
  }, [userData, router])

  if (!userData || !userData.authenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    localStorage.removeItem('demoUser')
    // Clear demo user cookie
    document.cookie = 'demoUser=; path=/; max-age=0'
    router.push('/login')
  }

  const marketplaceItems = [
    {
      icon: <Video className="w-6 h-6" />,
      title: 'AI Workshops',
      description: 'Interactive live sessions with AI experts',
      href: '/dashboard/workshops',
      count: 12,
      gradient: 'from-purple-500 to-blue-500',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80'
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: 'CBT Library',
      description: 'Bite-sized learning modules',
      href: '/dashboard/cbts',
      count: 48,
      gradient: 'from-blue-500 to-cyan-500',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Talent & Learning',
      description: 'Enterprise training & expert network',
      href: '/dashboard/talent',
      gradient: 'from-cyan-500 to-green-500',
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Workflows',
      description: 'Ready-to-deploy automation',
      href: '/dashboard/workflows',
      count: 24,
      gradient: 'from-green-500 to-yellow-500',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80'
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Resources',
      description: 'Guides and frameworks',
      href: '/dashboard/resources',
      count: 36,
      gradient: 'from-yellow-500 to-orange-500',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Analytics',
      description: 'Track your progress',
      href: '/dashboard/analytics',
      gradient: 'from-orange-500 to-red-500',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80'
    },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="ml-0 lg:ml-[var(--sidebar-width,280px)] transition-all">
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-8 border border-purple-500/20"
          >
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold font-gendy flex-shrink-0">
                {userData.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white font-gendy mb-2">
                  Welcome back, {userData.name}
                </h1>
                <p className="text-gray-300 font-diatype mb-4">
                  {userData.company || 'Your Organization'} • Continue your AI transformation journey
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 backdrop-blur-xl border border-white/10">
                    <div className="flex items-center gap-2 text-purple-400 mb-1">
                      <Target className="w-5 h-5" />
                      <span className="text-2xl font-bold font-gendy">72</span>
                    </div>
                    <p className="text-gray-400 text-sm font-diatype">AI Maturity Score</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 backdrop-blur-xl border border-white/10">
                    <div className="flex items-center gap-2 text-blue-400 mb-1">
                      <TrendingUp className="w-5 h-5" />
                      <span className="text-2xl font-bold font-gendy">12</span>
                    </div>
                    <p className="text-gray-400 text-sm font-diatype">Completed CBTs</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 backdrop-blur-xl border border-white/10">
                    <div className="flex items-center gap-2 text-green-400 mb-1">
                      <Video className="w-5 h-5" />
                      <span className="text-2xl font-bold font-gendy">3</span>
                    </div>
                    <p className="text-gray-400 text-sm font-diatype">Workshops Attended</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-6 font-gendy">Your Marketplace</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketplaceItems.map((item, index) => (
                <Link key={index} href={item.href}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] h-full"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
                      <div className={`absolute top-4 right-4 p-3 rounded-xl bg-gradient-to-br ${item.gradient}`}>
                        {item.icon}
                      </div>
                      {item.count && (
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">
                          <span className="text-white text-sm font-bold font-diatype">{item.count} Available</span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-white mb-2 font-gendy group-hover:text-purple-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 text-sm font-diatype mb-4">
                        {item.description}
                      </p>
                      <div className="flex items-center text-purple-400 font-semibold text-sm font-diatype">
                        Explore
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
