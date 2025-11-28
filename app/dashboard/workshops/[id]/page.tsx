'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Star,
  Video,
  BookmarkPlus,
  Share2,
  CheckCircle2,
  PlayCircle,
  Award,
  Target,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'

const workshopData: Record<string, any> = {
  '1': {
    id: '1',
    title: 'AI Strategy Fundamentals',
    instructor: 'Dr. Sarah Chen',
    instructorTitle: 'AI Strategy Consultant & Former VP of AI at Google',
    instructorBio: 'Dr. Sarah Chen has over 15 years of experience leading AI transformation initiatives at Fortune 500 companies. She holds a Ph.D. in Computer Science from Stanford and has published extensively on AI implementation strategies.',
    instructorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    duration: '2h 30m',
    date: 'Nov 15, 2025',
    time: '2:00 PM EST',
    participants: 24,
    maxParticipants: 30,
    level: 'Beginner',
    category: 'Strategy',
    rating: 4.8,
    reviews: 156,
    price: 'Included in subscription',
    heroImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Master the fundamentals of AI strategy development and implementation. This comprehensive workshop will equip you with frameworks, tools, and real-world case studies to build an effective AI strategy for your organization.',
    whatYouWillLearn: [
      'Develop a comprehensive AI vision aligned with business objectives',
      'Assess your organization\'s AI readiness and maturity',
      'Identify high-value AI use cases and prioritize initiatives',
      'Build cross-functional AI teams and governance structures',
      'Create realistic roadmaps and measure ROI',
      'Navigate common pitfalls and implementation challenges'
    ],
    prerequisites: [
      'Basic understanding of business strategy',
      'No technical background required',
      'Familiarity with your organization\'s strategic objectives'
    ],
    agenda: [
      {
        time: '2:00 PM - 2:20 PM',
        title: 'Introduction & AI Landscape Overview',
        description: 'Current state of AI technology and business applications'
      },
      {
        time: '2:20 PM - 3:00 PM',
        title: 'AI Maturity Assessment Framework',
        description: 'Hands-on activity assessing your organization\'s AI readiness'
      },
      {
        time: '3:00 PM - 3:15 PM',
        title: 'Break',
        description: 'Networking and Q&A'
      },
      {
        time: '3:15 PM - 4:00 PM',
        title: 'Use Case Identification Workshop',
        description: 'Interactive session to identify AI opportunities in your business'
      },
      {
        time: '4:00 PM - 4:30 PM',
        title: 'Building Your AI Roadmap',
        description: 'Template-driven exercise to create your 12-month AI strategy'
      }
    ],
    keyTakeaways: [
      'AI Strategy Canvas template customized for your organization',
      'Use case prioritization framework with scoring model',
      'Stakeholder alignment toolkit',
      'ROI calculator for AI initiatives',
      'Access to exclusive AI strategy resource library',
      'Certificate of completion'
    ],
    testimonials: [
      {
        name: 'Michael Rodriguez',
        role: 'CTO, TechCorp',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
        quote: 'This workshop transformed how we approach AI. Dr. Chen\'s frameworks are immediately actionable and helped us identify $2M in AI opportunities within weeks.'
      },
      {
        name: 'Jennifer Kim',
        role: 'VP Innovation, RetailCo',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
        quote: 'The best AI strategy workshop I\'ve attended. Practical, insightful, and perfectly paced. Our team is now aligned on our AI vision.'
      }
    ]
  },
  '2': {
    id: '2',
    title: 'Building AI-Ready Teams',
    instructor: 'Marcus Williams',
    instructorTitle: 'Organizational Development Expert & AI Transformation Lead',
    instructorBio: 'Marcus Williams specializes in building high-performing AI teams. He has led transformation initiatives at Microsoft, Amazon, and numerous startups, focusing on culture change and skill development.',
    instructorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    duration: '3h',
    date: 'Nov 18, 2025',
    time: '10:00 AM EST',
    participants: 18,
    maxParticipants: 25,
    level: 'Intermediate',
    category: 'Leadership',
    rating: 4.9,
    reviews: 203,
    price: 'Included in subscription',
    heroImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Transform your workforce to embrace AI capabilities and drive innovation. Learn proven strategies to build, develop, and retain AI talent while fostering a culture of continuous learning.',
    whatYouWillLearn: [
      'Design AI-ready organizational structures',
      'Develop role-based AI competency frameworks',
      'Create effective upskilling and reskilling programs',
      'Build diverse and inclusive AI teams',
      'Foster psychological safety for AI experimentation',
      'Measure team performance and engagement in AI initiatives'
    ],
    prerequisites: [
      'Leadership or HR role',
      'Experience managing technical or cross-functional teams',
      'Understanding of organizational change principles'
    ],
    agenda: [
      {
        time: '10:00 AM - 10:30 AM',
        title: 'AI Team Archetypes & Structures',
        description: 'Overview of different AI team models and when to use each'
      },
      {
        time: '10:30 AM - 11:15 AM',
        title: 'Skills Assessment & Gap Analysis',
        description: 'Hands-on workshop to map current capabilities vs. future needs'
      },
      {
        time: '11:15 AM - 11:30 AM',
        title: 'Break',
        description: ''
      },
      {
        time: '11:30 AM - 12:15 PM',
        title: 'Building Learning Pathways',
        description: 'Design personalized AI learning journeys for different roles'
      },
      {
        time: '12:15 PM - 1:00 PM',
        title: 'Culture Change Strategies',
        description: 'Tactics to overcome resistance and build AI enthusiasm'
      }
    ],
    keyTakeaways: [
      'AI competency framework template',
      'Skills gap analysis toolkit',
      'Learning pathway builder',
      'Team charter templates',
      'Culture assessment survey',
      'Access to AI training resource database'
    ],
    testimonials: [
      {
        name: 'David Chen',
        role: 'CHRO, FinanceGlobal',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
        quote: 'Marcus provided exactly what we needed. Our team engagement scores jumped 35% after implementing his frameworks.'
      }
    ]
  },
  '3': {
    id: '3',
    title: 'AI Ethics & Governance',
    instructor: 'Dr. Emily Rodriguez',
    instructorTitle: 'AI Ethics Expert & Former Policy Director at OpenAI',
    instructorBio: 'Dr. Emily Rodriguez is a leading voice in AI ethics and governance. She holds a Ph.D. in Philosophy and has advised governments and Fortune 100 companies on responsible AI implementation. She previously led AI policy at OpenAI and has published over 40 papers on AI ethics.',
    instructorImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
    duration: '2h',
    date: 'Dec 5, 2025',
    time: '1:00 PM EST',
    participants: 30,
    maxParticipants: 30,
    level: 'Advanced',
    category: 'Ethics',
    rating: 5.0,
    reviews: 187,
    price: 'Included in subscription',
    heroImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Navigate the complex landscape of AI ethics and governance. Learn to build responsible AI systems that align with societal values while managing risk and ensuring compliance with emerging regulations.',
    whatYouWillLearn: [
      'Understand key ethical frameworks for AI decision-making',
      'Design governance structures for AI oversight',
      'Navigate GDPR, AI Act, and other regulatory requirements',
      'Identify and mitigate algorithmic bias and fairness issues',
      'Implement transparency and explainability standards',
      'Build stakeholder trust through ethical AI practices'
    ],
    prerequisites: [
      'Experience with AI implementation projects',
      'Understanding of organizational governance',
      'Familiarity with regulatory compliance concepts'
    ],
    agenda: [
      {
        time: '1:00 PM - 1:30 PM',
        title: 'Foundations of AI Ethics',
        description: 'Key ethical frameworks: consequentialism, deontology, and virtue ethics applied to AI'
      },
      {
        time: '1:30 PM - 2:15 PM',
        title: 'Regulatory Landscape & Compliance',
        description: 'Deep dive into GDPR, EU AI Act, and emerging global AI regulations'
      },
      {
        time: '2:15 PM - 2:30 PM',
        title: 'Break',
        description: ''
      },
      {
        time: '2:30 PM - 3:00 PM',
        title: 'Governance Framework Design',
        description: 'Hands-on workshop to build AI governance committees and decision processes'
      }
    ],
    keyTakeaways: [
      'AI Ethics Assessment Framework',
      'Governance charter template',
      'Regulatory compliance checklist',
      'Bias detection and mitigation toolkit',
      'Stakeholder communication playbook',
      'Access to AI ethics case study database'
    ],
    testimonials: [
      {
        name: 'Sarah Mitchell',
        role: 'Chief Ethics Officer, HealthTech Inc',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
        quote: 'Dr. Rodriguez\'s workshop gave us the frameworks we desperately needed. Our AI governance committee is now world-class.'
      },
      {
        name: 'Robert Zhang',
        role: 'Head of Compliance, BankCorp',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
        quote: 'The most comprehensive AI ethics training available. We\'ve implemented every framework from this workshop.'
      }
    ]
  },
  '4': {
    id: '4',
    title: 'Machine Learning for Business Leaders',
    instructor: 'James Taylor',
    instructorTitle: 'ML Educator & Former Data Science Lead at Netflix',
    instructorBio: 'James Taylor specializes in demystifying machine learning for business audiences. With a decade at Netflix leading recommendation systems, he excels at explaining complex ML concepts without technical jargon. He\'s trained over 5,000 executives worldwide.',
    instructorImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
    duration: '2h 45m',
    date: 'Dec 12, 2025',
    time: '3:00 PM EST',
    participants: 15,
    maxParticipants: 20,
    level: 'Beginner',
    category: 'Technical',
    rating: 4.7,
    reviews: 142,
    price: 'Included in subscription',
    heroImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Understand machine learning concepts and applications without the technical jargon. Build the ML literacy you need to make informed decisions about AI investments and initiatives.',
    whatYouWillLearn: [
      'Grasp fundamental ML concepts: supervised, unsupervised, reinforcement learning',
      'Understand when to use ML vs. traditional analytics',
      'Evaluate ML project feasibility and ROI',
      'Ask the right questions when working with data science teams',
      'Identify high-value ML use cases in your business',
      'Avoid common ML project pitfalls and failures'
    ],
    prerequisites: [
      'No technical background required',
      'Basic understanding of business analytics',
      'Curiosity about how ML works'
    ],
    agenda: [
      {
        time: '3:00 PM - 3:30 PM',
        title: 'ML Fundamentals Demystified',
        description: 'How ML actually works, explained with real-world analogies'
      },
      {
        time: '3:30 PM - 4:10 PM',
        title: 'ML Use Case Workshop',
        description: 'Interactive session identifying ML opportunities in your industry'
      },
      {
        time: '4:10 PM - 4:25 PM',
        title: 'Break',
        description: ''
      },
      {
        time: '4:25 PM - 5:05 PM',
        title: 'Evaluating ML Projects',
        description: 'Framework for assessing feasibility, cost, and expected value'
      },
      {
        time: '5:05 PM - 5:45 PM',
        title: 'Working with Data Scientists',
        description: 'Communication strategies and questions to ask your ML team'
      }
    ],
    keyTakeaways: [
      'ML literacy guide for executives',
      'Use case identification framework',
      'ML project evaluation scorecard',
      'Data science team collaboration guide',
      'ML terminology cheat sheet',
      'Certificate of completion'
    ],
    testimonials: [
      {
        name: 'Amanda Liu',
        role: 'COO, RetailChain',
        image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&q=80',
        quote: 'James made ML click for me. I can now have intelligent conversations with our data science team and make better investment decisions.'
      },
      {
        name: 'Thomas Green',
        role: 'VP Strategy, ManufacturingCo',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
        quote: 'Finally, an ML course that doesn\'t require a computer science degree. Incredibly practical and immediately useful.'
      }
    ]
  },
  '5': {
    id: '5',
    title: 'AI-Driven Process Automation',
    instructor: 'Lisa Anderson',
    instructorTitle: 'Process Automation Expert & Former McKinsey Partner',
    instructorBio: 'Lisa Anderson spent 12 years at McKinsey leading process transformation engagements. She\'s an expert in intelligent automation, having delivered over $500M in cost savings through AI-driven process optimization across industries.',
    instructorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    duration: '3h 30m',
    date: 'Jan 8, 2026',
    time: '11:00 AM EST',
    participants: 12,
    maxParticipants: 25,
    level: 'Intermediate',
    category: 'Operations',
    rating: 4.6,
    reviews: 98,
    price: 'Included in subscription',
    heroImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Identify and automate business processes using AI technologies. Learn to map processes, prioritize automation opportunities, and implement intelligent automation that delivers measurable ROI.',
    whatYouWillLearn: [
      'Map end-to-end business processes for automation readiness',
      'Distinguish between RPA, intelligent automation, and full AI',
      'Calculate ROI for automation initiatives',
      'Design human-in-the-loop workflows',
      'Select the right automation tools and vendors',
      'Manage change and adoption for automated processes'
    ],
    prerequisites: [
      'Understanding of business process management',
      'Experience with operational improvement',
      'Familiarity with process documentation'
    ],
    agenda: [
      {
        time: '11:00 AM - 11:40 AM',
        title: 'Process Automation Landscape',
        description: 'RPA vs. intelligent automation vs. AI - when to use each'
      },
      {
        time: '11:40 AM - 12:30 PM',
        title: 'Process Mapping Workshop',
        description: 'Hands-on exercise mapping processes for automation readiness'
      },
      {
        time: '12:30 PM - 12:45 PM',
        title: 'Break',
        description: ''
      },
      {
        time: '12:45 PM - 1:30 PM',
        title: 'ROI Calculation & Prioritization',
        description: 'Framework to calculate business case for automation projects'
      },
      {
        time: '1:30 PM - 2:15 PM',
        title: 'Implementation Strategies',
        description: 'Pilot design, vendor selection, and change management tactics'
      },
      {
        time: '2:15 PM - 2:30 PM',
        title: 'Q&A and Action Planning',
        description: 'Create your automation roadmap'
      }
    ],
    keyTakeaways: [
      'Process automation readiness assessment',
      'ROI calculator template',
      'Automation prioritization matrix',
      'Vendor evaluation framework',
      'Implementation playbook',
      'Change management toolkit'
    ],
    testimonials: [
      {
        name: 'Kevin Martinez',
        role: 'Director of Operations, LogisticsCorp',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
        quote: 'We automated 12 processes after this workshop, saving 3,200 hours per month. Lisa\'s frameworks are gold.'
      },
      {
        name: 'Rachel Foster',
        role: 'Process Excellence Lead, InsuranceGlobal',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80',
        quote: 'The most actionable automation training I\'ve experienced. Our ROI was positive within 90 days.'
      }
    ]
  },
  '6': {
    id: '6',
    title: 'Change Management for AI Transformation',
    instructor: 'Michael Chen',
    instructorTitle: 'Organizational Change Expert & Former Deloitte Principal',
    instructorBio: 'Michael Chen has led AI transformation change programs at 40+ organizations. With a background in organizational psychology and 14 years at Deloitte, he specializes in overcoming resistance and building enthusiasm for AI adoption.',
    instructorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    duration: '2h 15m',
    date: 'Jan 15, 2026',
    time: '2:30 PM EST',
    participants: 20,
    maxParticipants: 30,
    level: 'Intermediate',
    category: 'Leadership',
    rating: 4.8,
    reviews: 176,
    price: 'Included in subscription',
    heroImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Lead successful AI transformations through effective change management. Learn proven strategies to overcome resistance, build stakeholder buy-in, and sustain momentum through AI initiatives.',
    whatYouWillLearn: [
      'Apply change management frameworks to AI transformation',
      'Identify and engage key stakeholders and influencers',
      'Address fear and resistance to AI adoption',
      'Build coalition of AI champions across the organization',
      'Design communication plans for AI initiatives',
      'Measure and sustain change adoption over time'
    ],
    prerequisites: [
      'Leadership role or change management experience',
      'Involvement in organizational transformation',
      'Basic understanding of change management principles'
    ],
    agenda: [
      {
        time: '2:30 PM - 3:00 PM',
        title: 'AI Change Dynamics',
        description: 'Why AI transformation is different and what makes it challenging'
      },
      {
        time: '3:00 PM - 3:40 PM',
        title: 'Stakeholder Mapping & Engagement',
        description: 'Workshop to identify resistors, adopters, and champions'
      },
      {
        time: '3:40 PM - 3:50 PM',
        title: 'Break',
        description: ''
      },
      {
        time: '3:50 PM - 4:30 PM',
        title: 'Building Your Change Plan',
        description: 'Create communication strategy and intervention plan'
      },
      {
        time: '4:30 PM - 4:45 PM',
        title: 'Measuring Success',
        description: 'KPIs and feedback mechanisms for change initiatives'
      }
    ],
    keyTakeaways: [
      'AI change management playbook',
      'Stakeholder analysis template',
      'Communication plan framework',
      'Resistance management toolkit',
      'Champion network guide',
      'Change metrics dashboard'
    ],
    testimonials: [
      {
        name: 'Patricia Wilson',
        role: 'SVP HR, PharmaCorp',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
        quote: 'Michael\'s change frameworks turned our struggling AI initiative into a success story. Adoption rate went from 23% to 87%.'
      },
      {
        name: 'Daniel Kim',
        role: 'Transformation Director, EnergyGlobal',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&q=80',
        quote: 'The stakeholder mapping exercise alone was worth the price of admission. Essential training for any AI transformation leader.'
      }
    ]
  }
}

