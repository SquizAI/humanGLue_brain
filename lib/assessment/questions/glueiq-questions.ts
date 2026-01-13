/**
 * GlueIQ Assessment Questions
 *
 * The GlueIQ Assessment measures individual AI adaptability across 5 dimensions:
 * 1. Individual Readiness - Personal AI literacy, tech comfort, growth mindset
 * 2. Leadership Capability - Change leadership, vision communication, coaching
 * 3. Cultural Alignment - Innovation embrace, collaboration, experimentation
 * 4. Behavior Embedding - Habit formation, sustainability, process integration
 * 5. Change Velocity - Speed of adoption, resilience, adaptability
 *
 * Total: 30 questions (~6 per dimension)
 * Estimated completion time: 10-15 minutes
 */

export interface QuestionOption {
  value: number
  label: string
  description?: string
}

export interface GlueIQQuestion {
  id: string
  code: string
  dimension: 'individual' | 'leadership' | 'cultural' | 'embedding' | 'velocity'
  subdimension: string
  question: string
  description?: string
  helpText?: string
  answerType: 'scale' | 'multiChoice' | 'fearToConfidence' | 'boolean'
  options?: QuestionOption[]
  weight: number
  order: number
  isRequired: boolean
  followUpCondition?: {
    questionCode: string
    operator: 'eq' | 'lt' | 'lte' | 'gt' | 'gte'
    value: number
  }
}

// ============================================================
// DIMENSION 1: INDIVIDUAL READINESS
// Measures personal AI literacy, tech comfort, and growth mindset
// ============================================================

const individualReadinessQuestions: GlueIQQuestion[] = [
  {
    id: 'glueiq-ind-001',
    code: 'IND_001',
    dimension: 'individual',
    subdimension: 'ai_literacy',
    question: 'How would you describe your current understanding of AI and its capabilities?',
    description: 'Consider your knowledge of how AI works, what it can and cannot do, and its potential applications.',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'No understanding', description: 'I have little to no knowledge about AI' },
      { value: 25, label: 'Basic awareness', description: 'I know AI exists but not how it works' },
      { value: 50, label: 'General understanding', description: 'I understand basic concepts and common applications' },
      { value: 75, label: 'Working knowledge', description: 'I can discuss AI capabilities and limitations knowledgeably' },
      { value: 100, label: 'Deep expertise', description: 'I have hands-on experience and can evaluate AI solutions' },
    ],
    weight: 1.2,
    order: 1,
    isRequired: true,
  },
  {
    id: 'glueiq-ind-002',
    code: 'IND_002',
    dimension: 'individual',
    subdimension: 'tech_comfort',
    question: 'When a new technology tool is introduced at work, how do you typically respond?',
    description: 'Think about your natural reaction when facing new software, apps, or digital processes.',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'Avoid it', description: 'I try to stick with what I know and avoid new tools' },
      { value: 25, label: 'Wait and see', description: 'I wait for others to try it first and only adopt if required' },
      { value: 50, label: 'Cautiously explore', description: 'I give it a try but prefer guidance and support' },
      { value: 75, label: 'Eager to learn', description: 'I actively explore new tools and enjoy learning them' },
      { value: 100, label: 'Early adopter', description: 'I seek out new tools and often help others learn them' },
    ],
    weight: 1.0,
    order: 2,
    isRequired: true,
  },
  {
    id: 'glueiq-ind-003',
    code: 'IND_003',
    dimension: 'individual',
    subdimension: 'growth_mindset',
    question: 'How do you view your ability to learn new skills at this stage of your career?',
    answerType: 'fearToConfidence',
    helpText: 'Move the slider from fear (I\'m too set in my ways) to confidence (I can learn anything)',
    weight: 1.3,
    order: 3,
    isRequired: true,
  },
  {
    id: 'glueiq-ind-004',
    code: 'IND_004',
    dimension: 'individual',
    subdimension: 'learning_agility',
    question: 'In the past year, how many new digital tools or AI-powered applications have you learned to use?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'None', description: 'I haven\'t learned any new digital tools' },
      { value: 25, label: '1-2 tools', description: 'I\'ve picked up a couple of new applications' },
      { value: 50, label: '3-5 tools', description: 'I regularly learn new tools as needed' },
      { value: 75, label: '6-10 tools', description: 'I actively seek out and learn new technologies' },
      { value: 100, label: 'More than 10', description: 'I continuously experiment with new tools and AI' },
    ],
    weight: 1.0,
    order: 4,
    isRequired: true,
  },
  {
    id: 'glueiq-ind-005',
    code: 'IND_005',
    dimension: 'individual',
    subdimension: 'ai_experience',
    question: 'How often do you currently use AI tools (like ChatGPT, Copilot, or AI features in apps) in your work?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'Never', description: 'I don\'t use any AI tools' },
      { value: 20, label: 'Rarely', description: 'Once a month or less' },
      { value: 40, label: 'Occasionally', description: 'A few times a month' },
      { value: 60, label: 'Weekly', description: 'Several times a week' },
      { value: 80, label: 'Daily', description: 'Every day for various tasks' },
      { value: 100, label: 'Constantly', description: 'AI is integrated into my core workflow' },
    ],
    weight: 1.1,
    order: 5,
    isRequired: true,
  },
  {
    id: 'glueiq-ind-006',
    code: 'IND_006',
    dimension: 'individual',
    subdimension: 'self_awareness',
    question: 'How confident are you in identifying which parts of your job could be enhanced or automated by AI?',
    answerType: 'scale',
    helpText: 'Rate from 0 (not confident at all) to 100 (very confident)',
    weight: 0.9,
    order: 6,
    isRequired: true,
  },
]

