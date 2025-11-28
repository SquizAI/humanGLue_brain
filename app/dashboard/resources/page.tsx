'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  FileText,
  ArrowRight,
  Search,
  Download,
  BookmarkPlus,
  Eye,
  Clock,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'

interface Resource {
  id: string
  title: string
  description: string
  type: 'Guide' | 'Playbook' | 'Framework' | 'Template' | 'Case Study'
  category: string
  readTime: string
  downloads: number
  pages: number
  publishedDate: string
}

export default function ResourcesPage() {
  const router = useRouter()
  const { userData } = useChat()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

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
    router.push('/login')
  }

  const resources: Resource[] = [
    {
      id: '1',
      title: 'AI Strategy Implementation Guide',
      description: 'Comprehensive guide to developing and executing an effective AI strategy',
      type: 'Guide',
      category: 'Strategy',
      readTime: '45 mins',
      downloads: 2341,
      pages: 87,
      publishedDate: 'Dec 2024',
    },
    {
      id: '2',
      title: 'Change Management Playbook',
      description: 'Step-by-step playbook for leading AI transformation initiatives',
      type: 'Playbook',
      category: 'Leadership',
      readTime: '30 mins',
      downloads: 1876,
      pages: 62,
      publishedDate: 'Nov 2024',
    },
    {
      id: '3',
      title: 'AI Maturity Assessment Framework',
      description: 'Framework for assessing and improving organizational AI maturity',
      type: 'Framework',
      category: 'Assessment',
      readTime: '25 mins',
      downloads: 3412,
      pages: 45,
      publishedDate: 'Dec 2024',
    },
    {
      id: '4',
      title: 'AI Project Kickoff Template',
      description: 'Template for planning and launching AI initiatives',
      type: 'Template',
      category: 'Project Management',
      readTime: '15 mins',
      downloads: 1543,
      pages: 28,
      publishedDate: 'Oct 2024',
    },
    {
      id: '5',
      title: 'Enterprise AI Transformation Case Study',
      description: 'Real-world case study of Fortune 500 AI transformation',
      type: 'Case Study',
      category: 'Best Practices',
      readTime: '35 mins',
      downloads: 2987,
      pages: 56,
      publishedDate: 'Nov 2024',
    },
    {
      id: '6',
      title: 'AI Ethics and Governance Framework',
      description: 'Framework for establishing AI ethics and governance policies',
      type: 'Framework',
      category: 'Ethics',
      readTime: '40 mins',
      downloads: 2156,
      pages: 73,
      publishedDate: 'Dec 2024',
    },
  ]

  const types = ['all', 'Guide', 'Playbook', 'Framework', 'Template', 'Case Study']
  const categories = ['all', 'Strategy', 'Leadership', 'Assessment', 'Project Management', 'Best Practices', 'Ethics']

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || resource.type === selectedType
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory
    return matchesSearch && matchesType && matchesCategory
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Guide': return 'from-purple-500 to-blue-500'
      case 'Playbook': return 'from-blue-500 to-cyan-500'
      case 'Framework': return 'from-cyan-500 to-green-500'
      case 'Template': return 'from-green-500 to-yellow-500'
      case 'Case Study': return 'from-yellow-500 to-orange-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all">
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white font-gendy mb-2">
                  Resource Library
                </h1>
                <p className="text-gray-400 font-diatype">
                  Guides, playbooks, and frameworks for AI transformation
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors font-diatype"
                />
              </div>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-colors font-diatype"
              >
                <option value="all">All Types</option>
                {types.slice(1).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

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
            {filteredResources.map((resource, index) => (
              <Link key={resource.id} href={`/dashboard/resources/${resource.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] cursor-pointer h-full"
                >
                  <div className="p-6 space-y-4">
                    <div className={`h-32 rounded-xl bg-gradient-to-br ${getTypeColor(resource.type)} flex items-center justify-center mb-4`}>
                      <FileText className="w-16 h-16 text-white opacity-80" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold font-diatype">
                          {resource.type}
                        </span>
                        <span className="px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold font-diatype">
                          {resource.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2 font-gendy group-hover:text-purple-400 transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-gray-400 text-sm font-diatype leading-relaxed">
                        {resource.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      <div>
                        <p className="text-xs text-gray-400 mb-1 font-diatype">Read Time</p>
                        <div className="flex items-center gap-1 text-white">
                          <Clock className="w-4 h-4 text-purple-400" />
                          <span className="text-sm font-semibold font-diatype">{resource.readTime}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1 font-diatype">Pages</p>
                        <div className="flex items-center gap-1 text-white">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-semibold font-diatype">{resource.pages}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        <span className="font-diatype">{resource.downloads.toLocaleString()}</span>
                      </div>
                      <span className="font-diatype">{resource.publishedDate}</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-4 text-purple-400 group-hover:text-purple-300 transition-colors">
                      <Eye className="w-4 h-4" />
                      <span className="font-semibold font-diatype">View Resource</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div className={`absolute inset-0 bg-gradient-to-br ${getTypeColor(resource.type)} opacity-0 group-hover:opacity-5 transition-opacity`} />
                </motion.div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
