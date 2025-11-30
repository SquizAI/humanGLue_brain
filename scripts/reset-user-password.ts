/**
 * Reset password for a user
 * Usage: npx tsx scripts/reset-user-password.ts <email> <new-password>
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function resetPassword(email: string, newPassword: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log(`\n🔄 Resetting password for: ${email}`)
  console.log(`🔑 New password: ${newPassword}`)

  try {
    // First, get the user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      throw listError
    }

    const user = users.find(u => u.email === email)

    if (!user) {
      console.error(`❌ User not found: ${email}`)
      process.exit(1)
    }

    console.log(`✅ Found user: ${user.id}`)

    // Update the user's password
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (error) {
      throw error
    }

    console.log(`✅ Password reset successfully!`)
    console.log(`\n📧 Email: ${email}`)
    console.log(`🔑 Password: ${newPassword}`)
    console.log(`\nYou can now login with these credentials.\n`)

  } catch (error) {
    console.error('❌ Error resetting password:', error)
    process.exit(1)
  }
}

// Get email and password from command line arguments
const email = process.argv[2]
const newPassword = process.argv[3]

if (!email || !newPassword) {
  console.error('Usage: npx tsx scripts/reset-user-password.ts <email> <new-password>')
  console.error('Example: npx tsx scripts/reset-user-password.ts matty@humanglue.ai NewPassword123!')
  process.exit(1)
}

resetPassword(email, newPassword)
