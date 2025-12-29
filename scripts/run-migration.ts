import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTable() {
  // Try to query the table
  const { data, error } = await supabase
    .from('expert_applications')
    .select('id')
    .limit(1)
  
  if (error) {
    console.log('Error:', error.code, '-', error.message)
    if (error.code === 'PGRST205') {
      console.log('\n⚠️  Table "expert_applications" does not exist!')
      console.log('\nPlease run the following migration in the Supabase SQL Editor:')
      console.log('supabase/migrations/016_expert_applications.sql')
      console.log('\nOr go to: https://supabase.com/dashboard/project/egqqdscvxvtwcdwknbnt/sql')
    }
  } else {
    console.log('✅ Table exists! Records found:', data?.length || 0)
  }
}

checkTable()
