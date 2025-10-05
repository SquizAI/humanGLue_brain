'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  Users,
  Search,
  Star,
  Building2,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  Target,
  MapPin,
  Award,
  TrendingUp,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
import { BookmarkButton } from '@/components/molecules/BookmarkButton'
import { ShareButton } from '@/components/molecules/ShareButton'
import { cn } from '@/utils/cn'

// Clean, realistic expert data
const experts = [
  {
    id: 1,
    name: 'Sarah Chen',
    title: 'AI Strategy & Transformation',
    location: 'San Francisco, CA',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    expertise: ['AI Strategy', 'Change Management', 'Executive Coaching'],
    industries: ['Technology', 'Finance', 'Healthcare'],
    rating: 4.9,
    reviews: 38,
    yearsExp: 15,
    hourlyRate: 650,
    availability: 'limited',
    bio: 'Leading Fortune 500 organizations through AI-driven cultural transformation with proven frameworks.',
  },
  {
    id: 2,
    name: 'Marcus Thompson',
    title: 'Manufacturing & Operations AI',
    location: 'Detroit, MI',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    expertise: ['Process Optimization', 'Workforce Training', 'Lean AI'],
    industries: ['Manufacturing', 'Automotive', 'Logistics'],
    rating: 4.8,
    reviews: 29,
    yearsExp: 12,
    hourlyRate: 450,
    availability: 'available',
    bio: 'Embedding sustainable behavior change in manufacturing through AI-assisted production.',
  },
  {
    id: 3,
    name: 'Priya Patel',
    title: 'Healthcare AI Ethics',
    location: 'Boston, MA',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
    expertise: ['Healthcare AI', 'Clinical Workflow', 'Ethics & Compliance'],
    industries: ['Healthcare', 'Biotech', 'Pharma'],
    rating: 4.9,
    reviews: 25,
    yearsExp: 10,
    hourlyRate: 550,
    availability: 'available',
    bio: 'Humanizing AI adoption in clinical settings while maintaining the human touch in care.',
  },
  {
    id: 4,
    name: 'Kenji Yamamoto',
    title: 'Leadership Development',
    location: 'Seattle, WA',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    expertise: ['Executive Leadership', 'Decision Frameworks', 'Team Dynamics'],
    industries: ['Technology', 'Consulting', 'Finance'],
    rating: 4.7,
    reviews: 44,
    yearsExp: 18,
    hourlyRate: 700,
    availability: 'limited',
    bio: 'Building adaptive leadership capabilities for the AI era through strategic thinking.',
  },
  {
    id: 5,
    name: 'Aisha Mohamed',
    title: 'Culture Transformation',
    location: 'New York, NY',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop',
    expertise: ['Org Culture', 'Psychological Safety', 'Team Coaching'],
    industries: ['Media', 'Technology', 'Retail'],
    rating: 4.9,
    reviews: 32,
    yearsExp: 11,
    hourlyRate: 525,
    availability: 'available',
    bio: 'Creating psychologically safe environments for AI experimentation and innovation.',
  },
  {
    id: 6,
    name: 'Carlos Rivera',
    title: 'Retail & Customer Experience',
    location: 'Austin, TX',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
    expertise: ['Customer Experience', 'Frontline Training', 'Service Design'],
    industries: ['Retail', 'Hospitality', 'E-commerce'],
    rating: 4.6,
    reviews: 21,
    yearsExp: 9,
    hourlyRate: 400,
    availability: 'available',
    bio: 'Transforming frontline teams to deliver AI-enhanced service without losing personal touch.',
  },
]