// ============================================================
// DIMENSION 2: LEADERSHIP CAPABILITY
// Measures ability to lead through change and inspire AI adoption
// ============================================================

const leadershipCapabilityQuestions: GlueIQQuestion[] = [
  {
    id: 'glueiq-lead-001',
    code: 'LEAD_001',
    dimension: 'leadership',
    subdimension: 'change_leadership',
    question: 'When your team faces a significant change, how do you typically approach leading them through it?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'Struggle with change', description: 'I find it hard to guide others through uncertainty' },
      { value: 25, label: 'Follow instructions', description: 'I implement changes as directed from above' },
      { value: 50, label: 'Communicate clearly', description: 'I explain the change and answer questions' },
      { value: 75, label: 'Inspire and support', description: 'I help the team see the vision and provide support' },
      { value: 100, label: 'Champion change', description: 'I lead by example and create excitement for transformation' },
    ],
    weight: 1.2,
    order: 1,
    isRequired: true,
  },
  {
    id: 'glueiq-lead-002',
    code: 'LEAD_002',
    dimension: 'leadership',
    subdimension: 'vision_communication',
    question: 'How effectively can you articulate a vision for how AI will transform your team\'s work?',
    answerType: 'fearToConfidence',
    helpText: 'Move the slider based on your ability to paint a compelling picture of the AI-enabled future',
    weight: 1.1,
    order: 2,
    isRequired: true,
  },
  {
    id: 'glueiq-lead-003',
    code: 'LEAD_003',
    dimension: 'leadership',
    subdimension: 'coaching',
    question: 'How often do you help colleagues or team members learn new technologies or AI tools?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'Never', description: 'I don\'t help others with technology' },
      { value: 25, label: 'Rarely', description: 'Only when specifically asked' },
      { value: 50, label: 'Sometimes', description: 'When I notice someone struggling' },
      { value: 75, label: 'Often', description: 'I regularly share knowledge and tips' },
      { value: 100, label: 'Always', description: 'I proactively mentor and train others' },
    ],
    weight: 1.0,
    order: 3,
    isRequired: true,
  },
  {
    id: 'glueiq-lead-004',
    code: 'LEAD_004',
    dimension: 'leadership',
    subdimension: 'psychological_safety',
    question: 'How comfortable would your team feel coming to you about AI-related concerns or fears?',
    answerType: 'scale',
    description: 'Consider whether your team feels safe discussing worries about job security, skill gaps, or technology anxiety.',
    helpText: 'Rate from 0 (not comfortable at all) to 100 (completely comfortable)',
    weight: 1.0,
    order: 4,
    isRequired: true,
  },
  {
    id: 'glueiq-lead-005',
    code: 'LEAD_005',
    dimension: 'leadership',
    subdimension: 'decision_making',
    question: 'When evaluating AI solutions for your team, how do you approach the decision?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'Avoid decisions', description: 'I defer to others or avoid AI-related decisions' },
      { value: 25, label: 'Follow mandates', description: 'I implement what\'s decided at higher levels' },
      { value: 50, label: 'Gather input', description: 'I consult with the team and stakeholders' },
      { value: 75, label: 'Strategic analysis', description: 'I evaluate ROI, risks, and alignment with goals' },
      { value: 100, label: 'Innovative leadership', description: 'I proactively identify AI opportunities and champion them' },
    ],
    weight: 1.1,
    order: 5,
    isRequired: true,
  },
  {
    id: 'glueiq-lead-006',
    code: 'LEAD_006',
    dimension: 'leadership',
    subdimension: 'influence',
    question: 'How successful have you been at influencing others in your organization to adopt new technologies?',
    answerType: 'scale',
    helpText: 'Rate from 0 (no success) to 100 (highly successful)',
    weight: 0.9,
    order: 6,
    isRequired: true,
  },
]

