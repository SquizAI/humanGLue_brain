/**
 * Workshop Test Fixtures
 * Mock data for workshop-related tests
 */

import { Workshop } from '@/components/workshops/WorkshopCard'

export const mockWorkshops: Workshop[] = [
  {
    id: 'adapt-101',
    title: 'AI Adaptability Fundamentals',
    description:
      'Build core adaptability skills needed to thrive in an AI-augmented workplace. Learn change readiness frameworks and practical strategies.',
    pillar: 'adaptability',
    level: 'beginner',
    format: 'live',
    schedule: {
      date: '2025-03-15',
      time: '10:00 AM',
      duration: "2 hours",
    },
    capacity: {
      total: 25,
      remaining: 12,
    },
    price: {
      amount: 299,
      earlyBird: 249,
    },
    instructor: { 
      name: 'Sarah Johnson',
      title: 'AI Adaptability Expert',
      avatar: '/instructors/default.jpg',
    },
    tags: ['ai', 'change-management', 'adaptability'],
    outcomes: [
      'Understand the 5 dimensions of adaptability',
      'Build change readiness skills',
      'Develop learning agility',
      'Create personal transformation roadmap',
    ],
  },
  {
    id: 'coach-102',
    title: 'AI-Augmented Coaching Certification',
    description:
      'Master coaching techniques enhanced by AI tools. Learn to guide individuals and teams through AI transformation.',
    pillar: 'coaching',
    level: 'intermediate',
    format: 'hybrid',
    schedule: {
      date: '2025-04-10',
      time: '2:00 PM',
      duration: "3 hours",
    },
    capacity: {
      total: 15,
      remaining: 8,
    },
    price: {
      amount: 599,
      earlyBird: 499,
    },
    instructor: { 
      name: 'Michael Chen',
      title: 'AI Coaching Specialist',
      avatar: '/instructors/default.jpg',
    },
    tags: ['coaching', 'certification', 'ai-tools'],
    outcomes: [
      'Earn AI-Augmented Coaching Certification',
      'Master GROW model for AI adoption',
      'Learn AI-assisted coaching techniques',
      'Build coaching practice with AI tools',
    ],
  },
  {
    id: 'market-103',
    title: 'Talent Marketplace Success',
    description:
      'Navigate the modern talent marketplace with confidence. Build your personal brand and connect with opportunities.',
    pillar: 'marketplace',
    level: 'beginner',
    format: 'live',
    schedule: {
      date: '2025-03-22',
      time: '11:00 AM',
      duration: "90 minutes",
    },
    capacity: {
      total: 30,
      remaining: 0, // Sold out
    },
    price: {
      amount: 199,
      earlyBird: 149,
    },
    instructor: { 
      name: 'Emily Rodriguez',
      title: 'Talent Marketplace Expert',
      avatar: '/instructors/default.jpg',
    },
    tags: ['marketplace', 'personal-branding', 'career'],
    outcomes: [
      'Build compelling marketplace profile',
      'Understand marketplace dynamics',
      'Develop pricing strategy',
      'Connect with opportunities',
    ],
  },
  {
    id: 'adapt-201',
    title: 'Advanced Adaptability Leadership',
    description:
      'Lead organizational transformation at scale. Advanced frameworks for embedding adaptability across teams.',
    pillar: 'adaptability',
    level: 'advanced',
    format: 'live',
    schedule: {
      date: '2025-05-01',
      time: '9:00 AM',
      duration: "8 hours",
    },
    capacity: {
      total: 20,
      remaining: 18,
    },
    price: {
      amount: 1299,
      earlyBird: 1099,
    },
    instructor: { 
      name: 'Sarah Johnson',
      title: 'AI Adaptability Expert',
      avatar: '/instructors/default.jpg',
    },
    tags: ['leadership', 'transformation', 'advanced'],
    outcomes: [
      'Master organizational change frameworks',
      'Lead transformation initiatives',
      'Build adaptability culture',
      'Measure transformation impact',
    ],
  },
  {
    id: 'coach-201',
    title: 'Executive AI Coaching Mastery',
    description:
      'Elite coaching program for C-suite executives navigating AI transformation. Limited cohort of 10 participants.',
    pillar: 'coaching',
    level: 'advanced',
    format: 'hybrid',
    schedule: {
      date: '2025-06-15',
      time: '10:00 AM',
      duration: "4 hours",
    },
    capacity: {
      total: 10,
      remaining: 3,
    },
    price: {
      amount: 2499,
    },
    instructor: { 
      name: 'Michael Chen',
      title: 'AI Coaching Specialist',
      avatar: '/instructors/default.jpg',
    },
    tags: ['executive', 'coaching', 'elite'],
    outcomes: [
      'Master executive coaching techniques',
      'Navigate C-suite AI transformation',
      'Build elite coaching practice',
      'Join executive coaching network',
    ],
  },
]

/**
 * Get workshop by ID
 */
export function getWorkshopById(id: string): Workshop | undefined {
  return mockWorkshops.find((w) => w.id === id)
}

/**
 * Filter workshops by pillar
 */
export function filterByPillar(pillar: Workshop['pillar']): Workshop[] {
  return mockWorkshops.filter((w) => w.pillar === pillar)
}

/**
 * Filter workshops by level
 */
export function filterByLevel(level: Workshop['level']): Workshop[] {
  return mockWorkshops.filter((w) => w.level === level)
}

/**
 * Get available workshops (not sold out)
 */
export function getAvailableWorkshops(): Workshop[] {
  return mockWorkshops.filter((w) => w.capacity.remaining > 0)
}

/**
 * Get sold out workshops
 */
export function getSoldOutWorkshops(): Workshop[] {
  return mockWorkshops.filter((w) => w.capacity.remaining === 0)
}

/**
 * Get featured workshops (first 2 workshops)
 */
export function getFeaturedWorkshops(): Workshop[] {
  return mockWorkshops.slice(0, 2)
}
