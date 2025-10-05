/**
 * Create Demo User Accounts
 * Sets up demo accounts for client, instructor, and admin roles
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const demoUsers = [
  {
    email: 'demo.client@humanglue.com',
    password: 'DemoClient123!',
    role: 'client' as const,
    metadata: {
      full_name: 'Demo Client User',
      company: 'Demo Corporation',
      isDemo: true
    }
  },
  {
    email: 'demo.instructor@humanglue.com',
    password: 'DemoInstructor123!',
    role: 'instructor' as const,
    metadata: {
      full_name: 'Demo Instructor',
      title: 'Senior Instructor',
      isDemo: true
    }
  },
  {
    email: 'demo.admin@humanglue.com',
    password: 'DemoAdmin123!',
    role: 'admin' as const,
    metadata: {
      full_name: 'Demo Admin',
      isDemo: true
    }
  }
]

async function createDemoUsers() {
  console.log('🚀 Creating demo user accounts...\n')

  for (const user of demoUsers) {
    console.log(`Creating ${user.role} demo account: ${user.email}`)

    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const exists = existingUsers?.users.find(u => u.email === user.email)

      if (exists) {
        console.log(`  ⚠️  User already exists, updating password...`)

        // Update password
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          exists.id,
          { password: user.password }
        )

        if (updateError) {
          console.error(`  ❌ Error updating password:`, updateError.message)
          continue
        }

        console.log(`  ✅ Password updated successfully`)
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: user.metadata
        })

        if (createError) {
          console.error(`  ❌ Error creating user:`, createError.message)
          continue
        }

        console.log(`  ✅ User created successfully`)

        // Update user role in profiles table
        if (newUser?.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: user.role })
            .eq('id', newUser.user.id)

          if (profileError) {
            console.error(`  ⚠️  Error updating role:`, profileError.message)
          } else {
            console.log(`  ✅ Role set to ${user.role}`)
          }
        }
      }

      console.log()
    } catch (error: any) {
      console.error(`  ❌ Unexpected error:`, error.message)
      console.log()
    }
  }

  console.log('✨ Demo user creation complete!\n')
  console.log('Demo Credentials:')
  console.log('─────────────────────────────────────────────')
  demoUsers.forEach(user => {
    console.log(`${user.role.toUpperCase()}:`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Password: ${user.password}`)
    console.log()
  })
}

createDemoUsers()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
