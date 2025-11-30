/**
 * Mind Reasoner Simulation API
 *
 * POST /api/outreach/minds/simulate - Run a simulation on a trained mind
 */

import { NextRequest, NextResponse } from 'next/server'
import { mindReasonerService } from '@/lib/services/mind-reasoner'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      mindId,
      scenario,
      model = 'mind-reasoner-pro',
      storeResult = false,
    } = body

    if (!mindId) {
      return NextResponse.json(
        { success: false, error: 'mindId is required' },
        { status: 400 }
      )
    }

    if (!scenario) {
      return NextResponse.json(
        { success: false, error: 'scenario is required' },
        { status: 400 }
      )
    }

    // Check if service is configured
    if (!mindReasonerService.isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Mind Reasoner not configured',
          message: 'MIND_REASONER_API_KEY environment variable is not set'
        },
        { status: 503 }
      )
    }

    // Run simulation
    const result = await mindReasonerService.simulate(mindId, scenario, model)

    // Optionally store in Neo4j
    if (storeResult) {
      try {
        await mindReasonerService.storeSimulationResult(
          mindId,
          scenario,
          result,
          model
        )
      } catch (graphError) {
        console.error('[Simulate API] Failed to store result:', graphError)
        // Continue - simulation was successful
      }
    }

    return NextResponse.json({
      success: true,
      result,
      model,
      stored: storeResult,
    })
  } catch (error) {
    console.error('[Simulate API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Simulation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
