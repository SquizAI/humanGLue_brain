-- Seed Data for HumanGlue Platform
-- This file contains sample data for testing and development

-- ============================================================
-- USERS & ROLES
-- ============================================================

-- Note: In production, users are created via Supabase Auth
-- This is example data structure for testing

-- Insert sample organizations
INSERT INTO public.organizations (id, name, slug, industry, company_size, subscription_tier, subscription_status) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Acme Corporation', 'acme-corp', 'Technology', '201-500', 'growth', 'active'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'TechStart Inc', 'techstart', 'Software', '51-200', 'starter', 'active'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Global Enterprises', 'global-ent', 'Consulting', '1000+', 'enterprise', 'active');

-- ============================================================
-- WORKSHOPS
-- ============================================================

INSERT INTO public.workshops (
  id,
  title,
  description,
  slug,
  instructor_id,
  pillar,
  level,
  format,
  schedule_date,
  schedule_time,
  duration_minutes,
  capacity_total,
  capacity_remaining,
  price_amount,
  price_early_bird,
  outcomes,
  tags,
  status,
  is_featured
) VALUES
  (
    'd4e5f6a7-b8c9-0123-def1-234567890123',
    'From Fear to Confidence: AI Transformation Mindset',
    'Transform your team''s relationship with AI from resistance to readiness. Learn proven behavioral reframing techniques that unlock confidence and accelerate adoption.',
    'fear-to-confidence-ai-mindset',
    'instructor-uuid-1', -- Replace with actual instructor user ID
    'adaptability',
    'beginner',
    'live',
    '2025-10-15',
    '14:00:00',
    120,
    50,
    23,
    299.00,
    199.00,
    ARRAY[
      'Understand the psychology of AI resistance',
      'Apply behavioral reframing techniques',
      'Build confidence through hands-on practice',
      'Create a personal AI adoption roadmap'
    ],
    ARRAY['AI adoption', 'change management', 'mindset', 'transformation'],
    'published',
    true
  ),
  (
    'e5f6a7b8-c9d0-1234-ef12-345678901234',
    'Embedding AI Behaviors That Stick',
    'Go beyond awareness to action. Learn how to design nudges, triggers, and reinforcement systems that make AI adoption automatic and sustainable.',
    'embedding-ai-behaviors',
    'instructor-uuid-2',
    'adaptability',
    'intermediate',
    'hybrid',
    '2025-10-22',
    '10:00:00',
    180,
    30,
    15,
    399.00,
    299.00,
    ARRAY[
      'Design effective behavioral nudges',
      'Create habit loops for AI tool usage',
      'Build reinforcement systems',
      'Measure behavior change success'
    ],
    ARRAY['behavior change', 'AI adoption', 'habits', 'culture'],
    'published',
    true
  ),
  (
    'f6a7b8c9-d0e1-2345-f123-456789012345',
    'Leading Through AI Transformation',
    'Equip your leadership team to champion AI change. Learn how to communicate vision, model vulnerability, and create psychological safety for experimentation.',
    'leading-ai-transformation',
    'instructor-uuid-1',
    'coaching',
    'intermediate',
    'live',
    '2025-11-05',
    '13:00:00',
    120,
    40,
    40,
    349.00,
    NULL,
    ARRAY[
      'Articulate compelling AI vision',
      'Model learning in public',
      'Create psychological safety',
      'Champion organizational experimentation'
    ],
    ARRAY['leadership', 'AI strategy', 'change leadership'],
    'published',
    false
  ),
  (
    'a7b8c9d0-e1f2-3456-1234-567890123456',
    'Building Your AI Coaching Practice',
    'For coaches and consultants: Learn HumanGlue''s proven framework for guiding organizations through AI transformation. From assessment to embedding.',
    'building-ai-coaching-practice',
    'instructor-uuid-2',
    'marketplace',
    'advanced',
    'hybrid',
    '2025-11-12',
    '09:00:00',
    240,
    25,
    18,
    599.00,
    499.00,
    ARRAY[
      'Apply the 5-dimension adaptability framework',
      'Conduct transformational assessments',
      'Design custom reframing interventions',
      'Scale your coaching practice'
    ],
    ARRAY['coaching', 'consulting', 'framework', 'professional development'],
    'published',
    false
  );

-- ============================================================
-- ASSESSMENTS (Sample structure)
-- ============================================================

-- Note: In production, assessments are created by users
-- This shows the data structure for testing

INSERT INTO public.assessments (
  id,
  user_id,
  organization_id,
  assessment_type,
  status,
  individual_score,
  leadership_score,
  cultural_score,
  embedding_score,
  velocity_score,
  started_at,
  completed_at
) VALUES
  (
    'b8c9d0e1-f2a3-4567-2345-678901234567',
    'user-uuid-1', -- Replace with actual user ID
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'full',
    'completed',
    75,
    68,
    70,
    73,
    74,
    NOW() - INTERVAL '2 weeks',
    NOW() - INTERVAL '2 weeks' + INTERVAL '45 minutes'
  );

-- ============================================================
-- TALENT PROFILES
-- ============================================================

