'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  X,
  Grid3x3,
  List,
  Sparkles,
  TrendingUp,
  Award,
  Users,
  ChevronDown,
} from 'lucide-react'
import { TalentCard, TalentProfile } from './TalentCard'
import { mockTalent } from '@/lib/data/mock-talent'
import { cn } from '@/utils/cn'
import { typography, spacing } from '@/lib/design-system'

type AvailabilityFilter = 'all' | TalentProfile['availability']
type CoachingStyleFilter = 'all' | TalentProfile['focusAreas']['coachingStyle']
type ViewMode = 'grid' | 'list'
type SortBy =
  | 'transformationSuccess'
  | 'behaviorChange'
  | 'clientRetention'
  | 'hourlyRate'
  | 'rating'

// Define filter options
const EXPERTISE_OPTIONS = [
  'AI Strategy & Implementation',
  'Cultural Transformation',
  'Change Leadership',
  'Executive Coaching',
  'Manufacturing Transformation',
  'Healthcare AI Ethics',
  'Leadership Development',
  'Organizational Culture',
  'Customer Experience',
  'Team Coaching',
]

const INDUSTRY_OPTIONS = [
  'Technology',
  'Finance',
  'Healthcare',
  'Manufacturing',
  'Retail',
  'Education',
  'Government',
  'Consulting',
  'Media',
  'Energy',
]

const TRANSFORMATION_STAGES = [
  { value: 'assess', label: 'Assess' },
  { value: 'reframe', label: 'Reframe' },
  { value: 'embed', label: 'Embed' },
  { value: 'scale', label: 'Scale' },
] as const

