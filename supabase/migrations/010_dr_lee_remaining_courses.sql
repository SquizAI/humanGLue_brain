-- =====================================================
-- Migration: 010_dr_lee_remaining_courses.sql
-- Description: Import remaining 15 Dr. Lee courses (6-21)
-- Created: 2025-11-28
-- Dependencies: 009_dr_lee_courses.sql
--
-- This migration imports the remaining 15 courses from
-- Dr. Ernesto Lee's catalog to complete the full 21-course
-- library.
-- =====================================================

-- Course 5: Production AI (AI Product Factory)
INSERT INTO courses (
  instructor_name,
  instructor_bio,
  title,
  slug,
  description,
  pillar,
  level,
  duration_hours,
  estimated_effort,
  price_amount,
  currency,
  prerequisites,
  learning_outcomes,
  is_published,
  published_at,
  metadata
) VALUES (
  'Dr. Ernesto Lee',
  'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
  'Production AI',
  'production-ai',
  'Build an AI Product Factory. Own your MLOps platform—train, deploy, monitor, scale.',
  'coaching',
  'advanced',
  45,
  '9 weeks',
  997.00,
  'USD',
  ARRAY['Intermediate Python', 'Basic ML knowledge'],
  ARRAY[
    'Build complete MLOps pipelines from scratch',
    'Implement model training, versioning, and deployment',
    'Create monitoring and observability systems',
    'Scale AI systems in production',
    'Own your complete ML infrastructure'
  ],
  true,
  NOW(),
  jsonb_build_object(
    'instructor_user_id', '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
    'shu_ha_ri', true,
    'pricing_tiers', jsonb_build_array(
      jsonb_build_object('name', 'Self-Paced', 'price', 997),
      jsonb_build_object('name', 'Cohort', 'price', 3997, 'popular', true),
      jsonb_build_object('name', 'Founder', 'price', 9997)
    ),
    'module_count', 11,
    'category', 'Hardcore Developers'
  )
);

-- Course 6: GraphRAG System
INSERT INTO courses (
  instructor_name,
  instructor_bio,
  title,
  slug,
  description,
  pillar,
  level,
  duration_hours,
  estimated_effort,
  price_amount,
  currency,
  prerequisites,
  learning_outcomes,
  is_published,
  published_at,
  metadata
) VALUES (
  'Dr. Ernesto Lee',
  'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
  'GraphRAG System',
  'graphrag-system',
  'Build knowledge graph RAG from scratch. Own your retrieval intelligence—no LlamaIndex, no Langchain.',
  'coaching',
  'advanced',
  35,
  '8 weeks',
  1197.00,
  'USD',
  ARRAY['Python programming', 'Basic RAG understanding'],
  ARRAY[
    'Build knowledge graphs from unstructured data',
    'Implement graph-based retrieval systems',
    'Create semantic search without dependencies',
    'Scale knowledge bases efficiently',
    'Own your RAG technology stack'
  ],
  true,
  NOW(),
  jsonb_build_object(
    'instructor_user_id', '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
    'shu_ha_ri', true,
    'pricing_tiers', jsonb_build_array(
      jsonb_build_object('name', 'Self-Paced', 'price', 1197),
      jsonb_build_object('name', 'Cohort', 'price', 4997, 'popular', true),
      jsonb_build_object('name', 'Founder', 'price', 12997)
    ),
    'module_count', 8,
    'category', 'Hardcore Developers'
  )
);

-- Course 7: Machine Learning Intuition
INSERT INTO courses (
  instructor_name,
  instructor_bio,
  title,
  slug,
  description,
  pillar,
  level,
  duration_hours,
  estimated_effort,
  price_amount,
  currency,
  prerequisites,
  learning_outcomes,
  is_published,
  published_at,
  metadata
) VALUES (
  'Dr. Ernesto Lee',
  'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
  'Machine Learning Intuition',
  'machine-learning-intuition',
  'Build ML intuition from first principles. Code regression, classification, trees, clustering—own the fundamentals.',
  'coaching',
  'intermediate',
  35,
  '9 weeks',
  697.00,
  'USD',
  ARRAY['Basic Python', 'High school math'],
  ARRAY[
    'Understand ML algorithms from first principles',
    'Code linear regression, logistic regression from scratch',
    'Build decision trees and random forests',
    'Implement clustering algorithms',
    'Develop deep ML intuition'
  ],
  true,
  NOW(),
  jsonb_build_object(
    'instructor_user_id', '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
    'shu_ha_ri', true,
    'pricing_tiers', jsonb_build_array(
      jsonb_build_object('name', 'Self-Paced', 'price', 697),
      jsonb_build_object('name', 'Cohort', 'price', 2997, 'popular', true),
      jsonb_build_object('name', 'Founder', 'price', 7997)
    ),
    'module_count', 13,
    'category', 'Citizen Developer'
  )
);

