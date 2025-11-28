'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  BarChart3,
  ArrowRight,
  TrendingUp,
  Target,
  Users,
  Award,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'

export default function AnalyticsPage() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const metrics = [
    {
      label: 'Overall Progress',
      value: '68%',
      change: '+12%',
      trend: 'up',
      icon: <TrendingUp className="w-6 h-6" />,
      gradient: 'from-purple-500 to-blue-500',
    },
    {
      label: 'Adaptability Score',
      value: '72/100',
      change: '+8',
      trend: 'up',
      icon: <Target className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Team Engagement',
      value: '84%',
      change: '+5%',
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      gradient: 'from-cyan-500 to-green-500',
    },
    {
      label: 'Milestones Achieved',
      value: '15/20',
      change: '+3',
      trend: 'up',
      icon: <Award className="w-6 h-6" />,
      gradient: 'from-green-500 to-yellow-500',
    },
  ]

  const learningMetrics = [
    { label: 'CBTs Completed', value: 12, total: 48, percentage: 25 },
    { label: 'Workshops Attended', value: 3, total: 12, percentage: 25 },
    { label: 'Learning Hours', value: 24, total: 100, percentage: 24 },
    { label: 'Skills Acquired', value: 8, total: 25, percentage: 32 },
  ]

  const recentActivity = [
    {
      title: 'Completed AI Ethics CBT',
      time: '2 hours ago',
      type: 'learning',
      icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,
    },
    {
      title: 'Enrolled in AI Strategy Workshop',
      time: '1 day ago',
      type: 'enrollment',
      icon: <Users className="w-5 h-5 text-blue-400" />,
    },
    {
      title: 'Downloaded Change Management Playbook',
      time: '2 days ago',
      type: 'resource',
      icon: <BarChart3 className="w-5 h-5 text-purple-400" />,
    },
    {
      title: 'Achieved Adaptability Milestone',
      time: '3 days ago',
      type: 'achievement',
      icon: <Award className="w-5 h-5 text-yellow-400" />,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all">
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white font-gendy mb-2">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-400 font-diatype">
                  Track your transformation progress with real-time insights
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/dashboard">
                  <button className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 hover:border-purple-500/30 transition-all inline-flex items-center gap-2 font-diatype">
                    <ArrowRight className="w-5 h-5 rotate-180" />
                    Back to Dashboard
                  </button>
                </Link>
              </motion.div>
            </div>
          </div>
        </header>

        <main className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-purple-500/30 transition-all hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]"
              >
                <div className="relative z-10">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${metric.gradient} mb-4`}>
                    {metric.icon}
                  </div>
                  <p className="text-gray-400 text-sm mb-1 font-diatype">{metric.label}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-white font-gendy">{metric.value}</h3>
                    <span className="text-green-400 text-sm font-diatype">{metric.change}</span>
                  </div>
                </div>
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6 font-gendy">Learning Progress</h2>
              <div className="space-y-4">
                {learningMetrics.map((metric, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 font-diatype">{metric.label}</span>
                      <span className="text-purple-400 font-semibold font-diatype">
                        {metric.value}/{metric.total}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.percentage}%` }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6 font-gendy">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-diatype">{activity.title}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                        <Clock className="w-4 h-4" />
                        <span className="font-diatype">{activity.time}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4 font-gendy">AI Transformation Roadmap</h2>
            <p className="text-gray-400 font-diatype mb-6">
              Track your progress through our structured AI transformation journey
            </p>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500 to-blue-500" />
              <div className="space-y-6">
                {[
                  { phase: 'Assessment & Planning', status: 'completed', progress: 100 },
                  { phase: 'Foundation Building', status: 'in-progress', progress: 68 },
                  { phase: 'Implementation & Training', status: 'upcoming', progress: 25 },
                  { phase: 'Optimization & Scaling', status: 'upcoming', progress: 0 },
                ].map((phase, i) => (
                  <div key={i} className="relative pl-12">
                    <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      phase.status === 'completed' ? 'bg-green-500' :
                      phase.status === 'in-progress' ? 'bg-blue-500' :
                      'bg-gray-600'
                    }`}>
                      {phase.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-white" />}
                      {phase.status === 'in-progress' && <div className="w-3 h-3 bg-white rounded-full animate-pulse" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2 font-gendy">{phase.phase}</h3>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                          style={{ width: `${phase.progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-400 mt-1 font-diatype">{phase.progress}% complete</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
