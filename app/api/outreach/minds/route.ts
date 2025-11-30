/**
 * Mind Reasoner API Endpoints
 *
 * POST /api/outreach/minds - Create a new mind for a prospect
 * GET /api/outreach/minds - List all minds or get specific mind
 */

import { NextRequest, NextResponse } from 'next/server'
import { mindReasonerService } from '@/lib/services/mind-reasoner'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prospectId, name } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
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

    // Create mind in Mind Reasoner
    const mind = await mindReasonerService.createMind(name)

    // If prospectId provided, link mind to prospect in Neo4j
    if (prospectId) {
      try {
        await mindReasonerService.storeMindInGraph(
          mind.id,
          name,
          mind.digitalTwin.id,
          prospectId
        )
      } catch (graphError) {
        console.error('[Minds API] Failed to store in Neo4j:', graphError)
        // Continue - mind was created successfully in Mind Reasoner
      }
    }

    return NextResponse.json({
      success: true,
      mind: {
        id: mind.id,
        name: mind.name,
        digitalTwinId: mind.digitalTwin.id,
        linkedToProspect: !!prospectId,
      },
    })
  } catch (error) {
    console.error('[Minds API] Create error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create mind',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mindId = searchParams.get('mindId')
    const prospectId = searchParams.get('prospectId')

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

    // Get specific mind
    if (mindId) {
      const mind = await mindReasonerService.getMind(mindId)
      return NextResponse.json({
        success: true,
        mind,
      })
    }

    // Get profile for prospect
    if (prospectId) {
      const profile = await mindReasonerService.getProspectProfile(prospectId)
      const hasMind = await mindReasonerService.prospectHasMind(prospectId)

      return NextResponse.json({
        success: true,
        hasMind,
        profile,
      })
    }

    // List all minds
    const minds = await mindReasonerService.listMinds()
    return NextResponse.json({
      success: true,
      minds,
      count: minds.length,
    })
  } catch (error) {
    console.error('[Minds API] Get error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve mind(s)',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
