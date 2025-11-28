/**
 * Script to create user records for existing auth users
 * This fixes the issue where users authenticated but have no profile in users table
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminUser() {
  // Get all auth users (from auth.users)
  const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error('Error fetching auth users:', authError)
    return
  }

  console.log(`\n=== Found ${authUsers.length} Auth Users ===`)

  if (authUsers.length === 0) {
    console.log('No auth users found. Please sign up first at https://hmnglue.com/signup')
    return
  }

  authUsers.forEach((user, idx) => {
    console.log(`\n${idx + 1}. Email: ${user.email}`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Created: ${user.created_at}`)
  })

  // For each auth user, create a corresponding user record if it doesn't exist
  console.log('\n=== Creating Missing User Records ===')

  for (const authUser of authUsers) {
    // Check if user record exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', authUser.id)
      .single()

    if (existingUser) {
      console.log(`\n✓ User record exists for ${authUser.email}`)
      console.log(`  Role: ${existingUser.role}`)
      continue
    }

    // Create user record with admin role (you can change this per user)
    console.log(`\n→ Creating user record for ${authUser.email}...`)

    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email!,
        full_name: authUser.user_metadata?.full_name || authUser.email!.split('@')[0],
        role: 'admin', // Set as admin - change to 'member' for regular users
      })

    if (insertError) {
      console.error(`  ✗ Error creating user record:`, insertError.message)
    } else {
      console.log(`  ✓ Created admin user record for ${authUser.email}`)
    }
  }

  // Show final state
  console.log('\n=== Final User Records ===')
  const { data: allUsers } = await supabase
    .from('users')
    .select('email, role')
    .order('created_at', { ascending: false })

  allUsers?.forEach(user => {
    console.log(`${user.email}: ${user.role}`)
  })
}

createAdminUser().then(() => process.exit(0)).catch(err => {
  console.error(err)
  process.exit(1)
})
