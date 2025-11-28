/**
 * Script to create demo user accounts
 * Run with: npx tsx scripts/create-demo-users.ts
 */

const SIGNUP_API_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/signup`
  : 'http://localhost:3000/api/auth/signup'

const DEMO_USERS = [
  {
    email: 'info@lvng.ai',
    password: 'Demo123!@#',
    fullName: 'LVNG Instructor Demo',
    role: 'instructor' as const,
  },
  {
    email: 'matty@humanglue.ai',
    password: 'Admin123!@#',
    fullName: 'Matty Admin',
    role: 'client' as const, // Will be upgraded to admin manually in database
  },
]

async function createUser(userData: typeof DEMO_USERS[0]) {
  try {
    console.log(`Creating user: ${userData.email}...`)

    const response = await fetch(SIGNUP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error(`❌ Failed to create ${userData.email}:`, data)
      return false
    }

    console.log(`✅ Created ${userData.email}`)
    console.log(`   Message: ${data.data?.message}`)
    return true
  } catch (error) {
    console.error(`❌ Error creating ${userData.email}:`, error)
    return false
  }
}

async function main() {
  console.log('🚀 Creating demo user accounts...\n')
  console.log(`API URL: ${SIGNUP_API_URL}\n`)

  for (const user of DEMO_USERS) {
    await createUser(user)
    console.log('') // Empty line between users
  }

  console.log('✨ Done!')
  console.log('\n📝 Next steps:')
  console.log('1. Check the email inboxes for confirmation emails')
  console.log('2. For matty@humanglue.ai, manually update the role to "admin" in Supabase:')
  console.log('   UPDATE users SET role = \'admin\' WHERE email = \'matty@humanglue.ai\';')
  console.log('3. Update matty@lvng.ai role from team_lead to member:')
  console.log('   UPDATE users SET role = \'member\' WHERE email = \'matty@lvng.ai\';')
}

main()
