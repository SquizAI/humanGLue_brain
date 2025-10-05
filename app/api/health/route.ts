/**
 * Health Check API Endpoint
 *
 * Returns the health status of the application and its dependencies.
 * Used by monitoring systems and deployment verification.
 *
 * GET /api/health
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  environment: string
  checks: {
    database: HealthCheckResult
    storage: HealthCheckResult
    realtime: HealthCheckResult
  }
  uptime?: number
  memory?: {
    used: number
    limit: number
  }
}

interface HealthCheckResult {
  status: 'pass' | 'fail'
  responseTime?: number
  message?: string
}

async function checkDatabase(): Promise<HealthCheckResult> {
  try {
    const startTime = Date.now()
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single()

    const responseTime = Date.now() - startTime

    // PGRST116 is "no rows" which is acceptable
    if (error && error.code !== 'PGRST116') {
      return {
        status: 'fail',
        responseTime,
        message: error.message,
      }
    }

    return {
      status: 'pass',
      responseTime,
    }
  } catch (error: any) {
    return {
      status: 'fail',
      message: error.message || 'Database connection failed',
    }
  }
}

async function checkStorage(): Promise<HealthCheckResult> {
  try {
    const startTime = Date.now()
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    const { error } = await supabase.storage.listBuckets()
    const responseTime = Date.now() - startTime

    if (error) {
      return {
        status: 'fail',
        responseTime,
        message: error.message,
      }
    }

    return {
      status: 'pass',
      responseTime,
    }
  } catch (error: any) {
    return {
      status: 'fail',
      message: error.message || 'Storage check failed',
    }
  }
}

async function checkRealtime(): Promise<HealthCheckResult> {
  // For edge runtime, we just verify the Supabase client can be created
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    // Check if realtime is configured
    if (supabase.realtime) {
      return {
        status: 'pass',
        message: 'Realtime client available',
      }
    }

    return {
      status: 'fail',
      message: 'Realtime not configured',
    }
  } catch (error: any) {
    return {
      status: 'fail',
      message: error.message || 'Realtime check failed',
    }
  }
}

export async function GET(request: Request) {
  try {
    const startTime = Date.now()

    // Run health checks in parallel
    const [databaseCheck, storageCheck, realtimeCheck] = await Promise.all([
      checkDatabase(),
      checkStorage(),
      checkRealtime(),
    ])

    const totalTime = Date.now() - startTime

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

    if (
      databaseCheck.status === 'fail' ||
      storageCheck.status === 'fail'
    ) {
      status = 'unhealthy'
    } else if (realtimeCheck.status === 'fail') {
      status = 'degraded'
    }

    const response: HealthCheck = {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NEXT_PUBLIC_ENV || 'unknown',
      checks: {
        database: databaseCheck,
        storage: storageCheck,
        realtime: realtimeCheck,
      },
    }

    // Add response time header
    const headers = new Headers()
    headers.set('X-Response-Time', `${totalTime}ms`)
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')

    // Return appropriate status code
    const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503

    return NextResponse.json(response, {
      status: statusCode,
      headers,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message || 'Health check failed',
      },
      { status: 503 }
    )
  }
}