// ============================================================
// DIMENSION 3: CULTURAL ALIGNMENT
// Measures innovation embrace, collaboration, and experimentation
// ============================================================

const culturalAlignmentQuestions: GlueIQQuestion[] = [
  {
    id: 'glueiq-cult-001',
    code: 'CULT_001',
    dimension: 'cultural',
    subdimension: 'innovation_embrace',
    question: 'How does your team typically respond to innovative ideas or new ways of working?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'Resistant', description: 'New ideas are usually met with skepticism or rejection' },
      { value: 25, label: 'Cautious', description: 'We\'re slow to change and prefer proven methods' },
      { value: 50, label: 'Open', description: 'We consider new ideas if they have clear benefits' },
      { value: 75, label: 'Encouraging', description: 'We actively encourage experimentation and new thinking' },
      { value: 100, label: 'Innovation-driven', description: 'Innovation is in our DNA - we constantly seek better ways' },
    ],
    weight: 1.2,
    order: 1,
    isRequired: true,
  },
  {
    id: 'glueiq-cult-002',
    code: 'CULT_002',
    dimension: 'cultural',
    subdimension: 'collaboration',
    question: 'How effectively does your organization share knowledge and best practices about AI and new technologies?',
    answerType: 'scale',
    description: 'Consider cross-team communication, knowledge bases, communities of practice, etc.',
    helpText: 'Rate from 0 (no sharing) to 100 (excellent knowledge sharing)',
    weight: 1.0,
    order: 2,
    isRequired: true,
  },
  {
    id: 'glueiq-cult-003',
    code: 'CULT_003',
    dimension: 'cultural',
    subdimension: 'experimentation',
    question: 'What happens in your organization when someone tries a new AI tool or approach and it doesn\'t work out?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'Punished', description: 'Failure leads to blame and negative consequences' },
      { value: 25, label: 'Discouraged', description: 'It\'s seen as a mistake and is quietly forgotten' },
      { value: 50, label: 'Accepted', description: 'Failure is tolerated but not celebrated' },
      { value: 75, label: 'Learned from', description: 'We analyze what went wrong and share learnings' },
      { value: 100, label: 'Celebrated', description: 'We celebrate learning from experiments, successful or not' },
    ],
    weight: 1.3,
    order: 3,
    isRequired: true,
  },
  {
    id: 'glueiq-cult-004',
    code: 'CULT_004',
    dimension: 'cultural',
    subdimension: 'trust',
    question: 'How much do you trust AI systems to help you make better decisions in your work?',
    answerType: 'fearToConfidence',
    helpText: 'Move the slider from distrust (AI can\'t be trusted) to full trust (AI is a valuable partner)',
    weight: 1.0,
    order: 4,
    isRequired: true,
  },
  {
    id: 'glueiq-cult-005',
    code: 'CULT_005',
    dimension: 'cultural',
    subdimension: 'diversity_of_thought',
    question: 'How often are diverse perspectives (technical, non-technical, different departments) included in AI decisions?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'Never', description: 'Decisions are made by a small group without input' },
      { value: 25, label: 'Rarely', description: 'Occasionally someone is consulted' },
      { value: 50, label: 'Sometimes', description: 'Key stakeholders are involved in major decisions' },
      { value: 75, label: 'Often', description: 'We actively seek diverse perspectives' },
      { value: 100, label: 'Always', description: 'Inclusive decision-making is a core value' },
    ],
    weight: 0.9,
    order: 5,
    isRequired: true,
  },
  {
    id: 'glueiq-cult-006',
    code: 'CULT_006',
    dimension: 'cultural',
    subdimension: 'continuous_improvement',
    question: 'How would you rate your organization\'s commitment to continuous learning and improvement around AI?',
    answerType: 'scale',
    description: 'Consider training programs, learning budgets, time allocated for skill development.',
    helpText: 'Rate from 0 (no commitment) to 100 (deeply committed)',
    weight: 1.0,
    order: 6,
    isRequired: true,
  },
]

