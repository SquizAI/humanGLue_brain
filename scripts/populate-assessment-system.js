#!/usr/bin/env node

/**
 * Populate Assessment System
 * Creates assessment templates, question bank, and question flows
 * for the HumanGlue AI Maturity Assessment Platform
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// ============================================================
// ASSESSMENT TEMPLATES
// ============================================================

const assessmentTemplates = [
  {
    name: 'AI Adaptability Assessment',
    description: 'Comprehensive assessment measuring individual and organizational adaptability to AI transformation across 5 key dimensions.',
    pillar: 'adaptability',
    version: 1,
    duration_minutes: 45,
    questions: [], // Questions will be linked via question_bank
    scoring_config: {
      dimensions: {
        individual: { weight: 0.25, maxScore: 100 },
        leadership: { weight: 0.20, maxScore: 100 },
        cultural: { weight: 0.20, maxScore: 100 },
        embedding: { weight: 0.20, maxScore: 100 },
        velocity: { weight: 0.15, maxScore: 100 }
      },
      maturityLevels: [
        { level: 0, name: 'Unaware', minScore: 0, maxScore: 10 },
        { level: 1, name: 'Aware', minScore: 11, maxScore: 20 },
        { level: 2, name: 'Exploring', minScore: 21, maxScore: 30 },
        { level: 3, name: 'Experimenting', minScore: 31, maxScore: 40 },
        { level: 4, name: 'Adopting', minScore: 41, maxScore: 50 },
        { level: 5, name: 'Scaling', minScore: 51, maxScore: 60 },
        { level: 6, name: 'Optimizing', minScore: 61, maxScore: 70 },
        { level: 7, name: 'Innovating', minScore: 71, maxScore: 80 },
        { level: 8, name: 'Leading', minScore: 81, maxScore: 90 },
        { level: 9, name: 'Transforming', minScore: 91, maxScore: 100 }
      ]
    }
  },
  {
    name: 'AI Coaching Readiness Assessment',
    description: 'Evaluate readiness for AI-powered coaching and personalized learning experiences.',
    pillar: 'coaching',
    version: 1,
    duration_minutes: 30,
    questions: [],
    scoring_config: {
      dimensions: {
        individual: { weight: 0.30, maxScore: 100 },
        leadership: { weight: 0.25, maxScore: 100 },
        cultural: { weight: 0.20, maxScore: 100 },
        embedding: { weight: 0.15, maxScore: 100 },
        velocity: { weight: 0.10, maxScore: 100 }
      },
      maturityLevels: [
        { level: 0, name: 'Unaware', minScore: 0, maxScore: 10 },
        { level: 1, name: 'Aware', minScore: 11, maxScore: 20 },
        { level: 2, name: 'Exploring', minScore: 21, maxScore: 30 },
        { level: 3, name: 'Experimenting', minScore: 31, maxScore: 40 },
        { level: 4, name: 'Adopting', minScore: 41, maxScore: 50 },
        { level: 5, name: 'Scaling', minScore: 51, maxScore: 60 },
        { level: 6, name: 'Optimizing', minScore: 61, maxScore: 70 },
        { level: 7, name: 'Innovating', minScore: 71, maxScore: 80 },
        { level: 8, name: 'Leading', minScore: 81, maxScore: 90 },
        { level: 9, name: 'Transforming', minScore: 91, maxScore: 100 }
      ]
    }
  },
  {
    name: 'AI Marketplace Readiness Assessment',
    description: 'Assess organizational readiness to leverage AI marketplaces and external AI solutions.',
    pillar: 'marketplace',
    version: 1,
    duration_minutes: 35,
    questions: [],
    scoring_config: {
      dimensions: {
        individual: { weight: 0.15, maxScore: 100 },
        leadership: { weight: 0.25, maxScore: 100 },
        cultural: { weight: 0.20, maxScore: 100 },
        embedding: { weight: 0.25, maxScore: 100 },
        velocity: { weight: 0.15, maxScore: 100 }
      },
      maturityLevels: [
        { level: 0, name: 'Unaware', minScore: 0, maxScore: 10 },
        { level: 1, name: 'Aware', minScore: 11, maxScore: 20 },
        { level: 2, name: 'Exploring', minScore: 21, maxScore: 30 },
        { level: 3, name: 'Experimenting', minScore: 31, maxScore: 40 },
        { level: 4, name: 'Adopting', minScore: 41, maxScore: 50 },
        { level: 5, name: 'Scaling', minScore: 51, maxScore: 60 },
        { level: 6, name: 'Optimizing', minScore: 61, maxScore: 70 },
        { level: 7, name: 'Innovating', minScore: 71, maxScore: 80 },
        { level: 8, name: 'Leading', minScore: 81, maxScore: 90 },
        { level: 9, name: 'Transforming', minScore: 91, maxScore: 100 }
      ]
    }
  }
]

// ============================================================
// QUESTION BANK - Comprehensive Questions by Dimension
// ============================================================

const questionBank = [
  // INDIVIDUAL DIMENSION - Learning Agility & Personal AI Adoption
  {
    question_code: 'IND_001',
    question_text: 'How comfortable are you learning new AI tools and technologies?',
    question_description: 'Assesses personal learning agility for AI adoption',
    help_text: 'Think about how you felt when introduced to new software or AI tools in the past year.',
    dimension: 'individual',
    subdimension: 'learning_agility',
    answer_type: 'scale',
    weight: 2,
    answer_options: [
      { value: 0, label: 'Very Uncomfortable', description: 'I avoid new AI tools whenever possible' },
      { value: 25, label: 'Somewhat Uncomfortable', description: 'I feel anxious but will try if required' },
      { value: 50, label: 'Neutral', description: 'I can adapt but prefer familiar tools' },
      { value: 75, label: 'Comfortable', description: 'I enjoy learning new AI tools' },
      { value: 100, label: 'Very Comfortable', description: 'I actively seek out new AI tools to learn' }
    ],
    display_order: 1,
    question_group: 'learning'
  },
  {
    question_code: 'IND_002',
    question_text: 'How often do you experiment with AI tools in your daily work?',
    question_description: 'Measures frequency of AI experimentation',
    dimension: 'individual',
    subdimension: 'experimentation',
    answer_type: 'multiChoice',
    weight: 2,
    answer_options: [
      { value: 0, label: 'Never' },
      { value: 20, label: 'Rarely (once a month or less)' },
      { value: 40, label: 'Sometimes (weekly)' },
      { value: 60, label: 'Often (several times a week)' },
      { value: 80, label: 'Very Often (daily)' },
      { value: 100, label: 'Constantly (multiple times daily)' }
    ],
    display_order: 2,
    question_group: 'adoption'
  },
  {
    question_code: 'IND_003',
    question_text: 'When AI makes a mistake in your work, how do you typically respond?',
    question_description: 'Assesses resilience and problem-solving approach with AI',
    dimension: 'individual',
    subdimension: 'resilience',
    answer_type: 'multiChoice',
    weight: 2,
    answer_options: [
      { value: 0, label: 'I stop using AI entirely', description: 'Loss of trust leads to abandonment' },
      { value: 25, label: 'I get frustrated and avoid that tool', description: 'Negative experience creates avoidance' },
      { value: 50, label: 'I try again but remain skeptical', description: 'Cautious continuation' },
      { value: 75, label: 'I try to understand why it failed', description: 'Learning opportunity mindset' },
      { value: 100, label: 'I use it as a learning opportunity to improve my prompts', description: 'Growth mindset with AI' }
    ],
    display_order: 3,
    question_group: 'mindset'
  },
  {
    question_code: 'IND_004',
    question_text: 'How would you rate your current AI skill level?',
    question_description: 'Self-assessment of AI proficiency',
    dimension: 'individual',
    subdimension: 'skill_level',
    answer_type: 'scale',
    weight: 1,
    answer_options: [
      { value: 0, label: 'Novice', description: 'Little to no experience with AI' },
      { value: 25, label: 'Beginner', description: 'Basic understanding, limited practical use' },
      { value: 50, label: 'Intermediate', description: 'Regular use with moderate proficiency' },
      { value: 75, label: 'Advanced', description: 'Deep understanding and frequent innovative use' },
      { value: 100, label: 'Expert', description: 'Leading AI initiatives and teaching others' }
    ],
    display_order: 4,
    question_group: 'skills'
  },
  {
    question_code: 'IND_005',
    question_text: 'How do you feel about AI potentially changing your job responsibilities?',
    question_description: 'Measures emotional response to AI-driven change',
    dimension: 'individual',
    subdimension: 'change_readiness',
    answer_type: 'fearToConfidence',
    weight: 2,
    answer_options: [
      { value: 0, label: 'Very Fearful', description: 'I worry AI will make my skills obsolete' },
      { value: 25, label: 'Somewhat Anxious', description: 'I have concerns about my future role' },
      { value: 50, label: 'Neutral', description: 'I\'m uncertain but open to change' },
      { value: 75, label: 'Optimistic', description: 'I see opportunities in AI-driven changes' },
      { value: 100, label: 'Very Confident', description: 'I\'m excited to evolve my role with AI' }
    ],
    display_order: 5,
    question_group: 'mindset'
  },
  {
    question_code: 'IND_006',
    question_text: 'In the past 6 months, how many new AI skills have you actively developed?',
    question_description: 'Tracks recent learning investment',
    dimension: 'individual',
    subdimension: 'continuous_learning',
    answer_type: 'multiChoice',
    weight: 2,
    answer_options: [
      { value: 0, label: 'None' },
      { value: 25, label: '1-2 skills' },
      { value: 50, label: '3-4 skills' },
      { value: 75, label: '5-6 skills' },
      { value: 100, label: '7+ skills' }
    ],
    display_order: 6,
    question_group: 'learning'
  },

  // LEADERSHIP DIMENSION - AI Vision & Strategy
  {
    question_code: 'LEAD_001',
    question_text: 'How clearly has leadership communicated the organization\'s AI strategy?',
    question_description: 'Assesses clarity of AI strategic communication',
    dimension: 'leadership',
    subdimension: 'strategic_clarity',
    answer_type: 'scale',
    weight: 2,
    answer_options: [
      { value: 0, label: 'No Communication', description: 'I\'m not aware of any AI strategy' },
      { value: 25, label: 'Vague', description: 'I\'ve heard mentions but no clear direction' },
      { value: 50, label: 'Somewhat Clear', description: 'I understand the basics but lack details' },
      { value: 75, label: 'Clear', description: 'I understand the strategy and my role in it' },
      { value: 100, label: 'Very Clear', description: 'Crystal clear strategy with regular updates' }
    ],
    display_order: 1,
    question_group: 'strategy'
  },
  {
    question_code: 'LEAD_002',
    question_text: 'Does leadership actively champion and support AI initiatives?',
    question_description: 'Measures visible leadership support for AI',
    dimension: 'leadership',
    subdimension: 'executive_sponsorship',
    answer_type: 'scale',
    weight: 2,
    answer_options: [
      { value: 0, label: 'No Support', description: 'Leadership seems resistant to AI' },
      { value: 25, label: 'Passive', description: 'Leadership allows but doesn\'t encourage AI' },
      { value: 50, label: 'Moderate', description: 'Some leaders support AI initiatives' },
      { value: 75, label: 'Strong', description: 'Most leaders actively support AI' },
      { value: 100, label: 'Exceptional', description: 'All leaders champion AI transformation' }
    ],
    display_order: 2,
    question_group: 'support'
  },
  {
    question_code: 'LEAD_003',
    question_text: 'How well does leadership model AI adoption in their own work?',
    question_description: 'Assesses leadership as role models for AI use',
    dimension: 'leadership',
    subdimension: 'role_modeling',
    answer_type: 'scale',
    weight: 2,
    answer_options: [
      { value: 0, label: 'Not at All', description: 'Leaders don\'t use AI themselves' },
      { value: 25, label: 'Rarely', description: 'Occasional AI use by some leaders' },
      { value: 50, label: 'Sometimes', description: 'Moderate AI use visible from leadership' },
      { value: 75, label: 'Often', description: 'Leaders frequently demonstrate AI use' },
      { value: 100, label: 'Always', description: 'Leaders are power users and share learnings' }
    ],
    display_order: 3,
    question_group: 'behavior'
  },
  {
    question_code: 'LEAD_004',
    question_text: 'How effectively does leadership allocate resources for AI training and tools?',
    question_description: 'Measures resource commitment to AI enablement',
    dimension: 'leadership',
    subdimension: 'resource_allocation',
    answer_type: 'scale',
    weight: 2,
    answer_options: [
      { value: 0, label: 'No Resources', description: 'No budget for AI training or tools' },
      { value: 25, label: 'Limited', description: 'Minimal resources available' },
      { value: 50, label: 'Adequate', description: 'Basic resources for AI adoption' },
      { value: 75, label: 'Good', description: 'Substantial investment in AI enablement' },
      { value: 100, label: 'Excellent', description: 'Comprehensive AI resources and support' }
    ],
    display_order: 4,
    question_group: 'resources'
  },
  {
    question_code: 'LEAD_005',
    question_text: 'How well does leadership handle setbacks or failures in AI projects?',
    question_description: 'Assesses leadership resilience with AI challenges',
    dimension: 'leadership',
    subdimension: 'failure_tolerance',
    answer_type: 'scale',
    weight: 2,
    answer_options: [
      { value: 0, label: 'Punitive', description: 'Failures result in blame and consequences' },
      { value: 25, label: 'Critical', description: 'Failures are met with skepticism about AI' },
      { value: 50, label: 'Accepting', description: 'Failures are tolerated but not analyzed' },
      { value: 75, label: 'Learning-Focused', description: 'Failures are studied for improvement' },
      { value: 100, label: 'Encouraging', description: 'Safe to fail culture drives innovation' }
    ],
    display_order: 5,
    question_group: 'culture'
  },

  // CULTURAL DIMENSION - AI Culture & Norms
  {
    question_code: 'CULT_001',
    question_text: 'How would you describe your organization\'s general attitude toward AI?',
    question_description: 'Measures organizational AI sentiment',
    dimension: 'cultural',
    subdimension: 'ai_sentiment',
    answer_type: 'scale',
    weight: 2,
    answer_options: [
      { value: 0, label: 'Hostile', description: 'AI is seen as a threat' },
      { value: 25, label: 'Skeptical', description: 'Doubts about AI value are common' },
      { value: 50, label: 'Curious', description: 'Interest in AI but cautious approach' },
      { value: 75, label: 'Enthusiastic', description: 'Positive attitude toward AI adoption' },
      { value: 100, label: 'AI-First', description: 'AI is core to how we work' }
    ],
    display_order: 1,
    question_group: 'sentiment'
  },
  {
    question_code: 'CULT_002',
    question_text: 'How safe do employees feel sharing AI experiments or failures?',
    question_description: 'Measures psychological safety for AI experimentation',
    dimension: 'cultural',
    subdimension: 'psychological_safety',
    answer_type: 'scale',
    weight: 2,
    answer_options: [
      { value: 0, label: 'Not Safe', description: 'Fear of judgment prevents sharing' },
      { value: 25, label: 'Somewhat Unsafe', description: 'Sharing is risky' },
      { value: 50, label: 'Neutral', description: 'Mixed reactions to sharing' },
      { value: 75, label: 'Safe', description: 'Most sharing is welcomed' },
      { value: 100, label: 'Very Safe', description: 'Sharing failures is celebrated' }
    ],
    display_order: 2,
    question_group: 'safety'
  },
  {
    question_code: 'CULT_003',
    question_text: 'How often do teams collaborate on AI initiatives across departments?',
    question_description: 'Measures cross-functional AI collaboration',
    dimension: 'cultural',
    subdimension: 'collaboration',
    answer_type: 'multiChoice',
    weight: 2,
    answer_options: [
      { value: 0, label: 'Never', description: 'AI work is siloed' },
      { value: 25, label: 'Rarely', description: 'Occasional cross-team projects' },
      { value: 50, label: 'Sometimes', description: 'Regular but limited collaboration' },
      { value: 75, label: 'Often', description: 'Frequent cross-functional AI work' },
      { value: 100, label: 'Always', description: 'AI is inherently collaborative' }
    ],
    display_order: 3,
    question_group: 'teamwork'
  },
  {
    question_code: 'CULT_004',
    question_text: 'Is there a culture of knowledge sharing about AI best practices?',
    question_description: 'Assesses AI knowledge sharing culture',
    dimension: 'cultural',
    subdimension: 'knowledge_sharing',
    answer_type: 'scale',
    weight: 2,
    answer_options: [
      { value: 0, label: 'None', description: 'People keep AI knowledge to themselves' },
      { value: 25, label: 'Limited', description: 'Some informal sharing' },
      { value: 50, label: 'Moderate', description: 'Regular but unstructured sharing' },
      { value: 75, label: 'Good', description: 'Structured knowledge sharing programs' },
      { value: 100, label: 'Excellent', description: 'Robust AI knowledge sharing ecosystem' }
    ],
    display_order: 4,
    question_group: 'learning'
  },
  {
    question_code: 'CULT_005',
    question_text: 'How does the organization handle ethical concerns about AI?',
    question_description: 'Measures AI ethics culture',
    dimension: 'cultural',
    subdimension: 'ethics',
    answer_type: 'scale',
    weight: 2,
    answer_options: [
      { value: 0, label: 'Ignored', description: 'Ethics not considered' },
      { value: 25, label: 'Reactive', description: 'Only addressed when problems arise' },
      { value: 50, label: 'Aware', description: 'Acknowledged but not prioritized' },
      { value: 75, label: 'Proactive', description: 'Ethics considered in AI decisions' },
      { value: 100, label: 'Embedded', description: 'Ethics is central to AI strategy' }
    ],
    display_order: 5,
    question_group: 'governance'
  },

  // EMBEDDING DIMENSION - AI Integration & Processes
  {
    question_code: 'EMB_001',
    question_text: 'How deeply is AI integrated into your core business processes?',
    question_description: 'Measures AI process integration depth',
    dimension: 'embedding',
    subdimension: 'process_integration',
    answer_type: 'scale',
    weight: 2,
    answer_options: [
      { value: 0, label: 'Not at All', description: 'AI is not part of any processes' },
      { value: 25, label: 'Peripheral', description: 'AI used in few non-critical areas' },
      { value: 50, label: 'Supporting', description: 'AI supports some key processes' },
      { value: 75, label: 'Integrated', description: 'AI is integral to most processes' },
      { value: 100, label: 'Core', description: 'AI is fundamental to operations' }
    ],
    display_order: 1,
    question_group: 'integration'
  },
  {
    question_code: 'EMB_002',
    question_text: 'How mature is your AI governance framework?',
    question_description: 'Assesses AI governance maturity',
    dimension: 'embedding',
    subdimension: 'governance',
    answer_type: 'scale',
    weight: 2,
    answer_options: [
      { value: 0, label: 'None', description: 'No governance structure' },
      { value: 25, label: 'Basic', description: 'Informal guidelines exist' },
      { value: 50, label: 'Developing', description: 'Formal policies being created' },
      { value: 75, label: 'Established', description: 'Clear governance framework' },
      { value: 100, label: 'Advanced', description: 'Comprehensive, adaptive governance' }
    ],
    display_order: 2,
    question_group: 'governance'
  },
  {
    question_code: 'EMB_003',
    question_text: 'How well does AI integrate with existing technology systems?',
    question_description: 'Measures technical AI integration',
    dimension: 'embedding',
    subdimension: 'technical_integration',
    answer_type: 'scale',
    weight: 2,
    answer_options: [
      { value: 0, label: 'No Integration', description: 'AI tools are standalone' },
      { value: 25, label: 'Limited', description: 'Some basic integrations' },
      { value: 50, label: 'Moderate', description: 'Key system integrations exist' },
      { value: 75, label: 'Good', description: 'Most systems connect to AI' },
      { value: 100, label: 'Seamless', description: 'AI is fully integrated across stack' }
    ],
    display_order: 3,
    question_group: 'technology'
  },
  {
    question_code: 'EMB_004',
    question_text: 'How standardized are AI practices across your organization?',
    question_description: 'Measures AI practice standardization',
    dimension: 'embedding',
    subdimension: 'standardization',
    answer_type: 'scale',
    weight: 2,
    answer_options: [
      { value: 0, label: 'None', description: 'Every team does their own thing' },
      { value: 25, label: 'Low', description: 'Some common practices emerging' },
      { value: 50, label: 'Moderate', description: 'Guidelines exist but vary in adoption' },
      { value: 75, label: 'High', description: 'Consistent practices across most teams' },
      { value: 100, label: 'Full', description: 'Unified AI practices organization-wide' }
    ],
    display_order: 4,
    question_group: 'processes'
  },
  {
    question_code: 'EMB_005',
    question_text: 'How well does your organization measure AI ROI and impact?',
    question_description: 'Assesses AI impact measurement maturity',
    dimension: 'embedding',
    subdimension: 'measurement',
    answer_type: 'scale',
    weight: 2,
    answer_options: [
      { value: 0, label: 'Not at All', description: 'No measurement of AI impact' },
      { value: 25, label: 'Basic', description: 'Ad-hoc measurement attempts' },
      { value: 50, label: 'Developing', description: 'Some KPIs for AI initiatives' },
      { value: 75, label: 'Good', description: 'Systematic ROI tracking' },
      { value: 100, label: 'Advanced', description: 'Comprehensive AI value measurement' }
    ],
    display_order: 5,
    question_group: 'metrics'
  },

  // VELOCITY DIMENSION - Speed of AI Adoption
  {
    question_code: 'VEL_001',
    question_text: 'How quickly can your organization deploy new AI solutions?',
    question_description: 'Measures AI deployment speed',
    dimension: 'velocity',
    subdimension: 'deployment_speed',
    answer_type: 'multiChoice',
    weight: 2,
    answer_options: [
      { value: 0, label: 'Very Slow (1+ year)', description: 'Long approval and deployment cycles' },
      { value: 25, label: 'Slow (6-12 months)', description: 'Significant barriers to deployment' },
      { value: 50, label: 'Moderate (3-6 months)', description: 'Standard enterprise timeline' },
      { value: 75, label: 'Fast (1-3 months)', description: 'Agile deployment capabilities' },
      { value: 100, label: 'Very Fast (< 1 month)', description: 'Rapid experimentation and deployment' }
    ],
    display_order: 1,
    question_group: 'speed'
  },
  {
    question_code: 'VEL_002',
    question_text: 'How responsive is your organization to new AI capabilities?',
    question_description: 'Assesses responsiveness to AI innovations',
    dimension: 'velocity',
    subdimension: 'responsiveness',
    answer_type: 'scale',
    weight: 2,
    answer_options: [
      { value: 0, label: 'Not Responsive', description: 'New AI capabilities are ignored' },
      { value: 25, label: 'Slow', description: 'Late adoption of proven technologies' },
      { value: 50, label: 'Average', description: 'Adopt when industry standard' },
      { value: 75, label: 'Quick', description: 'Early adoption of promising AI' },
      { value: 100, label: 'Leading', description: 'First-mover on AI innovations' }
    ],
    display_order: 2,
    question_group: 'innovation'
  },
  {
    question_code: 'VEL_003',
    question_text: 'How quickly do employees adopt new AI tools once introduced?',
    question_description: 'Measures employee AI tool adoption speed',
    dimension: 'velocity',
    subdimension: 'user_adoption',
    answer_type: 'multiChoice',
    weight: 2,
    answer_options: [
      { value: 0, label: 'Very Slow (6+ months)', description: 'Resistance to new tools' },
      { value: 25, label: 'Slow (3-6 months)', description: 'Gradual reluctant adoption' },
      { value: 50, label: 'Moderate (1-3 months)', description: 'Standard learning curve' },
      { value: 75, label: 'Fast (2-4 weeks)', description: 'Quick uptake with training' },
      { value: 100, label: 'Very Fast (< 2 weeks)', description: 'Rapid enthusiastic adoption' }
    ],
    display_order: 3,
    question_group: 'adoption'
  },
  {
    question_code: 'VEL_004',
    question_text: 'How fast can your organization iterate on AI experiments?',
    question_description: 'Measures experimentation cycle speed',
    dimension: 'velocity',
    subdimension: 'iteration_speed',
    answer_type: 'scale',
    weight: 2,
    answer_options: [
      { value: 0, label: 'No Iteration', description: 'We don\'t experiment with AI' },
      { value: 25, label: 'Slow', description: 'Long cycles between experiments' },
      { value: 50, label: 'Moderate', description: 'Monthly experiment cycles' },
      { value: 75, label: 'Fast', description: 'Weekly experiment cycles' },
      { value: 100, label: 'Continuous', description: 'Always running AI experiments' }
    ],
    display_order: 4,
    question_group: 'experimentation'
  },
  {
    question_code: 'VEL_005',
    question_text: 'How well does your organization scale successful AI pilots?',
    question_description: 'Assesses AI scaling capability',
    dimension: 'velocity',
    subdimension: 'scaling',
    answer_type: 'scale',
    weight: 2,
    answer_options: [
      { value: 0, label: 'Cannot Scale', description: 'Pilots never become production' },
      { value: 25, label: 'Difficult', description: 'Scaling is rare and challenging' },
      { value: 50, label: 'Moderate', description: 'Some pilots scale successfully' },
      { value: 75, label: 'Good', description: 'Most pilots scale when successful' },
      { value: 100, label: 'Excellent', description: 'Clear path from pilot to enterprise' }
    ],
    display_order: 5,
    question_group: 'scaling'
  }
]

// ============================================================
// QUESTION FLOWS
// ============================================================

const questionFlows = [
  {
    flow_name: 'full_assessment_standard',
    flow_description: 'Complete AI Maturity Assessment covering all 5 dimensions',
    flow_type: 'standard',
    assessment_type: 'full',
    question_selection_strategy: 'sequential',
    question_codes: [
      // Individual
      'IND_001', 'IND_002', 'IND_003', 'IND_004', 'IND_005', 'IND_006',
      // Leadership
      'LEAD_001', 'LEAD_002', 'LEAD_003', 'LEAD_004', 'LEAD_005',
      // Cultural
      'CULT_001', 'CULT_002', 'CULT_003', 'CULT_004', 'CULT_005',
      // Embedding
      'EMB_001', 'EMB_002', 'EMB_003', 'EMB_004', 'EMB_005',
      // Velocity
      'VEL_001', 'VEL_002', 'VEL_003', 'VEL_004', 'VEL_005'
    ],
    branching_rules: [
      {
        from_question: 'IND_004',
        condition: { operator: 'gte', value: 75 },
        to_questions: ['IND_006'] // Skip to advanced questions if high skill
      },
      {
        from_question: 'LEAD_001',
        condition: { operator: 'lte', value: 25 },
        to_questions: ['LEAD_005'] // Jump to failure tolerance if strategy unclear
      }
    ]
  },
  {
    flow_name: 'quick_assessment',
    flow_description: 'Quick 10-question AI readiness check',
    flow_type: 'quick',
    assessment_type: 'quick',
    question_selection_strategy: 'sequential',
    question_codes: [
      'IND_001', 'IND_005',  // Individual
      'LEAD_001', 'LEAD_002', // Leadership
      'CULT_001', 'CULT_002', // Cultural
      'EMB_001', 'EMB_002',   // Embedding
      'VEL_001', 'VEL_002'    // Velocity
    ],
    branching_rules: []
  },
  {
    flow_name: 'technology_industry_assessment',
    flow_description: 'Tailored assessment for technology companies',
    flow_type: 'industry_specific',
    industries: ['technology', 'software', 'saas'],
    assessment_type: 'full',
    question_selection_strategy: 'adaptive',
    question_codes: [
      'IND_001', 'IND_002', 'IND_003', 'IND_004', 'IND_005', 'IND_006',
      'LEAD_001', 'LEAD_002', 'LEAD_003', 'LEAD_004', 'LEAD_005',
      'CULT_001', 'CULT_002', 'CULT_003', 'CULT_004', 'CULT_005',
      'EMB_001', 'EMB_002', 'EMB_003', 'EMB_004', 'EMB_005',
      'VEL_001', 'VEL_002', 'VEL_003', 'VEL_004', 'VEL_005'
    ],
    branching_rules: []
  },
  {
    flow_name: 'financial_services_assessment',
    flow_description: 'Tailored assessment for financial services with emphasis on governance',
    flow_type: 'industry_specific',
    industries: ['finance', 'banking', 'insurance', 'fintech'],
    assessment_type: 'full',
    question_selection_strategy: 'sequential',
    question_codes: [
      'IND_001', 'IND_002', 'IND_003', 'IND_004', 'IND_005',
      'LEAD_001', 'LEAD_002', 'LEAD_003', 'LEAD_004', 'LEAD_005',
      'CULT_001', 'CULT_002', 'CULT_003', 'CULT_004', 'CULT_005',
      'EMB_001', 'EMB_002', 'EMB_003', 'EMB_004', 'EMB_005',
      'VEL_001', 'VEL_002', 'VEL_003', 'VEL_004', 'VEL_005'
    ],
    branching_rules: []
  }
]

// ============================================================
// MAIN EXECUTION
// ============================================================

async function populateAssessmentSystem() {
  console.log('🚀 Starting Assessment System Population...\n')

  // Step 1: Create Assessment Templates
  console.log('📋 Creating Assessment Templates...')
  for (const template of assessmentTemplates) {
    const { data, error } = await supabase
      .from('assessment_templates')
      .upsert({
        ...template,
        questions: JSON.stringify(template.questions),
        scoring_config: template.scoring_config
      }, { onConflict: 'name' })
      .select()

    if (error) {
      console.log(`  ❌ Error creating template ${template.name}:`, error.message)
    } else {
      console.log(`  ✅ Created template: ${template.name}`)
    }
  }

  // Step 2: Populate Question Bank
  console.log('\n📝 Populating Question Bank...')
  let questionsCreated = 0
  for (const question of questionBank) {
    const { error } = await supabase
      .from('question_bank')
      .insert(question)

    if (error) {
      if (error.code === '23505') {
        console.log(`  ⚠️  Question ${question.question_code} already exists`)
      } else {
        console.log(`  ❌ Error creating question ${question.question_code}:`, error.message)
      }
    } else {
      questionsCreated++
    }
  }
  console.log(`  ✅ Created ${questionsCreated} questions`)

  // Step 3: Create Question Flows
  console.log('\n🔄 Creating Question Flows...')
  for (const flow of questionFlows) {
    const { error } = await supabase
      .from('question_flows')
      .insert(flow)

    if (error) {
      if (error.code === '23505') {
        console.log(`  ⚠️  Flow ${flow.flow_name} already exists`)
      } else {
        console.log(`  ❌ Error creating flow ${flow.flow_name}:`, error.message)
      }
    } else {
      console.log(`  ✅ Created flow: ${flow.flow_name}`)
    }
  }

  // Summary
  console.log('\n🎉 Assessment System Population Complete!')
  console.log(`   Templates: ${assessmentTemplates.length}`)
  console.log(`   Questions: ${questionBank.length}`)
  console.log(`   Flows: ${questionFlows.length}`)

  // Verify
  const { data: questionCount } = await supabase
    .from('question_bank')
    .select('dimension', { count: 'exact' })

  const { data: flowCount } = await supabase
    .from('question_flows')
    .select('*', { count: 'exact' })

  console.log('\n📊 Verification:')
  console.log(`   Questions in bank: ${questionCount?.length || 0}`)
  console.log(`   Active flows: ${flowCount?.length || 0}`)
}

populateAssessmentSystem().catch(console.error)
