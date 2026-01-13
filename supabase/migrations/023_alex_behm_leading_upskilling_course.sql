-- =====================================================
-- Migration: 023_alex_behm_leading_upskilling_course.sql
-- Description: Create Alex Behm's instructor account and
--              Leading & Upskilling with AI course
-- Created: 2026-01-07
-- Dependencies: 002_instructor_schema.sql
--
-- This migration creates:
-- 1. Alex Behm's user account with admin + instructor roles
-- 2. Instructor profile
-- 3. The "Leading & Upskilling with AI" 2-day executive course
-- 4. All 9 modules (Pre-Arrival + 8 day modules)
-- =====================================================

-- =====================================================
-- STEP 1: CREATE ALEX BEHM'S USER ACCOUNT
-- =====================================================

DO $$
DECLARE
  alex_user_id UUID;
BEGIN
  -- Check if Alex already exists
  SELECT id INTO alex_user_id FROM users WHERE email = 'alex@behmn.com';

  IF alex_user_id IS NULL THEN
    -- Create user account
    INSERT INTO users (
      email,
      full_name,
      role,
      is_active,
      email_verified
    ) VALUES (
      'alex@behmn.com',
      'Alex Behm',
      'instructor',
      true,
      true
    ) RETURNING id INTO alex_user_id;

    RAISE NOTICE 'Created user account for Alex Behm with ID: %', alex_user_id;
  ELSE
    RAISE NOTICE 'User Alex Behm already exists with ID: %', alex_user_id;
  END IF;

  -- Add admin role (if not exists)
  INSERT INTO user_roles (user_id, role, granted_at)
  VALUES (alex_user_id, 'admin', NOW())
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Add instructor role (if not exists)
  INSERT INTO user_roles (user_id, role, granted_at)
  VALUES (alex_user_id, 'instructor', NOW())
  ON CONFLICT (user_id, role) DO NOTHING;

  RAISE NOTICE 'Assigned admin and instructor roles to Alex Behm';
END $$;

-- =====================================================
-- STEP 2: CREATE INSTRUCTOR PROFILE
-- =====================================================

DO $$
DECLARE
  alex_user_id UUID;
BEGIN
  SELECT id INTO alex_user_id FROM users WHERE email = 'alex@behmn.com';

  -- Check if instructor profile already exists
  IF NOT EXISTS (SELECT 1 FROM instructor_profiles WHERE user_id = alex_user_id) THEN
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
      alex_user_id,
      'Alex Behm is a pioneer in human-centered AI transformation, specializing in helping executives bridge the gap between AI strategy and workforce reality. With deep expertise in trust-building methodologies and organizational change, Alex has developed the GLUE Framework and Trust Journey Model that have helped hundreds of organizations achieve sustainable AI adoption. His research-backed approach draws from HBR, MIT, Deloitte, and Gallup studies to deliver transformation programs that actually work.',
      'AI Transformation & Human-Centered Change Expert',
      'You cannot lead a transformation you have not experienced.',
      ARRAY['AI Transformation', 'Trust Building', 'Change Management', 'Executive Development', 'GLUE Framework', 'Shadow AI', 'Organizational Psychology'],
      ARRAY['adaptability', 'coaching']::ai_pillar[],
      true,
      true,
      true
    );

    RAISE NOTICE 'Created instructor profile for Alex Behm';
  ELSE
    RAISE NOTICE 'Instructor profile already exists for Alex Behm';
  END IF;
END $$;

-- =====================================================
-- STEP 3: CREATE INSTRUCTOR SETTINGS
-- =====================================================

DO $$
DECLARE
  alex_user_id UUID;
BEGIN
  SELECT id INTO alex_user_id FROM users WHERE email = 'alex@behmn.com';

  -- Check if settings already exist
  IF NOT EXISTS (SELECT 1 FROM instructor_settings WHERE user_id = alex_user_id) THEN
    INSERT INTO instructor_settings (
      user_id,
      auto_approve_enrollments,
      allow_student_questions,
      allow_course_reviews,
      show_student_count,
      currency
    ) VALUES (
      alex_user_id,
      false, -- Manual approval for executive course
      true,
      true,
      true,
      'USD'
    );

    RAISE NOTICE 'Created instructor settings for Alex Behm';
  ELSE
    RAISE NOTICE 'Instructor settings already exist for Alex Behm';
  END IF;
END $$;

-- =====================================================
-- STEP 4: CREATE THE COURSE
-- =====================================================

DO $$
DECLARE
  alex_user_id UUID;
  course_id UUID;
  module_id UUID;
