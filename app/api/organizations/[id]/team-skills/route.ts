/**
 * Organization Team Skills API
 * GET - Returns team members with AI skill assessments
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  requireAuth,
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api'
import type {
  TeamSkillsResponse,
  TeamMemberSkill,
  TeamSkillsSummary,
  SkillLevel,
} from '@/lib/types/assessment'

/**
 * Check if user has access to the organization
 */
async function checkOrganizationAccess(
  organizationId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient()

  // Check user role (admin/super_admin gets access to all orgs)
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)

  const isAdmin = userRoles?.some(r =>
    r.role === 'admin' || r.role === 'super_admin_full' || r.role === 'super_admin'
  ) || false

  if (isAdmin) return true

  // Check if user is part of the organization via team membership
  const { data: teamMembership } = await supabase
    .from('team_members')
    .select('team_id, teams!inner(organization_id)')
    .eq('user_id', userId)
    .eq('teams.organization_id', organizationId)
    .limit(1)

  return (teamMembership && teamMembership.length > 0) || false
}

/**
 * Map AI skill level string to SkillLevel type
 */
function mapSkillLevel(level: string | null): SkillLevel {
  const normalized = (level || 'none').toLowerCase()
  if (normalized === 'expert' || normalized === 'advanced_user') return 'expert'
  if (normalized === 'advanced' || normalized === 'proficient') return 'advanced'
  if (normalized === 'intermediate' || normalized === 'moderate') return 'intermediate'
  if (normalized === 'beginner' || normalized === 'basic' || normalized === 'learning') return 'beginner'
  return 'none'
}

/**
 * Get numeric score from skill level
 */
function skillLevelToScore(level: SkillLevel): number {
  const scores: Record<SkillLevel, number> = {
    expert: 95,
    advanced: 80,
    intermediate: 60,
    beginner: 35,
    none: 0,
  }
  return scores[level] || 0
}

/**
 * Map numeric score to skill level
 */
function scoreToSkillLevel(score: number): SkillLevel {
  if (score >= 90) return 'expert'
  if (score >= 70) return 'advanced'
  if (score >= 50) return 'intermediate'
  if (score >= 25) return 'beginner'
  return 'none'
}

/**
 * Calculate summary statistics for a set of members
 */