// ============================================================
// DIMENSION 4: BEHAVIOR EMBEDDING
// Measures habit formation, sustainability, and process integration
// ============================================================

const behaviorEmbeddingQuestions: GlueIQQuestion[] = [
  {
    id: 'glueiq-emb-001',
    code: 'EMB_001',
    dimension: 'embedding',
    subdimension: 'habit_formation',
    question: 'When you learn a new AI tool or technique, how quickly does it become part of your regular workflow?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'Never sticks', description: 'I usually revert to old ways within days' },
      { value: 25, label: 'Takes months', description: 'It takes significant effort and time to form new habits' },
      { value: 50, label: 'A few weeks', description: 'With conscious effort, I can adopt new practices' },
      { value: 75, label: 'Within a week', description: 'I\'m quick to integrate useful tools into my routine' },
      { value: 100, label: 'Immediately', description: 'Valuable tools become instant habits for me' },
    ],
    weight: 1.2,
    order: 1,
    isRequired: true,
  },
  {
    id: 'glueiq-emb-002',
    code: 'EMB_002',
    dimension: 'embedding',
    subdimension: 'process_integration',
    question: 'How well are AI tools integrated into your team\'s standard operating procedures and workflows?',
    answerType: 'scale',
    description: 'Consider whether AI is documented in processes, built into templates, or just ad-hoc usage.',
    helpText: 'Rate from 0 (not integrated) to 100 (fully embedded in processes)',
    weight: 1.1,
    order: 2,
    isRequired: true,
  },
  {
    id: 'glueiq-emb-003',
    code: 'EMB_003',
    dimension: 'embedding',
    subdimension: 'sustainability',
    question: 'When initial excitement about a new AI tool fades, how does usage typically evolve?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'Abandoned', description: 'Tools are quickly forgotten after the novelty wears off' },
      { value: 25, label: 'Declining', description: 'Usage drops significantly over time' },
      { value: 50, label: 'Maintained', description: 'Core users continue, but adoption doesn\'t grow' },
      { value: 75, label: 'Growing', description: 'Usage expands as more use cases are discovered' },
      { value: 100, label: 'Deepening', description: 'Tools become more embedded and usage becomes more sophisticated' },
    ],
    weight: 1.0,
    order: 3,
    isRequired: true,
  },
  {
    id: 'glueiq-emb-004',
    code: 'EMB_004',
    dimension: 'embedding',
    subdimension: 'measurement',
    question: 'How well do you track the impact and ROI of AI tools you\'ve adopted?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'Not at all', description: 'We don\'t measure AI impact' },
      { value: 25, label: 'Anecdotally', description: 'We have a general sense but no data' },
      { value: 50, label: 'Basic metrics', description: 'We track some usage and time savings' },
      { value: 75, label: 'Comprehensive', description: 'We measure productivity, quality, and cost impact' },
      { value: 100, label: 'Data-driven', description: 'We have dashboards and make decisions based on AI ROI data' },
    ],
    weight: 0.9,
    order: 4,
    isRequired: true,
  },
  {
    id: 'glueiq-emb-005',
    code: 'EMB_005',
    dimension: 'embedding',
    subdimension: 'reinforcement',
    question: 'What systems or structures exist to reinforce continued AI adoption in your organization?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'None', description: 'No formal support for AI adoption' },
      { value: 25, label: 'Basic training', description: 'Initial training is provided' },
      { value: 50, label: 'Ongoing support', description: 'Help desk, champions, or regular training sessions' },
      { value: 75, label: 'Integrated systems', description: 'AI is part of goals, reviews, and incentives' },
      { value: 100, label: 'Cultural embedding', description: 'AI adoption is woven into company culture and values' },
    ],
    weight: 1.0,
    order: 5,
    isRequired: true,
  },
  {
    id: 'glueiq-emb-006',
    code: 'EMB_006',
    dimension: 'embedding',
    subdimension: 'documentation',
    question: 'How well documented are the AI tools, prompts, and best practices your team uses?',
    answerType: 'scale',
    helpText: 'Rate from 0 (nothing documented) to 100 (comprehensive documentation)',
    weight: 0.8,
    order: 6,
    isRequired: true,
  },
]

