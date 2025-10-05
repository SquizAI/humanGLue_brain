#!/usr/bin/env tsx
/**
 * ============================================================================
 * System Health Check Script for HumanGlue Platform
 * ============================================================================
 * This script performs comprehensive health checks on the deployed application
 * including database connectivity, API endpoints, real-time connections, and
 * storage accessibility.
 *
 * Usage:
 *   npm run health-check
 *   or
 *   tsx scripts/health-check.ts [environment-url]
 *
 * Examples:
 *   tsx scripts/health-check.ts https://humanglue.ai
 *   tsx scripts/health-check.ts https://staging.humanglue.ai
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// ============================================================================
// Configuration
// ============================================================================

const SITE_URL = process.argv[2] || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5040'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

interface HealthCheckResult {
  name: string
  status: 'pass' | 'fail' | 'warn'
  message: string
  duration?: number
  details?: any
}

const results: HealthCheckResult[] = []

// ============================================================================
// Utility Functions
// ============================================================================

function logSuccess(message: string) {
  console.log(`✅ ${message}`)
}

function logError(message: string) {
  console.log(`❌ ${message}`)
}

function logWarning(message: string) {
  console.log(`⚠️  ${message}`)
}

function logInfo(message: string) {
  console.log(`ℹ️  ${message}`)
}

async function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = Date.now()
  const result = await fn()
  const duration = Date.now() - start
  return { result, duration }
}

// ============================================================================
// Health Check Functions
// ============================================================================

async function checkWebsiteAccessibility(): Promise<HealthCheckResult> {
  try {
    const { result: response, duration } = await measureTime(async () => {
      return await fetch(SITE_URL, {
        method: 'GET',
        headers: { 'User-Agent': 'HumanGlue-HealthCheck/1.0' },
      })
    })

    if (response.ok) {
      return {
        name: 'Website Accessibility',
        status: 'pass',
        message: `Website is accessible (${response.status})`,
        duration,
      }
    } else {
      return {
        name: 'Website Accessibility',
        status: 'fail',
        message: `Website returned ${response.status}`,
        duration,
      }
    }
  } catch (error: any) {
    return {
      name: 'Website Accessibility',
      status: 'fail',
      message: `Failed to reach website: ${error.message}`,
    }
  }
}

async function checkDatabaseConnectivity(): Promise<HealthCheckResult> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      name: 'Database Connectivity',
      status: 'warn',
      message: 'Supabase credentials not configured',
    }
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    const { duration, result } = await measureTime(async () => {
      const { data, error } = await supabase.from('users').select('count').limit(1).single()
      return { data, error }
    })

    if (result.error && result.error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is fine
      return {
        name: 'Database Connectivity',
        status: 'fail',
        message: `Database query failed: ${result.error.message}`,
        duration,
      }
    }

    return {
      name: 'Database Connectivity',
      status: 'pass',
      message: 'Database is reachable and responsive',
      duration,
    }
  } catch (error: any) {
    return {
      name: 'Database Connectivity',
      status: 'fail',
      message: `Database connection failed: ${error.message}`,
    }
  }
}

async function checkRealtimeConnection(): Promise<HealthCheckResult> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      name: 'Realtime Connection',
      status: 'warn',
      message: 'Supabase credentials not configured',
    }
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 2,
        },
      },
    })

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({
          name: 'Realtime Connection',
          status: 'fail',
          message: 'Realtime connection timeout',
        })
      }, 5000)

      const channel = supabase
        .channel('health-check')
        .on('presence', { event: 'sync' }, () => {
          clearTimeout(timeout)
          channel.unsubscribe()
          resolve({
            name: 'Realtime Connection',
            status: 'pass',
            message: 'Realtime connection established',
          })
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            channel.track({ online_at: new Date().toISOString() })
          }
        })
    })
  } catch (error: any) {
    return {
      name: 'Realtime Connection',
      status: 'fail',
      message: `Realtime connection failed: ${error.message}`,
    }
  }
}

async function checkAPIEndpoints(): Promise<HealthCheckResult[]> {
  const endpoints = [
    { path: '/api/health', required: false },
    { path: '/api/version', required: false },
    { path: '/api/status', required: false },
  ]

  const endpointResults: HealthCheckResult[] = []

  for (const endpoint of endpoints) {
    try {
      const { result: response, duration } = await measureTime(async () => {
        return await fetch(`${SITE_URL}${endpoint.path}`, {
          method: 'GET',
          headers: { 'User-Agent': 'HumanGlue-HealthCheck/1.0' },
        })
      })

      if (response.ok) {
        endpointResults.push({
          name: `API: ${endpoint.path}`,
          status: 'pass',
          message: `Endpoint accessible (${response.status})`,
          duration,
        })
      } else if (!endpoint.required) {
        endpointResults.push({
          name: `API: ${endpoint.path}`,
          status: 'warn',
          message: `Endpoint not found (${response.status})`,
          duration,
        })
      } else {
        endpointResults.push({
          name: `API: ${endpoint.path}`,
          status: 'fail',
          message: `Endpoint failed (${response.status})`,
          duration,
        })
      }
    } catch (error: any) {
      endpointResults.push({
        name: `API: ${endpoint.path}`,
        status: endpoint.required ? 'fail' : 'warn',
        message: `Request failed: ${error.message}`,
      })
    }
  }

  return endpointResults
}

async function checkStorageAccess(): Promise<HealthCheckResult> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      name: 'Storage Access',
      status: 'warn',
      message: 'Supabase credentials not configured',
    }
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    const { duration, result } = await measureTime(async () => {
      const { data, error } = await supabase.storage.listBuckets()
      return { data, error }
    })

    if (result.error) {
      return {
        name: 'Storage Access',
        status: 'fail',
        message: `Storage access failed: ${result.error.message}`,
        duration,
      }
    }

    return {
      name: 'Storage Access',
      status: 'pass',
      message: `Storage accessible (${result.data?.length || 0} buckets)`,
      duration,
      details: { buckets: result.data?.length || 0 },
    }
  } catch (error: any) {
    return {
      name: 'Storage Access',
      status: 'fail',
      message: `Storage check failed: ${error.message}`,
    }
  }
}

async function checkSSLCertificate(): Promise<HealthCheckResult> {
  if (!SITE_URL.startsWith('https://')) {
    return {
      name: 'SSL Certificate',
      status: 'warn',
      message: 'Site is not using HTTPS',
    }
  }

  try {
    const response = await fetch(SITE_URL, {
      method: 'HEAD',
    })

    if (response.ok) {
      return {
        name: 'SSL Certificate',
        status: 'pass',
        message: 'SSL certificate is valid',
      }
    } else {
      return {
        name: 'SSL Certificate',
        status: 'warn',
        message: 'Could not verify SSL certificate',
      }
    }
  } catch (error: any) {
    return {
      name: 'SSL Certificate',
      status: 'fail',
      message: `SSL verification failed: ${error.message}`,
    }
  }
}

async function checkResponseTime(): Promise<HealthCheckResult> {
  try {
    const { duration } = await measureTime(async () => {
      return await fetch(SITE_URL, {
        method: 'GET',
        headers: { 'User-Agent': 'HumanGlue-HealthCheck/1.0' },
      })
    })

    let status: 'pass' | 'warn' | 'fail' = 'pass'
    let message = `Response time: ${duration}ms`

    if (duration > 2000) {
      status = 'fail'
      message += ' (too slow)'
    } else if (duration > 1000) {
      status = 'warn'
      message += ' (acceptable)'
    } else {
      message += ' (good)'
    }

    return {
      name: 'Response Time',
      status,
      message,
      duration,
    }
  } catch (error: any) {
    return {
      name: 'Response Time',
      status: 'fail',
      message: `Failed to measure response time: ${error.message}`,
    }
  }
}

// ============================================================================
// Main Function
// ============================================================================

async function main() {
  console.log('============================================================')
  console.log('🏥 HumanGlue Platform Health Check')
  console.log('============================================================')
  console.log(`Target: ${SITE_URL}`)
  console.log(`Timestamp: ${new Date().toISOString()}`)
  console.log('============================================================\n')

  // Run all health checks
  logInfo('Running health checks...\n')

  results.push(await checkWebsiteAccessibility())
  results.push(await checkResponseTime())
  results.push(await checkSSLCertificate())
  results.push(await checkDatabaseConnectivity())
  results.push(await checkRealtimeConnection())
  results.push(...(await checkAPIEndpoints()))
  results.push(await checkStorageAccess())

  // Print results
  console.log('\n============================================================')
  console.log('📊 Health Check Results')
  console.log('============================================================\n')

  let passCount = 0
  let warnCount = 0
  let failCount = 0

  results.forEach((result) => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌'
    const durationStr = result.duration ? ` (${result.duration}ms)` : ''
    console.log(`${icon} ${result.name}: ${result.message}${durationStr}`)

    if (result.status === 'pass') passCount++
    else if (result.status === 'warn') warnCount++
    else failCount++
  })

  // Summary
  console.log('\n============================================================')
  console.log('📈 Summary')
  console.log('============================================================')
  console.log(`Total Checks: ${results.length}`)
  console.log(`✅ Passed: ${passCount}`)
  console.log(`⚠️  Warnings: ${warnCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log('============================================================\n')

  // Exit code
  if (failCount > 0) {
    logError(`Health check failed with ${failCount} failures`)
    process.exit(1)
  } else if (warnCount > 0) {
    logWarning(`Health check passed with ${warnCount} warnings`)
    process.exit(0)
  } else {
    logSuccess('All health checks passed!')
    process.exit(0)
  }
}

// Run health check
main()