function calculateSummary(members: TeamMemberSkill[]): TeamSkillsSummary {
  const skillDistribution: Record<SkillLevel, number> = {
    none: 0,
    beginner: 0,
    intermediate: 0,
    advanced: 0,
    expert: 0,
  }

  members.forEach((m) => {
    if (m.overallSkillLevel in skillDistribution) {
      skillDistribution[m.overallSkillLevel]++
    }
  })

  const totalScore = members.reduce((sum, m) => sum + m.overallScore, 0)
  const averageScore = members.length > 0 ? Math.round((totalScore / members.length) * 100) / 100 : 0

  // Aggregate skills across all members
  const skillAggregates: Record<string, { total: number; count: number }> = {}
  const skillCoverage: Record<string, number> = {}

  members.forEach((m) => {
    m.skills.forEach((skill) => {
      if (!skillAggregates[skill.skill]) {
        skillAggregates[skill.skill] = { total: 0, count: 0 }
        skillCoverage[skill.skill] = 0
      }
      skillAggregates[skill.skill].total += skill.score
      skillAggregates[skill.skill].count++
      if (skill.level !== 'none') {
        skillCoverage[skill.skill]++
      }
    })
  })

  // Calculate top skills
  const topSkills = Object.entries(skillAggregates)
    .map(([skill, { total, count }]) => ({
      skill,
      averageLevel: scoreToSkillLevel(total / count),
      teamCoverage: members.length > 0 ? Math.round((skillCoverage[skill] / members.length) * 100) : 0,
    }))
    .sort((a, b) => skillLevelToScore(b.averageLevel) - skillLevelToScore(a.averageLevel))
    .slice(0, 10)

  // Identify skill gaps (skills where average is below intermediate)
  const skillGaps = Object.entries(skillAggregates)
    .map(([skill, { total, count }]) => {
      const avgScore = total / count
      const currentLevel = scoreToSkillLevel(avgScore)
      const targetLevel: SkillLevel = 'intermediate' // Default target

      return {
        skill,
        currentLevel,
        targetLevel,
        gap: Math.max(0, skillLevelToScore(targetLevel) - avgScore),
        membersAffected: members.filter((m) =>
          m.skills.some((s) => s.skill === skill && skillLevelToScore(s.level) < skillLevelToScore(targetLevel))
        ).length,
      }
    })
    .filter((g) => g.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 10)

  return {
    totalMembers: members.length,
    skillDistribution,
    averageScore,
    topSkills,
    skillGaps,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params

    // Require authentication
    const user = await requireAuth()

    // Check organization access
    const hasAccess = await checkOrganizationAccess(organizationId, user.id)

    if (!hasAccess) {
      throw APIErrors.FORBIDDEN('You do not have access to this organization')
    }

    const supabase = await createClient()

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const departmentFilter = searchParams.get('department')
    const skillLevelFilter = searchParams.get('skillLevel') as SkillLevel | null
    const limit = parseInt(searchParams.get('limit') || '100')
    const includeDepartmentBreakdown = searchParams.get('departmentBreakdown') === 'true'

    // Validate skill level filter
    const validSkillLevels: SkillLevel[] = ['none', 'beginner', 'intermediate', 'advanced', 'expert']
    if (skillLevelFilter && !validSkillLevels.includes(skillLevelFilter)) {
      throw APIErrors.INVALID_QUERY_PARAMS({
        skillLevel: `Invalid skill level. Must be one of: ${validSkillLevels.join(', ')}`,
      })
    }

    // Fetch skills profiles from skills_profiles table
    let profilesQuery = supabase
      .from('skills_profiles')
      .select(`
        id,
        user_id,
        person_name,
        title,
        department,
        ai_skill_level,
        ai_skill_score,
        tools_used,
        usage_frequency,
        mentioned_by,
        evidence,
        is_champion,
        champion_reason,
        growth_potential,
        recommended_training,
        created_at,
        updated_at
      `)
      .eq('organization_id', organizationId)

    if (departmentFilter) {
      profilesQuery = profilesQuery.eq('department', departmentFilter)
    }
    if (skillLevelFilter) {
      profilesQuery = profilesQuery.eq('ai_skill_level', skillLevelFilter)
    }

    profilesQuery = profilesQuery
      .order('ai_skill_score', { ascending: false })
      .limit(limit)

    const { data: profilesData, error: profilesError } = await profilesQuery

    if (profilesError) {
      throw APIErrors.DATABASE_ERROR('Failed to fetch team skills profiles')
    }

    // Build member responses
    const members: TeamMemberSkill[] = (profilesData || []).map((profile) => {
      const skillLevel = mapSkillLevel(profile.ai_skill_level)
      const overallScore = profile.ai_skill_score || skillLevelToScore(skillLevel)

      // Parse tools_used as skills
      const toolsUsed = Array.isArray(profile.tools_used) ? profile.tools_used : []
      const skills = toolsUsed.map((tool: string | { name?: string; proficiency?: string }) => {
        const toolName = typeof tool === 'string' ? tool : (tool.name || 'Unknown')
        const toolProficiency = typeof tool === 'object' && tool.proficiency ? tool.proficiency : 'intermediate'
        const toolLevel = mapSkillLevel(toolProficiency)

        return {
          category: 'AI Tools',
          skill: toolName,
          level: toolLevel,
          score: skillLevelToScore(toolLevel),
          assessedAt: profile.updated_at || profile.created_at,
        }
      })

      // Add overall AI skill as a skill entry
      skills.unshift({
        category: 'AI Competency',
        skill: 'Overall AI Skills',
        level: skillLevel,
        score: overallScore,
        assessedAt: profile.updated_at || profile.created_at,
      })

      // Parse evidence for strengths
      const evidence = Array.isArray(profile.evidence) ? profile.evidence : []
      const strengths = evidence
        .filter((e: { type?: string }) => e.type === 'strength')
        .map((e: { content?: string }) => e.content || '')
        .slice(0, 5)

      // Parse recommended_training for development areas
      const recommendedTraining = Array.isArray(profile.recommended_training) ? profile.recommended_training : []
      const developmentAreas = recommendedTraining.slice(0, 5)

      return {
        id: profile.id,
        userId: profile.user_id,
        name: profile.person_name || 'Unknown',
        email: '', // Not stored in skills_profiles
        role: profile.title || '',
        department: profile.department || '',
        overallSkillLevel: skillLevel,
        overallScore,
        skills,
        strengths: strengths.length > 0 ? strengths : (profile.is_champion ? ['AI Champion'] : []),
        developmentAreas,
        learningPath: {
          currentCourse: null,
          completedCourses: 0,
          recommendedNextSteps: recommendedTraining.slice(0, 3),
        },
      }
    })

    // Calculate overall summary
    const summary = calculateSummary(members)

    // Calculate department breakdown if requested
    let departmentBreakdown: Record<string, TeamSkillsSummary> | undefined

    if (includeDepartmentBreakdown) {
      const departments = [...new Set(members.map((m) => m.department).filter(Boolean))] as string[]

      departmentBreakdown = {}
      for (const dept of departments) {
        const deptMembers = members.filter((m) => m.department === dept)
        departmentBreakdown[dept] = calculateSummary(deptMembers)
      }
    }

    // Build response
    const response: TeamSkillsResponse = {
      organizationId,
      summary,
      members,
      ...(departmentBreakdown && { departmentBreakdown }),
    }

    return NextResponse.json(successResponse(response))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
