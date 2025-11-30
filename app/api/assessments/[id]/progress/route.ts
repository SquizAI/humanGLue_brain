/**
 * GET /api/assessments/[id]/progress - Get assessment progress
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAssessmentProgress } from '@/lib/services/question-engine'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user owns this assessment
    const { data: assessment } = await supabase
      .from('assessments')
      .select('id, user_id, organization_id')
      .eq('id', assessmentId)
      .single()

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    // Check if user owns assessment or is in the organization
    if (assessment.user_id !== user.id) {
      const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', assessment.organization_id)
        .eq('user_id', user.id)
        .single()

      if (!membership) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }
    }

    // Get progress from question engine
    const progress = await getAssessmentProgress(assessmentId)

    return NextResponse.json(progress)
  } catch (error) {
    console.error('[Assessment Progress API] GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get progress' },
      { status: 500 }
    )
  }
}
