-- =====================================================
-- Migration: 009_dr_lee_courses.sql
-- Description: Import Dr. Ernesto Lee's AI Masterclasses
-- Created: 2025-11-28
-- Dependencies: 002_instructor_schema.sql
--
-- This migration creates Dr. Ernesto Lee's instructor profile
-- and imports his masterclass courses with the Shu-Ha-Ri methodology.
-- =====================================================

-- =====================================================
-- STEP 1: CREATE DR. LEE'S USER ACCOUNT
-- =====================================================

DO $$
DECLARE
  dr_lee_user_id UUID;
BEGIN
  -- Check if Dr. Lee already exists
  SELECT id INTO dr_lee_user_id FROM users WHERE email = 'dr.ernesto.lee@drlee.ai';

  IF dr_lee_user_id IS NULL THEN
    -- Create user account
    INSERT INTO users (
      email,
      full_name,
      role,
      is_active,
      email_verified
    ) VALUES (
      'dr.ernesto.lee@drlee.ai',
      'Dr. Ernesto Lee',
      'instructor',
      true,
      true
    ) RETURNING id INTO dr_lee_user_id;

    -- Create instructor profile
    INSERT INTO instructor_profiles (
      user_id,
      bio,
      professional_title,
      tagline,
      expertise_tags,
      pillars,
      is_verified,
      is_featured,
      is_accepting_students
    ) VALUES (
      dr_lee_user_id,
      'Dr. Ernesto Lee is a world-renowned AI educator and architect who has taught thousands of engineers and founders to build frontier AI systems from scratch. His Shu-Ha-Ri teaching methodology combines Harvard/MIT/Stanford-level executive education with hands-on builder culture.',
      'AI Architect & Executive Educator',
      'Stop Consuming. Start Building. Own Your AI Technology.',
      ARRAY['LLM', 'Reasoning AI', 'Frontier AI', 'PyTorch', 'Deep Learning'],
      ARRAY['optimization', 'infrastructure']::ai_pillar[],
      true,
      true,
      true
    );

    -- Create instructor settings
    INSERT INTO instructor_settings (
      user_id,
      auto_approve_enrollments,
      allow_student_questions,
      allow_course_reviews,
      show_student_count,
      currency
    ) VALUES (
      dr_lee_user_id,
      true,
      true,
      true,
      true,
      'USD'
    );
  END IF;
END $$;

-- =====================================================
-- STEP 2: CREATE COURSES
-- =====================================================

-- Course 1: Build Your Own LLM
DO $$
DECLARE
  dr_lee_user_id UUID;
  course_id UUID;
  module_id UUID;
BEGIN
  SELECT id INTO dr_lee_user_id FROM users WHERE email = 'dr.ernesto.lee@drlee.ai';

  INSERT INTO courses (
    instructor_id,
    title,
    description,
    difficulty_level,
    duration_weeks,
    estimated_hours,
    price_amount,
    price_currency,
    is_published,
    status,
    category,
    tags,
    what_you_will_learn,
    target_audience,
    language
  ) VALUES (
    dr_lee_user_id,
    'Build Your Own LLM',
    'The ONLY masterclass teaching you to build production-ready LLMs from scratch—own your technology, stop renting from OpenAI.',
    'advanced',
    9,
    50,
    1997.00,
    'USD',
    true,
    'published',
    'Hardcore Developers',
    ARRAY['LLM', 'GPT', 'Transformers', 'PyTorch', 'Flagship'],
    ARRAY[
      'Build complete GPT architecture from scratch',
      'Implement attention mechanisms without libraries',
      'Train models on 100M+ tokens',
      'Fine-tune for classification tasks',
      'Deploy with zero API dependency'
    ],
    ARRAY[
      'AI engineers earning $100K-$150K',
      'Technical founders burning $5K-$50K/month on APIs',
      'Engineers with intermediate Python skills'
    ],
    'en'
  ) RETURNING id INTO course_id;

  -- Add modules
  INSERT INTO course_modules (course_id, title, description, order_index) VALUES
  (course_id, 'The Architecture of Intelligence', 'Understand transformer architecture and GPT design', 1),
  (course_id, 'Text as Data', 'Master tokenization and embeddings', 2),
  (course_id, 'The Attention Revolution', 'Code attention mechanisms from scratch', 3),
  (course_id, 'Architecting Language Models', 'Build complete GPT architecture', 4),
  (course_id, 'Training at Scale', 'Train on massive datasets', 5),
  (course_id, 'Task Specialization', 'Fine-tune for specific tasks', 6),
  (course_id, 'Instruction Intelligence', 'Make models follow instructions', 7),
  (course_id, 'Production Training Excellence', 'Implement production techniques', 8),
  (course_id, 'Efficient Adaptation at Scale', 'Master LoRA for fine-tuning', 9);

  -- Set pricing metadata
  UPDATE courses SET metadata = jsonb_build_object(
    'pricing_tiers', jsonb_build_array(
      jsonb_build_object('name', 'Self-Paced', 'price', 1997),
      jsonb_build_object('name', 'Cohort', 'price', 6997, 'popular', true),
      jsonb_build_object('name', 'Founder', 'price', 19997)
    ),
    'shu_ha_ri', true
  ) WHERE id = course_id;
