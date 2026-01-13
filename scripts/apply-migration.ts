/**
 * Apply assessment migration to seed question banks
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

async function applyMigration() {
  console.log('Starting migration...\n')

  // Step 1: Seed GlueIQ questions (matching existing schema - weight is INTEGER)
  console.log('1. Seeding GlueIQ questions...')

  const glueiqQuestions = [
    // Individual Readiness (6 questions)
    {
      question_code: 'IND_001',
      version: 1,
      question_text: 'How would you describe your current understanding of AI and its capabilities?',
      question_description: 'Consider your knowledge of how AI works, what it can and cannot do, and its potential applications.',
      dimension: 'individual',
      subdimension: 'ai_literacy',
      answer_type: 'multiChoice',
      weight: 2,
      answer_options: [
        { value: 0, label: 'No understanding', description: 'I have little to no knowledge about AI' },
        { value: 25, label: 'Basic awareness', description: 'I know AI exists but not how it works' },
        { value: 50, label: 'General understanding', description: 'I understand basic concepts and common applications' },
        { value: 75, label: 'Working knowledge', description: 'I can discuss AI capabilities and limitations knowledgeably' },
        { value: 100, label: 'Deep expertise', description: 'I have hands-on experience and can evaluate AI solutions' }
      ],
      display_order: 1,
      is_active: true
    },
    {
      question_code: 'IND_002',
      version: 1,
      question_text: 'When a new technology tool is introduced at work, how do you typically respond?',
      dimension: 'individual',
      subdimension: 'tech_comfort',
      answer_type: 'multiChoice',
      weight: 1,
      answer_options: [
        { value: 0, label: 'Avoid it', description: 'I try to stick with what I know' },
        { value: 25, label: 'Wait and see', description: 'I wait for others to try it first' },
        { value: 50, label: 'Cautiously explore', description: 'I give it a try but prefer guidance' },
        { value: 75, label: 'Eager to learn', description: 'I actively explore new tools' },
        { value: 100, label: 'Early adopter', description: 'I seek out new tools and help others learn' }
      ],
      display_order: 2,
      is_active: true
    },
    {
      question_code: 'IND_003',
      version: 1,
      question_text: 'How do you view your ability to learn new skills at this stage of your career?',
      help_text: 'Move the slider from fear (I\'m too set in my ways) to confidence (I can learn anything)',
      dimension: 'individual',
      subdimension: 'growth_mindset',
      answer_type: 'fearToConfidence',
      weight: 2,
      answer_options: [],
      display_order: 3,
      is_active: true
    },
    {
      question_code: 'IND_004',
      version: 1,
      question_text: 'In the past year, how many new digital tools or AI-powered applications have you learned to use?',
      dimension: 'individual',
      subdimension: 'learning_agility',
      answer_type: 'multiChoice',
      weight: 1,
      answer_options: [
        { value: 0, label: 'None', description: 'I haven\'t learned any new digital tools' },
        { value: 25, label: '1-2 tools', description: 'I\'ve picked up a couple of new applications' },
        { value: 50, label: '3-5 tools', description: 'I regularly learn new tools as needed' },
        { value: 75, label: '6-10 tools', description: 'I actively seek out and learn new technologies' },
        { value: 100, label: 'More than 10', description: 'I continuously experiment with new tools and AI' }
      ],
      display_order: 4,
      is_active: true
    },
    {
      question_code: 'IND_005',
      version: 1,
      question_text: 'How often do you currently use AI tools (like ChatGPT, Copilot, or AI features in apps) in your work?',
      dimension: 'individual',
      subdimension: 'ai_experience',
      answer_type: 'multiChoice',
      weight: 1,
      answer_options: [
        { value: 0, label: 'Never', description: 'I don\'t use any AI tools' },
        { value: 20, label: 'Rarely', description: 'Once a month or less' },
        { value: 40, label: 'Occasionally', description: 'A few times a month' },
        { value: 60, label: 'Weekly', description: 'Several times a week' },
        { value: 80, label: 'Daily', description: 'Every day for various tasks' },
        { value: 100, label: 'Constantly', description: 'AI is integrated into my core workflow' }
      ],
      display_order: 5,
      is_active: true
    },
    {
      question_code: 'IND_006',
      version: 1,
      question_text: 'How confident are you in identifying which parts of your job could be enhanced or automated by AI?',
      help_text: 'Rate from 0 (not confident at all) to 100 (very confident)',
      dimension: 'individual',
      subdimension: 'self_awareness',
      answer_type: 'scale',
      weight: 1,
      answer_options: [],
      display_order: 6,
      is_active: true
    },
    // Leadership Capability (6 questions)
    {
      question_code: 'LEAD_001',
      version: 1,
      question_text: 'When your team faces a significant change, how do you typically approach leading them through it?',
      dimension: 'leadership',
      subdimension: 'change_leadership',
      answer_type: 'multiChoice',
      weight: 2,
      answer_options: [
        { value: 0, label: 'Struggle with change', description: 'I find it hard to guide others through uncertainty' },
        { value: 25, label: 'Follow instructions', description: 'I implement changes as directed from above' },
        { value: 50, label: 'Communicate clearly', description: 'I explain the change and answer questions' },
        { value: 75, label: 'Inspire and support', description: 'I help the team see the vision and provide support' },
        { value: 100, label: 'Champion change', description: 'I lead by example and create excitement for transformation' }
      ],
      display_order: 7,
      is_active: true
    },
    {
      question_code: 'LEAD_002',
      version: 1,
      question_text: 'How effectively can you articulate a vision for how AI will transform your team\'s work?',
      help_text: 'Move the slider based on your ability to paint a compelling picture of the AI-enabled future',
      dimension: 'leadership',
      subdimension: 'vision_communication',
      answer_type: 'fearToConfidence',
      weight: 1,
      answer_options: [],
      display_order: 8,
      is_active: true
    },
    {
      question_code: 'LEAD_003',
      version: 1,
      question_text: 'How often do you help colleagues or team members learn new technologies or AI tools?',
      dimension: 'leadership',
      subdimension: 'coaching',
      answer_type: 'multiChoice',
      weight: 1,
      answer_options: [
        { value: 0, label: 'Never', description: 'I don\'t help others with technology' },
        { value: 25, label: 'Rarely', description: 'Only when specifically asked' },
        { value: 50, label: 'Sometimes', description: 'When I notice someone struggling' },
        { value: 75, label: 'Often', description: 'I regularly share knowledge and tips' },
        { value: 100, label: 'Always', description: 'I proactively mentor and train others' }
      ],
      display_order: 9,
      is_active: true
    },
    {
      question_code: 'LEAD_004',
      version: 1,
      question_text: 'How comfortable would your team feel coming to you about AI-related concerns or fears?',
      question_description: 'Consider whether your team feels safe discussing worries about job security, skill gaps, or technology anxiety.',
      help_text: 'Rate from 0 (not comfortable at all) to 100 (completely comfortable)',
      dimension: 'leadership',
      subdimension: 'psychological_safety',
      answer_type: 'scale',
      weight: 1,
      answer_options: [],
      display_order: 10,
      is_active: true
    },
    {
      question_code: 'LEAD_005',
      version: 1,
      question_text: 'When evaluating AI solutions for your team, how do you approach the decision?',
      dimension: 'leadership',
      subdimension: 'decision_making',
      answer_type: 'multiChoice',
      weight: 1,
      answer_options: [
        { value: 0, label: 'Avoid decisions', description: 'I defer to others or avoid AI-related decisions' },
        { value: 25, label: 'Follow mandates', description: 'I implement what\'s decided at higher levels' },
        { value: 50, label: 'Gather input', description: 'I consult with the team and stakeholders' },
        { value: 75, label: 'Strategic analysis', description: 'I evaluate ROI, risks, and alignment with goals' },
        { value: 100, label: 'Innovative leadership', description: 'I proactively identify AI opportunities and champion them' }
      ],
      display_order: 11,
      is_active: true
    },
    {
      question_code: 'LEAD_006',
      version: 1,
      question_text: 'How successful have you been at influencing others in your organization to adopt new technologies?',
      help_text: 'Rate from 0 (no success) to 100 (highly successful)',
      dimension: 'leadership',
      subdimension: 'influence',
      answer_type: 'scale',
      weight: 1,
      answer_options: [],
      display_order: 12,
      is_active: true
    },
    // Cultural Alignment (6 questions)
    {
      question_code: 'CULT_001',
      version: 1,
      question_text: 'How does your team typically respond to innovative ideas or new ways of working?',
      dimension: 'cultural',
      subdimension: 'innovation_embrace',
      answer_type: 'multiChoice',
      weight: 2,
      answer_options: [
        { value: 0, label: 'Resistant', description: 'New ideas are usually met with skepticism or rejection' },
        { value: 25, label: 'Cautious', description: 'We\'re slow to change and prefer proven methods' },
        { value: 50, label: 'Open', description: 'We consider new ideas if they have clear benefits' },
        { value: 75, label: 'Encouraging', description: 'We actively encourage experimentation and new thinking' },
        { value: 100, label: 'Innovation-driven', description: 'Innovation is in our DNA' }
      ],
      display_order: 13,
      is_active: true
    },
    {
      question_code: 'CULT_002',
      version: 1,
      question_text: 'How effectively does your organization share knowledge and best practices about AI?',
      question_description: 'Consider cross-team communication, knowledge bases, communities of practice, etc.',
      help_text: 'Rate from 0 (no sharing) to 100 (excellent knowledge sharing)',
      dimension: 'cultural',
      subdimension: 'collaboration',
      answer_type: 'scale',
      weight: 1,
      answer_options: [],
      display_order: 14,
      is_active: true
    },
    {
      question_code: 'CULT_003',
      version: 1,
      question_text: 'What happens in your organization when someone tries a new AI tool or approach and it doesn\'t work out?',
      dimension: 'cultural',
      subdimension: 'experimentation',
      answer_type: 'multiChoice',
      weight: 2,
      answer_options: [
        { value: 0, label: 'Punished', description: 'Failure leads to blame and negative consequences' },
        { value: 25, label: 'Discouraged', description: 'It\'s seen as a mistake and is quietly forgotten' },
        { value: 50, label: 'Accepted', description: 'Failure is tolerated but not celebrated' },
        { value: 75, label: 'Learned from', description: 'We analyze what went wrong and share learnings' },
        { value: 100, label: 'Celebrated', description: 'We celebrate learning from experiments' }
      ],
      display_order: 15,
      is_active: true
    },
    {
      question_code: 'CULT_004',
      version: 1,
      question_text: 'How much do you trust AI systems to help you make better decisions in your work?',
      help_text: 'Move the slider from distrust to full trust',
      dimension: 'cultural',
      subdimension: 'trust',
      answer_type: 'fearToConfidence',
      weight: 1,
      answer_options: [],
      display_order: 16,
      is_active: true
    },
    {
      question_code: 'CULT_005',
      version: 1,
      question_text: 'How often are diverse perspectives included in AI decisions?',
      dimension: 'cultural',
      subdimension: 'diversity_of_thought',
      answer_type: 'multiChoice',
      weight: 1,
      answer_options: [
        { value: 0, label: 'Never', description: 'Decisions are made by a small group without input' },
        { value: 25, label: 'Rarely', description: 'Occasionally someone is consulted' },
        { value: 50, label: 'Sometimes', description: 'Key stakeholders are involved in major decisions' },
        { value: 75, label: 'Often', description: 'We actively seek diverse perspectives' },
        { value: 100, label: 'Always', description: 'Inclusive decision-making is a core value' }
      ],
      display_order: 17,
      is_active: true
    },
    {
      question_code: 'CULT_006',
      version: 1,
      question_text: 'How would you rate your organization\'s commitment to continuous learning around AI?',
      question_description: 'Consider training programs, learning budgets, time allocated for skill development.',
      help_text: 'Rate from 0 (no commitment) to 100 (deeply committed)',
      dimension: 'cultural',
      subdimension: 'continuous_improvement',
      answer_type: 'scale',
      weight: 1,
      answer_options: [],
      display_order: 18,
      is_active: true
    },
    // Embedding Dimension (6 questions)
    {
      question_code: 'EMB_001',
      version: 1,
      question_text: 'When you learn a new AI tool, how quickly does it become part of your regular workflow?',
      dimension: 'embedding',
      subdimension: 'habit_formation',
      answer_type: 'multiChoice',
      weight: 2,
      answer_options: [
        { value: 0, label: 'Never sticks', description: 'I usually revert to old ways within days' },
        { value: 25, label: 'Takes months', description: 'It takes significant effort to form new habits' },
        { value: 50, label: 'A few weeks', description: 'With conscious effort, I can adopt new practices' },
        { value: 75, label: 'Within a week', description: 'I\'m quick to integrate useful tools' },
        { value: 100, label: 'Immediately', description: 'Valuable tools become instant habits for me' }
      ],
      display_order: 19,
      is_active: true
    },
    {
      question_code: 'EMB_002',
      version: 1,
      question_text: 'How well are AI tools integrated into your team\'s standard operating procedures?',
      question_description: 'Consider whether AI is documented in processes, built into templates, or just ad-hoc usage.',
      help_text: 'Rate from 0 (not integrated) to 100 (fully embedded in processes)',
      dimension: 'embedding',
      subdimension: 'process_integration',
      answer_type: 'scale',
      weight: 1,
      answer_options: [],
      display_order: 20,
      is_active: true
    },
    {
      question_code: 'EMB_003',
      version: 1,
      question_text: 'When initial excitement about a new AI tool fades, how does usage typically evolve?',
      dimension: 'embedding',
      subdimension: 'sustainability',
      answer_type: 'multiChoice',
      weight: 1,
      answer_options: [
        { value: 0, label: 'Abandoned', description: 'Tools are quickly forgotten after the novelty wears off' },
        { value: 25, label: 'Declining', description: 'Usage drops significantly over time' },
        { value: 50, label: 'Maintained', description: 'Core users continue, but adoption doesn\'t grow' },
        { value: 75, label: 'Growing', description: 'Usage expands as more use cases are discovered' },
        { value: 100, label: 'Deepening', description: 'Tools become more embedded and usage becomes more sophisticated' }
      ],
      display_order: 21,
      is_active: true
    },
    {
      question_code: 'EMB_004',
      version: 1,
      question_text: 'How well do you track the impact and ROI of AI tools you\'ve adopted?',
      dimension: 'embedding',
      subdimension: 'measurement',
      answer_type: 'multiChoice',
      weight: 1,
      answer_options: [
        { value: 0, label: 'Not at all', description: 'We don\'t measure AI impact' },
        { value: 25, label: 'Anecdotally', description: 'We have a general sense but no data' },
        { value: 50, label: 'Basic metrics', description: 'We track some usage and time savings' },
        { value: 75, label: 'Comprehensive', description: 'We measure productivity, quality, and cost impact' },
        { value: 100, label: 'Data-driven', description: 'We have dashboards and make decisions based on AI ROI data' }
      ],
      display_order: 22,
      is_active: true
    },
    {
      question_code: 'EMB_005',
      version: 1,
      question_text: 'What systems exist to reinforce continued AI adoption in your organization?',
      dimension: 'embedding',
      subdimension: 'reinforcement',
      answer_type: 'multiChoice',
      weight: 1,
      answer_options: [
        { value: 0, label: 'None', description: 'No formal support for AI adoption' },
        { value: 25, label: 'Basic training', description: 'Initial training is provided' },
        { value: 50, label: 'Ongoing support', description: 'Help desk, champions, or regular training sessions' },
        { value: 75, label: 'Integrated systems', description: 'AI is part of goals, reviews, and incentives' },
        { value: 100, label: 'Cultural embedding', description: 'AI adoption is woven into company culture and values' }
      ],
      display_order: 23,
      is_active: true
    },
    {
      question_code: 'EMB_006',
      version: 1,
      question_text: 'How well documented are the AI tools, prompts, and best practices your team uses?',
      help_text: 'Rate from 0 (nothing documented) to 100 (comprehensive documentation)',
      dimension: 'embedding',
      subdimension: 'documentation',
      answer_type: 'scale',
      weight: 1,
      answer_options: [],
      display_order: 24,
      is_active: true
    },
    // Velocity Dimension (6 questions)
    {
      question_code: 'VEL_001',
      version: 1,
      question_text: 'How quickly can your team go from learning about a new AI capability to using it productively?',
      dimension: 'velocity',
      subdimension: 'adoption_speed',
      answer_type: 'multiChoice',
      weight: 2,
      answer_options: [
        { value: 0, label: 'Months or more', description: 'Adoption is very slow due to various barriers' },
        { value: 25, label: '1-2 months', description: 'We need significant time for evaluation and training' },
        { value: 50, label: '2-4 weeks', description: 'We can pilot and adopt with reasonable speed' },
        { value: 75, label: '1-2 weeks', description: 'We move quickly from awareness to implementation' },
        { value: 100, label: 'Days', description: 'We can rapidly test and deploy new AI capabilities' }
      ],
      display_order: 25,
      is_active: true
    },
    {
      question_code: 'VEL_002',
      version: 1,
      question_text: 'When an AI initiative doesn\'t go as planned, how does your team respond?',
      dimension: 'velocity',
      subdimension: 'resilience',
      answer_type: 'multiChoice',
      weight: 1,
      answer_options: [
        { value: 0, label: 'Give up', description: 'We abandon AI efforts after setbacks' },
        { value: 25, label: 'Hesitate', description: 'We become more cautious and slow down significantly' },
        { value: 50, label: 'Regroup', description: 'We pause, assess, and try again with modifications' },
        { value: 75, label: 'Persist', description: 'We learn from failures and maintain momentum' },
        { value: 100, label: 'Accelerate', description: 'Setbacks fuel our determination to succeed' }
      ],
      display_order: 26,
      is_active: true
    },
    {
      question_code: 'VEL_003',
      version: 1,
      question_text: 'How confident are you in your ability to adapt if AI significantly changes your job role?',
      help_text: 'Move the slider from fear (worried about becoming obsolete) to confidence (I will thrive)',
      dimension: 'velocity',
      subdimension: 'adaptability',
      answer_type: 'fearToConfidence',
      weight: 2,
      answer_options: [],
      display_order: 27,
      is_active: true
    },
    {
      question_code: 'VEL_004',
      version: 1,
      question_text: 'How quickly does your team iterate on AI implementations based on feedback and results?',
      dimension: 'velocity',
      subdimension: 'iteration_speed',
      answer_type: 'multiChoice',
      weight: 1,
      answer_options: [
        { value: 0, label: 'Never iterate', description: 'Once implemented, AI solutions rarely change' },
        { value: 25, label: 'Annual reviews', description: 'We revisit AI implementations yearly' },
        { value: 50, label: 'Quarterly', description: 'We review and improve AI usage regularly' },
        { value: 75, label: 'Monthly', description: 'We continuously optimize and iterate' },
        { value: 100, label: 'Weekly or faster', description: 'Rapid iteration is part of our AI culture' }
      ],
      display_order: 28,
      is_active: true
    },
    {
      question_code: 'VEL_005',
      version: 1,
      question_text: 'How would you describe the current momentum of AI adoption in your organization?',
      dimension: 'velocity',
      subdimension: 'momentum',
      answer_type: 'multiChoice',
      weight: 1,
      answer_options: [
        { value: 0, label: 'Stalled', description: 'AI adoption has stopped or is moving backward' },
        { value: 25, label: 'Slow', description: 'There\'s movement but it feels stuck' },
        { value: 50, label: 'Steady', description: 'Consistent progress at a moderate pace' },
        { value: 75, label: 'Accelerating', description: 'AI adoption is picking up speed' },
        { value: 100, label: 'Transformational', description: 'AI is driving rapid organizational change' }
      ],
      display_order: 29,
      is_active: true
    },
    {
      question_code: 'VEL_006',
      version: 1,
      question_text: 'How prepared do you feel for the next wave of AI advancements?',
      question_description: 'Consider your awareness of emerging AI trends and your readiness to adapt.',
      help_text: 'Rate from 0 (completely unprepared) to 100 (fully prepared)',
      dimension: 'velocity',
      subdimension: 'future_readiness',
      answer_type: 'scale',
      weight: 1,
      answer_options: [],
      display_order: 30,
      is_active: true
    }
  ]

  // Insert questions using upsert with proper conflict handling
  let successCount = 0
  for (const q of glueiqQuestions) {
    // First try to delete existing question with same code and version
    await supabase
      .from('question_bank')
      .delete()
      .eq('question_code', q.question_code)
      .eq('version', q.version)

    const { error } = await supabase
      .from('question_bank')
      .insert(q)

    if (error) {
      console.log(`   Error inserting ${q.question_code}:`, error.message)
    } else {
      successCount++
    }
  }

  console.log(`   Successfully inserted ${successCount}/${glueiqQuestions.length} questions`)

  console.log('\n2. Updating question flows...')

  // Delete existing flows first
  await supabase
    .from('question_flows')
    .delete()
    .in('flow_name', ['GlueIQ Standard Flow', 'GlueIQ Quick Assessment'])

  const flows = [
    {
      flow_name: 'GlueIQ Standard Flow',
      flow_description: 'Standard sequential flow through all 5 GlueIQ dimensions',
      flow_type: 'standard',
      assessment_type: 'full',
      question_selection_strategy: 'sequential',
      question_codes: [
        'IND_001', 'IND_002', 'IND_003', 'IND_004', 'IND_005', 'IND_006',
        'LEAD_001', 'LEAD_002', 'LEAD_003', 'LEAD_004', 'LEAD_005', 'LEAD_006',
        'CULT_001', 'CULT_002', 'CULT_003', 'CULT_004', 'CULT_005', 'CULT_006',
        'EMB_001', 'EMB_002', 'EMB_003', 'EMB_004', 'EMB_005', 'EMB_006',
        'VEL_001', 'VEL_002', 'VEL_003', 'VEL_004', 'VEL_005', 'VEL_006'
      ],
      is_active: true
    },
    {
      flow_name: 'GlueIQ Quick Assessment',
      flow_description: 'Abbreviated assessment with 2 key questions per dimension',
      flow_type: 'quick',
      assessment_type: 'quick',
      question_selection_strategy: 'sequential',
      question_codes: ['IND_001', 'IND_003', 'LEAD_001', 'LEAD_002', 'CULT_001', 'CULT_003', 'EMB_001', 'EMB_003', 'VEL_001', 'VEL_003'],
      is_active: true
    }
  ]

  for (const flow of flows) {
    const { error } = await supabase
      .from('question_flows')
      .insert(flow)

    if (error) {
      console.log(`   Error creating flow ${flow.flow_name}:`, error.message)
    } else {
      console.log(`   Created flow: ${flow.flow_name}`)
    }
  }

  console.log('\n3. Verifying questions...')
  const { data: questions, error: countError } = await supabase
    .from('question_bank')
    .select('question_code, dimension')
    .order('display_order')

  if (countError) {
    console.log('   Error fetching questions:', countError.message)
  } else {
    console.log(`   Total questions in database: ${questions?.length || 0}`)
    const byDimension = questions?.reduce((acc, q) => {
      acc[q.dimension] = (acc[q.dimension] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    console.log('   Questions by dimension:', byDimension)
  }

  console.log('\nMigration complete!')
}

applyMigration().catch(console.error)
