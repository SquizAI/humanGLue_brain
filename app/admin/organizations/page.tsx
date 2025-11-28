'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Plus,
  Search,
  Users,
  DollarSign,
  TrendingUp,
  Settings,
  Eye,
  Crown,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'

interface Organization {
  id: number
  name: string
  members: number
  activeUsers: number
  subscription: 'starter' | 'professional' | 'enterprise'
  mrr: number
  status: 'active' | 'trial' | 'suspended'
  joinedDate: string
}

const initialOrgs: Organization[] = [
  {
    id: 1,
    name: 'TechCorp Industries',
    members: 250,
    activeUsers: 187,
    subscription: 'enterprise',
    mrr: 12500,
    status: 'active',
    joinedDate: '2025-06-15',
  },
  {
    id: 2,
    name: 'Innovation Labs',
    members: 45,
    activeUsers: 32,
    subscription: 'professional',
    mrr: 2250,
    status: 'active',
    joinedDate: '2025-08-20',
  },
]

export default function OrganizationsAdmin() {
  const router = useRouter()
  const { userData } = useChat()
  const [orgs, setOrgs] = useState<Organization[]>(initialOrgs)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!userData?.isAdmin) {
      router.push('/login')
    }
  }, [userData, router])

  if (!userData?.isAdmin) {
    return null
  }

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const filteredOrgs = orgs.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getSubBadge = (sub: string) => {
    const badges = {
      starter: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      professional: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      enterprise: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    }
    return badges[sub as keyof typeof badges]
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/admin" className="text-gray-400 hover:text-white transition-colors mb-2 inline-block">
                  <span className="font-diatype">← Back to Dashboard</span>
                </Link>
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">
                  Organization Management
                </h1>
                <p className="text-gray-400 font-diatype">
                  Manage enterprise accounts ({filteredOrgs.length} organizations)
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-diatype"
              >
                <Plus className="w-5 h-5" />
                Add Organization
              </motion.button>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6"
            >
              <Building2 className="w-6 h-6 text-purple-400 mb-2" />
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">{orgs.length}</h3>
              <p className="text-sm text-gray-400 font-diatype">Total Organizations</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6"
            >
              <Users className="w-6 h-6 text-blue-400 mb-2" />
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                {orgs.reduce((sum, o) => sum + o.members, 0)}
              </h3>
              <p className="text-sm text-gray-400 font-diatype">Total Members</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-900/30 to-green-900/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6"
            >
              <DollarSign className="w-6 h-6 text-green-400 mb-2" />
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                ${orgs.reduce((sum, o) => sum + o.mrr, 0).toLocaleString()}
              </h3>
              <p className="text-sm text-gray-400 font-diatype">Total MRR</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-amber-900/30 to-amber-900/10 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6"
            >
              <Crown className="w-6 h-6 text-amber-400 mb-2" />
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                {orgs.filter((o) => o.subscription === 'enterprise').length}
              </h3>
              <p className="text-sm text-gray-400 font-diatype">Enterprise Clients</p>
            </motion.div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search organizations..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrgs.map((org, index) => (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-gendy">{org.name}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${getSubBadge(
                          org.subscription
                        )}`}
                      >
                        {org.subscription}
                      </span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Settings className="w-5 h-5 text-gray-400" />
                  </motion.button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-2xl font-bold text-white mb-1 font-gendy">{org.members}</p>
                    <p className="text-xs text-gray-400 font-diatype">Members</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-2xl font-bold text-green-400 mb-1 font-gendy">
                      {org.activeUsers}
                    </p>
                    <p className="text-xs text-green-400 font-diatype">Active</p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-2xl font-bold text-blue-400 mb-1 font-gendy">
                      ${org.mrr}
                    </p>
                    <p className="text-xs text-blue-400 font-diatype">MRR</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg transition-all font-diatype"
                  >
                    <Users className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
