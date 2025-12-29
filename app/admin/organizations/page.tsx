'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Building2,
  Plus,
  Search,
  Users,
  DollarSign,
  Settings,
  Eye,
  Crown,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { StatCard } from '@/components/atoms/StatCard'
import { Text, Heading } from '@/components/atoms/Text'
import { signOut } from '@/lib/auth/hooks'

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
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)
  const [orgs, setOrgs] = useState<Organization[]>(initialOrgs)
  const [searchQuery, setSearchQuery] = useState('')

  // Check admin access with timeout pattern
  useEffect(() => {
    if (!authLoading && userData?.isAdmin) {
      setShowContent(true)
      return
    }

    const timeout = setTimeout(() => {
      console.log('[OrganizationsAdmin] Auth timeout - trusting middleware protection')
      setShowContent(true)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [authLoading, userData])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      await signOut()
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

  if (!showContent) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <LoadingSpinner variant="neural" size="xl" text="Loading organizations..." />
        </div>
      </div>
    )
  }

  const filteredOrgs = orgs.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getSubBadge = (sub: string) => {
    const badges = {
      starter: 'bg-blue-500/20 text-[var(--hg-cyan-text)] border-blue-500/30',
      professional: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      enterprise: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    }
    return badges[sub as keyof typeof badges]
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <div className="border-b hg-bg-sidebar hg-border">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/admin">
                  <Text variant="muted" size="sm" className="hover:underline mb-2 inline-block">← Back to Dashboard</Text>
                </Link>
                <Heading as="h1" size="3xl" className="mb-2">
                  Organization Management
                </Heading>
                <Text variant="muted">
                  Manage enterprise accounts ({filteredOrgs.length} organizations)
                </Text>
              </div>
              <Link href="/signup/organization">
                <Button variant="primary" size="lg" icon={<Plus className="w-5 h-5" />}>
                  Add Organization
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Stats Grid - Demo Layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Organizations"
              value={orgs.length}
              subtitle="All time"
              icon={<Building2 className="w-5 h-5" />}
              variant="cyan"
            />

            <StatCard
              title="Total Members"
              value={orgs.reduce((sum, o) => sum + o.members, 0)}
              icon={<Users className="w-5 h-5" />}
              variant="cyan"
              trend={{ value: 12, label: 'this month', direction: 'up' }}
            />

            <StatCard
              title="Total MRR"
              value={`$${orgs.reduce((sum, o) => sum + o.mrr, 0).toLocaleString()}`}
              icon={<DollarSign className="w-5 h-5" />}
              variant="cyan"
              trend={{ value: 8, direction: 'up' }}
            />

            <StatCard
              title="Enterprise Clients"
              value={orgs.filter((o) => o.subscription === 'enterprise').length}
              subtitle="Premium"
              icon={<Crown className="w-5 h-5" />}
              variant="warning"
            />
          </div>

          {/* Search */}
          <Card padding="lg" className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 hg-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search organizations..."
                className="w-full pl-12 pr-4 py-3 rounded-xl transition-all hg-border border focus:outline-none focus:ring-2 hg-bg-secondary hg-text-primary"
                style={{ '--tw-ring-color': 'var(--hg-cyan-border)' } as React.CSSProperties}
              />
            </div>
          </Card>

          {/* Organization Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrgs.map((org, index) => (
              <Card key={org.id} animate hover padding="lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-500">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <Link href={`/admin/organizations/${org.id}/branding`} className="hover:underline">
                        <Heading as="h3" size="lg">{org.name}</Heading>
                      </Link>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${getSubBadge(
                          org.subscription
                        )}`}
                      >
                        {org.subscription}
                      </span>
                    </div>
                  </div>
                  <Link href={`/admin/organizations/${org.id}/branding`}>
                    <Button variant="secondary" size="sm">
                      <Settings className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-lg p-3 hg-bg-secondary">
                    <Heading as="h4" size="2xl" className="mb-1">{org.members}</Heading>
                    <Text variant="muted" size="xs">Members</Text>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                    <Heading as="h4" size="2xl" className="text-emerald-400 mb-1">
                      {org.activeUsers}
                    </Heading>
                    <Text size="xs" className="text-emerald-400">Active</Text>
                  </div>
                  <div className="rounded-lg p-3 bg-[var(--hg-cyan-bg)]">
                    <Heading as="h4" size="2xl" className="text-[var(--hg-cyan-text)] mb-1">
                      ${org.mrr}
                    </Heading>
                    <Text variant="cyan" size="xs">MRR</Text>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/admin/organizations/${org.id}/branding`} className="flex-1">
                    <Button variant="cyan" className="w-full" icon={<Eye className="w-4 h-4" />}>
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/admin/organizations/${org.id}/members`}>
                    <Button variant="secondary">
                      <Users className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
