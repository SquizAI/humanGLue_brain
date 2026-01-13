/**
 * Organization Analysis Entities API
 * GET - Returns extracted entities (tools, concepts) with frequencies
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
  AnalysisEntitiesResponse,
  AnalysisEntity,
  EntityMention,
  EntityType,
  SentimentType,
} from '@/lib/types/assessment'

/**
 * Check if user has access to the organization
 */
async function checkOrganizationAccess(
  organizationId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient()

  // Check user role
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single()

  const isAdmin = userRole?.role === 'admin' || userRole?.role === 'super_admin_full'
  if (isAdmin) return true

  // Check if user is part of the organization
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', userId)
    .single()

  return userProfile?.organization_id === organizationId
}

/**
 * Get readable entity type name
 */
function getEntityTypeName(type: EntityType): string {
  const names: Record<EntityType, string> = {
    ai_tool: 'AI Tool',
    ai_concept: 'AI Concept',
    business_process: 'Business Process',
    challenge: 'Challenge',
    opportunity: 'Opportunity',
    competitor: 'Competitor',
    technology: 'Technology',
  }
  return names[type] || type
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
    const typeFilter = searchParams.get('type') as EntityType | null
    const sentimentFilter = searchParams.get('sentiment') as SentimentType | null
    const minFrequency = parseInt(searchParams.get('minFrequency') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Validate filters
    const validTypes: EntityType[] = ['ai_tool', 'ai_concept', 'business_process', 'challenge', 'opportunity', 'competitor', 'technology']
    if (typeFilter && !validTypes.includes(typeFilter)) {
      throw APIErrors.INVALID_QUERY_PARAMS({
        type: `Invalid entity type. Must be one of: ${validTypes.join(', ')}`,
      })
    }

    const validSentiments: SentimentType[] = ['positive', 'negative', 'neutral', 'mixed']
    if (sentimentFilter && !validSentiments.includes(sentimentFilter)) {
      throw APIErrors.INVALID_QUERY_PARAMS({
        sentiment: `Invalid sentiment. Must be one of: ${validSentiments.join(', ')}`,
      })
    }

    // Get the latest assessment for the organization
    const { data: latestAssessment, error: assessmentError } = await supabase
      .from('organization_assessments')
      .select('id')
      .eq('organization_id', organizationId)
      .order('assessment_date', { ascending: false })
      .limit(1)
      .single()

    if (assessmentError && assessmentError.code !== 'PGRST116') {
      throw APIErrors.DATABASE_ERROR('Failed to fetch assessment data')
    }

    if (!latestAssessment) {
      throw APIErrors.NOT_FOUND('Assessment data')
    }

    // Build entities query
    let entitiesQuery = supabase
      .from('organization_analysis_entities')
      .select(`
        id,
        name,
        type,
        frequency,
        sentiment,
        sentiment_score,
        first_mentioned,
        last_mentioned,
        created_at
      `)
      .eq('assessment_id', latestAssessment.id)
      .gte('frequency', minFrequency)

    if (typeFilter) {
      entitiesQuery = entitiesQuery.eq('type', typeFilter)
    }
    if (sentimentFilter) {
      entitiesQuery = entitiesQuery.eq('sentiment', sentimentFilter)
    }

    entitiesQuery = entitiesQuery
      .order('frequency', { ascending: false })
      .limit(limit)

    const { data: entitiesData, error: entitiesError } = await entitiesQuery

    if (entitiesError) {
      throw APIErrors.DATABASE_ERROR('Failed to fetch analysis entities')
    }

    // Get total mentions for percentage calculation
    const totalFrequency = (entitiesData || []).reduce((sum, e) => sum + e.frequency, 0) || 1

    // Build entity responses with mentions and relationships
    const entities: AnalysisEntity[] = await Promise.all(
      (entitiesData || []).map(async (entity) => {
        // Fetch mentions for this entity
        const { data: mentionsData } = await supabase
          .from('organization_entity_mentions')
          .select(`
            id,
            context,
            speaker,
            sentiment,
            timestamp
          `)
          .eq('entity_id', entity.id)
          .order('timestamp', { ascending: false })
          .limit(10)

        const mentions: EntityMention[] = (mentionsData || []).map((m) => ({
          id: m.id,
          context: m.context,
          speaker: m.speaker,
          sentiment: m.sentiment as SentimentType,
          timestamp: m.timestamp,
        }))

        // Fetch related entities
        const { data: relatedData } = await supabase
          .from('organization_entity_relationships')
          .select(`
            related_entity_id,
            relationship_type,
            strength
          `)
          .eq('entity_id', entity.id)
          .order('strength', { ascending: false })
          .limit(5)

        // Get names for related entities
        const relatedEntities = await Promise.all(
          (relatedData || []).map(async (rel) => {
            const { data: relatedEntity } = await supabase
              .from('organization_analysis_entities')
              .select('name')
              .eq('id', rel.related_entity_id)
              .single()

            return {
              entityId: rel.related_entity_id,
              entityName: relatedEntity?.name || 'Unknown',
              relationshipType: rel.relationship_type,
              strength: rel.strength,
            }
          })
        )

        return {
          id: entity.id,
          name: entity.name,
          type: entity.type as EntityType,
          frequency: entity.frequency,
          frequencyPercentage: Math.round((entity.frequency / totalFrequency) * 100 * 100) / 100,
          sentiment: entity.sentiment as SentimentType,
          sentimentScore: entity.sentiment_score || 0,
          mentions,
          relatedEntities,
          firstMentioned: entity.first_mentioned,
          lastMentioned: entity.last_mentioned,
        }
      })
    )

    // Group entities by type
    const byType: Record<EntityType, AnalysisEntity[]> = {
      ai_tool: [],
      ai_concept: [],
      business_process: [],
      challenge: [],
      opportunity: [],
      competitor: [],
      technology: [],
    }

    entities.forEach((e) => {
      if (e.type in byType) {
        byType[e.type].push(e)
      }
    })

    // Calculate summary statistics
    const mostMentionedEntity = entities.length > 0 ? entities[0].name : ''

    const positiveEntities = entities.filter((e) => e.sentiment === 'positive')
    const mostPositiveEntity = positiveEntities.length > 0
      ? positiveEntities.reduce((max, e) => e.sentimentScore > max.sentimentScore ? e : max).name
      : ''

    const negativeEntities = entities.filter((e) => e.sentiment === 'negative')
    const mostNegativeEntity = negativeEntities.length > 0
      ? negativeEntities.reduce((min, e) => e.sentimentScore < min.sentimentScore ? e : min).name
      : ''

    // Calculate entity diversity (number of unique types represented)
    const typesRepresented = new Set(entities.map((e) => e.type)).size
    const entityDiversity = Math.round((typesRepresented / validTypes.length) * 100)

    // Build response
    const response: AnalysisEntitiesResponse = {
      organizationId,
      totalEntities: entities.length,
      entities,
      byType,
      summary: {
        mostMentionedEntity,
        mostPositiveEntity,
        mostNegativeEntity,
        entityDiversity,
      },
    }

    return NextResponse.json(successResponse(response))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