export function TalentMarketplace() {
  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [selectedStages, setSelectedStages] = useState<string[]>([])
  const [coachingStyleFilter, setCoachingStyleFilter] =
    useState<CoachingStyleFilter>('all')
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('transformationSuccess')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort talent
  const filteredTalent = useMemo(() => {
    let filtered = mockTalent.filter((talent) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.expertise.some((exp) =>
          exp.toLowerCase().includes(searchQuery.toLowerCase())
        )

      // Expertise filter
      const matchesExpertise =
        selectedExpertise.length === 0 ||
        selectedExpertise.some((exp) => talent.expertise.includes(exp))

      // Industries filter
      const matchesIndustries =
        selectedIndustries.length === 0 ||
        selectedIndustries.some((ind) => talent.focusAreas.industries.includes(ind))

      // Transformation stages filter
      const matchesStages =
        selectedStages.length === 0 ||
        selectedStages.some((stage) =>
          talent.focusAreas.transformationStages.includes(
            stage as 'assess' | 'reframe' | 'embed' | 'scale'
          )
        )

      // Coaching style filter
      const matchesCoachingStyle =
        coachingStyleFilter === 'all' ||
        talent.focusAreas.coachingStyle === coachingStyleFilter

      // Availability filter
      const matchesAvailability =
        availabilityFilter === 'all' || talent.availability === availabilityFilter

      return (
        matchesSearch &&
        matchesExpertise &&
        matchesIndustries &&
        matchesStages &&
        matchesCoachingStyle &&
        matchesAvailability
      )
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'transformationSuccess':
          return (
            b.adaptabilityImpact.transformationSuccessRate -
            a.adaptabilityImpact.transformationSuccessRate
          )
        case 'behaviorChange':
          return (
            b.adaptabilityImpact.behaviorChangeScore -
            a.adaptabilityImpact.behaviorChangeScore
          )
        case 'clientRetention':
          return (
            b.adaptabilityImpact.clientRetentionRate -
            a.adaptabilityImpact.clientRetentionRate
          )
        case 'hourlyRate':
          return a.hourlyRate - b.hourlyRate
        case 'rating':
          return b.rating - a.rating
        default:
          return 0
      }
    })

    return filtered
  }, [
    searchQuery,
    selectedExpertise,
    selectedIndustries,
    selectedStages,
    coachingStyleFilter,
    availabilityFilter,
    sortBy,
  ])

  // Featured experts (top 3 by transformation success)
  const featuredExperts = useMemo(() => {
    return mockTalent
      .filter((t) => t.availability !== 'booked')
      .sort(
        (a, b) =>
          b.adaptabilityImpact.transformationSuccessRate -
          a.adaptabilityImpact.transformationSuccessRate
      )
      .slice(0, 3)
  }, [])

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedExpertise([])
    setSelectedIndustries([])
    setSelectedStages([])
    setCoachingStyleFilter('all')
    setAvailabilityFilter('all')
  }

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedExpertise.length > 0 ||
    selectedIndustries.length > 0 ||
    selectedStages.length > 0 ||
    coachingStyleFilter !== 'all' ||
    availabilityFilter !== 'all'

  // Toggle filter helpers
  const toggleExpertise = (expertise: string) => {
    setSelectedExpertise((prev) =>
      prev.includes(expertise)
        ? prev.filter((e) => e !== expertise)
        : [...prev, expertise]
    )
  }

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry) ? prev.filter((i) => i !== industry) : [...prev, industry]
    )
  }

  const toggleStage = (stage: string) => {
    setSelectedStages((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section
        className={cn(
          'bg-gradient-to-br from-gray-900 via-cyan-900/20 to-gray-900',
          spacing.section.y
        )}
      >
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">
                Curated Transformation Experts
              </span>
            </motion.div>

            <h1 className={cn(typography.manifesto.h1, 'mb-6 text-white')}>
              Talent Marketplace
            </h1>

            <p className={cn(typography.body.xl, 'text-gray-300 mb-8')}>
              Connect with vetted experts who embed transformation, not just advise on it.
              These are transformation partners, not commodity freelancers.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <span>{filteredTalent.length} Verified Experts</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-400" />
                <span>85%+ Average Success Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>50,000+ Employees Transformed</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Experts */}
      {!hasActiveFilters && (
        <section className="py-12 bg-gray-900/50">
          <div className={spacing.container.wide}>
            <h2 className={cn(typography.heading.h3, 'text-white mb-8')}>
              Featured Transformation Experts
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {featuredExperts.map((expert) => (
                <TalentCard key={expert.id} profile={expert} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search & Filter Section */}
      <section className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 py-6">
        <div className={spacing.container.wide}>
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-6">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, expertise, or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                data-testid="talent-search"
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

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Sort By */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="appearance-none pl-4 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer"
                  data-testid="talent-sort"
                >
                  <option value="transformationSuccess">Transformation Success</option>
                  <option value="behaviorChange">Behavior Change Score</option>
                  <option value="clientRetention">Client Retention</option>
                  <option value="rating">Rating</option>
                  <option value="hourlyRate">Hourly Rate</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Filter Toggle (Mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'lg:hidden px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2',
                  showFilters
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                )}
                data-testid="filter-toggle"
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                )}
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-800 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    viewMode === 'grid'
                      ? 'bg-cyan-500 text-white'
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
                      ? 'bg-cyan-500 text-white'
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
          <div className="hidden lg:grid grid-cols-1 gap-6">
            {/* Row 1: Availability, Coaching Style, Transformation Stages */}
            <div className="flex flex-wrap items-center gap-6">
              {/* Availability */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-400">Availability:</span>
                <div className="flex gap-2">
                  <FilterButton
                    active={availabilityFilter === 'all'}
                    onClick={() => setAvailabilityFilter('all')}
                    data-testid="filter-availability-all"
                  >
                    All
                  </FilterButton>
                  <FilterButton
                    active={availabilityFilter === 'available'}
                    onClick={() => setAvailabilityFilter('available')}
                    variant="green"
                    data-testid="filter-availability-available"
                  >
                    Available
                  </FilterButton>
                  <FilterButton
                    active={availabilityFilter === 'limited'}
                    onClick={() => setAvailabilityFilter('limited')}
                    variant="amber"
                    data-testid="filter-availability-limited"
                  >
                    Limited
                  </FilterButton>
                </div>
              </div>

              {/* Coaching Style */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-400">Style:</span>
                <div className="flex gap-2">
                  <FilterButton
                    active={coachingStyleFilter === 'all'}
                    onClick={() => setCoachingStyleFilter('all')}
                  >
                    All
                  </FilterButton>
                  <FilterButton
                    active={coachingStyleFilter === 'directive'}
                    onClick={() => setCoachingStyleFilter('directive')}
                    variant="cyan"
                  >
                    Directive
                  </FilterButton>
                  <FilterButton
                    active={coachingStyleFilter === 'facilitative'}
                    onClick={() => setCoachingStyleFilter('facilitative')}
                    variant="cyan"
                  >
                    Facilitative
                  </FilterButton>
                  <FilterButton
                    active={coachingStyleFilter === 'hybrid'}
                    onClick={() => setCoachingStyleFilter('hybrid')}
                    variant="cyan"
                  >
                    Hybrid
                  </FilterButton>
                </div>
              </div>

              {/* Transformation Stages */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-400">Stages:</span>
                <div className="flex gap-2">
                  {TRANSFORMATION_STAGES.map((stage) => (
                    <FilterButton
                      key={stage.value}
                      active={selectedStages.includes(stage.value)}
                      onClick={() => toggleStage(stage.value)}
                      variant="cyan"
                      data-testid={`filter-stage-${stage.value}`}
                    >
                      {stage.label}
                    </FilterButton>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Expertise (scrollable) */}
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium text-gray-400 pt-2">Expertise:</span>
              <div className="flex-1 flex flex-wrap gap-2">
                {EXPERTISE_OPTIONS.map((expertise) => (
                  <FilterButton
                    key={expertise}
                    active={selectedExpertise.includes(expertise)}
                    onClick={() => toggleExpertise(expertise)}
                    variant="cyan"
                    data-testid={`filter-expertise-${expertise}`}
                  >
                    {expertise}
                  </FilterButton>
                ))}
              </div>
            </div>

            {/* Row 3: Industries (scrollable) */}
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium text-gray-400 pt-2">Industries:</span>
              <div className="flex-1 flex flex-wrap gap-2">
                {INDUSTRY_OPTIONS.map((industry) => (
                  <FilterButton
                    key={industry}
                    active={selectedIndustries.includes(industry)}
                    onClick={() => toggleIndustry(industry)}
                    variant="cyan"
                    data-testid={`filter-industry-${industry}`}
                  >
                    {industry}
                  </FilterButton>
                ))}
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
                  {/* Availability */}
                  <div>
                    <span className="text-sm font-medium text-gray-400 mb-3 block">
                      Availability:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <FilterButton
                        active={availabilityFilter === 'all'}
                        onClick={() => setAvailabilityFilter('all')}
                      >
                        All
                      </FilterButton>
                      <FilterButton
                        active={availabilityFilter === 'available'}
                        onClick={() => setAvailabilityFilter('available')}
                        variant="green"
                      >
                        Available
                      </FilterButton>
                      <FilterButton
                        active={availabilityFilter === 'limited'}
                        onClick={() => setAvailabilityFilter('limited')}
                        variant="amber"
                      >
                        Limited
                      </FilterButton>
                    </div>
                  </div>

                  {/* Coaching Style */}
                  <div>
                    <span className="text-sm font-medium text-gray-400 mb-3 block">
                      Coaching Style:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <FilterButton
                        active={coachingStyleFilter === 'all'}
                        onClick={() => setCoachingStyleFilter('all')}
                      >
                        All
                      </FilterButton>
                      <FilterButton
                        active={coachingStyleFilter === 'directive'}
                        onClick={() => setCoachingStyleFilter('directive')}
                        variant="cyan"
                      >
                        Directive
                      </FilterButton>
                      <FilterButton
                        active={coachingStyleFilter === 'facilitative'}
                        onClick={() => setCoachingStyleFilter('facilitative')}
                        variant="cyan"
                      >
                        Facilitative
                      </FilterButton>
                      <FilterButton
                        active={coachingStyleFilter === 'hybrid'}
                        onClick={() => setCoachingStyleFilter('hybrid')}
                        variant="cyan"
                      >
                        Hybrid
                      </FilterButton>
                    </div>
                  </div>

                  {/* Transformation Stages */}
                  <div>
                    <span className="text-sm font-medium text-gray-400 mb-3 block">
                      Transformation Stages:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {TRANSFORMATION_STAGES.map((stage) => (
                        <FilterButton
                          key={stage.value}
                          active={selectedStages.includes(stage.value)}
                          onClick={() => toggleStage(stage.value)}
                          variant="cyan"
                        >
                          {stage.label}
                        </FilterButton>
                      ))}
                    </div>
                  </div>

                  {/* Expertise */}
                  <div>
                    <span className="text-sm font-medium text-gray-400 mb-3 block">
                      Expertise:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {EXPERTISE_OPTIONS.map((expertise) => (
                        <FilterButton
                          key={expertise}
                          active={selectedExpertise.includes(expertise)}
                          onClick={() => toggleExpertise(expertise)}
                          variant="cyan"
                        >
                          {expertise}
                        </FilterButton>
                      ))}
                    </div>
                  </div>

                  {/* Industries */}
                  <div>
                    <span className="text-sm font-medium text-gray-400 mb-3 block">
                      Industries:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {INDUSTRY_OPTIONS.map((industry) => (
                        <FilterButton
                          key={industry}
                          active={selectedIndustries.includes(industry)}
                          onClick={() => toggleIndustry(industry)}
                          variant="cyan"
                        >
                          {industry}
                        </FilterButton>
                      ))}
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
              <span className="font-semibold text-white">{filteredTalent.length}</span>{' '}
              {filteredTalent.length === 1 ? 'expert' : 'experts'}
              {hasActiveFilters && ' (filtered)'}
            </p>
          </div>

          {/* Talent Grid */}
          {filteredTalent.length > 0 ? (
            <div
              className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8'
                  : 'flex flex-col gap-8 max-w-4xl mx-auto'
              )}
              data-testid="talent-grid"
            >
              <AnimatePresence mode="popLayout">
                {filteredTalent.map((talent) => (
                  <TalentCard key={talent.id} profile={talent} />
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
                No experts found
              </h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your filters or search query
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 rounded-full bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition-all"
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
  variant?: 'default' | 'cyan' | 'green' | 'amber'
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
    purple: active
      ? 'bg-cyan-500 text-white'
      : 'bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/20',
    green: active
      ? 'bg-green-500 text-white'
      : 'bg-green-500/10 text-green-300 hover:bg-green-500/20 border border-green-500/20',
    amber: active
      ? 'bg-amber-500 text-white'
      : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20',
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
