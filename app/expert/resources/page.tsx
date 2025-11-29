'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Upload, Trash2, Eye, Search } from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useRouter } from 'next/navigation'

// Trust middleware protection - no need for client-side auth checks
// Middleware already validates access before page loads

export default function ExpertResourcesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'documents' | 'templates' | 'guides'>('all')

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      localStorage.removeItem('humanglue_user')
      localStorage.removeItem('demoUser')
      document.cookie = 'demoUser=; path=/; max-age=0'
      localStorage.removeItem('sb-egqqdscvxvtwcdwknbnt-auth-token')
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/login'
    }
  }

  // Mock resources
  const resources = [
    {
      id: 1,
      name: 'AI Transformation Roadmap Template',
      type: 'template',
      size: '245 KB',
      lastModified: '2025-11-25',
      downloads: 12,
      description: 'Step-by-step template for creating AI transformation roadmaps'
    },
    {
      id: 2,
      name: 'Change Management Guide',
      type: 'guide',
      size: '1.2 MB',
      lastModified: '2025-11-20',
      downloads: 8,
      description: 'Comprehensive guide for managing organizational change'
    },
    {
      id: 3,
      name: 'Session Notes Template',
      type: 'template',
      size: '180 KB',
      lastModified: '2025-11-18',
      downloads: 15,
      description: 'Template for documenting client session notes'
    },
    {
      id: 4,
      name: 'AI Maturity Assessment',
      type: 'document',
      size: '420 KB',
      lastModified: '2025-11-15',
      downloads: 20,
      description: 'Assessment framework for evaluating AI maturity'
    }
  ]

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || resource.type === filterType
    return matchesSearch && matchesType
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'template': return 'text-purple-400 bg-purple-500/20 border-purple-500/30'
      case 'guide': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'document': return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Resources</h1>
              <p className="text-gray-400 font-diatype">Share materials and documents with clients</p>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all font-diatype flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Resource
            </button>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-diatype"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'documents', 'templates', 'guides'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as any)}
                  className={`px-4 py-3 rounded-xl transition-all font-diatype ${
                    filterType === type
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid gap-4">
            {filteredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-400" />
                    </div>

                    {/* Resource Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white font-gendy">{resource.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium font-diatype border ${getTypeColor(resource.type)}`}>
                          {resource.type}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3 font-diatype">{resource.description}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="font-diatype">{resource.size}</span>
                        <span className="font-diatype">Modified: {new Date(resource.lastModified).toLocaleDateString()}</span>
                        <span className="font-diatype">{resource.downloads} downloads</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10" title="Preview">
                      <Eye className="w-5 h-5 text-gray-400" />
                    </button>
                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10" title="Download">
                      <Download className="w-5 h-5 text-gray-400" />
                    </button>
                    <button className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all border border-red-500/30" title="Delete">
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredResources.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2 font-gendy">No resources found</h3>
                <p className="text-gray-500 font-diatype">
                  {searchQuery
                    ? "Try adjusting your search or filters"
                    : "Upload your first resource to get started"}
                </p>
              </div>
            )}
          </div>

          {/* Storage Info */}
          <div className="mt-8 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white font-gendy">Storage Usage</h3>
              <span className="text-sm text-gray-400 font-diatype">2.1 GB of 10 GB used</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full" style={{ width: '21%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
