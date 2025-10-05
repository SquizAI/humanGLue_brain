'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, Grid3x3, List, Sparkles } from 'lucide-react'
import { WorkshopCard, Workshop } from './WorkshopCard'
import { mockWorkshops } from '@/lib/data/mock-workshops'
import { cn } from '@/utils/cn'
import { typography, spacing } from '@/lib/design-system'

type PillarFilter = 'all' | Workshop['pillar']
type LevelFilter = 'all' | Workshop['level']
type ViewMode = 'grid' | 'list'

export function WorkshopsCatalog() {
  const [searchQuery, setSearchQuery] = useState('')
  const [pillarFilter, setPillarFilter] = useState<PillarFilter>('all')
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Filter workshops based on search and filters
  const filteredWorkshops = useMemo(() => {
    return mockWorkshops.filter((workshop) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        workshop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workshop.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workshop.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )

      // Pillar filter
      const matchesPillar =
        pillarFilter === 'all' || workshop.pillar === pillarFilter

      // Level filter
      const matchesLevel = levelFilter === 'all' || workshop.level === levelFilter

      return matchesSearch && matchesPillar && matchesLevel
    })
  }, [searchQuery, pillarFilter, levelFilter])

  // Get filter counts
  const filterCounts = useMemo(() => {
    const counts = {
      pillars: {
        adaptability: 0,
        coaching: 0,
        marketplace: 0,
      },
      levels: {
        beginner: 0,
        intermediate: 0,
        advanced: 0,
      },
    }

    filteredWorkshops.forEach((workshop) => {
      counts.pillars[workshop.pillar]++
      counts.levels[workshop.level]++
    })

    return counts
  }, [filteredWorkshops])

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setPillarFilter('all')
    setLevelFilter('all')
  }

  const hasActiveFilters =
    searchQuery !== '' || pillarFilter !== 'all' || levelFilter !== 'all'

  // Featured workshop (first one in the list)
  const featuredWorkshop = mockWorkshops.find(
    (w) => w.id === 'coach-102' // The featured one
  )

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className={cn('bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900', spacing.section.y)}>
        <div className={spacing.container.wide}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">
                Transform Your Skills for the AI Era
              </span>
            </motion.div>

            <h1 className={cn(typography.manifesto.h1, 'mb-6 text-white')}>
              Workshop Catalog
            </h1>

            <p className={cn(typography.body.xl, 'text-gray-300 mb-8')}>
              Build the skills you need to thrive in an AI-augmented world. Expert-led
              workshops on adaptability, coaching, and marketplace success.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>{filterCounts.pillars.adaptability} Adaptability</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span>{filterCounts.pillars.coaching} Coaching</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span>{filterCounts.pillars.marketplace} Marketplace</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Workshop */}
      {featuredWorkshop && !hasActiveFilters && (
        <section className="py-12 bg-gray-900/50">
          <div className={spacing.container.wide}>
            <h2 className={cn(typography.heading.h3, 'text-white mb-8')}>
              Featured Workshop
            </h2>
            <WorkshopCard workshop={featuredWorkshop} variant="featured" />
          </div>
        </section>
      )}

      {/* Filters & Search Section */}
      <section className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 py-6">
        <div className={spacing.container.wide}>
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search workshops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                data-testid="workshop-search"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle & View Mode */}
            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'lg:hidden px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2',
                  showFilters
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                )}
                data-testid="filter-toggle"
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                )}
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-800 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    viewMode === 'grid'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  )}
                  aria-label="Grid view"
                  data-testid="view-grid"
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    viewMode === 'list'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  )}
                  aria-label="List view"
                  data-testid="view-list"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all flex items-center gap-2"
                  data-testid="clear-filters"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center gap-6 mt-6">
            {/* Pillar Filters */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-400">Pillar:</span>
              <div className="flex gap-2">
                <FilterButton
                  active={pillarFilter === 'all'}
                  onClick={() => setPillarFilter('all')}
                  data-testid="filter-pillar-all"
                >
                  All
                </FilterButton>
                <FilterButton
                  active={pillarFilter === 'adaptability'}
                  onClick={() => setPillarFilter('adaptability')}
                  variant="blue"
                  data-testid="filter-pillar-adaptability"
                >
                  Adaptability
                </FilterButton>
                <FilterButton
                  active={pillarFilter === 'coaching'}
                  onClick={() => setPillarFilter('coaching')}
                  variant="amber"
                  data-testid="filter-pillar-coaching"
                >
                  Coaching
                </FilterButton>
                <FilterButton
                  active={pillarFilter === 'marketplace'}
                  onClick={() => setPillarFilter('marketplace')}
                  variant="purple"
                  data-testid="filter-pillar-marketplace"
                >
                  Marketplace
                </FilterButton>
              </div>
            </div>

            {/* Level Filters */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-400">Level:</span>
              <div className="flex gap-2">
                <FilterButton
                  active={levelFilter === 'all'}
                  onClick={() => setLevelFilter('all')}
                  data-testid="filter-level-all"
                >
                  All
                </FilterButton>
                <FilterButton
                  active={levelFilter === 'beginner'}
                  onClick={() => setLevelFilter('beginner')}
                  data-testid="filter-level-beginner"
                >
                  Beginner
                </FilterButton>
                <FilterButton
                  active={levelFilter === 'intermediate'}
                  onClick={() => setLevelFilter('intermediate')}
                  data-testid="filter-level-intermediate"
                >
                  Intermediate
                </FilterButton>
                <FilterButton
                  active={levelFilter === 'advanced'}
                  onClick={() => setLevelFilter('advanced')}
                  data-testid="filter-level-advanced"
                >
                  Advanced
                </FilterButton>
              </div>
            </div>
          </div>

          {/* Mobile Filters Dropdown */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden overflow-hidden"
              >
                <div className="pt-6 space-y-6">
                  {/* Pillar Filters */}
                  <div>
                    <span className="text-sm font-medium text-gray-400 mb-3 block">
                      Pillar:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <FilterButton
                        active={pillarFilter === 'all'}
                        onClick={() => setPillarFilter('all')}
                      >
                        All
                      </FilterButton>
                      <FilterButton
                        active={pillarFilter === 'adaptability'}
                        onClick={() => setPillarFilter('adaptability')}
                        variant="blue"
                      >
                        Adaptability
                      </FilterButton>
                      <FilterButton
                        active={pillarFilter === 'coaching'}
                        onClick={() => setPillarFilter('coaching')}
                        variant="amber"
                      >
                        Coaching
                      </FilterButton>
                      <FilterButton
                        active={pillarFilter === 'marketplace'}
                        onClick={() => setPillarFilter('marketplace')}
                        variant="purple"
                      >
                        Marketplace
                      </FilterButton>
                    </div>
                  </div>

                  {/* Level Filters */}
                  <div>
                    <span className="text-sm font-medium text-gray-400 mb-3 block">
                      Level:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <FilterButton
                        active={levelFilter === 'all'}
                        onClick={() => setLevelFilter('all')}
                      >
                        All
                      </FilterButton>
                      <FilterButton
                        active={levelFilter === 'beginner'}
                        onClick={() => setLevelFilter('beginner')}
                      >
                        Beginner
                      </FilterButton>
                      <FilterButton
                        active={levelFilter === 'intermediate'}
                        onClick={() => setLevelFilter('intermediate')}
                      >
                        Intermediate
                      </FilterButton>
                      <FilterButton
                        active={levelFilter === 'advanced'}
                        onClick={() => setLevelFilter('advanced')}
                      >
                        Advanced
                      </FilterButton>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Results Section */}
      <section className={spacing.section.y}>
        <div className={spacing.container.wide}>
          {/* Results Count */}
          <div className="mb-8">
            <p className="text-gray-400">
              Showing{' '}
              <span className="font-semibold text-white">
                {filteredWorkshops.length}
              </span>{' '}
              {filteredWorkshops.length === 1 ? 'workshop' : 'workshops'}
              {hasActiveFilters && ' (filtered)'}
            </p>
          </div>

          {/* Workshop Grid */}
          {filteredWorkshops.length > 0 ? (
            <div
              className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 lg:grid-cols-2 gap-8'
                  : 'flex flex-col gap-8'
              )}
              data-testid="workshops-grid"
            >
              <AnimatePresence mode="popLayout">
                {filteredWorkshops.map((workshop) => (
                  <WorkshopCard key={workshop.id} workshop={workshop} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className={cn(typography.heading.h4, 'text-white mb-2')}>
                No workshops found
              </h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your filters or search query
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-all"
                >
                  Clear all filters
                </button>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}

// Filter Button Component
interface FilterButtonProps {
  active: boolean
  onClick: () => void
  variant?: 'default' | 'blue' | 'amber' | 'purple'
  children: React.ReactNode
  'data-testid'?: string
}

function FilterButton({
  active,
  onClick,
  variant = 'default',
  children,
  'data-testid': testId,
}: FilterButtonProps) {
  const variantClasses = {
    default: active
      ? 'bg-gray-700 text-white'
      : 'bg-gray-800 text-gray-400 hover:bg-gray-700',
    blue: active
      ? 'bg-blue-500 text-white'
      : 'bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border border-blue-500/20',
    amber: active
      ? 'bg-amber-500 text-white'
      : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20',
    purple: active
      ? 'bg-purple-500 text-white'
      : 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/20',
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-full text-sm font-medium transition-all',
        variantClasses[variant]
      )}
      data-testid={testId}
    >
      {children}
    </button>
  )
}
