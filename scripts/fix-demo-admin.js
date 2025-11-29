#!/usr/bin/env node

/**
 * Fix Demo Admin User - Add users table record
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
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixDemoAdmin() {
  console.log('🔧 Fixing demo admin user...\n')

  try {
    // Get the auth user
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const authUser = authUsers?.users.find(u => u.email === 'admin@humanglue.com')

    if (!authUser) {
      console.error('❌ Auth user not found')
      process.exit(1)
    }

    console.log('✅ Found auth user:', authUser.id)

    // Create user record in users table
    console.log('\n👤 Creating user record in users table...')

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{
        id: authUser.id,
        email: 'admin@humanglue.com',
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

    // Also create a profiles record with super_admin_full role
    console.log('\n👤 Creating profile record...')

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authUser.id,
        email: 'admin@humanglue.com',
        full_name: 'Super Admin Demo',
        role: 'super_admin_full',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()

    if (profileError) {
      console.log('⚠️  Profile creation warning:', profileError.message)
    } else {
      console.log('✅ Profile record created:', profileData[0].id)
    }

    // Create user_permissions for super admin
    console.log('\n🔐 Creating super admin permissions...')

    const { data: permData, error: permError } = await supabase
      .from('user_permissions')
      .insert([{
        user_id: authUser.id,
        can_access_financials: true,
        can_manage_courses: true,
        can_manage_users: true,
        can_manage_organizations: true,
        can_manage_experts: true,
        can_manage_instructors: true,
        can_view_analytics: true,
        can_manage_payments: true,
        can_manage_platform_settings: true,
        organization_id: null, // Platform-wide permissions
        granted_at: new Date().toISOString()
      }])
      .select()

    if (permError) {
      console.log('⚠️  Permissions creation warning:', permError.message)
    } else {
      console.log('✅ Permissions created:', permData[0].id)
    }

    console.log('\n🎉 Demo admin account is ready!')
    console.log('\n📋 Login Credentials:')
    console.log('   Email: admin@humanglue.com')
    console.log('   Password: Admin123!')
    console.log('   Role: admin (with super_admin_full permissions)')
    console.log('\n💡 You can now login at: http://localhost:5040/login')

  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

fixDemoAdmin()