// ============================================================
// DIMENSION 5: CHANGE VELOCITY
// Measures speed of adoption, resilience, and adaptability
// ============================================================

const changeVelocityQuestions: GlueIQQuestion[] = [
  {
    id: 'glueiq-vel-001',
    code: 'VEL_001',
    dimension: 'velocity',
    subdimension: 'adoption_speed',
    question: 'How quickly can your team typically go from learning about a new AI capability to using it productively?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'Months or more', description: 'Adoption is very slow due to various barriers' },
      { value: 25, label: '1-2 months', description: 'We need significant time for evaluation and training' },
      { value: 50, label: '2-4 weeks', description: 'We can pilot and adopt with reasonable speed' },
      { value: 75, label: '1-2 weeks', description: 'We move quickly from awareness to implementation' },
      { value: 100, label: 'Days', description: 'We can rapidly test and deploy new AI capabilities' },
    ],
    weight: 1.2,
    order: 1,
    isRequired: true,
  },
  {
    id: 'glueiq-vel-002',
    code: 'VEL_002',
    dimension: 'velocity',
    subdimension: 'resilience',
    question: 'When an AI initiative doesn\'t go as planned, how does your team respond?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'Give up', description: 'We abandon AI efforts after setbacks' },
      { value: 25, label: 'Hesitate', description: 'We become more cautious and slow down significantly' },
      { value: 50, label: 'Regroup', description: 'We pause, assess, and try again with modifications' },
      { value: 75, label: 'Persist', description: 'We learn from failures and maintain momentum' },
      { value: 100, label: 'Accelerate', description: 'Setbacks fuel our determination to succeed' },
    ],
    weight: 1.1,
    order: 2,
    isRequired: true,
  },
  {
    id: 'glueiq-vel-003',
    code: 'VEL_003',
    dimension: 'velocity',
    subdimension: 'adaptability',
    question: 'How confident are you in your ability to adapt if AI significantly changes your job role?',
    answerType: 'fearToConfidence',
    helpText: 'Move the slider from fear (worried about becoming obsolete) to confidence (I will thrive)',
    weight: 1.3,
    order: 3,
    isRequired: true,
  },
  {
    id: 'glueiq-vel-004',
    code: 'VEL_004',
    dimension: 'velocity',
    subdimension: 'iteration_speed',
    question: 'How quickly does your team iterate on AI implementations based on feedback and results?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'Never iterate', description: 'Once implemented, AI solutions rarely change' },
      { value: 25, label: 'Annual reviews', description: 'We revisit AI implementations yearly' },
      { value: 50, label: 'Quarterly', description: 'We review and improve AI usage regularly' },
      { value: 75, label: 'Monthly', description: 'We continuously optimize and iterate' },
      { value: 100, label: 'Weekly or faster', description: 'Rapid iteration is part of our AI culture' },
    ],
    weight: 1.0,
    order: 4,
    isRequired: true,
  },
  {
    id: 'glueiq-vel-005',
    code: 'VEL_005',
    dimension: 'velocity',
    subdimension: 'momentum',
    question: 'How would you describe the current momentum of AI adoption in your organization?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'Stalled', description: 'AI adoption has stopped or is moving backward' },
      { value: 25, label: 'Slow', description: 'There\'s movement but it feels stuck' },
      { value: 50, label: 'Steady', description: 'Consistent progress at a moderate pace' },
      { value: 75, label: 'Accelerating', description: 'AI adoption is picking up speed' },
      { value: 100, label: 'Transformational', description: 'AI is driving rapid organizational change' },
    ],
    weight: 1.0,
    order: 5,
    isRequired: true,
  },
  {
    id: 'glueiq-vel-006',
    code: 'VEL_006',
    dimension: 'velocity',
    subdimension: 'future_readiness',
    question: 'How prepared do you feel for the next wave of AI advancements (AGI, autonomous agents, etc.)?',
    answerType: 'scale',
    description: 'Consider your awareness of emerging AI trends and your readiness to adapt.',
    helpText: 'Rate from 0 (completely unprepared) to 100 (fully prepared)',
    weight: 0.9,
    order: 6,
    isRequired: true,
  },
]