BEGIN
  SELECT id INTO alex_user_id FROM users WHERE email = 'alex@behmn.com';

  -- Check if course already exists
  IF EXISTS (SELECT 1 FROM courses WHERE title = 'Leading & Upskilling with AI' AND instructor_id = alex_user_id) THEN
    RAISE NOTICE 'Course already exists, skipping creation';
    RETURN;
  END IF;

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
    language,
    certificate_enabled,
    allow_comments,
    allow_qa
  ) VALUES (
    alex_user_id,
    'Leading & Upskilling with AI',
    E'A 2-Day Executive Transformation Course. You cannot lead a transformation you haven''t experienced. Day 1 transforms you; Day 2 teaches you to transform others.\n\nThis isn''t about AI adoption. It''s about human becoming. Every module asks: What do we want people in our organizations to become? The technology is incidental to the transformation.\n\nKey research backing:\n- 95% of AI programs fail to deliver bottom-line returns (MIT Research 2025)\n- Trust in generative AI dropped 31% in just 3 months (Deloitte TrustID)\n- Employee-centric organizations are 7x more likely to achieve AI maturity (HBR 2025)\n- 47% of leaders rank leadership effectiveness as #1 driver of AI ROI',
    'advanced',
    1, -- 2-day intensive
    16, -- 16 hours total
    0.00, -- Price TBD
    'USD',
    true,
    'published',
    'Executive AI Transformation',
    ARRAY['AI Strategy', 'Trust Journey', 'Change Leadership', 'GLUE Framework', '90-Day Sprint', 'Shadow AI', 'Executive Development', 'Featured'],
    ARRAY[
      'Experience personal AI transformation before leading others through it',
      'Master the Trust Journey Model (Skeptical Pragmatist -> Confident Operator -> Trusted Champion)',
      'Conduct Shadow AI Audits to discover unmet innovation demand',
      'Apply the GLUE Framework for sustained organizational transformation',
      'Design 90-Day Sprints with specific milestones and accountability',
      'Build psychological safety for AI experimentation',
      'Reduce AI adoption resistance by 60%+ using evidence-based interventions',
      'Become a "Shaper" - the leadership capability that 47% identify as #1 for AI ROI'
    ],
    ARRAY[
      'Executive or senior leadership role',
      'Authority to influence organizational AI strategy',
      'Willingness to engage in hands-on AI exercises',
      'Pre-work completion (2-3 hours before Day 1)'
    ],
    'en',
    true,
    true,
    true
  ) RETURNING id INTO course_id;

  RAISE NOTICE 'Created course with ID: %', course_id;

  -- =====================================================
  -- STEP 5: CREATE MODULES
  -- =====================================================

  -- Pre-Arrival Module
  INSERT INTO course_modules (course_id, title, description, order_index)
  VALUES (
    course_id,
    'Pre-Arrival: The Executive Reality Check',
    '30-45 minute pre-work to establish baseline understanding and prepare AI toolkit',
    0
  ) RETURNING id INTO module_id;

  INSERT INTO course_lessons (module_id, title, description, order_index, lesson_type, duration) VALUES
  (module_id, 'Your Organization''s AI Reality Assessment', 'Where are you on the AI adoption curve?', 1, 'assignment', 10),
  (module_id, 'Your Personal AI Reality Check', 'Honest assessment of your own AI usage', 2, 'assignment', 10),
  (module_id, 'Trust Position Self-Assessment', 'Skeptical Pragmatist, Confident Operator, or Trusted Champion?', 3, 'quiz', 5),
  (module_id, 'Emotional Landscape Mapping', 'What emotions does AI trigger for you?', 4, 'assignment', 5),
  (module_id, 'Pre-Work: Set Up Your AI Toolkit', 'Claude, Perplexity, NotebookLM, Gamma', 5, 'article', 15);

  -- Day 1, Module 1
  INSERT INTO course_modules (course_id, title, description, order_index)
  VALUES (
    course_id,
    'Day 1, Module 1: The Reality You''re Not Seeing',
    '9:00 AM - 10:45 AM | The Three Reality Gaps: Strategy Delusion, Shadow AI Economy, Trust Crisis',
    1
  ) RETURNING id INTO module_id;

  INSERT INTO course_lessons (module_id, title, description, order_index, lesson_type, duration) VALUES
  (module_id, 'The Three Reality Gaps', 'Strategy Delusion, Shadow AI Economy, Trust Crisis', 1, 'video', 30),
  (module_id, 'The 45-Point Executive-Employee Perception Gap', '91% of executives believe their AI strategy is clear vs 46% of employees', 2, 'video', 20),
  (module_id, 'Trust Collapse Deep Dive', '-31% in 3 months (Generative AI), -89% (Agentic AI) - Deloitte TrustID', 3, 'video', 25),
  (module_id, 'The Trust Diagnosis', 'Where are you on the Trust Journey?', 4, 'live_session', 25);

  -- Day 1, Module 2
  INSERT INTO course_modules (course_id, title, description, order_index)
  VALUES (
    course_id,
    'Day 1, Module 2: Into the Arena',
    '11:00 AM - 12:30 PM | Extended hands-on AI immersion. Not a demo - a transformation.',
    2
  ) RETURNING id INTO module_id;

  INSERT INTO course_lessons (module_id, title, description, order_index, lesson_type, duration) VALUES
  (module_id, 'The Jagged Frontier - Live Demo', 'AI doing something shockingly well vs embarrassingly failing', 1, 'live_session', 20),
  (module_id, 'Executive AI Lab I: The Problem You''ve Been Avoiding', 'Station rotation: Claude (Deep Analysis), Perplexity (Research Sprint), NotebookLM (Synthesis)', 2, 'assignment', 45),
  (module_id, 'The 5 Power Prompts', 'Pre-Mortem, Adversarial, Perspective Multiplication, Translation Stack, Chain-of-Thought', 3, 'article', 15),
  (module_id, 'The Permission Insight', 'What your people need: permission, time, safety', 4, 'video', 10);

  -- Day 1, Module 3
  INSERT INTO course_modules (course_id, title, description, order_index)
  VALUES (
    course_id,
    'Day 1, Module 3: The Architecture of Trust',
    '1:30 PM - 3:15 PM | Move from personal experience to psychological understanding.',
    3
  ) RETURNING id INTO module_id;

  INSERT INTO course_lessons (module_id, title, description, order_index, lesson_type, duration) VALUES
  (module_id, 'The Emotional Dimension', '96% execs positive vs 63% ICs vs 33% negative - the gap leaders miss', 1, 'video', 20),
  (module_id, 'Exercise: Emotional Mapping', 'Map your organization by emotional state, not adoption stage', 2, 'assignment', 20),
  (module_id, 'The Trust Journey Model', 'Skeptical Pragmatists -> Confident Operators -> Trusted Champions', 3, 'video', 30),
  (module_id, 'The 60/30/10 Reality', 'Typical distribution vs assumed 30/50/20 - designing for an organization that doesn''t exist', 4, 'video', 25);

  -- Day 1, Module 4
  INSERT INTO course_modules (course_id, title, description, order_index)
  VALUES (
    course_id,
    'Day 1, Module 4: Leaders Go First',
    '3:30 PM - 5:00 PM | Translate personal transformation into leadership commitment.',
    4
  ) RETURNING id INTO module_id;

  INSERT INTO course_lessons (module_id, title, description, order_index, lesson_type, duration) VALUES
  (module_id, 'The SHAPE Self-Assessment', 'Strategic Agility, Human Centricity, Applied Curiosity, Performance Drive, Ethical Stewardship', 1, 'quiz', 20),
  (module_id, 'Executive AI Lab II: Wow Moment Exercises', '10-Min Competitive Intel, Stakeholder Simulation, Voice-to-Strategy, Instant Presentation, Document Intelligence', 2, 'assignment', 30),
  (module_id, 'Personal Commitment Design', 'One belief, One behavior, One permission, One conversation', 3, 'assignment', 20),
  (module_id, 'Day 1 Closing: The Shaper Mandate', '"The gap between your AI roadmap and your people''s reality"', 4, 'video', 10);

  -- Day 2, Module 5
  INSERT INTO course_modules (course_id, title, description, order_index)
  VALUES (
    course_id,
    'Day 2, Module 5: Where Your People Actually Are',
    '9:00 AM - 10:45 AM | Move from personal transformation to organizational diagnosis.',
    5
  ) RETURNING id INTO module_id;

  INSERT INTO course_lessons (module_id, title, description, order_index, lesson_type, duration) VALUES
  (module_id, 'The Shadow AI Audit - Deep Dive', '78% bring own tools, 80%+ use unapproved AI, 38% share confidential data', 1, 'video', 35),
  (module_id, 'The Reframe: Shadow AI as Signal', 'Shadow AI isn''t a compliance problem - it''s unmet demand', 2, 'video', 20),
  (module_id, 'Trust Pulse Diagnostic', 'Fast survey design to understand your organization', 3, 'assignment', 25),
  (module_id, 'The Amnesty Approach Script', 'How to have honest conversations about AI usage', 4, 'article', 15);

  -- Day 2, Module 6
  INSERT INTO course_modules (course_id, title, description, order_index)
  VALUES (
    course_id,
    'Day 2, Module 6: The Journey Architecture',
    '11:00 AM - 12:30 PM | Design the phased approach for your organization.',
    6
  ) RETURNING id INTO module_id;

  INSERT INTO course_lessons (module_id, title, description, order_index, lesson_type, duration) VALUES
  (module_id, 'Phase 1: Build Trust (Months 1-2)', 'Target: Skeptical Pragmatists - "AI helps you, it doesn''t replace you"', 1, 'video', 20),
  (module_id, 'Phase 2: Prove Value (Months 3-4)', 'Target: Confident Operators - "AI saves time, improves quality"', 2, 'video', 20),
  (module_id, 'Phase 3: Normalize (Months 5-6)', 'Target: Trusted Champions - "This is what elite performance looks like"', 3, 'video', 20),
  (module_id, 'Case Studies: Colgate-Palmolive & IKEA', '3,000-5,000 custom AI assistants | 8,500 workers reskilled', 4, 'video', 20);

  -- Day 2, Module 7
  INSERT INTO course_modules (course_id, title, description, order_index)
  VALUES (
    course_id,
    'Day 2, Module 7: From Training to Transformation',
    '1:30 PM - 3:15 PM | Why traditional approaches fail and what actually works.',
    7
  ) RETURNING id INTO module_id;

  INSERT INTO course_lessons (module_id, title, description, order_index, lesson_type, duration) VALUES
  (module_id, 'The Engagement Crisis', '31% US engagement (10-year low), $8.9T annual cost globally', 1, 'video', 20),
  (module_id, 'What Builds Trust - With Evidence', '144% higher trust (hands-on), 72% more trust (help build), 60% boost (weekly check-ins)', 2, 'video', 25),
  (module_id, 'The GLUE Framework', 'Grow (Weeks 1-4), Leverage (5-8), Unite (9-12), Evolve (13+)', 3, 'video', 30),
  (module_id, 'Weekly Check-In Structure', 'Permission & Safety -> Wins & Blockers -> Teaching & Scaling -> Continuous Adaptation', 4, 'article', 20);

  -- Day 2, Module 8
  INSERT INTO course_modules (course_id, title, description, order_index)
  VALUES (
    course_id,
    'Day 2, Module 8: The 90-Day Sprint',
    '3:30 PM - 5:00 PM | Translate everything into a concrete 90-day action plan.',
    8
  ) RETURNING id INTO module_id;

  INSERT INTO course_lessons (module_id, title, description, order_index, lesson_type, duration) VALUES
  (module_id, 'The 90-Day Architecture', 'Days 1-7 Leader Modeling, 8-30 GROW, 31-60 LEVERAGE, 61-90 UNITE', 1, 'video', 20),
  (module_id, '90-Day Sprint Planning Workshop', 'Build your concrete action plan with milestones', 2, 'assignment', 30),
  (module_id, 'The Questions That Move Leadership', '"What does it cost us if we''re 18 months behind?"', 3, 'video', 15),
  (module_id, 'Closing: The Only Failure is Inaction', '"What will you do Monday morning that you wouldn''t have done before?"', 4, 'video', 15);

  -- Set course metadata
  UPDATE courses SET metadata = jsonb_build_object(
    'format', '2-day intensive',
    'delivery', ARRAY['in_person', 'virtual'],
    'includes', ARRAY[
      'Pre-arrival assessments',
      'AI toolkit setup guides',
      'Shadow AI Audit templates',
      'Trust Journey diagnostic',
      'SHAPE self-assessment',
      'GLUE Framework workbook',
      '90-Day Sprint planner',
      'Governance conversation starters',
      'Post-course resources'
    ],
    'research_sources', ARRAY[
      'MIT Research 2025',
      'Harvard Business Review 2025',
      'Deloitte TrustID 2025',
      'Gallup 2025',
      'Microsoft Research 2024-2025',
      'BCG 2025',
      'World Economic Forum 2025'
    ],
    'featured', true
  ) WHERE id = course_id;

  RAISE NOTICE 'Created all 9 modules and lessons for the course';
END $$;

-- =====================================================
-- SUMMARY
-- =====================================================

DO $$
DECLARE
  alex_user_id UUID;
  course_count INTEGER;
  module_count INTEGER;
  lesson_count INTEGER;
BEGIN
  SELECT id INTO alex_user_id FROM users WHERE email = 'alex@behmn.com';

  SELECT COUNT(*) INTO course_count
  FROM courses
  WHERE instructor_id = alex_user_id;

  SELECT COUNT(*) INTO module_count
  FROM course_modules cm
  JOIN courses c ON cm.course_id = c.id
  WHERE c.instructor_id = alex_user_id;

  SELECT COUNT(*) INTO lesson_count
  FROM course_lessons cl
  JOIN course_modules cm ON cl.module_id = cm.id
  JOIN courses c ON cm.course_id = c.id
  WHERE c.instructor_id = alex_user_id;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Alex Behm Course Import Complete';
  RAISE NOTICE 'User ID: %', alex_user_id;
  RAISE NOTICE 'Courses: % | Modules: % | Lessons: %', course_count, module_count, lesson_count;
  RAISE NOTICE '========================================';
END $$;
