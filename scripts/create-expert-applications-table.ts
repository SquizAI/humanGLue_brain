import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Use the admin client which can bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

async function createTable() {
  console.log('Checking if we can create the table via RPC...')
  
  // Try calling the supabase postgres functions
  // This works if a function exists to run DDL
  const { data, error } = await supabase.rpc('create_expert_applications_table')
  
  if (error) {
    console.log('RPC not available:', error.message)
    console.log('')
    console.log('The table must be created manually via the Supabase Dashboard SQL Editor.')
    console.log('')
    console.log('Opening browser to Supabase SQL Editor...')
  } else {
    console.log('Success:', data)
  }
}

createTable()
