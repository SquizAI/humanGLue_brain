const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTable() {
  try {
    // Try to query the expert_applications table
    const { data, error, count } = await supabase
      .from('expert_applications')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      if (error.message.includes('does not exist') || error.code === '42P01') {
        console.log('Table does NOT exist - migration needs to be applied')
        process.exit(1)
      }
      console.log('Error checking table:', error.message)
      process.exit(1)
    }
    
    console.log('Table EXISTS - count:', count)
    process.exit(0)
  } catch (err) {
    console.log('Error:', err.message)
    process.exit(1)
  }
}

checkTable()
