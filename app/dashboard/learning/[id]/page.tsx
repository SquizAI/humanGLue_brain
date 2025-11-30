'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  ArrowLeft,
  Star,
  Clock,
  Users,
  Play,
  CheckCircle2,
  Calendar,
  Award,
  BookOpen,
  Video,
  FileText,
  Download,
  Share2,
  ShoppingCart,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useCart } from '@/lib/contexts/CartContext'
import { BookmarkButton } from '@/components/molecules/BookmarkButton'
import { LikeButton } from '@/components/molecules/LikeButton'
import { ShareButton } from '@/components/molecules/ShareButton'
import { SocialStats } from '@/components/molecules/SocialStats'
import { cn } from '@/utils/cn'
import Link from 'next/link'

const courses = [
  {
    id: 1,
    title: 'AI Transformation for Executives',
    instructor: 'Sarah Chen',
    instructorTitle: 'AI Strategy & Transformation Expert',
    instructorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    category: 'ai-adoption',
    level: 'Executive',
    duration: '6 hours',
    lessons: 12,
    students: 2847,
    rating: 4.9,
    reviews: 384,
    price: 299,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop',
    description: 'Lead your organization through AI transformation with proven frameworks and real-world case studies.',
    fullDescription: 'This executive-level course provides a comprehensive framework for leading AI transformation initiatives in large organizations. You\'ll learn proven strategies for building stakeholder buy-in, managing change resistance, calculating ROI, and creating sustainable AI adoption programs. The course includes real case studies from Fortune 500 transformations and practical tools you can implement immediately.',
    skills: ['AI Strategy', 'Change Leadership', 'ROI Planning', 'Stakeholder Management'],
    upcoming: '2025-11-15',
    syllabus: [
      {
        module: 'Module 1: AI Transformation Foundations',
        lessons: [
          'Understanding AI\'s Impact on Your Industry',
          'Building the Business Case for AI',
          'Common Transformation Pitfalls to Avoid',
        ]
      },
      {
        module: 'Module 2: Stakeholder Alignment',
        lessons: [
          'Getting C-Suite Buy-In',
          'Managing Board Expectations',
          'Communicating AI Value Across the Organization',
        ]
      },
      {
        module: 'Module 3: Change Management',
        lessons: [
          'Addressing Fear and Resistance',
          'Building AI Champions',
          'Creating Psychological Safety',
        ]
      },
      {
        module: 'Module 4: Implementation Strategy',
        lessons: [
          'Phased Rollout Planning',
          'Measuring Success and ROI',
          'Scaling AI Across the Enterprise',
        ]
      },
    ],
    outcomes: [
      'Develop a comprehensive AI transformation roadmap',
      'Build stakeholder alignment across C-suite and board',
      'Create change management strategies that reduce resistance by 60%+',
      'Calculate and communicate AI ROI effectively',
      'Lead confidently through complex organizational change',
    ],
    requirements: [
      'Executive or senior leadership role',
      'Basic understanding of AI concepts',
      'Authority to drive organizational change',
    ],
    testimonials: [
      {
        name: 'James Rodriguez',
        title: 'CTO, Global Tech Inc.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        rating: 5,
        comment: 'This course gave me the frameworks I needed to lead our AI transformation. Within 3 months, we reduced resistance by 70% and accelerated our timeline by 6 months.',
      },
      {
        name: 'Lisa Anderson',
        title: 'CEO, Finance Corp',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
        rating: 5,
        comment: 'Sarah\'s approach to change management is brilliant. The ROI calculator alone was worth the course price.',
      },
    ],
  },
  {
    id: 2,
    title: 'Building Psychologically Safe Teams for AI',
    instructor: 'Aisha Mohamed',
    instructorTitle: 'Culture Transformation Specialist',
    instructorImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop',
    category: 'leadership',
    level: 'All Levels',
    duration: '4 hours',
    lessons: 8,
    students: 1923,
    rating: 5.0,
    reviews: 267,
    price: 199,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop',
    description: 'Create environments where teams can experiment, fail safely, and embrace AI-driven change.',
    fullDescription: 'Learn the neuroscience and practical techniques for building psychological safety in teams facing AI transformation. This course covers fear management, creating safe spaces for experimentation, and building cultures where innovation thrives.',
    skills: ['Team Dynamics', 'Culture Building', 'Fear Management', 'Innovation'],
    upcoming: '2025-11-20',
    syllabus: [
      {
        module: 'Module 1: Understanding Psychological Safety',
        lessons: [
          'The Neuroscience of Fear and Safety',
          'Why AI Triggers Existential Threats',
        ]
      },
      {
        module: 'Module 2: Building Safe Environments',
        lessons: [
          'Creating Space for Experimentation',
          'Normalizing Failure as Learning',
          'Leader Behaviors That Build Safety',
        ]
      },
      {
        module: 'Module 3: Practical Application',
        lessons: [
          'Running Safe-to-Fail Experiments',
          'Facilitating Vulnerable Conversations',
          'Measuring Psychological Safety',
        ]
      },
    ],
    outcomes: [
      'Understand the neuroscience behind fear and safety',
      'Create environments where teams experiment without fear',
      'Reduce AI adoption resistance by 60%+',
      'Build cultures of innovation and learning',
    ],
    requirements: [
      'Team leadership experience',
      'Openness to behavioral psychology',
    ],
    testimonials: [
      {
        name: 'Robert Kim',
        title: 'CPO, Digital Media Corp',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        rating: 5,
        comment: 'Our engagement scores jumped 45% after implementing Aisha\'s frameworks.',
      },
    ],
  },
  {
    id: 3,
    title: 'Data-Driven Decision Making for Leaders',
    instructor: 'Marcus Thompson',
    instructorTitle: 'Manufacturing & Operations AI Expert',
    instructorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    category: 'data-ai',
    level: 'Intermediate',
    duration: '8 hours',
    lessons: 16,
    students: 3156,
    rating: 4.8,
    reviews: 441,
    price: 349,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
    description: 'Master data analytics and AI-powered insights to make better strategic decisions faster.',
    fullDescription: 'Transform how you make decisions with data and AI. This course teaches executives and managers how to leverage analytics, interpret AI-generated insights, and make faster, more confident decisions.',
    skills: ['Analytics', 'Data Literacy', 'AI Tools', 'Business Intelligence'],
    upcoming: '2025-11-18',
    syllabus: [
      {
        module: 'Module 1: Data Literacy Foundations',
        lessons: [
          'Understanding Data Types and Sources',
          'Reading Data Visualizations',
          'Asking the Right Questions',
          'Spotting Data Quality Issues',
        ]
      },
      {
        module: 'Module 2: AI-Powered Analytics',
        lessons: [
          'How AI Generates Insights',
          'Interpreting ML Model Outputs',
          'Understanding Confidence Levels',
          'When to Trust (and Question) AI',
        ]
      },
      {
        module: 'Module 3: Decision Frameworks',
        lessons: [
          'Data-Informed vs Data-Driven Decisions',
          'Combining Data with Intuition',
          'Speed vs Accuracy Tradeoffs',
          'Communicating Data-Based Decisions',
        ]
      },
      {
        module: 'Module 4: Tools and Practice',
        lessons: [
          'Essential BI Tools Overview',
          'Building Your First Dashboard',
          'AI Decision Support Systems',
          'Case Studies and Practice',
        ]
      },
    ],
    outcomes: [
      'Read and interpret complex data visualizations',
      'Use AI-powered analytics tools confidently',
      'Make faster decisions with data backing',
      'Communicate data insights to stakeholders',
    ],
    requirements: [
      'Leadership or management role',
      'Basic computer skills',
    ],
    testimonials: [
      {
        name: 'Linda Martinez',
        title: 'COO, AutoMakers United',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
        rating: 5,
        comment: 'Decision speed improved by 3x while maintaining accuracy.',
      },
    ],
  },
  {
    id: 4,
    title: 'AI Ethics & Responsible Innovation',
    instructor: 'Priya Patel',
    instructorTitle: 'Healthcare AI Ethics Expert',
    instructorImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
    category: 'ethics',
    level: 'All Levels',
    duration: '5 hours',
    lessons: 10,
    students: 1634,
    rating: 4.9,
    reviews: 198,
    price: 249,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=500&fit=crop',
    description: 'Navigate ethical challenges in AI deployment while building trust with stakeholders.',
    fullDescription: 'Build ethical AI systems that stakeholders trust. Learn frameworks for responsible AI deployment, bias detection, privacy protection, and regulatory compliance.',
    skills: ['AI Ethics', 'Governance', 'Risk Management', 'Compliance'],
    upcoming: '2025-11-22',
    syllabus: [
      {
        module: 'Module 1: Ethical Foundations',
        lessons: [
          'AI Ethics Principles',
          'Bias and Fairness',
          'Privacy and Data Rights',
        ]
      },
      {
        module: 'Module 2: Governance Frameworks',
        lessons: [
          'Building AI Governance',
          'Risk Assessment',
          'Compliance Requirements',
          'Stakeholder Trust',
        ]
      },
      {
        module: 'Module 3: Practical Application',
        lessons: [
          'Ethical AI Checklist',
          'Audit and Monitoring',
          'Crisis Management',
        ]
      },
    ],
    outcomes: [
      'Implement ethical AI frameworks',
      'Detect and mitigate bias',
      'Build stakeholder trust',
      'Ensure regulatory compliance',
    ],
    requirements: [
      'Basic AI understanding',
    ],
    testimonials: [
      {
        name: 'Dr. Michael Chen',
        title: 'CMO, Northeast Health',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        rating: 5,
        comment: '100% HIPAA compliance maintained while adopting AI.',
      },
    ],
  },
  {
    id: 5,
    title: 'Change Management Mastery',
    instructor: 'Kenji Yamamoto',
    instructorTitle: 'Leadership Development Expert',
    instructorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    category: 'change-management',
    level: 'Advanced',
    duration: '10 hours',
    lessons: 20,
    students: 4271,
    rating: 4.7,
    reviews: 592,
    price: 399,
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=500&fit=crop',
    description: 'Advanced frameworks for leading organizational transformation in the AI era.',
    fullDescription: 'Master the art and science of leading complex organizational change. This advanced course covers change psychology, resistance management, communication strategies, and measurement frameworks.',
    skills: ['Change Strategy', 'Resistance Management', 'Communication', 'Measurement'],
    upcoming: '2025-11-25',
    syllabus: [
      {
        module: 'Module 1: Change Psychology',
        lessons: [
          'How Humans Process Change',
          'The Neuroscience of Resistance',
          'Change Readiness Assessment',
          'Cultural Factors in Change',
        ]
      },
      {
        module: 'Module 2: Strategy Development',
        lessons: [
          'Stakeholder Mapping',
          'Change Vision and Story',
          'Phased Implementation',
          'Risk Mitigation',
        ]
      },
      {
        module: 'Module 3: Execution Excellence',
        lessons: [
          'Communication Plans',
          'Building Change Networks',
          'Training and Support',
          'Momentum Management',
        ]
      },
      {
        module: 'Module 4: Measurement & Sustainability',
        lessons: [
          'KPIs for Change',
          'Early Warning Signals',
          'Course Correction',
          'Embedding Change',
        ]
      },
      {
        module: 'Module 5: Advanced Topics',
        lessons: [
          'Leading Through Crisis',
          'Digital Transformation Specifics',
          'Multi-site Change',
          'Case Studies',
        ]
      },
    ],
    outcomes: [
      'Lead complex organizational transformations',
      'Reduce resistance by 60%+',
      'Build sustainable change',
      'Measure and communicate progress',
    ],
    requirements: [
      'Senior leadership role',
      'Previous change experience',
    ],
    testimonials: [
      {
        name: 'Amanda Foster',
        title: 'CEO, Strategic Advisors',
        avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop',
        rating: 5,
        comment: 'Transformed our approach to change. 3x faster decisions.',
      },
    ],
  },
  {
    id: 6,
    title: 'Coaching Teams Through AI Adoption',
    instructor: 'Carlos Rivera',
    instructorTitle: 'Retail & Customer Experience Expert',
    instructorImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
    category: 'human-skills',
    level: 'Intermediate',
    duration: '6 hours',
    lessons: 12,
    students: 1512,
    rating: 4.8,
    reviews: 223,
    price: 279,
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=500&fit=crop',
    description: 'Practical coaching techniques to help teams embrace AI tools and overcome adoption fears.',
    fullDescription: 'Learn proven coaching techniques to help teams overcome AI adoption fears and build confidence. Includes active listening, behavior change strategies, and practical exercises.',
    skills: ['Coaching', 'Team Development', 'Active Listening', 'Behavior Change'],
    upcoming: '2025-11-28',
    syllabus: [
      {
        module: 'Module 1: Coaching Foundations',
        lessons: [
          'Coaching vs Managing',
          'Active Listening Skills',
          'Powerful Questions',
        ]
      },
      {
        module: 'Module 2: AI-Specific Coaching',
        lessons: [
          'Understanding AI Anxiety',
          'Building AI Confidence',
          'Skill Development Plans',
        ]
      },
      {
        module: 'Module 3: Team Dynamics',
        lessons: [
          'Group Coaching Techniques',
          'Peer Learning',
          'Celebrating Wins',
        ]
      },
      {
        module: 'Module 4: Behavior Change',
        lessons: [
          'Habit Formation',
          'Sustaining Change',
          'Measuring Progress',
        ]
      },
    ],
    outcomes: [
      'Coach individuals through AI adoption',
      'Build team confidence with AI tools',
      'Create sustainable behavior change',
      'Measure coaching effectiveness',
    ],
    requirements: [
      'Team leadership experience',
      'Interest in coaching',
    ],
    testimonials: [
      {
        name: 'Jessica Wu',
        title: 'VP CX, Retail Innovations',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
        rating: 5,
        comment: 'Trained 3,000 associates without losing personal touch.',
      },
    ],
  },
]

