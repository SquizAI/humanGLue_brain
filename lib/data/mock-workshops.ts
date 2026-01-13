import { Workshop } from '@/components/workshops/WorkshopCard'

/**
 * Mock workshop data for the HMN platform
 * Aligned with the HMN Manifesto and three-pillar approach
 */

export const mockWorkshops: Workshop[] = [
  // ADAPTABILITY PILLAR - Beginner
  {
    id: 'adapt-101',
    title: 'AI Adaptability Fundamentals',
    description: 'Build your foundation in AI literacy and organizational change. Learn to navigate the transformation from fear to confidence in the age of intelligent machines.',
    instructor: {
      name: 'Sarah Chen',
      title: 'Chief Transformation Officer',
      avatar: '/instructors/sarah-chen.jpg',
    },
    schedule: {
      date: 'Nov 15, 2025',
      time: '10:00 AM PST',
      duration: '2 hours',
    },
    format: 'live',
    capacity: {
      total: 50,
      remaining: 12,
    },
    price: {
      amount: 299,
      earlyBird: 249,
    },
    outcomes: [
      'Understand the AI transformation landscape and its impact on work',
      'Develop a personal AI adaptability roadmap',
      'Build confidence in working alongside AI systems',
      'Create your first AI-assisted workflow',
    ],
    pillar: 'adaptability',
    level: 'beginner',
    tags: ['AI Literacy', 'Change Management', 'Mindset', 'Getting Started'],
  },

  // ADAPTABILITY PILLAR - Intermediate
  {
    id: 'adapt-201',
    title: 'Leading AI-Driven Teams',
    description: 'Master the art of leading hybrid human-AI teams. Transform your leadership approach to thrive in an AI-augmented workplace.',
    instructor: {
      name: 'Marcus Thompson',
      title: 'Leadership Development Expert',
      avatar: '/instructors/marcus-thompson.jpg',
    },
    schedule: {
      date: 'Nov 22, 2025',
      time: '2:00 PM PST',
      duration: '3 hours',
    },
    format: 'hybrid',
    capacity: {
      total: 40,
      remaining: 8,
    },
    price: {
      amount: 449,
      earlyBird: 399,
    },
    outcomes: [
      'Design effective human-AI collaboration frameworks',
      'Navigate team dynamics during AI integration',
      'Build psychological safety in AI-augmented teams',
      'Measure and optimize hybrid team performance',
    ],
    pillar: 'adaptability',
    level: 'intermediate',
    tags: ['Team Leadership', 'AI Integration', 'Performance Management'],
  },

  // ADAPTABILITY PILLAR - Advanced
  {
    id: 'adapt-301',
    title: 'AI Strategy & Organizational Design',
    description: 'Architect enterprise-wide AI transformation. Design org structures that maximize human-AI synergy while maintaining resilience and adaptability.',
    instructor: {
      name: 'Dr. Elena Rodriguez',
      title: 'Organizational Systems Architect',
      avatar: '/instructors/elena-rodriguez.jpg',
    },
    schedule: {
      date: 'Dec 5, 2025',
      time: '9:00 AM PST',
      duration: '4 hours',
    },
    format: 'live',
    capacity: {
      total: 25,
      remaining: 3,
    },
    price: {
      amount: 799,
    },
    outcomes: [
      'Develop comprehensive AI transformation roadmaps',
      'Design adaptive organizational structures',
      'Create governance frameworks for AI integration',
      'Build measurement systems for transformation success',
    ],
    pillar: 'adaptability',
    level: 'advanced',
    tags: ['Strategy', 'Org Design', 'Governance', 'Executive'],
  },

  // COACHING PILLAR - Beginner
  {
    id: 'coach-101',
    title: 'Foundations of AI-Era Coaching',
    description: 'Learn to coach in the age of AI. Develop skills to guide individuals through technological change and unlock their potential.',
    instructor: {
      name: 'Jennifer Park',
      title: 'Executive Coach & Author',
      avatar: '/instructors/jennifer-park.jpg',
    },
    schedule: {
      date: 'Nov 18, 2025',
      time: '1:00 PM PST',
      duration: '2.5 hours',
    },
    format: 'live',
    capacity: {
      total: 60,
      remaining: 22,
    },
    price: {
      amount: 349,
      earlyBird: 299,
    },
    outcomes: [
      'Master core coaching competencies for AI transformation',
      'Build trust and psychological safety in coaching relationships',
      'Guide clients from fear to confidence with AI',
      'Create personalized growth plans for the AI era',
    ],
    pillar: 'coaching',
    level: 'beginner',
    tags: ['Coaching Basics', 'Career Development', 'Mindset Shifts'],
  },

  // COACHING PILLAR - Intermediate
  {
    id: 'coach-201',
    title: 'Advanced Coaching Techniques for Transformation',
    description: 'Elevate your coaching practice with advanced frameworks for navigating complex organizational change and AI adoption.',
    instructor: {
      name: 'David Kumar',
      title: 'Master Certified Coach (MCC)',
      avatar: '/instructors/david-kumar.jpg',
    },
    schedule: {
      date: 'Nov 29, 2025',
      time: '11:00 AM PST',
      duration: '3 hours',
    },
    format: 'live',
    capacity: {
      total: 35,
      remaining: 0,
    },
    price: {
      amount: 549,
    },
    outcomes: [
      'Apply advanced coaching models to AI transformation',
      'Navigate resistance and build buy-in',
      'Coach leaders through strategic decision-making',
      'Measure coaching impact on business outcomes',
    ],
    pillar: 'coaching',
    level: 'intermediate',
    tags: ['Advanced Coaching', 'Leadership', 'Change Management', 'SOLD OUT'],
  },

  // COACHING PILLAR - Beginner (Featured)
  {
    id: 'coach-102',
    title: 'Building High-Performance Coaching Cultures',
    description: 'Create a coaching culture that drives continuous learning and adaptation. Learn to embed coaching throughout your organization.',
    instructor: {
      name: 'Michael Chen',
      title: 'Culture Transformation Specialist',
      avatar: '/instructors/michael-chen.jpg',
    },
    schedule: {
      date: 'Dec 10, 2025',
      time: '3:00 PM PST',
      duration: '2 hours',
    },
    format: 'hybrid',
    capacity: {
      total: 45,
      remaining: 18,
    },
    price: {
      amount: 399,
      earlyBird: 349,
    },
    outcomes: [
      'Design organization-wide coaching programs',
      'Train managers to become effective coaches',
      'Build systems that reinforce coaching behaviors',
      'Measure cultural transformation through coaching',
    ],
    pillar: 'coaching',
    level: 'beginner',
    tags: ['Culture', 'Manager Training', 'Learning Organization'],
  },

  // MARKETPLACE PILLAR - Beginner
  {
    id: 'market-101',
    title: 'Personal Branding in the AI Economy',
    description: 'Stand out in the talent marketplace. Build a compelling personal brand that showcases your unique human capabilities.',
    instructor: {
      name: 'Rachel Foster',
      title: 'Personal Brand Strategist',
      avatar: '/instructors/rachel-foster.jpg',
    },
    schedule: {
      date: 'Nov 20, 2025',
      time: '4:00 PM PST',
      duration: '2 hours',
    },
    format: 'live',
    capacity: {
      total: 75,
      remaining: 34,
    },
    price: {
      amount: 249,
      earlyBird: 199,
    },
    outcomes: [
      'Define your unique value proposition in the AI era',
      'Build an authentic and compelling personal brand',
      'Create visibility through strategic content',
      'Network effectively in digital-first environments',
    ],
    pillar: 'marketplace',
    level: 'beginner',
    tags: ['Personal Branding', 'Career Growth', 'Networking'],
  },

  // MARKETPLACE PILLAR - Intermediate
  {
    id: 'market-201',
    title: 'Talent Marketplace Mastery',
    description: 'Navigate internal and external talent marketplaces with confidence. Position yourself for the opportunities that matter.',
    instructor: {
      name: 'Alex Rivera',
      title: 'Talent Strategy Advisor',
      avatar: '/instructors/alex-rivera.jpg',
    },
    schedule: {
      date: 'Dec 1, 2025',
      time: '12:00 PM PST',
      duration: '2.5 hours',
    },
    format: 'live',
    capacity: {
      total: 50,
      remaining: 15,
    },
    price: {
      amount: 399,
      earlyBird: 349,
    },
    outcomes: [
      'Understand how AI is reshaping talent markets',
      'Position yourself for high-value opportunities',
      'Build strategic relationships with decision-makers',
      'Negotiate effectively in the new economy',
    ],
    pillar: 'marketplace',
    level: 'intermediate',
    tags: ['Career Strategy', 'Talent Markets', 'Negotiation'],
  },

  // MARKETPLACE PILLAR - Advanced
  {
    id: 'market-301',
    title: 'Building Internal Talent Marketplaces',
    description: 'Design and implement talent marketplaces that unlock human potential across your organization. Create systems for opportunity and growth.',
    instructor: {
      name: 'Dr. Patricia Wong',
      title: 'Workforce Innovation Leader',
      avatar: '/instructors/patricia-wong.jpg',
    },
    schedule: {
      date: 'Dec 12, 2025',
      time: '10:00 AM PST',
      duration: '4 hours',
    },
    format: 'hybrid',
    capacity: {
      total: 30,
      remaining: 7,
    },
    price: {
      amount: 699,
      earlyBird: 649,
    },
    outcomes: [
      'Design talent marketplace platforms and processes',
      'Build skills taxonomies and opportunity matching',
      'Create governance and measurement frameworks',
      'Drive adoption and cultural change',
    ],
    pillar: 'marketplace',
    level: 'advanced',
    tags: ['HR Technology', 'Talent Strategy', 'Platform Design', 'Executive'],
  },

  // CROSS-PILLAR WORKSHOPS
  {
    id: 'transform-101',
    title: 'The Complete AI Transformation Journey',
    description: 'A comprehensive workshop covering all three pillars: adaptability, coaching, and marketplace. Your complete guide to thriving in the AI era.',
    instructor: {
      name: 'The HMN Team',
      title: 'Transformation Specialists',
      avatar: '/instructors/team.jpg',
    },
    schedule: {
      date: 'Dec 15, 2025',
      time: '9:00 AM PST',
      duration: '6 hours',
    },
    format: 'live',
    capacity: {
      total: 100,
      remaining: 42,
    },
    price: {
      amount: 999,
      earlyBird: 849,
    },
    outcomes: [
      'Master the three pillars of AI-era success',
      'Create your personal transformation roadmap',
      'Build networks with fellow transformation leaders',
      'Access ongoing community and resources',
    ],
    pillar: 'adaptability',
    level: 'beginner',
    tags: ['Comprehensive', 'All Pillars', 'Community', 'Flagship'],
  },

  // Additional workshops for variety
  {
    id: 'adapt-skill-building',
    title: 'AI Skills for Non-Technical Leaders',
    description: 'Demystify AI technology. Build the technical fluency needed to lead AI initiatives without becoming a data scientist.',
    instructor: {
      name: 'Tom Anderson',
      title: 'Technology Translator',
      avatar: '/instructors/tom-anderson.jpg',
    },
    schedule: {
      date: 'Nov 25, 2025',
      time: '2:00 PM PST',
      duration: '3 hours',
    },
    format: 'live',
    capacity: {
      total: 55,
      remaining: 19,
    },
    price: {
      amount: 399,
      earlyBird: 349,
    },
    outcomes: [
      'Understand key AI concepts and terminology',
      'Evaluate AI solutions and vendors effectively',
      'Communicate technical concepts to stakeholders',
      'Make informed decisions about AI investments',
    ],
    pillar: 'adaptability',
    level: 'intermediate',
    tags: ['AI Literacy', 'Leadership', 'Non-Technical'],
  },

  {
    id: 'coach-assessment',
    title: 'AI-Powered Assessment & Coaching',
    description: 'Leverage AI tools to enhance your coaching practice. Learn to use assessments and AI insights to accelerate client growth.',
    instructor: {
      name: 'Lisa Martinez',
      title: 'Assessment Technology Expert',
      avatar: '/instructors/lisa-martinez.jpg',
    },
    schedule: {
      date: 'Dec 3, 2025',
      time: '1:00 PM PST',
      duration: '2.5 hours',
    },
    format: 'hybrid',
    capacity: {
      total: 40,
      remaining: 11,
    },
    price: {
      amount: 449,
    },
    outcomes: [
      'Master AI-powered coaching assessment tools',
      'Interpret and act on assessment insights',
      'Integrate technology into coaching workflows',
      'Maintain ethical standards with AI tools',
    ],
    pillar: 'coaching',
    level: 'intermediate',
    tags: ['Assessments', 'Technology', 'Coaching Tools'],
  },

  {
    id: 'market-skills-portfolio',
    title: 'Building Your Skills Portfolio',
    description: 'Create a dynamic skills portfolio that showcases your capabilities and opens doors to new opportunities in the AI economy.',
    instructor: {
      name: 'Jordan Lee',
      title: 'Skills Development Advisor',
      avatar: '/instructors/jordan-lee.jpg',
    },
    schedule: {
      date: 'Nov 27, 2025',
      time: '5:00 PM PST',
      duration: '2 hours',
    },
    format: 'recorded',
    capacity: {
      total: 150,
      remaining: 87,
    },
    price: {
      amount: 199,
      earlyBird: 149,
    },
    outcomes: [
      'Build a comprehensive skills inventory',
      'Create compelling project portfolios',
      'Validate and showcase your expertise',
      'Connect skills to market opportunities',
    ],
    pillar: 'marketplace',
    level: 'beginner',
    tags: ['Skills', 'Portfolio', 'Career Development', 'On-Demand'],
  },

  {
    id: 'coach-emotional-intelligence',
    title: 'Emotional Intelligence in AI-Augmented Work',
    description: 'Develop the EQ skills that matter most when working alongside AI. Coach others to build empathy, connection, and human leadership.',
    instructor: {
      name: 'Dr. Samantha Brooks',
      title: 'EQ & Leadership Researcher',
      avatar: '/instructors/samantha-brooks.jpg',
    },
    schedule: {
      date: 'Dec 8, 2025',
      time: '11:00 AM PST',
      duration: '3 hours',
    },
    format: 'live',
    capacity: {
      total: 45,
      remaining: 4,
    },
    price: {
      amount: 499,
      earlyBird: 449,
    },
    outcomes: [
      'Assess and develop emotional intelligence competencies',
      'Coach clients to build stronger relationships',
      'Navigate AI-human collaboration challenges',
      'Build team cultures of empathy and trust',
    ],
    pillar: 'coaching',
    level: 'intermediate',
    tags: ['Emotional Intelligence', 'Soft Skills', 'Team Building'],
  },

  {
    id: 'market-future-skills',
    title: 'Future-Proofing Your Career',
    description: 'Identify and develop the skills that will remain valuable as AI evolves. Build a career resilient to technological change.',
    instructor: {
      name: 'Kevin Zhang',
      title: 'Future of Work Strategist',
      avatar: '/instructors/kevin-zhang.jpg',
    },
    schedule: {
      date: 'Dec 6, 2025',
      time: '3:00 PM PST',
      duration: '2 hours',
    },
    format: 'live',
    capacity: {
      total: 65,
      remaining: 28,
    },
    price: {
      amount: 299,
      earlyBird: 249,
    },
    outcomes: [
      'Identify skills resistant to AI automation',
      'Build a future-focused learning roadmap',
      'Develop meta-skills for continuous adaptation',
      'Position yourself for emerging opportunities',
    ],
    pillar: 'marketplace',
    level: 'beginner',
    tags: ['Future Skills', 'Career Planning', 'Lifelong Learning'],
  },
]

// Helper functions for filtering
export const getWorkshopsByPillar = (pillar: Workshop['pillar']) => {
  return mockWorkshops.filter((w) => w.pillar === pillar)
}

export const getWorkshopsByLevel = (level: Workshop['level']) => {
  return mockWorkshops.filter((w) => w.level === level)
}

export const getWorkshopById = (id: string) => {
  return mockWorkshops.find((w) => w.id === id)
}

export const searchWorkshops = (query: string) => {
  const lowerQuery = query.toLowerCase()
  return mockWorkshops.filter(
    (w) =>
      w.title.toLowerCase().includes(lowerQuery) ||
      w.description.toLowerCase().includes(lowerQuery) ||
      w.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  )
}
