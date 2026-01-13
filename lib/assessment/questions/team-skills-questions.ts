/**
 * Team AI Skills Inventory
 *
 * Quick pulse assessment for mapping team AI capabilities.
 * Designed for team leads and managers to assess their team's AI readiness.
 *
 * Categories:
 * 1. AI Tool Proficiency - Current tool usage and skill levels
 * 2. Learning & Development - Training needs and learning preferences
 * 3. Application & Impact - How AI is applied in daily work
 * 4. Collaboration & Sharing - Knowledge sharing and team dynamics
 *
 * Total: 20 questions
 * Estimated completion time: 6-8 minutes
 */

export interface TeamSkillsQuestion {
  id: string
  code: string
  category: 'proficiency' | 'learning' | 'application' | 'collaboration'
  categoryName: string
  question: string
  description?: string
  helpText?: string
  answerType: 'scale' | 'multiChoice' | 'multiSelect' | 'percentage' | 'boolean'
  options?: Array<{ value: number; label: string; description?: string }>
  multiSelectOptions?: Array<{ id: string; label: string }>
  weight: number
  order: number
  isRequired: boolean
}

// ============================================================
// CATEGORY 1: AI TOOL PROFICIENCY
// ============================================================

const proficiencyQuestions: TeamSkillsQuestion[] = [
  {
    id: 'team-prof-001',
    code: 'PROF_001',
    category: 'proficiency',
    categoryName: 'AI Tool Proficiency',
    question: 'What percentage of your team actively uses AI tools (ChatGPT, Copilot, Claude, etc.) in their work?',
    answerType: 'percentage',
    weight: 1.2,
    order: 1,
    isRequired: true,
  },
  {
    id: 'team-prof-002',
    code: 'PROF_002',
    category: 'proficiency',
    categoryName: 'AI Tool Proficiency',
    question: 'Which AI tools does your team currently use?',
    description: 'Select all that apply',
    answerType: 'multiSelect',
    multiSelectOptions: [
      { id: 'chatgpt', label: 'ChatGPT / OpenAI' },
      { id: 'claude', label: 'Claude / Anthropic' },
      { id: 'copilot', label: 'GitHub Copilot' },
      { id: 'mscopilot', label: 'Microsoft Copilot (Office 365)' },
      { id: 'gemini', label: 'Google Gemini / Bard' },
      { id: 'midjourney', label: 'Midjourney / DALL-E (Image generation)' },
      { id: 'notion', label: 'Notion AI' },
      { id: 'grammarly', label: 'Grammarly' },
      { id: 'jasper', label: 'Jasper AI' },
      { id: 'automation', label: 'Automation tools (Zapier AI, Make)' },
      { id: 'analytics', label: 'AI analytics tools' },
      { id: 'custom', label: 'Custom/internal AI tools' },
      { id: 'none', label: 'No AI tools currently used' },
    ],
    weight: 1.0,
    order: 2,
    isRequired: true,
  },
  {
    id: 'team-prof-003',
    code: 'PROF_003',
    category: 'proficiency',
    categoryName: 'AI Tool Proficiency',
    question: 'What is the average AI skill level of your team?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'No exposure', description: 'Team has not used AI tools' },
      { value: 25, label: 'Beginner', description: 'Basic awareness, occasional simple use' },
      { value: 50, label: 'Intermediate', description: 'Regular use for common tasks' },
      { value: 75, label: 'Advanced', description: 'Proficient use, can customize and optimize' },
      { value: 100, label: 'Expert', description: 'Deep expertise, trains others, innovates with AI' },
    ],
    weight: 1.1,
    order: 3,
    isRequired: true,
  },
  {
    id: 'team-prof-004',
    code: 'PROF_004',
    category: 'proficiency',
    categoryName: 'AI Tool Proficiency',
    question: 'How comfortable is your team with prompt engineering and getting quality outputs from AI?',
    answerType: 'scale',
    helpText: 'Rate from 0 (not comfortable) to 100 (highly skilled)',
    weight: 1.0,
    order: 4,
    isRequired: true,
  },
  {
    id: 'team-prof-005',
    code: 'PROF_005',
    category: 'proficiency',
    categoryName: 'AI Tool Proficiency',
    question: 'Does your team understand when to use AI vs. when human judgment is more appropriate?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'No awareness', description: 'Team doesn\'t consider this distinction' },
      { value: 33, label: 'Some awareness', description: 'Aware but inconsistent application' },
      { value: 66, label: 'Good judgment', description: 'Usually make appropriate choices' },
      { value: 100, label: 'Excellent judgment', description: 'Consistently optimal use of AI vs. human skills' },
    ],
    weight: 1.0,
    order: 5,
    isRequired: true,
  },
]

