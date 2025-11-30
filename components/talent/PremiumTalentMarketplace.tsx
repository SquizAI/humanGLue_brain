'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  Search,
  Sparkles,
  Award,
  TrendingUp,
  Users,
  ArrowRight,
  Filter,
  X,
  CheckCircle2,
  Star,
  Building2,
  Clock,
} from 'lucide-react'
import { Navigation } from '../organisms/Navigation'
import { Footer } from '../organisms/Footer'
import { mockTalent } from '@/lib/data/mock-talent'
import { TalentProfile } from './TalentCard'
import { cn } from '@/utils/cn'

interface PremiumTalentMarketplaceProps {
  userData: any
}

type SortBy = 'transformationSuccess' | 'behaviorChange' | 'rating' | 'clientRetention'

export function PremiumTalentMarketplace({ userData }: PremiumTalentMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'limited'>('all')
  const [sortBy, setSortBy] = useState<SortBy>('transformationSuccess')
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort
  const filteredTalent = useMemo(() => {
    let filtered = mockTalent.filter((talent) => {
      const matchesSearch =
        searchQuery === '' ||
        talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.expertise.some((exp) => exp.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesExpertise =
        selectedExpertise.length === 0 ||
        selectedExpertise.some((exp) => talent.expertise.includes(exp))

      const matchesIndustries =
        selectedIndustries.length === 0 ||
        selectedIndustries.some((ind) => talent.focusAreas.industries.includes(ind))

      const matchesAvailability =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && talent.availability === 'available') ||
        (availabilityFilter === 'limited' && talent.availability === 'limited')

      return matchesSearch && matchesExpertise && matchesIndustries && matchesAvailability
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'transformationSuccess':
          return b.adaptabilityImpact.transformationSuccessRate - a.adaptabilityImpact.transformationSuccessRate
        case 'behaviorChange':
          return b.adaptabilityImpact.behaviorChangeScore - a.adaptabilityImpact.behaviorChangeScore
        case 'clientRetention':
          return b.adaptabilityImpact.clientRetentionRate - a.adaptabilityImpact.clientRetentionRate
        case 'rating':
          return b.rating - a.rating
        default:
          return 0
      }
    })

    return filtered
  }, [searchQuery, selectedExpertise, selectedIndustries, availabilityFilter, sortBy, mockTalent])

  const featuredExperts = filteredTalent.filter((t) => t.featured).slice(0, 3)
  const regularExperts = filteredTalent.filter((t) => !t.featured)

  const expertiseOptions = Array.from(new Set(mockTalent.flatMap((t) => t.expertise)))
  const industryOptions = Array.from(new Set(mockTalent.flatMap((t) => t.focusAreas.industries)))

  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      {/* Hero Section - Premium */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.1),transparent_50%)]" />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="relative z-10 container max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 backdrop-blur-sm border border-cyan-500/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-300 font-diatype">Exclusive Access for Clients</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 font-gendy leading-tight"
          >
            The Talent Marketplace
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto mb-8 font-diatype"
          >
            Vetted transformation experts who embed change, not just deliver projects.
            <span className="block mt-2 text-cyan-400 font-semibold">Curated. Premium. Proven.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-8 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              <span>Impact-Ranked</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              <span>Culture-First Matching</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              <span>Behavior Change Experts</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="sticky top-20 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, expertise, or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all font-diatype"
            >
              <Filter className="w-5 h-5" />
              Filters
              {(selectedExpertise.length > 0 || selectedIndustries.length > 0 || availabilityFilter !== 'all') && (
                <span className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-300 rounded-full">
                  {selectedExpertise.length + selectedIndustries.length + (availabilityFilter !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none cursor-pointer font-diatype"
            >
              <option value="transformationSuccess">Transformation Impact</option>
              <option value="behaviorChange">Behavior Change Score</option>
              <option value="clientRetention">Client Retention</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-6 pt-6 border-t border-white/10 overflow-hidden"
              >
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Expertise Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-3 font-diatype">Expertise</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {expertiseOptions.slice(0, 8).map((exp) => (
                        <label key={exp} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedExpertise.includes(exp)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExpertise([...selectedExpertise, exp])
                              } else {
                                setSelectedExpertise(selectedExpertise.filter((x) => x !== exp))
                              }
                            }}
                            className="rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/50"
                          />
                          <span className="font-diatype">{exp}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Industry Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-3 font-diatype">Industries</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {industryOptions.slice(0, 8).map((ind) => (
                        <label key={ind} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedIndustries.includes(ind)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIndustries([...selectedIndustries, ind])
                              } else {
                                setSelectedIndustries(selectedIndustries.filter((x) => x !== ind))
                              }
                            }}
                            className="rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/50"
                          />
                          <span className="font-diatype">{ind}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Availability Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-3 font-diatype">Availability</label>
                    <div className="space-y-2">
                      {[
                        { value: 'all', label: 'All Experts' },
                        { value: 'available', label: 'Available Now' },
                        { value: 'limited', label: 'Limited Availability' },
                      ].map((option) => (
                        <label key={option.value} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white cursor-pointer">
                          <input
                            type="radio"
                            name="availability"
                            value={option.value}
                            checked={availabilityFilter === option.value}
                            onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                            className="border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/50"
                          />
                          <span className="font-diatype">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                {(selectedExpertise.length > 0 || selectedIndustries.length > 0 || availabilityFilter !== 'all') && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedExpertise([])
                        setSelectedIndustries([])
                        setAvailabilityFilter('all')
                      }}
                      className="text-sm text-cyan-400 hover:text-cyan-300 font-diatype"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Results Count */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-gray-400 font-diatype">
          Showing <span className="text-white font-semibold">{filteredTalent.length}</span> transformation experts
        </p>
      </div>

      {/* Featured Experts - Large Premium Cards */}
      {featuredExperts.length > 0 && (
        <section className="container max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <div className="flex items-center gap-3 mb-8">
            <Award className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white font-gendy">Featured Transformation Partners</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredExperts.map((expert, index) => (
              <motion.div
                key={expert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PremiumExpertCard expert={expert} featured />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Regular Experts Grid */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {regularExperts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg font-diatype">No experts match your current filters.</p>
            <button
              onClick={() => {
                setSelectedExpertise([])
                setSelectedIndustries([])
                setAvailabilityFilter('all')
                setSearchQuery('')
              }}
              className="mt-4 text-cyan-400 hover:text-cyan-300 font-diatype"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularExperts.map((expert, index) => (
              <motion.div
                key={expert.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <PremiumExpertCard expert={expert} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}

// Premium Expert Card Component
function PremiumExpertCard({ expert, featured = false }: { expert: TalentProfile; featured?: boolean }) {
  const availabilityConfig = {
    available: { color: 'text-green-400', bg: 'bg-green-500/10', label: 'Available Now' },
    limited: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Limited Availability' },
    booked: { color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Fully Booked' },
  }

  const availability = availabilityConfig[expert.availability]

  return (
    <Link href={`/talent/${expert.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className={cn(
          "group relative h-full bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]",
          featured && "border-cyan-500/30 shadow-[0_0_40px_rgba(168,85,247,0.1)]"
        )}
      >
        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-cyan-500/20 backdrop-blur-sm border border-cyan-500/30 rounded-full flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
            <span className="text-xs font-semibold text-cyan-300 font-diatype">Featured</span>
          </div>
        )}

        {/* Avatar */}
        <div className="relative h-64 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_70%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-white/10 flex items-center justify-center">
              <Users className="w-16 h-16 text-cyan-300/50" />
            </div>
          </div>

          {/* Availability Badge */}
          <div className={cn("absolute bottom-4 left-4 px-3 py-1.5 backdrop-blur-sm rounded-full flex items-center gap-2", availability.bg)}>
            <div className={cn("w-2 h-2 rounded-full animate-pulse", availability.color.replace('text-', 'bg-'))} />
            <span className={cn("text-xs font-semibold font-diatype", availability.color)}>{availability.label}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors font-gendy">{expert.name}</h3>
          <p className="text-cyan-400 text-sm mb-3 font-diatype">{expert.title}</p>

          <p className="text-gray-400 text-sm mb-4 line-clamp-2 font-diatype">{expert.tagline}</p>

          {/* Impact Metrics - Compact */}
          <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-white/5">
            <div>
              <div className="text-2xl font-bold text-white font-gendy">{expert.adaptabilityImpact.transformationSuccessRate}%</div>
              <div className="text-xs text-gray-500 font-diatype">Success Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-gendy">{expert.adaptabilityImpact.behaviorChangeScore}%</div>
              <div className="text-xs text-gray-500 font-diatype">Behavior Change</div>
            </div>
          </div>

          {/* Expertise Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {expert.expertise.slice(0, 2).map((exp, i) => (
              <span key={i} className="px-2 py-1 bg-cyan-500/10 text-cyan-300 text-xs rounded-md border border-cyan-500/20 font-diatype">
                {exp}
              </span>
            ))}
            {expert.expertise.length > 2 && (
              <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-md font-diatype">+{expert.expertise.length - 2}</span>
            )}
          </div>

          {/* Pricing & CTA */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 font-diatype">Starting at</div>
              <div className="text-lg font-bold text-white font-gendy">${expert.hourlyRate}/hr</div>
            </div>
            <div className="flex items-center gap-2 text-cyan-400 group-hover:text-cyan-300 transition-colors">
              <span className="text-sm font-semibold font-diatype">View Profile</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