-- Course 8: Deep Learning Intuition
INSERT INTO courses (
  instructor_name,
  instructor_bio,
  title,
  slug,
  description,
  pillar,
  level,
  duration_hours,
  estimated_effort,
  price_amount,
  currency,
  prerequisites,
  learning_outcomes,
  is_published,
  published_at,
  metadata
) VALUES (
  'Dr. Ernesto Lee',
  'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
  'Deep Learning Intuition',
  'deep-learning-intuition',
  'Build neural networks from scratch. Own CNNs, RNNs, embeddings—no libraries, pure understanding.',
  'coaching',
  'advanced',
  40,
  '10 weeks',
  897.00,
  'USD',
  ARRAY['Python programming', 'Basic ML knowledge', 'Linear algebra'],
  ARRAY[
    'Code neural networks from scratch',
    'Build CNNs for computer vision',
    'Implement RNNs for sequences',
    'Create word embeddings',
    'Master backpropagation and optimization'
  ],
  true,
  NOW(),
  jsonb_build_object(
    'instructor_user_id', '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
    'shu_ha_ri', true,
    'pricing_tiers', jsonb_build_array(
      jsonb_build_object('name', 'Self-Paced', 'price', 897),
      jsonb_build_object('name', 'Cohort', 'price', 3997, 'popular', true),
      jsonb_build_object('name', 'Founder', 'price', 9997)
    ),
    'module_count', 16,
    'category', 'Hardcore Developers'
  )
);

-- Course 9: Domain Specific SLM
INSERT INTO courses (
  instructor_name,
  instructor_bio,
  title,
  slug,
  description,
  pillar,
  level,
  duration_hours,
  estimated_effort,
  price_amount,
  currency,
  prerequisites,
  learning_outcomes,
  is_published,
  published_at,
  metadata
) VALUES (
  'Dr. Ernesto Lee',
  'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
  'Domain Specific SLM',
  'domain-specific-slm',
  'Build specialized small language models. Train domain-specific intelligence—medical, legal, finance—own your niche.',
  'coaching',
  'advanced',
  45,
  '11 weeks',
  1197.00,
  'USD',
  ARRAY['Python', 'LLM basics', 'Domain expertise'],
  ARRAY[
    'Build small language models from scratch',
    'Train domain-specific models',
    'Implement efficient architectures',
    'Fine-tune for specialized tasks',
    'Deploy lightweight production models'
  ],
  true,
  NOW(),
  jsonb_build_object(
    'instructor_user_id', '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
    'shu_ha_ri', true,
    'pricing_tiers', jsonb_build_array(
      jsonb_build_object('name', 'Self-Paced', 'price', 1197),
      jsonb_build_object('name', 'Cohort', 'price', 4997, 'popular', true),
      jsonb_build_object('name', 'Founder', 'price', 12997)
    ),
    'module_count', 15,
    'category', 'Hardcore Developers'
  )
);

-- Course 10: Fine-Tune Your Own Models
INSERT INTO courses (
  instructor_name,
  instructor_bio,
  title,
  slug,
  description,
  pillar,
  level,
  duration_hours,
  estimated_effort,
  price_amount,
  currency,
  prerequisites,
  learning_outcomes,
  is_published,
  published_at,
  metadata
) VALUES (
  'Dr. Ernesto Lee',
  'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
  'Fine-Tune Your Own Models',
  'fine-tune-your-own-models',
  'Master LoRA, QLoRA, full fine-tuning. Own model adaptation—no API limits, complete control.',
  'coaching',
  'advanced',
  25,
  '6 weeks',
  997.00,
  'USD',
  ARRAY['Python', 'Basic LLM knowledge'],
  ARRAY[
    'Implement LoRA from scratch',
    'Master QLoRA for efficient training',
    'Perform full model fine-tuning',
    'Optimize training workflows',
    'Deploy fine-tuned models'
  ],
  true,
  NOW(),
  jsonb_build_object(
    'instructor_user_id', '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
    'shu_ha_ri', true,
    'pricing_tiers', jsonb_build_array(
      jsonb_build_object('name', 'Self-Paced', 'price', 997),
      jsonb_build_object('name', 'Cohort', 'price', 3997, 'popular', true),
      jsonb_build_object('name', 'Founder', 'price', 9997)
    ),
    'module_count', 8,
    'category', 'Hardcore Developers'
  )
);