export default function CourseDetail() {
  const router = useRouter()
  const params = useParams()
    const { addToCart, setIsCartOpen } = useCart()
  const courseId = parseInt(params.id as string)
  const course = courses.find(c => c.id === courseId)
  const [expandedModule, setExpandedModule] = useState<number | null>(0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const handleAddToCart = () => {
    if (!course) return

    setIsAddingToCart(true)

    addToCart({
      id: course.id.toString(),
      type: 'course',
      name: course.title,
      description: course.description,
      price: course.price,
      image: course.image,
      metadata: {
        instructor: course.instructor,
        duration: course.duration,
        level: course.level,
      },
    })

    setIsAddingToCart(false)
    setShowToast(true)

    setTimeout(() => setShowToast(false), 3000)
  }

  const handleEnrollNow = () => {
    if (!course) return

    setIsAddingToCart(true)

    addToCart({
      id: course.id.toString(),
      type: 'course',
      name: course.title,
      description: course.description,
      price: course.price,
      image: course.image,
      metadata: {
        instructor: course.instructor,
        duration: course.duration,
        level: course.level,
      },
    })

    setIsAddingToCart(false)
    router.push('/checkout')
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-950">
        <DashboardSidebar onLogout={handleLogout} />
        <div className="ml-0 lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all">
          <div className="px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Course not found</h3>
              <Link href="/dashboard/learning">
                <button className="mt-4 px-6 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg">
                  Back to Learning
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

      {/* Toast Notification */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold">Added to cart!</span>
        </motion.div>
      )}

      <div className="ml-0 lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all">
        <div className="px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-7xl mx-auto">
          <Link href="/dashboard/learning">
            <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Learning
            </button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Course Header */}
              <div className="relative h-96 rounded-2xl overflow-hidden">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-cyan-500/90 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
                      {course.level}
                    </span>
                    <span className="px-3 py-1 bg-blue-500/90 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
                      {course.category}
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-4">{course.title}</h1>
                  <p className="text-xl text-gray-200 mb-4">{course.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-6">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-semibold">{course.rating}</span>
                      <span>({course.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course.students.toLocaleString()} students
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration}
                    </div>
                  </div>

                  {/* Social Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    <BookmarkButton
                      item={{
                        id: course.id.toString(),
                        type: 'course',
                        name: course.title,
                        image: course.image,
                        metadata: {
                          instructor: course.instructor,
                          duration: course.duration,
                          price: course.price,
                          level: course.level,
                        }
                      }}
                      variant="compact"
                    />
                    <LikeButton
                      id={course.id.toString()}
                      type="course"
                      variant="compact"
                    />
                    <ShareButton
                      id={course.id.toString()}
                      type="course"
                      title={course.title}
                      description={course.description}
                      variant="compact"
                    />
                  </div>
                </div>
              </div>

              {/* Social Stats */}
              <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6">
                <SocialStats
                  id={course.id.toString()}
                  type="course"
                  variant="default"
                />
              </div>

              {/* About */}
              <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">About This Course</h2>
                <p className="text-gray-300 leading-relaxed">{course.fullDescription}</p>
              </div>

              {/* Learning Outcomes */}
              <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">What You'll Learn</h2>
                <ul className="space-y-3">
                  {course.outcomes.map((outcome, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Syllabus */}
              <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Course Curriculum</h2>
                <div className="space-y-3">
                  {course.syllabus.map((module, i) => (
                    <div key={i} className="border border-white/10 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedModule(expandedModule === i ? null : i)}
                        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <span className="text-white font-semibold">{module.module}</span>
                        <motion.div
                          animate={{ rotate: expandedModule === i ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ArrowLeft className="w-5 h-5 text-gray-400 -rotate-90" />
                        </motion.div>
                      </button>
                      {expandedModule === i && (
                        <div className="p-4 bg-white/[0.02]">
                          <ul className="space-y-2">
                            {module.lessons.map((lesson, j) => (
                              <li key={j} className="flex items-center gap-3 text-gray-300">
                                <Play className="w-4 h-4 text-cyan-400" />
                                {lesson}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructor */}
              <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Instructor</h2>
                <div className="flex items-start gap-4">
                  <Image
                    src={course.instructorImage}
                    alt={course.instructor}
                    width={80}
                    height={80}
                    className="rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{course.instructor}</h3>
                    <p className="text-gray-400 mb-3">{course.instructorTitle}</p>
                    <Link href={`/dashboard/talent/${course.id}`}>
                      <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                        View Full Profile →
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Student Reviews</h2>
                <div className="space-y-4">
                  {course.testimonials.map((review, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-5 border border-white/10">
                      <div className="flex items-start gap-4">
                        <Image
                          src={review.avatar}
                          alt={review.name}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-white font-semibold">{review.name}</span>
                            <div className="flex gap-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{review.title}</p>
                          <p className="text-gray-300">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Enroll Card */}
              <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-xl p-6 sticky top-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-white mb-2">${course.price}</div>
                  <p className="text-gray-400 text-sm">One-time payment • Lifetime access</p>
                </div>

                <div className="flex gap-2 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="flex-1 px-6 py-4 bg-white/10 text-white rounded-lg font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isAddingToCart ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </>
                    )}
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEnrollNow}
                  disabled={isAddingToCart}
                  className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold text-lg shadow-lg shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enroll Now
                </motion.button>

                {course.upcoming && (
                  <div className="flex items-center justify-center gap-2 text-sm text-amber-400 mb-4">
                    <Calendar className="w-4 h-4" />
                    Next session: {new Date(course.upcoming).toLocaleDateString()}
                  </div>
                )}

                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Video className="w-5 h-5 text-cyan-400" />
                    <span>{course.lessons} video lessons</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span>Downloadable resources</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Award className="w-5 h-5 text-amber-400" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Clock className="w-5 h-5 text-green-400" />
                    <span>Lifetime access</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button className="flex-1 px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button className="flex-1 px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors">
                    Save
                  </button>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Skills You'll Gain</h3>
                <div className="flex flex-wrap gap-2">
                  {course.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-cyan-500/10 text-cyan-300 text-sm rounded-full border border-cyan-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Requirements</h3>
                <ul className="space-y-2">
                  {course.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
