'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Award,
  Star,
  PlayCircle,
  CheckCircle2,
  Target,
  Users,
  Download,
  Share2,
  Bookmark,
  Lock,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'

interface Module {
  id: number
  title: string
  duration: string
  lessons: string[]
  isCompleted?: boolean
  isLocked?: boolean
}

interface CourseData {
  id: string
  title: string
  description: string
  instructor: string
  instructorTitle: string
  instructorBio: string
  instructorImage: string
  duration: string
  totalModules: number
  enrolled: number
  rating: number
  reviews: number
  difficulty: string
  category: string
  heroImage: string
  videoUrl: string
  whatYouWillLearn: string[]
  prerequisites: string[]
  skillsGained: string[]
  modules: Module[]
  testimonials: Array<{
    name: string
    role: string
    image: string
    quote: string
  }>
}

const courseData: Record<string, CourseData> = {
  'ai-fundamentals': {
    id: 'ai-fundamentals',
    title: 'AI Fundamentals for Leaders',
    description: 'Master the essentials of AI transformation and learn how to lead your organization through change. This comprehensive course provides leaders with the foundational knowledge needed to drive AI initiatives and make informed strategic decisions.',
    instructor: 'Dr. Sarah Chen',
    instructorTitle: 'AI Strategy Consultant & Former VP of AI at Google',
    instructorBio: 'Dr. Sarah Chen has over 15 years of experience leading AI transformation initiatives at Fortune 500 companies. She holds a Ph.D. in Computer Science from Stanford and has trained over 10,000 executives in AI leadership.',
    instructorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    duration: '6 hours',
    totalModules: 5,
    enrolled: 1247,
    rating: 4.8,
    reviews: 284,
    difficulty: 'Beginner',
    category: 'Leadership',
    heroImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    whatYouWillLearn: [
      'Understand fundamental AI concepts and terminology',
      'Identify high-value AI opportunities in your organization',
      'Build a strategic AI roadmap aligned with business goals',
      'Lead AI transformation initiatives with confidence',
      'Communicate AI value to stakeholders and teams',
      'Navigate common pitfalls in AI implementation'
    ],
    prerequisites: [
      'No technical background required',
      'Basic understanding of business strategy',
      'Leadership or management experience preferred'
    ],
    skillsGained: [
      'AI Strategy',
      'Change Management',
      'Leadership',
      'Strategic Planning',
      'Stakeholder Communication'
    ],
    modules: [
      {
        id: 1,
        title: 'Introduction to AI & Its Business Impact',
        duration: '1h 15m',
        lessons: [
          'What is AI? Demystifying the technology',
          'AI vs Machine Learning vs Deep Learning',
          'Current state of AI across industries',
          'Real-world AI success stories and failures',
          'Understanding AI capabilities and limitations'
        ],
        isCompleted: true
      },
      {
        id: 2,
        title: 'AI Strategy & Vision Development',
        duration: '1h 30m',
        lessons: [
          'Assessing organizational AI readiness',
          'Identifying AI opportunities and use cases',
          'Building the AI business case',
          'Creating your AI vision and strategy',
          'Aligning AI initiatives with business objectives'
        ],
        isCompleted: false
      },
      {
        id: 3,
        title: 'Building AI-Ready Organizations',
        duration: '1h 15m',
        lessons: [
          'Data infrastructure requirements',
          'Building AI teams and governance',
          'Cultural transformation for AI adoption',
          'Skills and capabilities assessment',
          'Change management for AI initiatives'
        ],
        isCompleted: false
      },
      {
        id: 4,
        title: 'AI Implementation & ROI',
        duration: '1h',
        lessons: [
          'Pilot projects and proof of concepts',
          'Measuring AI performance and ROI',
          'Scaling AI across the organization',
          'Risk management and ethics',
          'Vendor selection and partnerships'
        ],
        isCompleted: false,
        isLocked: true
      },
      {
        id: 5,
        title: 'Leading AI Transformation',
        duration: '1h',
        lessons: [
          'Stakeholder engagement strategies',
          'Communicating AI value to executives',
          'Overcoming resistance to change',
          'Building momentum and celebrating wins',
          'Creating your AI transformation roadmap'
        ],
        isCompleted: false,
        isLocked: true
      }
    ],
    testimonials: [
      {
        name: 'Michael Rodriguez',
        role: 'CEO, TechCorp',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
        quote: 'This course gave me the confidence to lead our AI transformation. Dr. Chen breaks down complex concepts into actionable insights.'
      },
      {
        name: 'Jennifer Kim',
        role: 'VP Innovation, RetailCo',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
        quote: 'The best AI fundamentals course for business leaders. Practical, engaging, and immediately applicable to real-world challenges.'
      }
    ]
  },
  'data-literacy': {
    id: 'data-literacy',
    title: 'Data Literacy & AI Decision Making',
    description: 'Build data literacy skills and learn to make informed decisions using AI-powered insights. Develop the ability to interpret data, ask the right questions, and leverage AI tools for better decision-making.',
    instructor: 'Prof. Michael Torres',
    instructorTitle: 'Data Science Professor & Former Chief Data Officer at Amazon',
    instructorBio: 'Professor Michael Torres has 20 years of experience in data science and analytics. He led data initiatives at Amazon and now teaches data literacy at MIT Sloan School of Management.',
    instructorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    duration: '8 hours',
    totalModules: 6,
    enrolled: 892,
    rating: 4.9,
    reviews: 156,
    difficulty: 'Intermediate',
    category: 'Technical',
    heroImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    whatYouWillLearn: [
      'Read and interpret data visualizations effectively',
      'Ask the right questions about data and analytics',
      'Understand statistical concepts for business decisions',
      'Leverage AI tools for data analysis',
      'Identify data quality issues and biases',
      'Communicate data insights to non-technical stakeholders'
    ],
    prerequisites: [
      'Basic Excel or spreadsheet skills',
      'No advanced math required',
      'Familiarity with business metrics helpful'
    ],
    skillsGained: [
      'Data Analysis',
      'AI Tools',
      'Decision Making',
      'Critical Thinking',
      'Data Visualization'
    ],
    modules: [
      {
        id: 1,
        title: 'Foundations of Data Literacy',
        duration: '1h 20m',
        lessons: [
          'What is data literacy and why it matters',
          'Types of data: structured vs. unstructured',
          'Data quality and reliability',
          'Understanding data sources',
          'The data-to-insights journey'
        ]
      },
      {
        id: 2,
        title: 'Reading & Interpreting Data',
        duration: '1h 30m',
        lessons: [
          'Understanding charts and visualizations',
          'Common data visualization pitfalls',
          'Spotting misleading data presentations',
          'Interpreting trends and patterns',
          'Statistical thinking for business'
        ]
      },
      {
        id: 3,
        title: 'AI-Powered Analytics Tools',
        duration: '1h 45m',
        lessons: [
          'Overview of AI analytics platforms',
          'Natural language querying',
          'Automated insights generation',
          'Predictive analytics basics',
          'Hands-on: Using AI tools for analysis'
        ]
      },
      {
        id: 4,
        title: 'Making Data-Driven Decisions',
        duration: '1h 15m',
        lessons: [
          'Framework for data-driven decision making',
          'Balancing data with intuition',
          'A/B testing and experimentation',
          'ROI of data-driven decisions',
          'Case studies: Success and failure'
        ]
      },
      {
        id: 5,
        title: 'Data Ethics & Bias',
        duration: '1h 10m',
        lessons: [
          'Understanding algorithmic bias',
          'Privacy and data protection',
          'Ethical data collection and use',
          'Fairness in AI-powered decisions',
          'Building responsible data practices'
        ]
      },
      {
        id: 6,
        title: 'Communicating with Data',
        duration: '1h',
        lessons: [
          'Storytelling with data',
          'Creating compelling presentations',
          'Tailoring insights to audiences',
          'Data visualization best practices',
          'Building data-driven culture'
        ]
      }
    ],
    testimonials: [
      {
        name: 'Amanda Liu',
        role: 'Director of Analytics, FinanceCorp',
        image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&q=80',
        quote: 'Professor Torres made data analysis accessible and practical. Our team is now much more confident working with data and AI tools.'
      }
    ]
  },
  'culture-transformation': {
    id: 'culture-transformation',
    title: 'Building an AI-Ready Culture',
    description: 'Transform organizational culture to embrace AI and foster continuous innovation. Learn proven strategies to build psychological safety, overcome resistance, and create an environment where AI thrives.',
    instructor: 'Dr. Emily Rodriguez',
    instructorTitle: 'Organizational Development Expert & Culture Transformation Leader',
    instructorBio: 'Dr. Emily Rodriguez specializes in organizational culture transformation. She has led cultural change initiatives at 50+ companies and holds a Ph.D. in Organizational Psychology from Harvard.',
    instructorImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
    duration: '5 hours',
    totalModules: 4,
    enrolled: 654,
    rating: 4.7,
    reviews: 98,
    difficulty: 'Intermediate',
    category: 'Culture',
    heroImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    whatYouWillLearn: [
      'Assess your current organizational culture',
      'Build psychological safety for AI experimentation',
      'Overcome resistance to AI adoption',
      'Create learning and innovation habits',
      'Foster collaboration between humans and AI',
      'Measure culture change and impact'
    ],
    prerequisites: [
      'HR, leadership, or change management role',
      'Understanding of organizational dynamics',
      'Experience with culture or change initiatives'
    ],
    skillsGained: [
      'Culture Change',
      'Innovation',
      'Team Building',
      'Change Management',
      'Leadership Development'
    ],
    modules: [
      {
        id: 1,
        title: 'Understanding AI-Ready Culture',
        duration: '1h 15m',
        lessons: [
          'What makes a culture AI-ready?',
          'Cultural assessment frameworks',
          'Identifying cultural barriers to AI',
          'Growth mindset vs. fixed mindset',
          'Learning from high-performing AI organizations'
        ]
      },
      {
        id: 2,
        title: 'Building Psychological Safety',
        duration: '1h 30m',
        lessons: [
          'The role of psychological safety in innovation',
          'Creating safe spaces for experimentation',
          'Reframing failure as learning',
          'Leadership behaviors that enable safety',
          'Measuring psychological safety'
        ]
      },
      {
        id: 3,
        title: 'Driving AI Adoption & Engagement',
        duration: '1h 15m',
        lessons: [
          'Understanding resistance to AI',
          'Stakeholder engagement strategies',
          'Building AI champion networks',
          'Communication and change narratives',
          'Celebrating AI wins and learning'
        ]
      },
      {
        id: 4,
        title: 'Sustaining Cultural Transformation',
        duration: '1h',
        lessons: [
          'Embedding AI into workflows and rituals',
          'Recognition and rewards for AI innovation',
          'Continuous learning and upskilling',
          'Monitoring culture evolution',
          'Creating your culture change playbook'
        ]
      }
    ],
    testimonials: [
      {
        name: 'David Chen',
        role: 'CHRO, ManufacturingGlobal',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
        quote: 'Dr. Rodriguez helped us transform from AI skeptics to AI enthusiasts. Our innovation metrics have doubled since implementing her frameworks.'
      }
    ]
  },
  'ai-strategy': {
    id: 'ai-strategy',
    title: 'AI Strategy & Implementation',
    description: 'Develop comprehensive AI strategies and learn proven frameworks for successful implementation. This advanced course covers end-to-end AI strategy development, from vision to execution.',
    instructor: 'James Williams',
    instructorTitle: 'AI Strategy Expert & Former McKinsey Partner',
    instructorBio: 'James Williams spent 15 years at McKinsey leading AI strategy engagements for Fortune 100 companies. He has delivered over $2B in value through AI transformation programs.',
    instructorImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
    duration: '10 hours',
    totalModules: 8,
    enrolled: 423,
    rating: 4.9,
    reviews: 127,
    difficulty: 'Advanced',
    category: 'Strategy',
    heroImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    whatYouWillLearn: [
      'Develop enterprise AI strategies',
      'Build comprehensive AI roadmaps',
      'Calculate and optimize AI ROI',
      'Design AI governance frameworks',
      'Lead cross-functional AI initiatives',
      'Scale AI across the organization'
    ],
    prerequisites: [
      'Completion of AI Fundamentals or equivalent knowledge',
      'Strategic planning experience',
      'Leadership role in AI initiatives'
    ],
    skillsGained: [
      'Strategic Planning',
      'Implementation',
      'ROI Optimization',
      'Governance',
      'Program Management'
    ],
    modules: [
      {
        id: 1,
        title: 'AI Strategy Foundations',
        duration: '1h 15m',
        lessons: [
          'Elements of effective AI strategy',
          'Industry-specific AI strategies',
          'Competitive AI landscape analysis',
          'Technology stack decisions',
          'Build vs. buy vs. partner frameworks'
        ]
      },
      {
        id: 2,
        title: 'AI Opportunity Assessment',
        duration: '1h 30m',
        lessons: [
          'Use case identification frameworks',
          'Value vs. feasibility analysis',
          'Prioritization methodologies',
          'Portfolio management for AI',
          'Quick wins vs. transformational bets'
        ]
      },
      {
        id: 3,
        title: 'AI Business Case Development',
        duration: '1h 15m',
        lessons: [
          'ROI modeling for AI projects',
          'Cost estimation and budgeting',
          'Value realization planning',
          'Risk assessment and mitigation',
          'Stakeholder buy-in strategies'
        ]
      },
      {
        id: 4,
        title: 'AI Roadmap & Phasing',
        duration: '1h 20m',
        lessons: [
          'Multi-year AI roadmap design',
          'Phasing and sequencing decisions',
          'Dependency mapping',
          'Resource planning and allocation',
          'Milestone and success metrics'
        ]
      },
      {
        id: 5,
        title: 'AI Governance & Operating Model',
        duration: '1h 10m',
        lessons: [
          'AI governance structures',
          'Roles and responsibilities',
          'Decision rights frameworks',
          'Ethics and compliance governance',
          'Center of Excellence models'
        ]
      },
      {
        id: 6,
        title: 'AI Implementation Management',
        duration: '1h 30m',
        lessons: [
          'Agile AI project management',
          'Cross-functional team dynamics',
          'Vendor and partner management',
          'Quality assurance and testing',
          'Change and adoption planning'
        ]
      },
      {
        id: 7,
        title: 'Scaling & Industrialization',
        duration: '1h',
        lessons: [
          'Scaling AI capabilities',
          'MLOps and production AI',
          'Platform strategies',
          'Knowledge transfer and documentation',
          'Continuous improvement cycles'
        ]
      },
      {
        id: 8,
        title: 'Measuring AI Success',
        duration: '1h',
        lessons: [
          'KPIs and metrics frameworks',
          'Business value tracking',
          'Reporting and dashboards',
          'Lessons learned processes',
          'Strategy iteration and evolution'
        ]
      }
    ],
    testimonials: [
      {
        name: 'Patricia Wilson',
        role: 'Chief Strategy Officer, InsuranceCorp',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
        quote: 'James Williams is a master strategist. His frameworks are battle-tested and delivered immediate value for our AI transformation.'
      }
    ]
  },
  'prompt-engineering': {
    id: 'prompt-engineering',
    title: 'Prompt Engineering Mastery',
    description: 'Master the art of crafting effective AI prompts to maximize productivity and output quality. Learn advanced techniques for getting the best results from GPT, Claude, and other LLMs.',
    instructor: 'Alex Kim',
    instructorTitle: 'AI Prompt Engineering Specialist & Developer Advocate',
    instructorBio: 'Alex Kim is a leading expert in prompt engineering with experience at OpenAI and Anthropic. He has trained thousands of professionals in effective AI interaction techniques.',
    instructorImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
    duration: '4 hours',
    totalModules: 3,
    enrolled: 1523,
    rating: 4.6,
    reviews: 312,
    difficulty: 'Beginner',
    category: 'Technical',
    heroImage: 'https://images.unsplash.com/photo-1675271591423-4c3e1fc5d85a?w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    whatYouWillLearn: [
      'Fundamentals of effective prompt design',
      'Advanced prompting techniques and patterns',
      'Chain-of-thought and few-shot prompting',
      'Domain-specific prompting strategies',
      'Debugging and iterating on prompts',
      'Building prompt libraries for your team'
    ],
    prerequisites: [
      'Basic familiarity with AI tools like ChatGPT',
      'No coding experience required',
      'Willingness to experiment and practice'
    ],
    skillsGained: [
      'Prompt Engineering',
      'AI Tools',
      'Productivity',
      'Creative Problem Solving',
      'Technical Writing'
    ],
    modules: [
      {
        id: 1,
        title: 'Prompt Engineering Fundamentals',
        duration: '1h 30m',
        lessons: [
          'How language models work (simplified)',
          'Anatomy of an effective prompt',
          'Core prompting principles',
          'Common prompting mistakes',
          'Hands-on: Your first optimized prompts'
        ]
      },
      {
        id: 2,
        title: 'Advanced Prompting Techniques',
        duration: '1h 30m',
        lessons: [
          'Zero-shot vs. few-shot prompting',
          'Chain-of-thought reasoning',
          'Role prompting and personas',
          'System prompts and instructions',
          'Multi-turn conversations and context'
        ]
      },
      {
        id: 3,
        title: 'Applied Prompt Engineering',
        duration: '1h',
        lessons: [
          'Content creation and copywriting',
          'Data analysis and insights',
          'Code generation and debugging',
          'Research and summarization',
          'Building your prompt library'
        ]
      }
    ],
    testimonials: [
      {
        name: 'Rachel Foster',
        role: 'Content Director, MediaCorp',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80',
        quote: 'Alex Kim turned me into a prompt engineering pro. My team is now 3x more productive with AI tools thanks to this course.'
      }
    ]
  },
  'ethical-ai': {
    id: 'ethical-ai',
    title: 'Ethical AI & Responsible Innovation',
    description: 'Navigate the ethical considerations of AI and build responsible innovation practices. Learn to identify bias, ensure fairness, and implement AI governance frameworks.',
    instructor: 'Dr. Lisa Anderson',
    instructorTitle: 'AI Ethics Researcher & Former Tech Policy Advisor',
    instructorBio: 'Dr. Lisa Anderson is an AI ethics expert who has advised the White House on AI policy. She holds a Ph.D. in Applied Ethics and has published extensively on responsible AI.',
    instructorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    duration: '6 hours',
    totalModules: 5,
    enrolled: 734,
    rating: 4.8,
    reviews: 143,
    difficulty: 'Intermediate',
    category: 'Leadership',
    heroImage: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    whatYouWillLearn: [
      'Understand ethical frameworks for AI',
      'Identify and mitigate algorithmic bias',
      'Implement fairness and transparency standards',
      'Navigate AI regulations and compliance',
      'Build stakeholder trust in AI systems',
      'Create ethical AI governance frameworks'
    ],
    prerequisites: [
      'Basic understanding of AI concepts',
      'Interest in ethics and responsible innovation',
      'No technical background required'
    ],
    skillsGained: [
      'Ethics',
      'Compliance',
      'Risk Management',
      'Governance',
      'Stakeholder Management'
    ],
    modules: [
      {
        id: 1,
        title: 'Foundations of AI Ethics',
        duration: '1h 15m',
        lessons: [
          'Why AI ethics matters',
          'Ethical frameworks and principles',
          'Real-world AI ethics failures',
          'Stakeholder perspectives on AI ethics',
          'Building ethical awareness'
        ]
      },
      {
        id: 2,
        title: 'Bias & Fairness in AI',
        duration: '1h 30m',
        lessons: [
          'Understanding algorithmic bias',
          'Sources of bias in AI systems',
          'Fairness definitions and metrics',
          'Bias detection and mitigation',
          'Case studies: Bias in practice'
        ]
      },
      {
        id: 3,
        title: 'Transparency & Explainability',
        duration: '1h 15m',
        lessons: [
          'The black box problem',
          'Explainable AI techniques',
          'Transparency standards',
          'Communicating AI decisions',
          'Building interpretable models'
        ]
      },
      {
        id: 4,
        title: 'AI Governance & Compliance',
        duration: '1h',
        lessons: [
          'AI regulatory landscape',
          'GDPR and AI compliance',
          'Industry-specific regulations',
          'Governance frameworks',
          'Audit and accountability'
        ]
      },
      {
        id: 5,
        title: 'Building Responsible AI Practices',
        duration: '1h',
        lessons: [
          'Ethics review processes',
          'Risk assessment frameworks',
          'Stakeholder engagement',
          'Building trust through transparency',
          'Creating your ethics playbook'
        ]
      }
    ],
    testimonials: [
      {
        name: 'Kevin Martinez',
        role: 'Chief Compliance Officer, HealthTech',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
        quote: 'Dr. Anderson\'s course is essential for anyone deploying AI systems. It helped us build robust ethical frameworks that stakeholders trust.'
      }
    ]
  }
}