END $$;

-- Course 2: Build Your Own Reasoning Model
DO $$
DECLARE
  dr_lee_user_id UUID;
  course_id UUID;
BEGIN
  SELECT id INTO dr_lee_user_id FROM users WHERE email = 'dr.ernesto.lee@drlee.ai';

  INSERT INTO courses (
    instructor_id,
    title,
    description,
    difficulty_level,
    duration_weeks,
    estimated_hours,
    price_amount,
    price_currency,
    is_published,
    status,
    category,
    tags,
    what_you_will_learn,
    target_audience,
    language
  ) VALUES (
    dr_lee_user_id,
    'Build Your Own Reasoning Model',
    'The ONLY masterclass teaching you to build o1-class reasoning systems from scratch.',
    'advanced',
    9,
    40,
    1497.00,
    'USD',
    true,
    'published',
    'Hardcore Developers',
    ARRAY['Reasoning', 'o1', 'PSRM', 'RL'],
    ARRAY[
      'Implement process-supervised reward modeling',
      'Build inference-time compute scaling',
      'Train reasoning with RL',
      'Distill reasoning into efficient models'
    ],
    ARRAY[
      'AI engineers wanting reasoning expertise',
      'Founders building AI products'
    ],
    'en'
  ) RETURNING id INTO course_id;

  INSERT INTO course_modules (course_id, title, description, order_index) VALUES
  (course_id, 'Intelligence Behind Reasoning', 'What makes o1 different', 1),
  (course_id, 'Text Generation Foundations', 'Sampling strategies', 2),
  (course_id, 'Measuring Reasoning Quality', 'Evaluation benchmarks', 3),
  (course_id, 'Scaling Intelligence at Inference', 'Inference-time compute', 4),
  (course_id, 'Learning Through Reinforcement', 'PSRM and RL training', 5),
  (course_id, 'Knowledge Compression', 'Distillation techniques', 6),
  (course_id, 'Advanced Reasoning', 'Tool-augmented systems', 7),
  (course_id, 'Production Integration', 'Deploy at scale', 8),
  (course_id, 'Frontier Capabilities', 'Cutting-edge techniques', 9);

  UPDATE courses SET metadata = jsonb_build_object(
    'pricing_tiers', jsonb_build_array(
      jsonb_build_object('name', 'Self-Paced', 'price', 1497),
      jsonb_build_object('name', 'Cohort', 'price', 5997, 'popular', true),
      jsonb_build_object('name', 'Founder', 'price', 17997)
    ),
    'shu_ha_ri', true
  ) WHERE id = course_id;
END $$;

-- Course 3: Build Your Own Frontier AI
DO $$
DECLARE
  dr_lee_user_id UUID;
  course_id UUID;
