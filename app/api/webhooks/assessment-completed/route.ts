/**
 * POST /api/webhooks/assessment-completed
 *
 * Webhook handler for assessment completion
 * Automatically syncs assessment to Neo4j knowledge graph
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createAssessmentSnapshot,
  syncOrganizationToGraph,
} from '@/lib/neo4j/digital-twin'
import { updateOrganizationMaturityLevel } from '@/lib/services/industry-benchmarks'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assessment_id, organization_id, total_score } = body

    if (!assessment_id || !organization_id) {
      return NextResponse.json(
        { error: 'Missing required fields: assessment_id, organization_id' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify assessment exists
    const { data: assessment, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessment_id)
      .single()

    if (error || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    console.log(`[Webhook] Processing completed assessment: ${assessment_id}`)

    // Update organization's maturity level in metadata
    await updateOrganizationMaturityLevel(organization_id, total_score || assessment.total_score)

    // Sync organization to Neo4j (creates/updates digital twin)
    const digitalTwin = await syncOrganizationToGraph(organization_id)

    // Create assessment snapshot in Neo4j
    const snapshot = await createAssessmentSnapshot(assessment_id, organization_id)

    console.log(`[Webhook] Successfully synced assessment ${assessment_id} to knowledge graph`)

    return NextResponse.json({
      success: true,
      digitalTwin,
      snapshot,
      message: 'Assessment synced to knowledge graph',
    })
  } catch (error) {
    console.error('[Assessment Webhook] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