// ============================================================
// CATEGORY 2: LEARNING & DEVELOPMENT
// ============================================================

const learningQuestions: TeamSkillsQuestion[] = [
  {
    id: 'team-learn-001',
    code: 'LEARN_001',
    category: 'learning',
    categoryName: 'Learning & Development',
    question: 'What is your team\'s biggest AI training need right now?',
    answerType: 'multiChoice',
    options: [
      { value: 1, label: 'Basic AI literacy', description: 'Understanding what AI is and can do' },
      { value: 2, label: 'Tool-specific training', description: 'How to use specific AI tools effectively' },
      { value: 3, label: 'Prompt engineering', description: 'Getting better results from AI' },
      { value: 4, label: 'Integration skills', description: 'Building AI into workflows and processes' },
      { value: 5, label: 'Advanced applications', description: 'Custom solutions and complex use cases' },
      { value: 6, label: 'AI strategy', description: 'When and how to apply AI strategically' },
    ],
    weight: 1.0,
    order: 1,
    isRequired: true,
  },
  {
    id: 'team-learn-002',
    code: 'LEARN_002',
    category: 'learning',
    categoryName: 'Learning & Development',
    question: 'How does your team prefer to learn new AI skills?',
    answerType: 'multiSelect',
    multiSelectOptions: [
      { id: 'workshop', label: 'Live workshops and training sessions' },
      { id: 'online', label: 'Self-paced online courses' },
      { id: 'peer', label: 'Peer learning and knowledge sharing' },
      { id: 'mentoring', label: 'One-on-one mentoring' },
      { id: 'experiment', label: 'Hands-on experimentation' },
      { id: 'documentation', label: 'Written guides and documentation' },
      { id: 'video', label: 'Video tutorials' },
    ],
    weight: 0.8,
    order: 2,
    isRequired: true,
  },
  {
    id: 'team-learn-003',
    code: 'LEARN_003',
    category: 'learning',
    categoryName: 'Learning & Development',
    question: 'How much time per week does your team have for AI learning and experimentation?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'None', description: 'No time allocated' },
      { value: 25, label: '1-2 hours', description: 'Limited time' },
      { value: 50, label: '2-4 hours', description: 'Moderate time' },
      { value: 75, label: '4-8 hours', description: 'Good allocation' },
      { value: 100, label: '8+ hours', description: 'Significant learning time' },
    ],
    weight: 1.0,
    order: 3,
    isRequired: true,
  },
  {
    id: 'team-learn-004',
    code: 'LEARN_004',
    category: 'learning',
    categoryName: 'Learning & Development',
    question: 'Does your team have access to paid AI tools and learning resources?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'No access', description: 'Free tools only, no budget' },
      { value: 33, label: 'Limited', description: 'Some paid tools, tight budget' },
      { value: 66, label: 'Good access', description: 'Most needed tools available' },
      { value: 100, label: 'Full access', description: 'All tools and resources available' },
    ],
    weight: 0.9,
    order: 4,
    isRequired: true,
  },
  {
    id: 'team-learn-005',
    code: 'LEARN_005',
    category: 'learning',
    categoryName: 'Learning & Development',
    question: 'How quickly does your team typically adopt new AI tools after they become available?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'Very slow', description: 'Months to years, if at all' },
      { value: 25, label: 'Slow', description: 'Several weeks to months' },
      { value: 50, label: 'Moderate', description: '2-4 weeks' },
      { value: 75, label: 'Fast', description: 'Within a week or two' },
      { value: 100, label: 'Immediate', description: 'Days after availability' },
    ],
    weight: 1.0,
    order: 5,
    isRequired: true,
  },
]

// ============================================================
// CATEGORY 3: APPLICATION & IMPACT
// ============================================================