INSERT INTO public.talent_profiles (
  id,
  user_id,
  tagline,
  bio,
  location,
  expertise,
  transformation_success_rate,
  behavior_change_score,
  client_retention_rate,
  cultures_transformed,
  years_experience,
  clients_transformed,
  employees_reframed,
  industries,
  transformation_stages,
  coaching_style,
  rating,
  review_count,
  availability,
  hourly_rate,
  min_engagement_hours,
  is_public,
  accepting_clients
) VALUES
  (
    'c9d0e1f2-a3b4-5678-3456-789012345678',
    'expert-uuid-1', -- Replace with actual expert user ID
    'Transforming fear into confidence through behavioral science',
    'With 12+ years guiding Fortune 500 companies through digital transformations, I specialize in the human side of AI adoption. My approach combines behavioral psychology, change management, and hands-on coaching to turn resistance into readiness.',
    'San Francisco, CA',
    ARRAY['AI Adoption', 'Change Management', 'Behavioral Psychology', 'Executive Coaching', 'Culture Transformation'],
    92,
    88,
    95,
    47,
    12,
    89,
    12500,
    ARRAY['Technology', 'Financial Services', 'Healthcare', 'Manufacturing'],
    ARRAY['assess', 'reframe', 'embed', 'scale'],
    'hybrid',
    4.8,
    67,
    'available',
    350.00,
    20,
    true,
    true
  ),
  (
    'd0e1f2a3-b4c5-6789-4567-890123456789',
    'expert-uuid-2',
    'Embedding lasting behavior change in complex organizations',
    'I help organizations move from AI pilots to organization-wide transformation. My expertise lies in designing systems that make new behaviors stick—from nudges and triggers to measurement frameworks that prove ROI.',
    'New York, NY',
    ARRAY['Behavior Embedding', 'Organizational Development', 'AI Strategy', 'Systems Thinking', 'Learning Design'],
    88,
    94,
    91,
    35,
    10,
    62,
    8700,
    ARRAY['Technology', 'Consulting', 'Education', 'Retail'],
    ARRAY['embed', 'scale'],
    'facilitative',
    4.9,
    45,
    'limited',
    400.00,
    30,
    true,
    true
  );

-- ============================================================
-- TALENT TESTIMONIALS
-- ============================================================

INSERT INTO public.talent_testimonials (
  talent_profile_id,
  client_name,
  client_company,
  client_title,
  quote,
  metric,
  verified,
  is_featured
) VALUES
  (
    'c9d0e1f2-a3b4-5678-3456-789012345678',
    'Sarah Chen',
    'TechCorp Global',
    'VP of People Operations',
    'Dr. Thompson completely transformed our approach to AI adoption. Within 3 months, we went from 15% to 78% daily AI tool usage across our 500-person engineering team. The behavioral reframing techniques were game-changing.',
    '78% adoption in 3 months',
    true,
    true
  ),
  (
    'c9d0e1f2-a3b4-5678-3456-789012345678',
    'Marcus Rodriguez',
    'FinServe Solutions',
    'Chief Transformation Officer',
    'What sets Alex apart is the focus on sustainable behavior change, not just awareness training. The coaching nudges and reinforcement systems created lasting habits that survived beyond the engagement.',
    '5.2x productivity increase',
    true,
    false
  ),
  (
    'd0e1f2a3-b4c5-6789-4567-890123456789',
    'Jennifer Liu',
    'RetailMax',
    'Head of Learning & Development',
    'Maya''s embedding framework is brilliant. She helped us design a system of triggers and rewards that made AI usage automatic for our 1,200 store managers. Six months later, the behaviors are still strong.',
    '92% sustained adoption',
    true,
    true
  );

-- ============================================================
-- SAMPLE REVIEWS
-- ============================================================

INSERT INTO public.reviews (
  user_id,
  review_type,
  workshop_id,
  rating,
  title,
  review_text,
  content_quality_rating,
  delivery_rating,
  value_rating,
  impact_rating,
  verified_purchase,
  status
) VALUES
  (
    'user-uuid-2',
    'workshop',
    'd4e5f6a7-b8c9-0123-def1-234567890123',
    5,
    'Exactly What We Needed',
    'This workshop completely changed how our leadership team thinks about AI adoption. The fear-to-confidence framework gave us practical tools we could use immediately. Within a week, we saw tangible shifts in team conversations about AI.',
    5,
    5,
    5,
    5,
    true,
    'approved'
  ),
  (
    'user-uuid-3',
    'workshop',
    'e5f6a7b8-c9d0-1234-ef12-345678901234',
    5,
    'Actionable and Practical',
    'The behavior embedding techniques are brilliant. We implemented the nudge system the instructor outlined and saw immediate results. Our AI tool usage went from sporadic to habitual in just two weeks.',
    5,
    4,
    5,
    5,
    true,
    'approved'
  );

-- ============================================================
-- HELPER: Generate random UUIDs for testing
-- ============================================================

-- Function to generate test data (for development environments only)
CREATE OR REPLACE FUNCTION generate_sample_workshop_registrations(
  p_workshop_id UUID,
  p_count INTEGER
)
RETURNS void AS $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..p_count LOOP
    INSERT INTO public.workshop_registrations (
      workshop_id,
      user_id,
      status,
      price_paid,
      registered_at
    ) VALUES (
      p_workshop_id,
      gen_random_uuid(), -- Note: This won't work without actual user IDs
      'registered',
      199.00,
      NOW() - (random() * INTERVAL '30 days')
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- NOTES FOR PRODUCTION
-- ============================================================

-- 1. Replace all placeholder UUIDs with actual user IDs from auth.users
-- 2. Create actual instructor and expert users via Supabase Auth first
-- 3. Grant appropriate roles via user_roles table
-- 4. Update instructor_id, user_id, expert_id references
-- 5. Remove generate_sample_workshop_registrations in production
-- 6. Add actual payment records linked to Stripe/PayPal
-- 7. Generate real certificates after workshop completion
-- 8. Implement proper review moderation workflow

COMMENT ON FUNCTION generate_sample_workshop_registrations IS 'Development only: Generate sample registrations for testing';
