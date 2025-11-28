'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  FileText,
  Download,
  BookOpen,
  Video,
  FileCode,
  Folder,
  Search,
  ArrowRight,
  Star,
  Clock,
  Eye,
  Heart,
  Brain,
  Zap,
  Users,
  Trophy,
  TrendingUp,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'

export default function LibraryPage() {
  const router = useRouter()
  const { userData } = useChat()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')

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

  const resources = [
    {
      id: '1',
      title: 'AI Transformation Playbook 2025',
      description: 'Comprehensive guide to planning and executing enterprise AI transformations with proven frameworks.',
      category: 'Strategy',
      type: 'PDF',
      author: 'Dr. Sarah Chen',
      pages: 87,
      downloads: 1247,
      views: 5892,
      rating: 4.9,
      tags: ['Strategy', 'Planning', 'Framework'],
      featured: true,
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: '2',
      title: 'Machine Learning Implementation Checklist',
      description: 'Step-by-step checklist for deploying ML models in production environments.',
      category: 'Technical',
      type: 'PDF',
      author: 'Marcus Williams',
      pages: 24,
      downloads: 2156,
      views: 8934,
      rating: 4.8,
      tags: ['ML', 'Implementation', 'DevOps'],
      featured: true,
      icon: <FileCode className="w-5 h-5" />,
    },
    {
      id: '3',
      title: 'Ethics Framework Template',
      description: 'Customizable framework for establishing AI ethics guidelines and governance structures.',
      category: 'Ethics',
      type: 'Document',
      author: 'Emily Rodriguez',
      pages: 45,
      downloads: 892,
      views: 3421,
      rating: 5.0,
      tags: ['Ethics', 'Governance', 'Compliance'],
      featured: true,
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: '4',
      title: 'Change Management Workshop Materials',
      description: 'Complete workshop package including slides, exercises, and facilitator guides.',
      category: 'Leadership',
      type: 'Presentation',
      author: 'Michael Chen',
      pages: 156,
      downloads: 1523,
      views: 6234,
      rating: 4.7,
      tags: ['Change', 'Workshop', 'Leadership'],
      featured: false,
      icon: <Folder className="w-5 h-5" />,
    },
    {
      id: '5',
      title: 'Data Architecture Best Practices',
      description: 'Essential patterns and anti-patterns for building scalable data platforms.',
      category: 'Technical',
      type: 'Video',
      author: 'James Taylor',
      pages: 0,
      duration: '2h 45m',
      downloads: 0,
      views: 4567,
      rating: 4.9,
      tags: ['Architecture', 'Data', 'Cloud'],
      featured: false,
      icon: <Video className="w-5 h-5" />,
    },
    {
      id: '6',
      title: 'AI Product Launch Kit',
      description: 'Complete toolkit for planning and executing AI product launches.',
      category: 'Product',
      type: 'Bundle',
      author: 'Lisa Anderson',
      pages: 234,
      downloads: 1089,
      views: 5123,
      rating: 4.8,
      tags: ['Product', 'Launch', 'Marketing'],
      featured: false,
      icon: <Folder className="w-5 h-5" />,
    },
  ]

  const categories = [
    { value: 'all', label: 'All Categories', icon: <Folder className="w-5 h-5" />, count: resources.length, gradient: 'from-purple-500 to-blue-500' },
    { value: 'Strategy', label: 'Strategy & Planning', icon: <Brain className="w-5 h-5" />, count: resources.filter(r => r.category === 'Strategy').length, gradient: 'from-purple-500 to-blue-500' },
    { value: 'Technical', label: 'Technical Implementation', icon: <Zap className="w-5 h-5" />, count: resources.filter(r => r.category === 'Technical').length, gradient: 'from-blue-500 to-cyan-500' },
    { value: 'Ethics', label: 'Ethics & Governance', icon: <Trophy className="w-5 h-5" />, count: resources.filter(r => r.category === 'Ethics').length, gradient: 'from-cyan-500 to-green-500' },
    { value: 'Leadership', label: 'Change & Leadership', icon: <Users className="w-5 h-5" />, count: resources.filter(r => r.category === 'Leadership').length, gradient: 'from-green-500 to-amber-500' },
    { value: 'Product', label: 'Product & Strategy', icon: <TrendingUp className="w-5 h-5" />, count: resources.filter(r => r.category === 'Product').length, gradient: 'from-amber-500 to-orange-500' },
  ]

  const types = ['all', 'PDF', 'Video', 'Document', 'Presentation', 'Bundle']

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory
    const matchesType = selectedType === 'all' || resource.type === selectedType
    return matchesSearch && matchesCategory && matchesType
  })

  const featuredResources = filteredResources.filter(r => r.featured)
  const regularResources = filteredResources.filter(r => !r.featured)

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 backdrop-blur-sm border border-green-500/20 mb-3">
                  <FileText className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300 font-semibold font-diatype">Knowledge Base</span>
                </div>
                <h1 className="text-3xl font-bold text-white font-gendy mb-2">
                  Resource Library
                </h1>
                <p className="text-gray-400 font-diatype">
                  {filteredResources.length} resources • Guides, templates, and frameworks
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/dashboard/talent">
                  <button className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 hover:border-green-500/30 transition-all inline-flex items-center gap-2 font-diatype">
                    <ArrowRight className="w-5 h-5 rotate-180" />
                    Back to Academy
                  </button>
                </Link>
              </motion.div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500/50 transition-colors font-diatype"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50 transition-colors font-diatype"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50 transition-colors font-diatype"
              >
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <main className="p-8 space-y-10">
          {/* Category Quick Links */}
          <section>
            <h2 className="text-xl font-bold text-white mb-6 font-gendy">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => (
                <motion.button
                  key={category.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-xl border transition-all p-4 ${
                    selectedCategory === category.value
                      ? 'border-green-500/50 bg-green-500/10'
                      : 'border-white/10 hover:border-green-500/30'
                  }`}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${category.gradient} inline-flex mb-2`}>
                    <div className="text-white">{category.icon}</div>
                  </div>
                  <div className="text-sm font-semibold text-white mb-1 font-diatype">{category.label.split(' ')[0]}</div>
                  <div className="text-xs text-gray-400 font-diatype">{category.count} items</div>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Featured Resources */}
          {featuredResources.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-6 h-6 text-amber-400" />
                <h2 className="text-2xl font-bold text-white font-gendy">Featured Resources</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredResources.map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -6 }}
                    className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.1)] hover:shadow-[0_0_60px_rgba(34,197,94,0.2)] transition-all"
                  >
                    {/* Featured Badge */}
                    <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded-full flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold text-amber-300 font-diatype">Featured</span>
                    </div>

                    <div className="p-6">
                      {/* Icon */}
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center mb-4 text-green-400">
                        {resource.icon}
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-bold text-white mb-2 font-gendy group-hover:text-green-400 transition-colors line-clamp-2">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2 font-diatype">{resource.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {resource.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-green-500/10 text-green-300 text-xs rounded-md border border-green-500/20 font-diatype"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-4 pb-4 border-b border-white/10 font-diatype">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {resource.views}
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-3.5 h-3.5" />
                          {resource.downloads}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          {resource.rating}
                        </div>
                      </div>

                      {/* Author */}
                      <p className="text-xs text-gray-500 mb-4 font-diatype">by {resource.author}</p>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all shadow-lg inline-flex items-center justify-center gap-2 font-diatype">
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button className="px-3 py-2.5 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all">
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* All Resources */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white font-gendy">All Resources</h2>
            </div>

            <div className="space-y-3">
              {regularResources.map((resource, index) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  className="group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 hover:border-purple-500/30 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                >
                  <div className="flex items-center gap-5 p-5">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                      {resource.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white mb-1 font-gendy group-hover:text-purple-400 transition-colors">
                            {resource.title}
                          </h3>
                          <p className="text-sm text-gray-400 line-clamp-1 font-diatype">{resource.description}</p>
                        </div>
                        <span className="px-3 py-1 bg-purple-500/10 text-purple-300 text-xs rounded-md border border-purple-500/20 font-semibold font-diatype ml-4 flex-shrink-0">
                          {resource.type}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-6 text-xs text-gray-400 font-diatype">
                        <span>{resource.author}</span>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {resource.views} views
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-3.5 h-3.5" />
                          {resource.downloads} downloads
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          {resource.rating}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button className="p-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all inline-flex items-center gap-2 font-diatype">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
