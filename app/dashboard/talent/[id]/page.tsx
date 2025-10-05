'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  ArrowLeft,
  Star,
  MapPin,
  Briefcase,
  Award,
  CheckCircle2,
  Calendar,
  Mail,
  GraduationCap,
  Users,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
import { cn } from '@/utils/cn'
import Link from 'next/link'

// Expert data (same as main page - in production from API/database)
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
    fullBio: 'Sarah Chen is a renowned AI transformation strategist with over 15 years of experience helping Fortune 500 companies navigate the complexities of AI adoption. Her proven frameworks focus on human-centric change management, ensuring that technology serves people, not the other way around.',
    achievements: [
      'Led AI transformation for 47+ Fortune 500 companies',
      'Reduced change resistance by average of 70%',
      'Accelerated transformation timelines by 6 months average',
      'Published 3 books on AI leadership',
    ],
    testimonials: [
      {
        client: 'James Rodriguez',
        title: 'CTO',
        company: 'Global Tech Inc.',
        quote: "Sarah transformed our 5,000-person organization's approach to AI adoption. Her strategic framework reduced resistance by 70%.",
        rating: 5,
      },
    ],
    certifications: [
      'Certified Change Management Professional (CCMP)',
      'AI Strategy Executive Certificate - MIT',
      'ICF Certified Executive Coach',
    ],
    languages: ['English', 'Mandarin', 'Spanish'],
    education: [
      'PhD Organizational Psychology - Stanford',
      'MBA - Harvard Business School',
    ],
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
    fullBio: 'Marcus Thompson specializes in bringing AI to the manufacturing floor without disrupting operations. With 12 years of hands-on experience, he has developed a unique approach combining Lean with AI-powered insights.',
    achievements: [
      'Trained 8,500+ factory workers in AI-assisted production',
      'Achieved 100% workforce retention during AI transitions',
      'Improved production efficiency by 30% average',
    ],
    testimonials: [
      {
        client: 'Linda Martinez',
        title: 'COO',
        company: 'AutoMakers United',
        quote: 'Marcus helped us transition 2,000 factory workers to AI-assisted production without a single layoff.',
        rating: 5,
      },
    ],
    certifications: [
      'Lean Six Sigma Black Belt',
      'AI for Manufacturing - Georgia Tech',
    ],
    languages: ['English'],
    education: [
      'MS Industrial Engineering - University of Michigan',
    ],
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
    fullBio: 'Dr. Priya Patel brings clinical expertise and AI strategy to healthcare organizations, focusing on ethical deployment while preserving the human connection in care.',
    achievements: [
      'Helped 800+ physicians embrace AI diagnostics',
      'Improved diagnostic accuracy by 40% average',
      'Maintained 100% HIPAA compliance',
    ],
    testimonials: [
      {
        client: 'Dr. Michael Chen',
        title: 'CMO',
        company: 'Northeast Health Systems',
        quote: 'Priya helped our physicians embrace AI diagnostics while maintaining the human touch.',
        rating: 5,
      },
    ],
    certifications: [
      'MD - Johns Hopkins',
      'Healthcare AI Ethics - Harvard',
    ],
    languages: ['English', 'Hindi'],
    education: [
      'MD - Johns Hopkins School of Medicine',
    ],
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
    fullBio: 'Kenji Yamamoto is a globally recognized leadership development expert who has coached C-suite executives across three continents.',
    achievements: [
      'Coached 200+ C-suite executives',
      'Transformed leadership at 62 organizations',
      '3x faster decision-making achieved',
    ],
    testimonials: [
      {
        client: 'Amanda Foster',
        title: 'CEO',
        company: 'Strategic Advisors Group',
        quote: "Kenji's framework transformed our C-suite's approach to AI decision-making.",
        rating: 5,
      },
    ],
    certifications: [
      'ICF Master Certified Coach (MCC)',
      'Executive Leadership - INSEAD',
    ],
    languages: ['English', 'Japanese'],
    education: [
      'MBA - INSEAD',
    ],
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
    fullBio: 'Aisha Mohamed helps organizations build psychological safety needed for AI innovation, grounded in neuroscience and behavioral psychology.',
    achievements: [
      'Built safety frameworks for 39 organizations',
      'Increased employee engagement by 45% average',
      'Reduced AI adoption fear by 60%',
    ],
    testimonials: [
      {
        client: 'Robert Kim',
        title: 'CPO',
        company: 'Digital Media Corp',
        quote: 'Aisha created a culture where employees went from fearing AI to championing it.',
        rating: 5,
      },
    ],
    certifications: [
      'Organizational Development - Columbia',
      'Neuroscience of Change - NeuroLeadership',
    ],
    languages: ['English', 'Arabic', 'French'],
    education: [
      'MA Organizational Psychology - Columbia',
    ],
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
    fullBio: 'Carlos Rivera brings AI to customer-facing teams ensuring technology enhances rather than replaces human connection.',
    achievements: [
      'Trained 11,000+ frontline employees',
      'Increased customer satisfaction by 25% average',
      'Reduced training time by 40%',
    ],
    testimonials: [
      {
        client: 'Jessica Wu',
        title: 'VP CX',
        company: 'Retail Innovations',
        quote: 'Carlos trained 3,000 associates to use AI without losing our personal touch.',
        rating: 5,
      },
    ],
    certifications: [
      'Customer Experience Professional (CCXP)',
      'Service Design - Stanford',
    ],
    languages: ['English', 'Spanish'],
    education: [
      'MBA - UT Austin',
    ],
  },
]