BEGIN
  SELECT id INTO dr_lee_user_id FROM users WHERE email = 'dr.ernesto.lee@drlee.ai';

  INSERT INTO courses (
    instructor_id,
    title,
    description,
    difficulty_level,
    duration_weeks,
    estimated_hours,
    price_amount,
    price_currency,
    is_published,
    status,
    category,
    tags,
    what_you_will_learn,
    target_audience,
    language
  ) VALUES (
    dr_lee_user_id,
    'Build Your Own Frontier AI',
    'Master Mixture-of-Experts, MLA, 64x efficiency—cut API costs 90%.',
    'advanced',
    9,
    55,
    1997.00,
    'USD',
    true,
    'published',
    'Hardcore Developers',
    ARRAY['MoE', 'MLA', 'Production', 'FP8'],
    ARRAY[
      'Implement Mixture-of-Experts (8x capacity)',
      'Build Multi-Head Latent Attention (64x compression)',
      'Deploy FP8 training (2x speedup)',
      'Complete production serving'
    ],
    ARRAY[
      'Senior ML engineers',
      'Technical founders spending $500K/month on APIs'
    ],
    'en'
  ) RETURNING id INTO course_id;

  INSERT INTO course_modules (course_id, title, description, order_index) VALUES
  (course_id, 'Strategic Landscape', 'Frontier-class models', 1),
  (course_id, 'Inference Bottleneck', 'Solve inference problems', 2),
  (course_id, 'KV Cache Optimization', 'Memory management', 3),
  (course_id, 'Attention Variants (GQA)', 'Grouped-Query Attention', 4),
  (course_id, 'Latent Attention', '64x compression', 5),
  (course_id, 'Positional Encoding', 'RoPE for long contexts', 6),
  (course_id, 'Mixture-of-Experts', 'Sparse expert routing', 7),
  (course_id, 'Production Training', 'FP8 and distributed', 8),
  (course_id, 'Post-Training', 'SFT and DPO', 9),
  (course_id, 'Deployment', 'Production scale', 10);

  UPDATE courses SET metadata = jsonb_build_object(
    'pricing_tiers', jsonb_build_array(
      jsonb_build_object('name', 'Self-Paced', 'price', 1997),
      jsonb_build_object('name', 'Cohort', 'price', 6997, 'popular', true),
      jsonb_build_object('name', 'Founder', 'price', 19997)
    ),
    'shu_ha_ri', true
  ) WHERE id = course_id;
END $$;

-- Course 4: Build Your Own Image Generator
DO $$
DECLARE
  dr_lee_user_id UUID;
  course_id UUID;
BEGIN
  SELECT id INTO dr_lee_user_id FROM users WHERE email = 'dr.ernesto.lee@drlee.ai';

  INSERT INTO courses (
    instructor_id,
    title,
    description,
    difficulty_level,
    duration_weeks,
    estimated_hours,
    price_amount,
    price_currency,
    is_published,
    status,
    category,
    tags,
    what_you_will_learn,
    target_audience,
    language
  ) VALUES (
    dr_lee_user_id,
    'Build Your Own Image Generator',
    'Train vision models from scratch. Build DALL-E and Stable Diffusion systems.',
    'advanced',
    11,
    50,
    1997.00,
    'USD',
    true,
    'published',
    'Hardcore Developers',
    ARRAY['Diffusion', 'Vision', 'CLIP', 'Stable Diffusion'],
    ARRAY[
      'Build vision transformers',
      'Implement diffusion models',
      'Train CLIP models',
      'Create Stable Diffusion pipelines'
    ],
    ARRAY[
      'ML engineers interested in computer vision',
      'Founders building visual AI products'
    ],
    'en'
  ) RETURNING id INTO course_id;

  INSERT INTO course_modules (course_id, title, description, order_index) VALUES
  (course_id, 'Two Models', 'Transformer vs Diffusion', 1),
  (course_id, 'Build a Transformer', 'Attention mechanisms', 2),
  (course_id, 'Vision Transformers', 'ViT from scratch', 3),
  (course_id, 'Image Captioning', 'Text from images', 4),
  (course_id, 'Diffusion Models', 'Generate images', 5),
  (course_id, 'Control Generation', 'Classifier-free guidance', 6),
  (course_id, 'High-Res Generation', 'DDIM sampling', 7),
  (course_id, 'CLIP', 'Text-image understanding', 8),
  (course_id, 'Latent Diffusion', 'Stable Diffusion', 9),
  (course_id, 'Stable Diffusion Deep Dive', 'Complete architecture', 10),
  (course_id, 'VQGAN', 'Transformer generation', 11);

  UPDATE courses SET metadata = jsonb_build_object(
    'pricing_tiers', jsonb_build_array(
      jsonb_build_object('name', 'Self-Paced', 'price', 1997),
      jsonb_build_object('name', 'Cohort', 'price', 6997, 'popular', true),
      jsonb_build_object('name', 'Founder', 'price', 19997)
    ),
    'shu_ha_ri', true
  ) WHERE id = course_id;
END $$;

-- =====================================================
-- SUMMARY
-- =====================================================

DO $$
DECLARE
  dr_lee_user_id UUID;
  course_count INTEGER;
  total_hours INTEGER;
BEGIN
  SELECT id INTO dr_lee_user_id FROM users WHERE email = 'dr.ernesto.lee@drlee.ai';

  SELECT COUNT(*), SUM(estimated_hours)
  INTO course_count, total_hours
  FROM courses
  WHERE instructor_id = dr_lee_user_id;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Dr. Ernesto Lee Import Complete';
  RAISE NOTICE 'Courses: % | Hours: %', course_count, total_hours;
  RAISE NOTICE '========================================';
END $$;
