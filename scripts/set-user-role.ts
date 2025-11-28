/**
 * Script to set a specific user's role
 * Usage: tsx scripts/set-user-role.ts <email> <role>
 * Example: tsx scripts/set-user-role.ts admin@example.com admin
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setUserRole() {
  const email = process.argv[2]
  const role = process.argv[3] as 'admin' | 'org_admin' | 'team_lead' | 'member'

  if (!email || !role) {
    console.error('\nUsage: tsx scripts/set-user-role.ts <email> <role>')
    console.error('\nValid roles: admin, org_admin, team_lead, member')
    console.error('\nExample: tsx scripts/set-user-role.ts admin@example.com admin')
    process.exit(1)
  }

  if (!['admin', 'org_admin', 'team_lead', 'member'].includes(role)) {
    console.error(`\nError: Invalid role "${role}"`)
    console.error('Valid roles: admin, org_admin, team_lead, member')
    process.exit(1)
  }

  // Find user by email in auth.users
  const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error('Error fetching auth users:', authError)
    process.exit(1)
  }

  const authUser = authUsers.find(u => u.email === email)

  if (!authUser) {
    console.error(`\nError: No auth user found with email "${email}"`)
    console.error('\nAvailable users:')
    authUsers.forEach(u => console.error(`  - ${u.email}`))
    process.exit(1)
  }

  console.log(`\nFound auth user: ${authUser.email} (ID: ${authUser.id})`)

  // Check if user record exists
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('id', authUser.id)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
    console.error('Error fetching user record:', fetchError)
    process.exit(1)
  }

  if (!existingUser) {
    // Create user record
    console.log(`\nCreating user record with role "${role}"...`)

    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email!,
        full_name: authUser.user_metadata?.full_name || authUser.email!.split('@')[0],
        role: role,
      })

    if (insertError) {
      console.error(`Error creating user record:`, insertError.message)
      process.exit(1)
    }

    console.log(`✓ Created user record for ${authUser.email} with role "${role}"`)
  } else {
    // Update existing user record
    console.log(`\nCurrent role: ${existingUser.role}`)
    console.log(`Updating role to: ${role}...`)

    const { error: updateError } = await supabase
      .from('users')
      .update({ role })
      .eq('id', authUser.id)

    if (updateError) {
      console.error(`Error updating user role:`, updateError.message)
      process.exit(1)
    }

    console.log(`✓ Updated ${authUser.email} role from "${existingUser.role}" to "${role}"`)
  }

  // Verify the change
  const { data: updatedUser } = await supabase
    .from('users')
    .select('email, role')
    .eq('id', authUser.id)
    .single()

  if (updatedUser) {
    console.log(`\n✓ Verified: ${updatedUser.email} is now "${updatedUser.role}"`)
  }
}

setUserRole().then(() => process.exit(0)).catch(err => {
  console.error(err)
  process.exit(1)
})