const applicationQuestions: TeamSkillsQuestion[] = [
  {
    id: 'team-app-001',
    code: 'APP_001',
    category: 'application',
    categoryName: 'Application & Impact',
    question: 'What is the primary way your team uses AI today?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'Not using AI', description: 'Team doesn\'t use AI yet' },
      { value: 20, label: 'Content creation', description: 'Writing, editing, drafting' },
      { value: 40, label: 'Research & analysis', description: 'Information gathering, summarization' },
      { value: 60, label: 'Coding & development', description: 'Code assistance, debugging' },
      { value: 80, label: 'Process automation', description: 'Automating repetitive tasks' },
      { value: 100, label: 'Strategic decision support', description: 'Complex analysis and recommendations' },
    ],
    weight: 1.0,
    order: 1,
    isRequired: true,
  },
  {
    id: 'team-app-002',
    code: 'APP_002',
    category: 'application',
    categoryName: 'Application & Impact',
    question: 'How much time does AI save your team per week (estimated)?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'No time saved', description: 'AI not used or no impact yet' },
      { value: 20, label: '1-2 hours', description: 'Small time savings' },
      { value: 40, label: '2-5 hours', description: 'Moderate time savings' },
      { value: 60, label: '5-10 hours', description: 'Significant time savings' },
      { value: 80, label: '10-20 hours', description: 'Major productivity boost' },
      { value: 100, label: '20+ hours', description: 'Transformational impact' },
    ],
    weight: 1.2,
    order: 2,
    isRequired: true,
  },
  {
    id: 'team-app-003',
    code: 'APP_003',
    category: 'application',
    categoryName: 'Application & Impact',
    question: 'Has AI improved the quality of your team\'s work output?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'No change or worse', description: 'Quality not improved' },
      { value: 25, label: 'Slight improvement', description: 'Minor quality gains' },
      { value: 50, label: 'Moderate improvement', description: 'Noticeable quality improvements' },
      { value: 75, label: 'Significant improvement', description: 'Clear quality enhancement' },
      { value: 100, label: 'Transformational', description: 'Dramatically better output' },
    ],
    weight: 1.1,
    order: 3,
    isRequired: true,
  },
  {
    id: 'team-app-004',
    code: 'APP_004',
    category: 'application',
    categoryName: 'Application & Impact',
    question: 'How many distinct AI use cases has your team implemented?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'None', description: 'No implemented use cases' },
      { value: 25, label: '1-2', description: 'A couple of applications' },
      { value: 50, label: '3-5', description: 'Several use cases' },
      { value: 75, label: '6-10', description: 'Many applications' },
      { value: 100, label: '10+', description: 'AI integrated throughout' },
    ],
    weight: 1.0,
    order: 4,
    isRequired: true,
  },
  {
    id: 'team-app-005',
    code: 'APP_005',
    category: 'application',
    categoryName: 'Application & Impact',
    question: 'Are there documented AI best practices or playbooks for your team?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'None', description: 'No documentation' },
      { value: 33, label: 'Informal', description: 'Some notes or tips shared informally' },
      { value: 66, label: 'Basic documentation', description: 'Written guides for common use cases' },
      { value: 100, label: 'Comprehensive', description: 'Full playbooks with best practices' },
    ],
    weight: 0.9,
    order: 5,
    isRequired: true,
  },
]

// ============================================================
// CATEGORY 4: COLLABORATION & SHARING
// ============================================================