// ============================================================
// EXPORT ALL QUESTIONS
// ============================================================

export const glueiqQuestions: GlueIQQuestion[] = [
  ...individualReadinessQuestions,
  ...leadershipCapabilityQuestions,
  ...culturalAlignmentQuestions,
  ...behaviorEmbeddingQuestions,
  ...changeVelocityQuestions,
]

export const glueiqDimensions = {
  individual: {
    id: 'individual',
    name: 'Individual Readiness',
    description: 'Personal AI literacy, technology comfort, and growth mindset',
    icon: 'User',
    color: '#06B6D4', // cyan
    weight: 1.0,
  },
  leadership: {
    id: 'leadership',
    name: 'Leadership Capability',
    description: 'Ability to lead through change and inspire AI adoption in others',
    icon: 'Crown',
    color: '#8B5CF6', // violet
    weight: 1.0,
  },
  cultural: {
    id: 'cultural',
    name: 'Cultural Alignment',
    description: 'Innovation embrace, collaboration, and psychological safety for experimentation',
    icon: 'Users',
    color: '#10B981', // emerald
    weight: 1.0,
  },
  embedding: {
    id: 'embedding',
    name: 'Behavior Embedding',
    description: 'Habit formation, sustainability, and process integration of AI practices',
    icon: 'Layers',
    color: '#F59E0B', // amber
    weight: 1.0,
  },
  velocity: {
    id: 'velocity',
    name: 'Change Velocity',
    description: 'Speed of adoption, resilience, and adaptability to AI transformation',
    icon: 'Zap',
    color: '#EF4444', // red
    weight: 1.0,
  },
}

export const glueiqAssessmentConfig = {
  id: 'glueiq',
  name: 'GlueIQ Assessment',
  description: 'Measure your individual AI adaptability and transformation readiness',
  shortDescription: 'Personal AI readiness assessment',
  estimatedMinutes: 12,
  totalQuestions: glueiqQuestions.length,
  dimensions: Object.values(glueiqDimensions),
  version: '1.0.0',
  isActive: true,
}

export default glueiqQuestions