export default function TalentMarketplace() {
  const router = useRouter()
  const { userData } = useChat()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'limited'>('all')
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'rate'>('rating')

  // Filter and sort
  const filteredExperts = useMemo(() => {
    let filtered = experts.filter((expert) => {
      const matchesSearch =
        searchQuery === '' ||
        expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expert.expertise.some((exp) => exp.toLowerCase().includes(searchQuery.toLowerCase())) ||
        expert.title.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesExpertise =
        selectedExpertise.length === 0 ||
        selectedExpertise.some((exp) => expert.expertise.some(e => e.includes(exp)))

      const matchesIndustries =
        selectedIndustries.length === 0 ||
        selectedIndustries.some((ind) => expert.industries.includes(ind))

      const matchesAvailability =
        availabilityFilter === 'all' ||
        expert.availability === availabilityFilter

      return matchesSearch && matchesExpertise && matchesIndustries && matchesAvailability
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'experience':
          return b.yearsExp - a.yearsExp
        case 'rate':
          return a.hourlyRate - b.hourlyRate
        default:
          return 0
      }
    })

    return filtered
  }, [searchQuery, selectedExpertise, selectedIndustries, availabilityFilter, sortBy])

  useEffect(() => {
    if (!userData || !userData.authenticated) {
      router.push('/login')
    }
  }, [userData, router])

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  if (!userData || !userData.authenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="ml-0 lg:ml-[var(--sidebar-width,280px)] transition-all">
        <div className="px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white font-gendy">
                    Expert Network
                  </h1>
                  <p className="text-sm sm:text-base text-gray-400 mt-1 font-diatype">
                    Vetted AI transformation specialists for staff augmentation
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{experts.length}</div>
                    <div className="text-xs text-gray-400">Active Experts</div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Award className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">4.8</div>
                    <div className="text-xs text-gray-400">Avg Rating</div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Target className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">12</div>
                    <div className="text-xs text-gray-400">Industries</div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">95%</div>
                    <div className="text-xs text-gray-400">Client Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, expertise, or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                />
              </div>

              {/* Sort */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="experience">Most Experience</option>
                  <option value="rate">Lowest Rate</option>
                </select>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-gray-400 py-2">Expertise:</span>
                {['AI Strategy', 'Change Management', 'Data Science', 'Leadership'].map((exp) => (
                  <button
                    key={exp}
                    onClick={() => {
                      if (selectedExpertise.includes(exp)) {
                        setSelectedExpertise(selectedExpertise.filter(e => e !== exp))
                      } else {
                        setSelectedExpertise([...selectedExpertise, exp])
                      }
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                      selectedExpertise.includes(exp)
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                    )}
                  >
                    {exp}
                  </button>
                ))}
                <span className="text-xs text-gray-400 py-2 ml-4">Availability:</span>
                {[
                  { value: 'all', label: 'All' },
                  { value: 'available', label: 'Available' },
                  { value: 'limited', label: 'Limited' },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setAvailabilityFilter(filter.value as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                      availabilityFilter === filter.value
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Showing <span className="text-white font-semibold">{filteredExperts.length}</span> expert{filteredExperts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Expert Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredExperts.map((expert, index) => (
              <motion.div
                key={expert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/30 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]"
              >
                {/* Social Actions - Top Right */}
                <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <BookmarkButton
                    item={{
                      id: expert.id.toString(),
                      type: 'expert',
                      name: expert.name,
                      image: expert.image,
                      metadata: {
                        expertise: expert.expertise.join(', '),
                        hourlyRate: expert.hourlyRate,
                        rating: expert.rating,
                      }
                    }}
                    variant="icon-only"
                  />
                  <ShareButton
                    id={expert.id.toString()}
                    type="expert"
                    title={expert.name}
                    description={expert.bio}
                    variant="icon-only"
                    showCount={false}
                  />
                </div>

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <Image
                        src={expert.image}
                        alt={expert.name}
                        width={64}
                        height={64}
                        className="rounded-xl object-cover"
                      />
                      <div className={cn(
                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900",
                        expert.availability === 'available' ? 'bg-green-500' : 'bg-amber-500'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-1 font-gendy truncate">
                        {expert.name}
                      </h3>
                      <p className="text-sm text-gray-400 font-diatype mb-2">
                        {expert.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {expert.location}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2 font-diatype">
                    {expert.bio}
                  </p>

                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {expert.expertise.map((exp, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-purple-500/10 text-purple-300 text-xs rounded-full border border-purple-500/20"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-base font-bold text-white">{expert.rating}</span>
                      </div>
                      <div className="text-xs text-gray-500">{expert.reviews} reviews</div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-blue-400 mb-0.5">
                        {expert.yearsExp}+
                      </div>
                      <div className="text-xs text-gray-500">Years Exp</div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-green-400 mb-0.5">
                        ${expert.hourlyRate}
                      </div>
                      <div className="text-xs text-gray-500">/hour</div>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link href={`/dashboard/talent/${expert.id}`}>
                    <motion.button
                      whileHover={{ x: 4 }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold text-sm group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all"
                    >
                      View Profile
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredExperts.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-gendy">No experts found</h3>
              <p className="text-gray-400 font-diatype mb-6">
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedExpertise([])
                  setSelectedIndustries([])
                  setAvailabilityFilter('all')
                }}
                className="px-6 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
