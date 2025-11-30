/**
 * Assessment Templates API
 * GET /api/assessments/templates - List available assessment templates
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleUnknownError } from '@/lib/api/errors'
import { requireAuth } from '@/lib/api/auth'

/**
 * GET /api/assessments/templates
 * List available assessment templates
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)

    const pillar = searchParams.get('pillar')

    const supabase = await createClient()

    let query = supabase
      .from('assessment_templates')
      .select(`
        id,
        name,
        description,
        pillar,
        version,
        questions,
        scoring_config,
        duration_minutes,
        is_active,
        created_at
      `)
      .eq('is_active', true)

    if (pillar) {
      query = query.eq('pillar', pillar)
    }

    const { data: templates, error } = await query.order('name')

    if (error) throw error

    // Enrich with question counts and dimension breakdown
    const enrichedTemplates = templates?.map(template => {
      const questions = template.questions as Array<{ code: string; required: boolean }> || []
      const scoringConfig = template.scoring_config as {
        dimensions: Record<string, { weight: number; maxScore: number }>
        maturityLevels: Array<{ level: number; name: string; minScore: number; maxScore: number }>
      }

      return {
        ...template,
        questionCount: questions.length,
        requiredQuestions: questions.filter(q => q.required).length,
        dimensions: Object.keys(scoringConfig?.dimensions || {}),
        maturityLevels: scoringConfig?.maturityLevels?.length || 0,
      }
    })

    return NextResponse.json(successResponse({
      templates: enrichedTemplates,
      totalTemplates: enrichedTemplates?.length || 0,
    }))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