export default function WorkshopDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { userData } = useChat()
  const workshopId = params.id as string

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

  const workshop = workshopData[workshopId] || workshopData['1']

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all">
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard/workshops">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-purple-500/30 transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </motion.button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-white font-gendy">
                    {workshop.title}
                  </h1>
                  <p className="text-gray-400 font-diatype text-sm">
                    with {workshop.instructor}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 hover:border-purple-500/30 transition-all inline-flex items-center gap-2 font-diatype"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 hover:border-purple-500/30 transition-all"
                >
                  <BookmarkPlus className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative h-[400px] rounded-2xl overflow-hidden"
              >
                <Image
                  src={workshop.heroImage}
                  alt={workshop.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
                <div className="absolute bottom-6 left-6 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm font-semibold font-diatype">
                    {workshop.category}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-semibold font-diatype">
                    {workshop.level}
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-4 font-gendy">About This Workshop</h2>
                <p className="text-gray-300 font-diatype leading-relaxed mb-6">
                  {workshop.description}
                </p>

                {workshop.videoUrl && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3 font-gendy">Preview</h3>
                    <div className="relative w-full h-0 pb-[56.25%] rounded-xl overflow-hidden">
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={workshop.videoUrl}
                        title="Workshop Preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 font-gendy">What You'll Learn</h3>
                  <ul className="space-y-2">
                    {workshop.whatYouWillLearn?.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-gray-300 font-diatype">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {workshop.agenda && workshop.agenda.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
                >
                  <h2 className="text-2xl font-bold text-white mb-6 font-gendy">Agenda</h2>
                  <div className="space-y-4">
                    {workshop.agenda.map((item: any, i: number) => (
                      <div key={i} className="flex gap-4 pb-4 border-b border-white/10 last:border-0">
                        <div className="flex-shrink-0 w-32 text-purple-400 font-semibold font-diatype text-sm">
                          {item.time}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-1 font-diatype">{item.title}</h4>
                          {item.description && (
                            <p className="text-gray-400 text-sm font-diatype">{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {workshop.instructorBio && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
                >
                  <h2 className="text-2xl font-bold text-white mb-6 font-gendy">Your Instructor</h2>
                  <div className="flex items-start gap-6">
                    <Image
                      src={workshop.instructorImage}
                      alt={workshop.instructor}
                      width={120}
                      height={120}
                      className="rounded-full"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1 font-gendy">{workshop.instructor}</h3>
                      <p className="text-purple-400 mb-3 font-diatype">{workshop.instructorTitle}</p>
                      <p className="text-gray-300 font-diatype leading-relaxed">{workshop.instructorBio}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sticky top-24"
              >
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-bold font-gendy">{workshop.rating}</span>
                    <span className="text-gray-400 text-sm font-diatype">({workshop.reviews} reviews)</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <span className="font-diatype">{workshop.date} at {workshop.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span className="font-diatype">{workshop.duration}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span className="font-diatype">{workshop.participants}/{workshop.maxParticipants} enrolled</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Video className="w-5 h-5 text-purple-400" />
                    <span className="font-diatype">Live online workshop</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-purple-500/50 font-diatype mb-3"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Enroll Now
                </motion.button>

                <p className="text-center text-gray-400 text-sm font-diatype">{workshop.price}</p>

                {workshop.keyTakeaways && workshop.keyTakeaways.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h3 className="text-white font-semibold mb-3 font-gendy">You'll Receive:</h3>
                    <ul className="space-y-2">
                      {workshop.keyTakeaways.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-gray-300 text-sm font-diatype">
                          <Award className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {workshop.prerequisites && workshop.prerequisites.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h3 className="text-white font-semibold mb-3 font-gendy">Prerequisites:</h3>
                    <ul className="space-y-2">
                      {workshop.prerequisites.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-gray-300 text-sm font-diatype">
                          <Target className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
