import { createClient } from '@supabase/supabase-js'

// Use service role key for admin access
const supabaseUrl = 'https://egqqdscvxvtwcdwknbnt.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVncXFkc2N2eHZ0d2Nkd2tuYm50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTYwMDE2OSwiZXhwIjoyMDc1MTc2MTY5fQ.WMOTMSxuUu6xUnWPEUWH_8P5WSCrdA6ZsDUT6aGH9y4'

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('🚀 Starting Alex Behm course migration...\n')

  try {
    // Step 1: Check if user already exists in public.users
    console.log('Step 1: Checking if Alex Behm user exists...')
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('email', 'alex@behmn.com')
      .single()

    let alexUserId

    if (existingUser) {
      console.log(`   ✅ User already exists: ${existingUser.full_name} (${existingUser.id})`)
      alexUserId = existingUser.id
    } else {
      // Check if auth user exists (we created it in previous run)
      console.log('   Checking for existing auth user...')
      const { data: authUsers } = await supabase.auth.admin.listUsers()
      const existingAuthUser = authUsers?.users?.find(u => u.email === 'alex@behmn.com')

      if (existingAuthUser) {
        alexUserId = existingAuthUser.id
        console.log(`   Found existing auth user: ${alexUserId}`)
      } else {
        console.log('   Creating new auth user via Supabase Auth Admin API...')
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: 'alex@behmn.com',
          password: 'TempPassword123!',
          email_confirm: true,
          user_metadata: { full_name: 'Alex Behm' }
        })

        if (authError) {
          throw new Error(`Could not create auth user: ${authError.message}`)
        }
        alexUserId = authData.user.id
        console.log(`   ✅ Created auth user: ${alexUserId}`)
      }

      // Create public.users profile with ACTUAL schema
      console.log('   Creating public.users profile...')
      const { error: profileCreateError } = await supabase
        .from('users')
        .upsert({
          id: alexUserId,
          email: 'alex@behmn.com',
          full_name: 'Alex Behm',
          role: 'admin',  // Use valid enum value; actual instructor role is in user_roles table
          is_active: true,
          timezone: 'UTC',
          language: 'en'
        }, { onConflict: 'id' })

      if (profileCreateError) {
        console.log(`   ⚠️ Profile creation: ${profileCreateError.message}`)
      } else {
        console.log(`   ✅ Created/updated public.users profile`)
      }
    }

    // Step 2: Assign roles
    console.log('\nStep 2: Assigning admin and instructor roles...')
    const { data: existingRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', alexUserId)

    const currentRoles = existingRoles?.map(r => r.role) || []
    console.log(`   Current roles: ${currentRoles.length > 0 ? currentRoles.join(', ') : 'none'}`)

    if (!currentRoles.includes('admin')) {
      const { error: adminRoleError } = await supabase
        .from('user_roles')
        .insert({ user_id: alexUserId, role: 'admin', granted_at: new Date().toISOString() })
      if (!adminRoleError) console.log('   ✅ Added admin role')
      else console.log(`   ⚠️ Admin role: ${adminRoleError.message}`)
    } else {
      console.log('   ✅ Admin role already exists')
    }

    if (!currentRoles.includes('instructor')) {
      const { error: instructorRoleError } = await supabase
        .from('user_roles')
        .insert({ user_id: alexUserId, role: 'instructor', granted_at: new Date().toISOString() })
      if (!instructorRoleError) console.log('   ✅ Added instructor role')
      else console.log(`   ⚠️ Instructor role: ${instructorRoleError.message}`)
    } else {
      console.log('   ✅ Instructor role already exists')
    }

    // Step 3: Create the course (using ACTUAL schema)
    console.log('\nStep 3: Creating course...')
    const { data: existingCourse } = await supabase
      .from('courses')
      .select('id, title')
      .ilike('title', '%Leading%Upskilling%')
      .single()

    let courseId

    if (existingCourse) {
      console.log(`   ✅ Course already exists: ${existingCourse.title} (${existingCourse.id})`)
      courseId = existingCourse.id
    } else {
      const { data: newCourse, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: 'Leading & Upskilling with AI',
          slug: 'leading-upskilling-ai-2-day',
          description: `A 2-Day Executive Transformation Course. You cannot lead a transformation you haven't experienced. Day 1 transforms you; Day 2 teaches you to transform others.

This isn't about AI adoption. It's about human becoming. Every module asks: What do we want people in our organizations to become?

Key research backing:
• 95% of AI programs fail to deliver bottom-line returns (MIT Research 2025)
• Trust in generative AI dropped 31% in just 3 months (Deloitte TrustID)
• Employee-centric organizations are 7x more likely to achieve AI maturity (HBR 2025)
• 47% of leaders rank leadership effectiveness as #1 driver of AI ROI

Includes: GLUE Framework, Trust Journey Model, Shadow AI Audit templates, 90-Day Sprint planning toolkit.`,
          pillar: 'coaching',  // Using existing valid pillar value
          level: 'advanced',  // Valid values: beginner, intermediate, advanced
          instructor_name: 'Alex Behm',
          instructor_bio: 'Alex Behm is a pioneer in human-centered AI transformation, specializing in helping executives bridge the gap between AI strategy and workforce reality. Developer of the GLUE Framework and Trust Journey Model.',
          instructor_avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
          duration_hours: 16,
          estimated_effort: '2 days intensive',
          prerequisites: ['Executive or senior leadership role', 'Authority to influence organizational AI strategy', 'Pre-work completion (2-3 hours before Day 1)'],
          learning_outcomes: [
            'Experience personal AI transformation before leading others',
            'Master the Trust Journey Model (Skeptical Pragmatist → Confident Operator → Trusted Champion)',
            'Conduct Shadow AI Audits to discover unmet innovation demand',
            'Apply the GLUE Framework for sustained organizational transformation',
            'Design 90-Day Sprints with specific milestones and accountability',
            'Build psychological safety for AI experimentation',
            'Reduce AI adoption resistance by 60%+ using evidence-based interventions',
            'Become a "Shaper" - the leadership capability that 47% identify as #1 for AI ROI'
          ],
          price_amount: 0,
          currency: 'USD',
          is_published: true,
          published_at: new Date().toISOString(),
          sort_order: 1,
          metadata: {
            format: '2-day intensive',
            modules: 9,
            featured: true,
            delivery: ['in_person', 'virtual'],
            research_sources: ['MIT Research 2025', 'HBR 2025', 'Deloitte TrustID 2025', 'Gallup 2025'],
            includes: [
              'Pre-arrival assessments',
              'AI toolkit setup guides',
              'Shadow AI Audit templates',
              'Trust Journey diagnostic',
              'SHAPE self-assessment',
              'GLUE Framework workbook',
              '90-Day Sprint planner'
            ],
            syllabus: [
              { module: 'Pre-Arrival: The Executive Reality Check', duration: '30-45 min', lessons: ['Organization AI Reality Assessment', 'Personal AI Reality Check', 'Trust Position Self-Assessment', 'AI Toolkit Setup'] },
              { module: 'Day 1, Module 1: The Reality You\'re Not Seeing', duration: '9:00-10:45 AM', lessons: ['The Three Reality Gaps', '45-Point Executive-Employee Perception Gap', 'Trust Collapse Analysis', 'Trust Diagnosis'] },
              { module: 'Day 1, Module 2: Into the Arena', duration: '11:00 AM-12:30 PM', lessons: ['The Jagged Frontier Demo', 'Executive AI Lab I', 'The 5 Power Prompts', 'Permission Insight'] },
              { module: 'Day 1, Module 3: The Architecture of Trust', duration: '1:30-3:15 PM', lessons: ['The Emotional Dimension', 'Emotional Mapping Exercise', 'Trust Journey Model', 'The 60/30/10 Reality'] },
              { module: 'Day 1, Module 4: Leaders Go First', duration: '3:30-5:00 PM', lessons: ['SHAPE Self-Assessment', 'Executive AI Lab II', 'Personal Commitment Design'] },
              { module: 'Day 2, Module 5: Where Your People Actually Are', duration: '9:00-10:45 AM', lessons: ['Shadow AI Audit Deep Dive', 'The Reframe', 'Trust Pulse Diagnostic', 'Amnesty Approach'] },
              { module: 'Day 2, Module 6: The Journey Architecture', duration: '11:00 AM-12:30 PM', lessons: ['Phase 1: Build Trust', 'Phase 2: Prove Value', 'Phase 3: Normalize', 'Case Studies'] },
              { module: 'Day 2, Module 7: From Training to Transformation', duration: '1:30-3:15 PM', lessons: ['Engagement Crisis Analysis', 'What Builds Trust', 'GLUE Framework', 'Weekly Check-In Structure'] },
              { module: 'Day 2, Module 8: The 90-Day Sprint', duration: '3:30-5:00 PM', lessons: ['90-Day Architecture', 'Sprint Planning Workshop', 'Questions That Move Leadership', 'Closing'] }
            ]
          }
        })
        .select()
        .single()

      if (courseError) {
        throw new Error(`Failed to create course: ${courseError.message}`)
      }
      courseId = newCourse.id
      console.log(`   ✅ Created course: ${newCourse.title} (${newCourse.id})`)
    }

    // Final summary
    console.log('\n' + '='.repeat(50))
    console.log('✅ MIGRATION COMPLETE!')
    console.log('='.repeat(50))
    console.log(`User ID: ${alexUserId}`)
    console.log(`Email: alex@behmn.com`)
    console.log(`Course ID: ${courseId}`)
    console.log(`Course: Leading & Upskilling with AI`)
    console.log('='.repeat(50))

    // Verification
    console.log('\n📊 Final Verification:')

    const { data: finalUser } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_active')
      .eq('email', 'alex@behmn.com')
      .single()
    console.log(`   User: ${finalUser?.full_name} (${finalUser?.role}, active: ${finalUser?.is_active})`)

    const { data: finalRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', alexUserId)
    console.log(`   Roles: ${finalRoles?.map(r => r.role).join(', ')}`)

    const { data: finalCourse } = await supabase
      .from('courses')
      .select('id, title, is_published, instructor_name')
      .eq('id', courseId)
      .single()
    console.log(`   Course: ${finalCourse?.title} (published: ${finalCourse?.is_published}, instructor: ${finalCourse?.instructor_name})`)

    console.log('\n🔗 URLs:')
    console.log(`   Dashboard: https://hmnglue.com/dashboard/learning`)
    console.log(`   Course Detail: https://hmnglue.com/dashboard/learning/7`)
    console.log(`   Admin Panel: https://hmnglue.com/admin`)

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

runMigration()