-- Course 11: AI-Augmented Engineering
INSERT INTO courses (
  instructor_name,
  instructor_bio,
  title,
  slug,
  description,
  pillar,
  level,
  duration_hours,
  estimated_effort,
  price_amount,
  currency,
  prerequisites,
  learning_outcomes,
  is_published,
  published_at,
  metadata
) VALUES (
  'Dr. Ernesto Lee',
  'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
  'AI-Augmented Engineering',
  'ai-augmented-engineering',
  'Become a 10x developer. Master AI-native workflows—coding, debugging, architecture—own your productivity.',
  'coaching',
  'intermediate',
  20,
  '5 weeks',
  697.00,
  'USD',
  ARRAY['Software development experience', 'Basic AI understanding'],
  ARRAY[
    'Build AI-powered development workflows',
    'Master prompt engineering for coding',
    'Create intelligent debugging systems',
    'Implement AI code review processes',
    'Increase productivity 10x with AI'
  ],
  true,
  NOW(),
  jsonb_build_object(
    'instructor_user_id', '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
    'shu_ha_ri', true,
    'pricing_tiers', jsonb_build_array(
      jsonb_build_object('name', 'Self-Paced', 'price', 697),
      jsonb_build_object('name', 'Cohort', 'price', 2997, 'popular', true),
      jsonb_build_object('name', 'Founder', 'price', 6997)
    ),
    'module_count', 7,
    'category', 'Citizen Developer'
  )
);

-- Course 12: Automated Insights
INSERT INTO courses (
  instructor_name,
  instructor_bio,
  title,
  slug,
  description,
  pillar,
  level,
  duration_hours,
  estimated_effort,
  price_amount,
  currency,
  prerequisites,
  learning_outcomes,
  is_published,
  published_at,
  metadata
) VALUES (
  'Dr. Ernesto Lee',
  'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
  'Automated Insights',
  'automated-insights',
  'Build AI analytics from scratch. Own data analysis, visualization, reporting—no Tableau, pure intelligence.',
  'coaching',
  'intermediate',
  35,
  '8 weeks',
  897.00,
  'USD',
  ARRAY['Python', 'Basic data analysis'],
  ARRAY[
    'Build automated analytics pipelines',
    'Create AI-powered insights generation',
    'Implement intelligent reporting systems',
    'Master data visualization techniques',
    'Own your analytics stack'
  ],
  true,
  NOW(),
  jsonb_build_object(
    'instructor_user_id', '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
    'shu_ha_ri', true,
    'pricing_tiers', jsonb_build_array(
      jsonb_build_object('name', 'Self-Paced', 'price', 897),
      jsonb_build_object('name', 'Cohort', 'price', 3997, 'popular', true),
      jsonb_build_object('name', 'Founder', 'price', 8997)
    ),
    'module_count', 8,
    'category', 'Citizen Developer'
  )
);

-- Course 13: Agentic Automation
INSERT INTO courses (
  instructor_name,
  instructor_bio,
  title,
  slug,
  description,
  pillar,
  level,
  duration_hours,
  estimated_effort,
  price_amount,
  currency,
  prerequisites,
  learning_outcomes,
  is_published,
  published_at,
  metadata
) VALUES (
  'Dr. Ernesto Lee',
  'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
  'Agentic Automation',
  'agentic-automation',
  'Build no-code AI workflows. Own agentic automation—Zapier-killing intelligence, complete control.',
  'coaching',
  'beginner',
  18,
  '4 weeks',
  697.00,
  'USD',
  ARRAY['Basic computer skills', 'Problem-solving mindset'],
  ARRAY[
    'Build AI agent workflows without code',
    'Create intelligent automation systems',
    'Implement multi-agent orchestration',
    'Design workflow intelligence',
    'Own your automation stack'
  ],
  true,
  NOW(),
  jsonb_build_object(
    'instructor_user_id', '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
    'shu_ha_ri', true,
    'pricing_tiers', jsonb_build_array(
      jsonb_build_object('name', 'Self-Paced', 'price', 697),
      jsonb_build_object('name', 'Cohort', 'price', 2997, 'popular', true),
      jsonb_build_object('name', 'Founder', 'price', 6997)
    ),
    'module_count', 6,
    'category', 'Citizen Developer'
  )
);

