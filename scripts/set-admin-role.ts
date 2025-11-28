/**
 * Script to set admin role for Maddie's account
 * Usage: npx tsx scripts/set-admin-role.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setAdminRole() {
  const emails = ['maddie@lvng.ai', 'maddie@living.ai']

  console.log('Setting admin role for Maddie\'s accounts...\n')

  for (const email of emails) {
    console.log(`Checking ${email}...`)

    // Find user by email
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        console.log(`  ❌ User ${email} not found\n`)
        continue
      }
      console.error(`  ❌ Error fetching user:`, fetchError.message)
      continue
    }

    console.log(`  ✓ User found:`, user.id)
    console.log(`  Current role:`, user.role)

    if (user.role === 'admin') {
      console.log(`  ✓ Already admin\n`)
      continue
    }

    // Update to admin
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', user.id)

    if (updateError) {
      console.error(`  ❌ Error updating role:`, updateError.message)
      continue
    }

    console.log(`  ✓ Updated to admin\n`)
  }

  console.log('Done!')
}

setAdminRole().catch(console.error)