export default function CBTDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { userData } = useChat()
  const courseId = params.id as string

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

  const course = courseData[courseId] || courseData['ai-fundamentals']

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all">
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard/cbts">
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
                    {course.title}
                  </h1>
                  <p className="text-gray-400 font-diatype text-sm">
                    with {course.instructor}
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
                  <Bookmark className="w-5 h-5" />
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
                  src={course.heroImage}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
                <div className="absolute bottom-6 left-6 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm font-semibold font-diatype">
                    {course.category}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-semibold font-diatype">
                    {course.difficulty}
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-4 font-gendy">About This Course</h2>
                <p className="text-gray-300 font-diatype leading-relaxed mb-6">
                  {course.description}
                </p>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 font-gendy">Preview</h3>
                  <div className="relative w-full h-0 pb-[56.25%] rounded-xl overflow-hidden">
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={course.videoUrl}
                      title="Course Preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 font-gendy">What You'll Learn</h3>
                  <ul className="space-y-2">
                    {course.whatYouWillLearn.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-300 font-diatype">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6 font-gendy">Course Modules</h2>
                <div className="space-y-4">
                  {course.modules.map((module, i) => (
                    <div
                      key={module.id}
                      className={`bg-white/5 rounded-xl border border-white/10 overflow-hidden ${
                        module.isLocked ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              module.isCompleted
                                ? 'bg-green-500/20 border border-green-500/30'
                                : module.isLocked
                                ? 'bg-gray-500/20 border border-gray-500/30'
                                : 'bg-purple-500/20 border border-purple-500/30'
                            }`}
                          >
                            {module.isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-green-400" />
                            ) : module.isLocked ? (
                              <Lock className="w-5 h-5 text-gray-400" />
                            ) : (
                              <PlayCircle className="w-5 h-5 text-purple-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-semibold font-diatype">
                              Module {module.id}: {module.title}
                            </h4>
                            <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                              <span className="flex items-center gap-1 font-diatype">
                                <Clock className="w-4 h-4" />
                                {module.duration}
                              </span>
                              <span className="flex items-center gap-1 font-diatype">
                                <BookOpen className="w-4 h-4" />
                                {module.lessons.length} lessons
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 pb-4 pl-[72px]">
                        <ul className="space-y-2">
                          {module.lessons.map((lesson, j) => (
                            <li key={j} className="text-gray-400 text-sm flex items-start gap-2 font-diatype">
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                              {lesson}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6 font-gendy">Your Instructor</h2>
                <div className="flex items-start gap-6">
                  <Image
                    src={course.instructorImage}
                    alt={course.instructor}
                    width={120}
                    height={120}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 font-gendy">{course.instructor}</h3>
                    <p className="text-purple-400 mb-3 font-diatype">{course.instructorTitle}</p>
                    <p className="text-gray-300 font-diatype leading-relaxed">{course.instructorBio}</p>
                  </div>
                </div>
              </motion.div>

              {course.testimonials && course.testimonials.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
                >
                  <h2 className="text-2xl font-bold text-white mb-6 font-gendy">Student Testimonials</h2>
                  <div className="space-y-6">
                    {course.testimonials.map((testimonial, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <Image
                            src={testimonial.image}
                            alt={testimonial.name}
                            width={50}
                            height={50}
                            className="rounded-full"
                          />
                          <div>
                            <h4 className="text-white font-semibold font-diatype">{testimonial.name}</h4>
                            <p className="text-gray-400 text-sm font-diatype">{testimonial.role}</p>
                          </div>
                        </div>
                        <p className="text-gray-300 font-diatype italic">"{testimonial.quote}"</p>
                      </div>
                    ))}
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
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-bold font-gendy">{course.rating}</span>
                    <span className="text-gray-400 text-sm font-diatype">({course.reviews} reviews)</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span className="font-diatype">{course.duration} total</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    <span className="font-diatype">{course.totalModules} modules</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span className="font-diatype">{course.enrolled.toLocaleString()} enrolled</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Target className="w-5 h-5 text-purple-400" />
                    <span className="font-diatype">{course.difficulty} level</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-purple-500/50 font-diatype mb-3"
                >
                  <PlayCircle className="w-5 h-5" />
                  Start Course
                </motion.button>

                <p className="text-center text-gray-400 text-sm font-diatype mb-6">Included in subscription</p>

                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-white font-semibold mb-3 font-gendy">Skills You'll Gain:</h3>
                  <div className="flex flex-wrap gap-2">
                    {course.skillsGained.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs rounded-full font-diatype"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {course.prerequisites && course.prerequisites.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h3 className="text-white font-semibold mb-3 font-gendy">Prerequisites:</h3>
                    <ul className="space-y-2">
                      {course.prerequisites.map((item, i) => (
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
