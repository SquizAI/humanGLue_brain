/**
 * Admin Assessment Templates API
 * GET /api/admin/assessments - List all assessment templates (admin view)
 * POST /api/admin/assessments - Create new assessment template
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleUnknownError, APIErrors } from '@/lib/api/errors'
import { requireAuth } from '@/lib/api/auth'

/**
 * GET /api/admin/assessments
 * List all assessment templates with usage stats (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile?.role || !['admin', 'super_admin_full'].includes(profile.role)) {
      return NextResponse.json(
        errorResponse(APIErrors.FORBIDDEN('Admin access required')),
        { status: 403 }
      )
    }

    // Fetch all assessment templates
    const { data: templates, error: templatesError } = await supabase
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
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })

    if (templatesError) throw templatesError

    // Get usage stats for each template
    const enrichedTemplates = await Promise.all((templates || []).map(async (template) => {
      // Count assessments using this template
      const { count: assignedCount } = await supabase
        .from('assessments')
        .select('*', { count: 'exact', head: true })
        .eq('assessment_type', template.pillar || 'full')

      const { count: completedCount } = await supabase
        .from('assessments')
        .select('*', { count: 'exact', head: true })
        .eq('assessment_type', template.pillar || 'full')
        .eq('status', 'completed')

      // Get average score
      const { data: scores } = await supabase
        .from('assessments')
        .select('overall_score')
        .eq('assessment_type', template.pillar || 'full')
        .eq('status', 'completed')
        .not('overall_score', 'is', null)

      const avgScore = scores && scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + (s.overall_score || 0), 0) / scores.length)
        : 0

      const questions = template.questions as Array<{ code: string }> || []

      return {
        id: template.id,
        title: template.name,
        type: mapPillarToType(template.pillar),
        status: template.is_active ? 'active' : 'archived',
        questions: questions.length,
        assigned: assignedCount || 0,
        completed: completedCount || 0,
        avgScore,
        createdAt: template.created_at ? new Date(template.created_at).toISOString().split('T')[0] : '',
        description: template.description,
        pillar: template.pillar,
        durationMinutes: template.duration_minutes,
      }
    }))

    return NextResponse.json(successResponse({
      assessments: enrichedTemplates,
      total: enrichedTemplates.length,
    }))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}

/**
 * POST /api/admin/assessments
 * Create new assessment template (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile?.role || !['admin', 'super_admin_full'].includes(profile.role)) {
      return NextResponse.json(
        errorResponse(APIErrors.FORBIDDEN('Admin access required')),
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, type, description, questions, durationMinutes } = body

    if (!title) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR([{ message: 'Title is required' }])),
        { status: 400 }
      )
    }

    const pillar = mapTypeToPillar(type)

    const { data, error } = await supabase
      .from('assessment_templates')
      .insert({
        name: title,
        description,
        pillar,
        version: 1,
        questions: questions || [],
        scoring_config: {
          dimensions: {
            individual: { weight: 1, maxScore: 100 },
            leadership: { weight: 1, maxScore: 100 },
            cultural: { weight: 1, maxScore: 100 },
            embedding: { weight: 1, maxScore: 100 },
            velocity: { weight: 1, maxScore: 100 },
          },
          maturityLevels: [
            { level: 0, name: 'Level 0', minScore: 0, maxScore: 20 },
            { level: 1, name: 'Level 1', minScore: 21, maxScore: 40 },
            { level: 2, name: 'Level 2', minScore: 41, maxScore: 60 },
            { level: 3, name: 'Level 3', minScore: 61, maxScore: 80 },
            { level: 4, name: 'Level 4', minScore: 81, maxScore: 100 },
          ],
        },
        duration_minutes: durationMinutes || 30,
        is_active: false, // Start as draft
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(successResponse(data), { status: 201 })
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}

// Helper functions
function mapPillarToType(pillar?: string): 'leadership' | 'technical' | 'culture' | 'strategy' {
  const mapping: Record<string, 'leadership' | 'technical' | 'culture' | 'strategy'> = {
    adaptability: 'leadership',
    coaching: 'culture',
    marketplace: 'strategy',
    full: 'leadership',
  }
  return mapping[pillar || 'full'] || 'leadership'
}

function mapTypeToPillar(type?: string): string {
  const mapping: Record<string, string> = {
    leadership: 'adaptability',
    technical: 'marketplace',
    culture: 'coaching',
    strategy: 'marketplace',
  }
  return mapping[type || 'leadership'] || 'adaptability'
}
