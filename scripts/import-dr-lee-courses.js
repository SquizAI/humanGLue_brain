#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const courses = [
  {
    instructor_name: 'Dr. Ernesto Lee',
    instructor_bio: 'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
    title: 'Production AI',
    slug: 'production-ai',
    description: 'Build an AI Product Factory. Own your MLOps platform—train, deploy, monitor, scale.',
    pillar: 'coaching',
    level: 'advanced',
    duration_hours: 45,
    estimated_effort: '9 weeks',
    price_amount: 997.00,
    currency: 'USD',
    prerequisites: ['Intermediate Python', 'Basic ML knowledge'],
    learning_outcomes: [
      'Build complete MLOps pipelines from scratch',
      'Implement model training, versioning, and deployment',
      'Create monitoring and observability systems',
      'Scale AI systems in production',
      'Own your complete ML infrastructure'
    ],
    is_published: true,
    published_at: new Date().toISOString(),
    metadata: {
      instructor_user_id: '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
      shu_ha_ri: true,
      pricing_tiers: [
        { name: 'Self-Paced', price: 997 },
        { name: 'Cohort', price: 3997, popular: true },
        { name: 'Founder', price: 9997 }
      ],
      module_count: 11,
      category: 'Hardcore Developers'
    }
  },
  {
    instructor_name: 'Dr. Ernesto Lee',
    instructor_bio: 'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
    title: 'GraphRAG System',
    slug: 'graphrag-system',
    description: 'Build knowledge graph RAG from scratch. Own your retrieval intelligence—no LlamaIndex, no Langchain.',
    pillar: 'coaching',
    level: 'advanced',
    duration_hours: 35,
    estimated_effort: '8 weeks',
    price_amount: 1197.00,
    currency: 'USD',
    prerequisites: ['Python programming', 'Basic RAG understanding'],
    learning_outcomes: [
      'Build knowledge graphs from unstructured data',
      'Implement graph-based retrieval systems',
      'Create semantic search without dependencies',
      'Scale knowledge bases efficiently',
      'Own your RAG technology stack'
    ],
    is_published: true,
    published_at: new Date().toISOString(),
    metadata: {
      instructor_user_id: '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
      shu_ha_ri: true,
      pricing_tiers: [
        { name: 'Self-Paced', price: 1197 },
        { name: 'Cohort', price: 4997, popular: true },
        { name: 'Founder', price: 12997 }
      ],
      module_count: 8,
      category: 'Hardcore Developers'
    }
  },
  {
    instructor_name: 'Dr. Ernesto Lee',
    instructor_bio: 'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
    title: 'Machine Learning Intuition',
    slug: 'machine-learning-intuition',
    description: 'Build ML intuition from first principles. Code regression, classification, trees, clustering—own the fundamentals.',
    pillar: 'coaching',
    level: 'intermediate',
    duration_hours: 35,
    estimated_effort: '9 weeks',
    price_amount: 697.00,
    currency: 'USD',
    prerequisites: ['Basic Python', 'High school math'],
    learning_outcomes: [
      'Understand ML algorithms from first principles',
      'Code linear regression, logistic regression from scratch',
      'Build decision trees and random forests',
      'Implement clustering algorithms',
      'Develop deep ML intuition'
    ],
    is_published: true,
    published_at: new Date().toISOString(),
    metadata: {
      instructor_user_id: '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
      shu_ha_ri: true,
      pricing_tiers: [
        { name: 'Self-Paced', price: 697 },
        { name: 'Cohort', price: 2997, popular: true },
        { name: 'Founder', price: 7997 }
      ],
      module_count: 13,
      category: 'Citizen Developer'
    }
  },
  {
    instructor_name: 'Dr. Ernesto Lee',
    instructor_bio: 'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
    title: 'Deep Learning Intuition',
    slug: 'deep-learning-intuition',
    description: 'Build neural networks from scratch. Own CNNs, RNNs, embeddings—no libraries, pure understanding.',
    pillar: 'coaching',
    level: 'advanced',
    duration_hours: 40,
    estimated_effort: '10 weeks',
    price_amount: 897.00,
    currency: 'USD',
    prerequisites: ['Python programming', 'Basic ML knowledge', 'Linear algebra'],
    learning_outcomes: [
      'Code neural networks from scratch',
      'Build CNNs for computer vision',
      'Implement RNNs for sequences',
      'Create word embeddings',
      'Master backpropagation and optimization'
    ],
    is_published: true,
    published_at: new Date().toISOString(),
    metadata: {
      instructor_user_id: '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
      shu_ha_ri: true,
      pricing_tiers: [
        { name: 'Self-Paced', price: 897 },
        { name: 'Cohort', price: 3997, popular: true },
        { name: 'Founder', price: 9997 }
      ],
      module_count: 16,
      category: 'Hardcore Developers'
    }
  },
  {
    instructor_name: 'Dr. Ernesto Lee',
    instructor_bio: 'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
    title: 'Domain Specific SLM',
    slug: 'domain-specific-slm',
    description: 'Build specialized small language models. Train domain-specific intelligence—medical, legal, finance—own your niche.',
    pillar: 'coaching',
    level: 'advanced',
    duration_hours: 45,
    estimated_effort: '11 weeks',
    price_amount: 1197.00,
    currency: 'USD',
    prerequisites: ['Python', 'LLM basics', 'Domain expertise'],
    learning_outcomes: [
      'Build small language models from scratch',
      'Train domain-specific models',
      'Implement efficient architectures',
      'Fine-tune for specialized tasks',
      'Deploy lightweight production models'
    ],
    is_published: true,
    published_at: new Date().toISOString(),
    metadata: {
      instructor_user_id: '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
      shu_ha_ri: true,
      pricing_tiers: [
        { name: 'Self-Paced', price: 1197 },
        { name: 'Cohort', price: 4997, popular: true },
        { name: 'Founder', price: 12997 }
      ],
      module_count: 15,
      category: 'Hardcore Developers'
    }
  },
  {
    instructor_name: 'Dr. Ernesto Lee',
    instructor_bio: 'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
    title: 'Fine-Tune Your Own Models',
    slug: 'fine-tune-your-own-models',
    description: 'Master LoRA, QLoRA, full fine-tuning. Own model adaptation—no API limits, complete control.',
    pillar: 'coaching',
    level: 'advanced',
    duration_hours: 25,
    estimated_effort: '6 weeks',
    price_amount: 997.00,
    currency: 'USD',
    prerequisites: ['Python', 'Basic LLM knowledge'],
    learning_outcomes: [
      'Implement LoRA from scratch',
      'Master QLoRA for efficient training',
      'Perform full model fine-tuning',
      'Optimize training workflows',
      'Deploy fine-tuned models'
    ],
    is_published: true,
    published_at: new Date().toISOString(),
    metadata: {
      instructor_user_id: '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
      shu_ha_ri: true,
      pricing_tiers: [
        { name: 'Self-Paced', price: 997 },
        { name: 'Cohort', price: 3997, popular: true },
        { name: 'Founder', price: 9997 }
      ],
      module_count: 8,
      category: 'Hardcore Developers'
    }
  },
  {
    instructor_name: 'Dr. Ernesto Lee',
    instructor_bio: 'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
    title: 'AI-Augmented Engineering',
    slug: 'ai-augmented-engineering',
    description: 'Become a 10x developer. Master AI-native workflows—coding, debugging, architecture—own your productivity.',
    pillar: 'coaching',
    level: 'intermediate',
    duration_hours: 20,
    estimated_effort: '5 weeks',
    price_amount: 697.00,
    currency: 'USD',
    prerequisites: ['Software development experience', 'Basic AI understanding'],
    learning_outcomes: [
      'Build AI-powered development workflows',
      'Master prompt engineering for coding',
      'Create intelligent debugging systems',
      'Implement AI code review processes',
      'Increase productivity 10x with AI'
    ],
    is_published: true,
    published_at: new Date().toISOString(),
    metadata: {
      instructor_user_id: '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
      shu_ha_ri: true,
      pricing_tiers: [
        { name: 'Self-Paced', price: 697 },
        { name: 'Cohort', price: 2997, popular: true },
        { name: 'Founder', price: 6997 }
      ],
      module_count: 7,
      category: 'Citizen Developer'
    }
  },
  {
    instructor_name: 'Dr. Ernesto Lee',
    instructor_bio: 'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
    title: 'Automated Insights',
    slug: 'automated-insights',
    description: 'Build AI analytics from scratch. Own data analysis, visualization, reporting—no Tableau, pure intelligence.',
    pillar: 'coaching',
    level: 'intermediate',
    duration_hours: 35,
    estimated_effort: '8 weeks',
    price_amount: 897.00,
    currency: 'USD',
    prerequisites: ['Python', 'Basic data analysis'],
    learning_outcomes: [
      'Build automated analytics pipelines',
      'Create AI-powered insights generation',
      'Implement intelligent reporting systems',
      'Master data visualization techniques',
      'Own your analytics stack'
    ],
    is_published: true,
    published_at: new Date().toISOString(),
    metadata: {
      instructor_user_id: '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
      shu_ha_ri: true,
      pricing_tiers: [
        { name: 'Self-Paced', price: 897 },
        { name: 'Cohort', price: 3997, popular: true },
        { name: 'Founder', price: 8997 }
      ],
      module_count: 8,
      category: 'Citizen Developer'
    }
  },
  {
    instructor_name: 'Dr. Ernesto Lee',
    instructor_bio: 'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
    title: 'Agentic Automation',
    slug: 'agentic-automation',
    description: 'Build no-code AI workflows. Own agentic automation—Zapier-killing intelligence, complete control.',
    pillar: 'coaching',
    level: 'beginner',
    duration_hours: 18,
    estimated_effort: '4 weeks',
    price_amount: 697.00,
    currency: 'USD',
    prerequisites: ['Basic computer skills', 'Problem-solving mindset'],
    learning_outcomes: [
      'Build AI agent workflows without code',
      'Create intelligent automation systems',
      'Implement multi-agent orchestration',
      'Design workflow intelligence',
      'Own your automation stack'
    ],
    is_published: true,
    published_at: new Date().toISOString(),
    metadata: {
      instructor_user_id: '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
      shu_ha_ri: true,
      pricing_tiers: [
        { name: 'Self-Paced', price: 697 },
        { name: 'Cohort', price: 2997, popular: true },
        { name: 'Founder', price: 6997 }
      ],
      module_count: 6,
      category: 'Citizen Developer'
    }
  },
  {
    instructor_name: 'Dr. Ernesto Lee',
    instructor_bio: 'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
    title: 'Predictive Insight',
    slug: 'predictive-insight',
    description: 'Build forecasting systems from scratch. Own time series, predictions, trends—no black boxes.',
    pillar: 'coaching',
    level: 'intermediate',
    duration_hours: 16,
    estimated_effort: '4 weeks',
    price_amount: 497.00,
    currency: 'USD',
    prerequisites: ['Basic Python', 'Statistics fundamentals'],
    learning_outcomes: [
      'Build time series forecasting models',
      'Implement prediction systems',
      'Create trend analysis tools',
      'Master forecasting algorithms',
      'Own your predictive analytics'
    ],
    is_published: true,
    published_at: new Date().toISOString(),
    metadata: {
      instructor_user_id: '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
      shu_ha_ri: true,
      pricing_tiers: [
        { name: 'Self-Paced', price: 497 },
        { name: 'Cohort', price: 1997, popular: true },
        { name: 'Founder', price: 4997 }
      ],
      module_count: 6,
      category: 'Citizen Developer'
    }
  },
  {
    instructor_name: 'Dr. Ernesto Lee',
    instructor_bio: 'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
    title: 'The Decision Engine',
    slug: 'the-decision-engine',
    description: 'Build A/B testing from scratch. Own experimentation, metrics, statistical rigor—no Optimizely.',
    pillar: 'coaching',
    level: 'intermediate',
    duration_hours: 15,
    estimated_effort: '4 weeks',
    price_amount: 697.00,
    currency: 'USD',
    prerequisites: ['Basic statistics', 'Programming knowledge'],
    learning_outcomes: [
      'Build A/B testing frameworks from scratch',
      'Implement statistical testing',
      'Create experimentation platforms',
      'Master metrics and KPIs',
      'Own your decision systems'
    ],
    is_published: true,
    published_at: new Date().toISOString(),
    metadata: {
      instructor_user_id: '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
      shu_ha_ri: true,
      pricing_tiers: [
        { name: 'Self-Paced', price: 697 },
        { name: 'Cohort', price: 2997, popular: true },
        { name: 'Founder', price: 6997 }
      ],
      module_count: 5,
      category: 'Citizen Developer'
    }
  },
  {
    instructor_name: 'Dr. Ernesto Lee',
    instructor_bio: 'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
    title: 'Agentic SDK',
    slug: 'agentic-sdk',
    description: 'Build AI agent frameworks from scratch. Own orchestration, memory, tools—no LangChain dependency.',
    pillar: 'coaching',
    level: 'advanced',
    duration_hours: 22,
    estimated_effort: '6 weeks',
    price_amount: 997.00,
    currency: 'USD',
    prerequisites: ['Python', 'LLM basics', 'API development'],
    learning_outcomes: [
      'Build agent frameworks from scratch',
      'Implement agent orchestration',
      'Create memory systems',
      'Design tool integration',
      'Own your agent infrastructure'
    ],
    is_published: true,
    published_at: new Date().toISOString(),
    metadata: {
      instructor_user_id: '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
      shu_ha_ri: true,
      pricing_tiers: [
        { name: 'Self-Paced', price: 997 },
        { name: 'Cohort', price: 3997, popular: true },
        { name: 'Founder', price: 9997 }
      ],
      module_count: 7,
      category: 'Hardcore Developers'
    }
  },
  {
    instructor_name: 'Dr. Ernesto Lee',
    instructor_bio: 'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
    title: 'Vibe Marketing',
    slug: 'vibe-marketing',
    description: 'Build AI marketing systems. Own content generation, SEO, personalization—no HubSpot bills.',
    pillar: 'coaching',
    level: 'intermediate',
    duration_hours: 35,
    estimated_effort: '8 weeks',
    price_amount: 1497.00,
    currency: 'USD',
    prerequisites: ['Marketing knowledge', 'Basic AI understanding'],
    learning_outcomes: [
      'Build AI content generation systems',
      'Implement SEO automation',
      'Create personalization engines',
      'Master AI-powered campaigns',
      'Own your marketing tech stack'
    ],
    is_published: true,
    published_at: new Date().toISOString(),
    metadata: {
      instructor_user_id: '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
      shu_ha_ri: true,
      pricing_tiers: [
        { name: 'Self-Paced', price: 1497 },
        { name: 'Cohort', price: 6997, popular: true },
        { name: 'Founder', price: 17997 }
      ],
      module_count: 11,
      category: 'Citizen Developer'
    }
  },
  {
    instructor_name: 'Dr. Ernesto Lee',
    instructor_bio: 'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
    title: 'The AI-Native University',
    slug: 'the-ai-native-university',
    description: 'Build AI education systems. Own personalized learning, adaptive content, student analytics—own EdTech.',
    pillar: 'coaching',
    level: 'intermediate',
    duration_hours: 24,
    estimated_effort: '6 weeks',
    price_amount: 997.00,
    currency: 'USD',
    prerequisites: ['Education background', 'Basic AI knowledge'],
    learning_outcomes: [
      'Build personalized learning systems',
      'Implement adaptive content delivery',
      'Create student analytics platforms',
      'Design AI tutoring systems',
      'Own your EdTech stack'
    ],
    is_published: true,
    published_at: new Date().toISOString(),
    metadata: {
      instructor_user_id: '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
      shu_ha_ri: true,
      pricing_tiers: [
        { name: 'Self-Paced', price: 997 },
        { name: 'Cohort', price: 3997, popular: true },
        { name: 'Founder', price: 9997 }
      ],
      module_count: 8,
      category: 'Citizen Developer'
    }
  },
  {
    instructor_name: 'Dr. Ernesto Lee',
    instructor_bio: 'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
    title: 'The Token Economy',
    slug: 'the-token-economy',
    description: 'Build tokenomics systems. Own Web3 economics, incentive design, blockchain integration—no consultants.',
    pillar: 'coaching',
    level: 'advanced',
    duration_hours: 28,
    estimated_effort: '7 weeks',
    price_amount: 997.00,
    currency: 'USD',
    prerequisites: ['Economics basics', 'Blockchain understanding'],
    learning_outcomes: [
      'Design token economic systems',
      'Implement incentive mechanisms',
      'Build blockchain integrations',
      'Create governance models',
      'Own your token economy'
    ],
    is_published: true,
    published_at: new Date().toISOString(),
    metadata: {
      instructor_user_id: '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
      shu_ha_ri: true,
      pricing_tiers: [
        { name: 'Self-Paced', price: 997 },
        { name: 'Cohort', price: 3997, popular: true },
        { name: 'Founder', price: 9997 }
      ],
      module_count: 10,
      category: 'Hardcore Developers'
    }
  }
];

async function importCourses() {
  console.log('🚀 Starting import of 15 Dr. Lee courses...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const course of courses) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([course])
        .select();

      if (error) {
        console.error(`❌ Failed to import "${course.title}":`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Imported: ${course.title} (${course.duration_hours}h)`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Exception importing "${course.title}":`, err.message);
      errorCount++;
    }
  }

  console.log('\n📊 Import Summary:');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📦 Total: ${courses.length}`);

  // Verify total courses for Dr. Lee
  const { data: allCourses, error: countError } = await supabase
    .from('courses')
    .select('id, title, duration_hours')
    .eq('metadata->>instructor_user_id', '08fb44f1-1e63-4cb5-8095-02f5f4cfece2');

  if (countError) {
    console.error('\n❌ Error counting courses:', countError.message);
  } else {
    const totalHours = allCourses.reduce((sum, c) => sum + (c.duration_hours || 0), 0);
    console.log(`\n🎓 Total Dr. Lee Courses: ${allCourses.length}`);
    console.log(`⏱️  Total Hours: ${totalHours}`);
  }
}

importCourses();
