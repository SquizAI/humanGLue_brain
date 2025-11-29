#!/usr/bin/env node

/**
 * Create Demo Super Admin User Account
 * This script creates a super_admin_full demo user in Supabase
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createDemoAdmin() {
  console.log('🚀 Creating demo super admin user...\n')

  const demoEmail = 'admin@humanglue.com'
  const demoPassword = 'Admin123!'
  const demoUserId = '00000000-0000-0000-0000-000000000001' // Fixed UUID for demo admin

  try {
    // Step 1: Create auth user
    console.log('📧 Creating Supabase Auth user...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: 'Super Admin Demo',
        role: 'super_admin_full'
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('ℹ️  Auth user already exists, using existing user')

        // Get existing user
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const existingUser = existingUsers?.users.find(u => u.email === demoEmail)

        if (!existingUser) {
          throw new Error('Could not find existing auth user')
        }

        console.log('✅ Found existing auth user:', existingUser.id)

        // Step 2: Check if user record exists
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('users')
          .select('*')
          .eq('id', existingUser.id)
          .single()

        if (profileCheckError && profileCheckError.code === 'PGRST116') {
          // User doesn't exist in users table, create it
          console.log('\n👤 Creating user record in users table...')

          const { data: userData, error: userError } = await supabase
            .from('users')
            .insert([{
              id: existingUser.id,
              email: demoEmail,
              full_name: 'Super Admin Demo',
              role: 'admin',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select()

          if (userError) {
            throw userError
          }

          console.log('✅ User record created:', userData[0].id)
          console.log('\n🎉 Demo super admin account created successfully!')
          console.log('\n📋 Login Credentials:')
          console.log('   Email:', demoEmail)
          console.log('   Password:', demoPassword)
          console.log('   Role: admin')

        } else if (existingProfile) {
          // User already exists in both places
          console.log('\n✅ User record already exists in users table')
          console.log('   ID:', existingProfile.id)
          console.log('   Email:', existingProfile.email)
          console.log('   Role:', existingProfile.role)

          // Update role to admin if needed
          if (existingProfile.role !== 'admin') {
            console.log('\n🔄 Updating role to admin...')
            const { error: updateError } = await supabase
              .from('users')
              .update({ role: 'admin', updated_at: new Date().toISOString() })
              .eq('id', existingProfile.id)

            if (updateError) {
              throw updateError
            }
            console.log('✅ Role updated to admin')
          }

          console.log('\n🎉 Demo account is ready!')
          console.log('\n📋 Login Credentials:')
          console.log('   Email:', demoEmail)
          console.log('   Password:', demoPassword)
          console.log('   Role: admin')
        }

        return
      }
      throw authError
    }

    console.log('✅ Auth user created:', authData.user.id)

    // Step 2: Create user record in users table
    console.log('\n👤 Creating user record in users table...')

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: demoEmail,
        full_name: 'Super Admin Demo',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()

    if (userError) {
      throw userError
    }

    console.log('✅ User record created:', userData[0].id)

    console.log('\n🎉 Demo super admin account created successfully!')
    console.log('\n📋 Login Credentials:')
    console.log('   Email:', demoEmail)
    console.log('   Password:', demoPassword)
    console.log('   Role: admin')
    console.log('\n💡 You can now login at: http://localhost:5040/login')

  } catch (error) {
    console.error('\n❌ Error creating demo admin:', error)
    process.exit(1)
  }
}

// Run the script
createDemoAdmin()
