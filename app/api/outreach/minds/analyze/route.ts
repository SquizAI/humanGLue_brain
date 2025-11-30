/**
 * Mind Reasoner Psychometric Analysis API
 *
 * POST /api/outreach/minds/analyze - Analyze psychometrics from a trained mind
 */

import { NextRequest, NextResponse } from 'next/server'
import { mindReasonerService } from '@/lib/services/mind-reasoner'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mindId, snapshotId, storeProfile = true } = body

    if (!mindId) {
      return NextResponse.json(
        { success: false, error: 'mindId is required' },
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

    // Run psychometric analysis
    const profile = await mindReasonerService.analyzePsychometrics(mindId)

    // Add snapshot ID if provided
    if (snapshotId) {
      profile.snapshotId = snapshotId
    }

    // Store in Neo4j if requested
    if (storeProfile) {
      try {
        await mindReasonerService.storePsychometricProfile(profile)
      } catch (graphError) {
        console.error('[Analyze API] Failed to store profile:', graphError)
        // Continue - analysis was successful
      }
    }

    return NextResponse.json({
      success: true,
      profile,
      stored: storeProfile,
    })
  } catch (error) {
    console.error('[Analyze API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Psychometric analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
