'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Zap,
  ArrowRight,
  Search,
  Download,
  Play,
  CheckCircle2,
  Clock,
  TrendingUp,
  Star,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
interface Workflow {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  steps: number
  rating: number
  downloads: number
  useCases: string[]
}

export default function WorkflowsPage() {
  const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const workflows: Workflow[] = [
    {
      id: '1',
      title: 'Customer Onboarding Automation',
      description: 'Streamline new customer onboarding with AI-powered document processing and personalized workflows',
      category: 'Sales',
      difficulty: 'Beginner',
      duration: '30 mins',
      steps: 6,
      rating: 4.8,
      downloads: 1243,
      useCases: ['SaaS', 'E-commerce', 'B2B'],
    },
    {
      id: '2',
      title: 'Intelligent Lead Scoring',
      description: 'Automatically score and prioritize leads using predictive AI models',
      category: 'Marketing',
      difficulty: 'Intermediate',
      duration: '45 mins',
      steps: 8,
      rating: 4.9,
      downloads: 987,
      useCases: ['B2B', 'Enterprise', 'SaaS'],
    },
    {
      id: '3',
      title: 'Automated Report Generation',
      description: 'Generate comprehensive business reports automatically with AI-driven insights',
      category: 'Analytics',
      difficulty: 'Intermediate',
      duration: '1 hour',
      steps: 10,
      rating: 4.7,
      downloads: 2156,
      useCases: ['Finance', 'Operations', 'Executive'],
    },
    {
      id: '4',
      title: 'Smart Document Classification',
      description: 'Automatically classify and route documents using ML-powered categorization',
      category: 'Operations',
      difficulty: 'Advanced',
      duration: '2 hours',
      steps: 12,
      rating: 4.9,
      downloads: 765,
      useCases: ['Legal', 'HR', 'Finance'],
    },
    {
      id: '5',
      title: 'Customer Support Triage',
      description: 'Intelligently route and prioritize customer support tickets with AI',
      category: 'Support',
      difficulty: 'Beginner',
      duration: '25 mins',
      steps: 5,
      rating: 4.6,
      downloads: 1534,
      useCases: ['SaaS', 'E-commerce', 'Services'],
    },
    {
      id: '6',
      title: 'Predictive Maintenance Alerts',
      description: 'Predict equipment failures and automate maintenance scheduling',
      category: 'Operations',
      difficulty: 'Advanced',
      duration: '3 hours',
      steps: 15,
      rating: 5.0,
      downloads: 543,
      useCases: ['Manufacturing', 'Facilities', 'IoT'],
    },
  ]

  const categories = ['all', 'Sales', 'Marketing', 'Analytics', 'Operations', 'Support']

  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch = workflow.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || workflow.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'Intermediate': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      case 'Advanced': return 'text-red-400 bg-red-500/10 border-red-500/20'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all">
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white font-gendy mb-2">
                  Workflow Automation
                </h1>
                <p className="text-gray-400 font-diatype">
                  Ready-to-deploy AI workflow templates for your processes
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
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search workflow templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors font-diatype"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-colors font-diatype"
              >
                <option value="all">All Categories</option>
                {categories.slice(1).map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkflows.map((workflow, index) => (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold font-diatype">
                          {workflow.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full border text-xs font-semibold font-diatype ${getDifficultyColor(workflow.difficulty)}`}>
                          {workflow.difficulty}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2 font-gendy group-hover:text-purple-400 transition-colors">
                        {workflow.title}
                      </h3>
                      <p className="text-gray-400 text-sm font-diatype leading-relaxed">
                        {workflow.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-yellow-400" />
                    <span className="text-sm font-semibold font-diatype">{workflow.rating}</span>
                    <span className="text-gray-400 text-xs ml-1 font-diatype">({workflow.downloads} downloads)</span>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span className="font-diatype">{workflow.duration} setup</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="font-diatype">{workflow.steps} steps</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 mb-2 font-diatype">Use Cases:</p>
                    <div className="flex flex-wrap gap-1">
                      {workflow.useCases.map((useCase) => (
                        <span key={useCase} className="px-2 py-1 rounded bg-white/5 text-gray-300 text-xs font-diatype">
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-purple-500/50 font-diatype">
                      <Play className="w-4 h-4" />
                      Deploy
                    </button>
                    <button className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 hover:border-purple-500/30 transition-all">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-blue-500 opacity-0 group-hover:opacity-5 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