export default function ExpertProfile() {
  const router = useRouter()
  const params = useParams()
  const { userData } = useChat()
  const expertId = parseInt(params.id as string)
  const expert = experts.find(e => e.id === expertId)

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

  if (!expert) {
    return (
      <div className="min-h-screen bg-gray-950">
        <DashboardSidebar onLogout={handleLogout} />
        <div className="ml-0 lg:ml-[var(--sidebar-width,280px)] transition-all">
          <div className="px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Expert not found</h3>
              <Link href="/dashboard/talent">
                <button className="mt-4 px-6 py-2 bg-purple-500/20 text-purple-300 rounded-lg">
                  Back to Expert Network
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />
      <div className="ml-0 lg:ml-[var(--sidebar-width,280px)] transition-all">
        <div className="px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-6xl mx-auto">
          <Link href="/dashboard/talent">
            <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Expert Network
            </button>
          </Link>

          {/* Header */}
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative">
                <Image
                  src={expert.image}
                  alt={expert.name}
                  width={160}
                  height={160}
                  className="rounded-2xl object-cover"
                />
                <div className={cn(
                  "absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-gray-900",
                  expert.availability === 'available' ? 'bg-green-500' : 'bg-amber-500'
                )} />
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{expert.name}</h1>
                <p className="text-xl text-gray-300 mb-3">{expert.title}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {expert.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {expert.yearsExp}+ years
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-white font-semibold">{expert.rating}</span>
                    <span>({expert.reviews} reviews)</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {expert.expertise.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-purple-500/10 text-purple-300 text-sm rounded-full border border-purple-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-3xl font-bold text-green-400">${expert.hourlyRate}</div>
                    <div className="text-sm text-gray-400">per hour</div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Request Consultation
                  </motion.button>
                  <button className="px-6 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">About</h2>
                <p className="text-gray-300">{expert.fullBio}</p>
              </div>

              <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Key Achievements</h2>
                <ul className="space-y-3">
                  {expert.achievements.map((achievement, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Client Testimonials</h2>
                {expert.testimonials.map((t, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-5 border border-white/10">
                    <div className="flex gap-1 mb-3">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-gray-300 italic mb-4">"{t.quote}"</p>
                    <div className="text-white font-semibold">{t.client}</div>
                    <div className="text-sm text-gray-400">{t.title}, {t.company}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Industries</h3>
                <div className="flex flex-wrap gap-2">
                  {expert.industries.map((ind, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-blue-500/10 text-blue-300 text-sm rounded-full border border-blue-500/20"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Certifications</h3>
                <ul className="space-y-2">
                  {expert.certifications.map((cert, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Award className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Education</h3>
                <ul className="space-y-2">
                  {expert.education.map((edu, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{edu}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {expert.languages.map((lang, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-green-500/10 text-green-300 text-sm rounded-full border border-green-500/20"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