const collaborationQuestions: TeamSkillsQuestion[] = [
  {
    id: 'team-collab-001',
    code: 'COLLAB_001',
    category: 'collaboration',
    categoryName: 'Collaboration & Sharing',
    question: 'How often does your team share AI tips, prompts, and discoveries with each other?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'Never', description: 'No sharing of AI knowledge' },
      { value: 25, label: 'Rarely', description: 'Occasional informal sharing' },
      { value: 50, label: 'Sometimes', description: 'Regular but informal sharing' },
      { value: 75, label: 'Often', description: 'Frequent, structured sharing' },
      { value: 100, label: 'Constantly', description: 'Continuous knowledge exchange' },
    ],
    weight: 1.0,
    order: 1,
    isRequired: true,
  },
  {
    id: 'team-collab-002',
    code: 'COLLAB_002',
    category: 'collaboration',
    categoryName: 'Collaboration & Sharing',
    question: 'Is there a designated AI champion or enthusiast on your team?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'No one', description: 'No AI champion' },
      { value: 33, label: 'Informal', description: 'Someone helps informally' },
      { value: 66, label: 'Designated', description: 'Official AI champion role' },
      { value: 100, label: 'Team of champions', description: 'Multiple AI experts supporting team' },
    ],
    weight: 1.0,
    order: 2,
    isRequired: true,
  },
  {
    id: 'team-collab-003',
    code: 'COLLAB_003',
    category: 'collaboration',
    categoryName: 'Collaboration & Sharing',
    question: 'Does your team collaborate with other teams on AI initiatives?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'No collaboration', description: 'Completely siloed' },
      { value: 25, label: 'Minimal', description: 'Rare cross-team interaction' },
      { value: 50, label: 'Some', description: 'Occasional collaboration' },
      { value: 75, label: 'Regular', description: 'Frequent cross-team AI work' },
      { value: 100, label: 'Integrated', description: 'Deep collaboration across teams' },
    ],
    weight: 0.9,
    order: 3,
    isRequired: true,
  },
  {
    id: 'team-collab-004',
    code: 'COLLAB_004',
    category: 'collaboration',
    categoryName: 'Collaboration & Sharing',
    question: 'How does your team handle AI-related questions or problems?',
    answerType: 'multiChoice',
    options: [
      { value: 0, label: 'Figure it out alone', description: 'Everyone on their own' },
      { value: 25, label: 'Ask a colleague', description: 'Informal help-seeking' },
      { value: 50, label: 'Slack/Teams channel', description: 'Dedicated communication channel' },
      { value: 75, label: 'Regular sessions', description: 'Scheduled Q&A or office hours' },
      { value: 100, label: 'AI CoE support', description: 'Dedicated AI support team' },
    ],
    weight: 0.9,
    order: 4,
    isRequired: true,
  },
  {
    id: 'team-collab-005',
    code: 'COLLAB_005',
    category: 'collaboration',
    categoryName: 'Collaboration & Sharing',
    question: 'How receptive is your team to trying new AI tools suggested by colleagues?',
    answerType: 'scale',
    helpText: 'Rate from 0 (resistant) to 100 (very receptive)',
    weight: 1.0,
    order: 5,
    isRequired: true,
  },
]

// ============================================================
// EXPORT ALL QUESTIONS
// ============================================================

export const teamSkillsQuestions: TeamSkillsQuestion[] = [
  ...proficiencyQuestions,
  ...learningQuestions,
  ...applicationQuestions,
  ...collaborationQuestions,
]

export const teamSkillsCategories = {
  proficiency: {
    id: 'proficiency',
    name: 'AI Tool Proficiency',
    description: 'Current AI tool usage and skill levels across the team',
    icon: 'Wrench',
    color: '#3B82F6', // blue
    weight: 1.0,
  },
  learning: {
    id: 'learning',
    name: 'Learning & Development',
    description: 'Training needs, learning preferences, and development opportunities',
    icon: 'GraduationCap',
    color: '#10B981', // emerald
    weight: 1.0,
  },
  application: {
    id: 'application',
    name: 'Application & Impact',
    description: 'How AI is applied in daily work and its business impact',
    icon: 'Rocket',
    color: '#8B5CF6', // violet
    weight: 1.0,
  },
  collaboration: {
    id: 'collaboration',
    name: 'Collaboration & Sharing',
    description: 'Knowledge sharing, team dynamics, and support structures',
    icon: 'Users',
    color: '#F59E0B', // amber
    weight: 1.0,
  },
}

export const teamSkillsAssessmentConfig = {
  id: 'team-skills',
  name: 'Team AI Skills Inventory',
  description: 'Quick pulse assessment to map your team\'s AI capabilities and identify growth opportunities',
  shortDescription: 'Team AI skills assessment',
  estimatedMinutes: 7,
  totalQuestions: teamSkillsQuestions.length,
  categories: Object.values(teamSkillsCategories),
  version: '1.0.0',
  isActive: true,
}

export default teamSkillsQuestions
