/**
 * Database Health Check Script
 *
 * Quick health check for HumanGlue database:
 * - Connection status
 * - Table counts
 * - RLS verification
 * - Sample query test
 * - Performance check
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../supabase/types/database.types'

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: Record<string, {
    passed: boolean
    message: string
    duration_ms?: number
  }>
  timestamp: string
}

async function checkConnection(): Promise<{ passed: boolean; message: string; duration_ms: number }> {
  const start = Date.now()
  try {
    const { error } = await supabase.from('users').select('id').limit(1)
    const duration = Date.now() - start

    if (error) {
      return {
        passed: false,
        message: `Connection failed: ${error.message}`,
        duration_ms: duration
      }
    }

    return {
      passed: true,
      message: 'Database connection successful',
      duration_ms: duration
    }
  } catch (error) {
    return {
      passed: false,
      message: `Connection error: ${String(error)}`,
      duration_ms: Date.now() - start
    }
  }
}

async function checkTableCounts(): Promise<{ passed: boolean; message: string; duration_ms: number }> {
  const start = Date.now()
  try {
    const tables = [
      'organizations',
      'teams',
      'users',
      'instructor_profiles',
      'courses',
      'enrollments',
      'workshops',
      'notifications',
    ]

    const counts: Record<string, number> = {}

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table as any)
        .select('*', { count: 'exact', head: true })

      if (!error) {
        counts[table] = count || 0
      }
    }

    const totalRecords = Object.values(counts).reduce((sum, count) => sum + count, 0)
    const duration = Date.now() - start

    return {
      passed: totalRecords > 0,
      message: `Found ${totalRecords} total records across ${Object.keys(counts).length} tables`,
      duration_ms: duration
    }
  } catch (error) {
    return {
      passed: false,
      message: `Table count check failed: ${String(error)}`,
      duration_ms: Date.now() - start
    }
  }
}

async function checkRLS(): Promise<{ passed: boolean; message: string; duration_ms: number }> {
  const start = Date.now()
  try {
    // Test RLS by creating a client without service role
    const anonClient = createClient<Database>(
      SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )

    // This should fail or return empty due to RLS
    const { data, error } = await anonClient
      .from('users')
      .select('*')
      .limit(10)

    const duration = Date.now() - start

    // RLS is working if we get restricted access
    const rlsWorking = (data?.length === 0) || !!(error?.message.includes('permission') || error?.message.includes('policy'))

    return {
      passed: rlsWorking,
      message: rlsWorking
        ? 'RLS policies are active and restricting access'
        : 'Warning: RLS may not be properly configured',
      duration_ms: duration
    }
  } catch (error) {
    return {
      passed: false,
      message: `RLS check failed: ${String(error)}`,
      duration_ms: Date.now() - start
    }
  }
}

async function checkSampleQuery(): Promise<{ passed: boolean; message: string; duration_ms: number }> {
  const start = Date.now()
  try {
    // Test a complex query with joins
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        id,
        user_id,
        course_id,
        status,
        users (
          id,
          name,
          email
        ),
        courses (
          id,
          title,
          instructor_id
        )
      `)
      .limit(5)

    const duration = Date.now() - start

    if (error) {
      return {
        passed: false,
        message: `Sample query failed: ${error.message}`,
        duration_ms: duration
      }
    }

    return {
      passed: true,
      message: `Sample query executed successfully (${data?.length || 0} results in ${duration}ms)`,
      duration_ms: duration
    }
  } catch (error) {
    return {
      passed: false,
      message: `Sample query error: ${String(error)}`,
      duration_ms: Date.now() - start
    }
  }
}

async function checkPerformance(): Promise<{ passed: boolean; message: string; duration_ms: number }> {
  const start = Date.now()
  try {
    // Run a few typical queries and measure performance
    const queries = [
      supabase.from('users').select('id, name, email').limit(10),
      supabase.from('courses').select('id, title, instructor_id').eq('status', 'published').limit(10),
      supabase.from('enrollments').select('id, user_id, course_id').order('created_at', { ascending: false }).limit(10),
    ]

    const results = await Promise.all(queries)
    const duration = Date.now() - start

    const allSuccessful = results.every(r => !r.error)
    const avgDuration = duration / queries.length

    return {
      passed: allSuccessful && avgDuration < 200,
      message: `Executed ${queries.length} queries in ${duration}ms (avg: ${Math.round(avgDuration)}ms)`,
      duration_ms: duration
    }
  } catch (error) {
    return {
      passed: false,
      message: `Performance check failed: ${String(error)}`,
      duration_ms: Date.now() - start
    }
  }
}

async function runHealthCheck(): Promise<HealthCheckResult> {
  console.log('\n🏥 HumanGlue Database Health Check\n')
  console.log('='.repeat(50))

  const result: HealthCheckResult = {
    status: 'healthy',
    checks: {},
    timestamp: new Date().toISOString()
  }

  // Run all checks
  console.log('\n🔌 Checking database connection...')
  result.checks.connection = await checkConnection()
  console.log(`${result.checks.connection.passed ? '✅' : '❌'} ${result.checks.connection.message}`)

  console.log('\n📊 Checking table counts...')
  result.checks.tableCounts = await checkTableCounts()
  console.log(`${result.checks.tableCounts.passed ? '✅' : '❌'} ${result.checks.tableCounts.message}`)

  console.log('\n🔒 Checking RLS policies...')
  result.checks.rls = await checkRLS()
  console.log(`${result.checks.rls.passed ? '✅' : '❌'} ${result.checks.rls.message}`)

  console.log('\n🔍 Running sample query...')
  result.checks.sampleQuery = await checkSampleQuery()
  console.log(`${result.checks.sampleQuery.passed ? '✅' : '❌'} ${result.checks.sampleQuery.message}`)

  console.log('\n⚡ Checking query performance...')
  result.checks.performance = await checkPerformance()
  console.log(`${result.checks.performance.passed ? '✅' : '❌'} ${result.checks.performance.message}`)

  // Determine overall status
  const failedChecks = Object.values(result.checks).filter(c => !c.passed).length
  const totalChecks = Object.values(result.checks).length

  if (failedChecks === 0) {
    result.status = 'healthy'
  } else if (failedChecks <= totalChecks * 0.3) {
    result.status = 'degraded'
  } else {
    result.status = 'unhealthy'
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log(`\n📋 Health Check Summary\n`)
  console.log(`Status: ${result.status.toUpperCase()}`)
  console.log(`Passed: ${totalChecks - failedChecks}/${totalChecks} checks`)
  console.log(`Timestamp: ${result.timestamp}`)

  if (result.status === 'healthy') {
    console.log('\n✅ Database is healthy and ready for use!')
  } else if (result.status === 'degraded') {
    console.log('\n⚠️  Database is operational but has some issues.')
  } else {
    console.log('\n❌ Database has critical issues that need attention.')
  }

  // Performance metrics
  const totalDuration = Object.values(result.checks).reduce((sum, check) => sum + (check.duration_ms || 0), 0)
  console.log(`\nTotal check duration: ${totalDuration}ms`)

  return result
}

// Run health check
runHealthCheck()
  .then(result => {
    process.exit(result.status === 'healthy' ? 0 : 1)
  })
  .catch(error => {
    console.error('\n❌ Health check failed:', error)
    process.exit(1)
  })