-- Course 14: Predictive Insight
INSERT INTO courses (
  instructor_name,
  instructor_bio,
  title,
  slug,
  description,
  pillar,
  level,
  duration_hours,
  estimated_effort,
  price_amount,
  currency,
  prerequisites,
  learning_outcomes,
  is_published,
  published_at,
  metadata
) VALUES (
  'Dr. Ernesto Lee',
  'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
  'Predictive Insight',
  'predictive-insight',
  'Build forecasting systems from scratch. Own time series, predictions, trends—no black boxes.',
  'coaching',
  'intermediate',
  16,
  '4 weeks',
  497.00,
  'USD',
  ARRAY['Basic Python', 'Statistics fundamentals'],
  ARRAY[
    'Build time series forecasting models',
    'Implement prediction systems',
    'Create trend analysis tools',
    'Master forecasting algorithms',
    'Own your predictive analytics'
  ],
  true,
  NOW(),
  jsonb_build_object(
    'instructor_user_id', '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
    'shu_ha_ri', true,
    'pricing_tiers', jsonb_build_array(
      jsonb_build_object('name', 'Self-Paced', 'price', 497),
      jsonb_build_object('name', 'Cohort', 'price', 1997, 'popular', true),
      jsonb_build_object('name', 'Founder', 'price', 4997)
    ),
    'module_count', 6,
    'category', 'Citizen Developer'
  )
);

-- Course 15: The Decision Engine
INSERT INTO courses (
  instructor_name,
  instructor_bio,
  title,
  slug,
  description,
  pillar,
  level,
  duration_hours,
  estimated_effort,
  price_amount,
  currency,
  prerequisites,
  learning_outcomes,
  is_published,
  published_at,
  metadata
) VALUES (
  'Dr. Ernesto Lee',
  'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
  'The Decision Engine',
  'the-decision-engine',
  'Build A/B testing from scratch. Own experimentation, metrics, statistical rigor—no Optimizely.',
  'coaching',
  'intermediate',
  15,
  '4 weeks',
  697.00,
  'USD',
  ARRAY['Basic statistics', 'Programming knowledge'],
  ARRAY[
    'Build A/B testing frameworks from scratch',
    'Implement statistical testing',
    'Create experimentation platforms',
    'Master metrics and KPIs',
    'Own your decision systems'
  ],
  true,
  NOW(),
  jsonb_build_object(
    'instructor_user_id', '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
    'shu_ha_ri', true,
    'pricing_tiers', jsonb_build_array(
      jsonb_build_object('name', 'Self-Paced', 'price', 697),
      jsonb_build_object('name', 'Cohort', 'price', 2997, 'popular', true),
      jsonb_build_object('name', 'Founder', 'price', 6997)
    ),
    'module_count', 5,
    'category', 'Citizen Developer'
  )
);

-- Course 16: Agentic SDK
INSERT INTO courses (
  instructor_name,
  instructor_bio,
  title,
  slug,
  description,
  pillar,
  level,
  duration_hours,
  estimated_effort,
  price_amount,
  currency,
  prerequisites,
  learning_outcomes,
  is_published,
  published_at,
  metadata
) VALUES (
  'Dr. Ernesto Lee',
  'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
  'Agentic SDK',
  'agentic-sdk',
  'Build AI agent frameworks from scratch. Own orchestration, memory, tools—no LangChain dependency.',
  'coaching',
  'advanced',
  22,
  '6 weeks',
  997.00,
  'USD',
  ARRAY['Python', 'LLM basics', 'API development'],
  ARRAY[
    'Build agent frameworks from scratch',
    'Implement agent orchestration',
    'Create memory systems',
    'Design tool integration',
    'Own your agent infrastructure'
  ],
  true,
  NOW(),
  jsonb_build_object(
    'instructor_user_id', '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
    'shu_ha_ri', true,
    'pricing_tiers', jsonb_build_array(
      jsonb_build_object('name', 'Self-Paced', 'price', 997),
      jsonb_build_object('name', 'Cohort', 'price', 3997, 'popular', true),
      jsonb_build_object('name', 'Founder', 'price', 9997)
    ),
    'module_count', 7,
    'category', 'Hardcore Developers'
  )
);

-- Course 17: Vibe Marketing
INSERT INTO courses (
  instructor_name,
  instructor_bio,
  title,
  slug,
  description,
  pillar,
  level,
  duration_hours,
  estimated_effort,
  price_amount,
  currency,
  prerequisites,
  learning_outcomes,
  is_published,
  published_at,
  metadata
) VALUES (
  'Dr. Ernesto Lee',
  'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
  'Vibe Marketing',
  'vibe-marketing',
  'Build AI marketing systems. Own content generation, SEO, personalization—no HubSpot bills.',
  'coaching',
  'intermediate',
  35,
  '8 weeks',
  1497.00,
  'USD',
  ARRAY['Marketing knowledge', 'Basic AI understanding'],
  ARRAY[
    'Build AI content generation systems',
    'Implement SEO automation',
    'Create personalization engines',
    'Master AI-powered campaigns',
    'Own your marketing tech stack'
  ],
  true,
  NOW(),
  jsonb_build_object(
    'instructor_user_id', '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
    'shu_ha_ri', true,
    'pricing_tiers', jsonb_build_array(
      jsonb_build_object('name', 'Self-Paced', 'price', 1497),
      jsonb_build_object('name', 'Cohort', 'price', 6997, 'popular', true),
      jsonb_build_object('name', 'Founder', 'price', 17997)
    ),
    'module_count', 11,
    'category', 'Citizen Developer'
  )
);

-- Course 18: The AI-Native University
INSERT INTO courses (
  instructor_name,
  instructor_bio,
  title,
  slug,
  description,
  pillar,
  level,
  duration_hours,
  estimated_effort,
  price_amount,
  currency,
  prerequisites,
  learning_outcomes,
  is_published,
  published_at,
  metadata
) VALUES (
  'Dr. Ernesto Lee',
  'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
  'The AI-Native University',
  'the-ai-native-university',
  'Build AI education systems. Own personalized learning, adaptive content, student analytics—own EdTech.',
  'coaching',
  'intermediate',
  24,
  '6 weeks',
  997.00,
  'USD',
  ARRAY['Education background', 'Basic AI knowledge'],
  ARRAY[
    'Build personalized learning systems',
    'Implement adaptive content delivery',
    'Create student analytics platforms',
    'Design AI tutoring systems',
    'Own your EdTech stack'
  ],
  true,
  NOW(),
  jsonb_build_object(
    'instructor_user_id', '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
    'shu_ha_ri', true,
    'pricing_tiers', jsonb_build_array(
      jsonb_build_object('name', 'Self-Paced', 'price', 997),
      jsonb_build_object('name', 'Cohort', 'price', 3997, 'popular', true),
      jsonb_build_object('name', 'Founder', 'price', 9997)
    ),
    'module_count', 8,
    'category', 'Citizen Developer'
  )
);

-- Course 19: The Token Economy
INSERT INTO courses (
  instructor_name,
  instructor_bio,
  title,
  slug,
  description,
  pillar,
  level,
  duration_hours,
  estimated_effort,
  price_amount,
  currency,
  prerequisites,
  learning_outcomes,
  is_published,
  published_at,
  metadata
) VALUES (
  'Dr. Ernesto Lee',
  'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
  'The Token Economy',
  'the-token-economy',
  'Build tokenomics systems. Own Web3 economics, incentive design, blockchain integration—no consultants.',
  'coaching',
  'advanced',
  28,
  '7 weeks',
  997.00,
  'USD',
  ARRAY['Economics basics', 'Blockchain understanding'],
  ARRAY[
    'Design token economic systems',
    'Implement incentive mechanisms',
    'Build blockchain integrations',
    'Create governance models',
    'Own your token economy'
  ],
  true,
  NOW(),
  jsonb_build_object(
    'instructor_user_id', '08fb44f1-1e63-4cb5-8095-02f5f4cfece2',
    'shu_ha_ri', true,
    'pricing_tiers', jsonb_build_array(
      jsonb_build_object('name', 'Self-Paced', 'price', 997),
      jsonb_build_object('name', 'Cohort', 'price', 3997, 'popular', true),
      jsonb_build_object('name', 'Founder', 'price', 9997)
    ),
    'module_count', 10,
    'category', 'Hardcore Developers'
  )
);

-- =====================================================
-- SUMMARY
-- =====================================================

DO $$
DECLARE
  dr_lee_course_count INTEGER;
  total_hours INTEGER;
  new_course_count INTEGER;
BEGIN
  -- Count all Dr. Lee courses
  SELECT COUNT(*), SUM(duration_hours)
  INTO dr_lee_course_count, total_hours
  FROM courses
  WHERE metadata->>'instructor_user_id' = '08fb44f1-1e63-4cb5-8095-02f5f4cfece2';

  -- Count courses added in this migration
  new_course_count := 15;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Dr. Lee Course Import - Migration 010';
  RAISE NOTICE 'New Courses Added: %', new_course_count;
  RAISE NOTICE 'Total Dr. Lee Courses: %', dr_lee_course_count;
  RAISE NOTICE 'Total Hours: %', total_hours;
  RAISE NOTICE '========================================';
END $$;
