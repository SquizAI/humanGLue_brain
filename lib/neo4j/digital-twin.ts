/**
 * Digital Twin Service - Neo4j
 *
 * Creates and manages organizational digital twins in the knowledge graph.
 * Maps Supabase assessment data into Neo4j for relationship-based insights.
 */

import { executeRead, executeWrite } from './client'
import { createClient } from '@/lib/supabase/server'
import { calculateMaturityLevel } from '@/lib/services/industry-benchmarks'

export interface DigitalTwinNode {
  id: string
  name: string
  domain?: string
  maturityLevel: number
  createdAt: string
  updatedAt: string
}

export interface AssessmentSnapshot {
  id: string
  organizationId: string
  score: number
  maturityLevel: number
  completedAt: string
  answers: Record<string, any>
}

/**
 * Create or update an organization's digital twin in Neo4j
 */
export async function syncOrganizationToGraph(
  organizationId: string
): Promise<DigitalTwinNode> {
  const supabase = await createClient()

  // Get organization data from Supabase
  const { data: org, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()

  if (error || !org) {
    throw new Error(`Organization not found: ${organizationId}`)
  }

  const maturityLevel = org.metadata?.latest_maturity_level || 0

  // Create/update organization node in Neo4j
  const query = `
    MERGE (o:Organization {id: $orgId})
    SET o.name = $name,
        o.domain = $domain,
        o.maturityLevel = $maturityLevel,
        o.industry = $industry,
        o.employeeCount = $employeeCount,
        o.updatedAt = datetime()
    ON CREATE SET o.createdAt = datetime()

    // Link to maturity level
    WITH o
    MATCH (ml:MaturityLevel {level: $maturityLevel})
    MERGE (o)-[:HAS_MATURITY_LEVEL]->(ml)

    // Link to industry if available
    WITH o
    OPTIONAL MATCH (ind:Industry {name: $industry})
    FOREACH (i IN CASE WHEN ind IS NOT NULL THEN [ind] ELSE [] END |
      MERGE (o)-[:BELONGS_TO_INDUSTRY]->(i)
    )

    RETURN o.id as id, o.name as name, o.domain as domain,
           o.maturityLevel as maturityLevel, o.createdAt as createdAt,
           o.updatedAt as updatedAt
  `

  const result = await executeWrite<DigitalTwinNode>(query, {
    orgId: organizationId,
    name: org.name,
    domain: org.domain,
    maturityLevel,
    industry: org.industry,
    employeeCount: org.employee_count,
  })

  if (!result[0]) {
    throw new Error('Failed to create digital twin')
  }

  return result[0]
}

/**
 * Create an assessment snapshot in the graph
 */
export async function createAssessmentSnapshot(
  assessmentId: string,
  organizationId: string
): Promise<AssessmentSnapshot> {
  const supabase = await createClient()

  // Get assessment data
  const { data: assessment, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', assessmentId)
    .single()

  if (error || !assessment) {
    throw new Error(`Assessment not found: ${assessmentId}`)
  }

  const score = assessment.total_score || 0
  const maturityLevel = calculateMaturityLevel(score)

  // Create snapshot node and link to organization
  const query = `
    MATCH (o:Organization {id: $orgId})

    CREATE (s:AssessmentSnapshot {
      id: $assessmentId,
      organizationId: $orgId,
      score: $score,
      maturityLevel: $maturityLevel,
      completedAt: datetime($completedAt),
      answers: $answers
    })

    CREATE (o)-[:HAS_ASSESSMENT]->(s)
    CREATE (s)-[:MEASURED_AT {timestamp: datetime($completedAt)}]->(o)

    // Link to maturity level
    WITH s
    MATCH (ml:MaturityLevel {level: $maturityLevel})
    CREATE (s)-[:ACHIEVED_LEVEL]->(ml)

    RETURN s.id as id, s.organizationId as organizationId, s.score as score,
           s.maturityLevel as maturityLevel, s.completedAt as completedAt,
           s.answers as answers
  `

  const result = await executeWrite<AssessmentSnapshot>(query, {
    assessmentId,
    orgId: organizationId,
    score,
    maturityLevel,
    completedAt: assessment.completed_at || new Date().toISOString(),
    answers: JSON.stringify(assessment.answers || {}),
  })

  if (!result[0]) {
    throw new Error('Failed to create assessment snapshot')
  }

  return result[0]
}

/**
 * Get maturity progression over time
 */
export async function getMaturityProgression(
  organizationId: string
): Promise<Array<{
  date: string
  maturityLevel: number
  score: number
}>> {
  const query = `
    MATCH (o:Organization {id: $orgId})-[:HAS_ASSESSMENT]->(s:AssessmentSnapshot)
    RETURN s.completedAt as date, s.maturityLevel as maturityLevel, s.score as score
    ORDER BY s.completedAt ASC
  `

  const result = await executeRead<{
    date: string
    maturityLevel: number
    score: number
  }>(query, { orgId: organizationId })

  return result
}

/**
 * Find similar organizations (peers)
 */
export async function findSimilarOrganizations(
  organizationId: string,
  limit: number = 5
): Promise<Array<{
  id: string
  name: string
  maturityLevel: number
  similarity: number
}>> {
  const query = `
    MATCH (org:Organization {id: $orgId})
    MATCH (org)-[:BELONGS_TO_INDUSTRY]->(ind:Industry)
    MATCH (peer:Organization)-[:BELONGS_TO_INDUSTRY]->(ind)
    WHERE peer.id <> $orgId
      AND peer.maturityLevel IS NOT NULL
      AND org.maturityLevel IS NOT NULL

    WITH peer, org,
         abs(peer.maturityLevel - org.maturityLevel) as levelDiff,
         abs(toFloat(peer.employeeCount) - toFloat(org.employeeCount)) /
         CASE WHEN org.employeeCount > 0 THEN toFloat(org.employeeCount) ELSE 1.0 END as sizeDiff

    WITH peer,
         1.0 - (levelDiff / 9.0) as levelSimilarity,
         1.0 - CASE WHEN sizeDiff > 1.0 THEN 1.0 ELSE sizeDiff END as sizeSimilarity

    WITH peer,
         (levelSimilarity * 0.7 + sizeSimilarity * 0.3) as similarity

    RETURN peer.id as id, peer.name as name,
           peer.maturityLevel as maturityLevel,
           similarity
    ORDER BY similarity DESC
    LIMIT $limit
  `

  const result = await executeRead<{
    id: string
    name: string
    maturityLevel: number
    similarity: number
  }>(query, { orgId: organizationId, limit })

  return result
}

/**
 * Track technology adoption across assessments
 */
export async function trackTechnologyAdoption(
  organizationId: string
): Promise<Array<{
  technology: string
  firstSeen: string
  lastSeen: string
  assessmentCount: number
}>> {
  const query = `
    MATCH (o:Organization {id: $orgId})-[:HAS_ASSESSMENT]->(s:AssessmentSnapshot)
    UNWIND s.answers as answer
    WITH answer.technology as tech, s.completedAt as date
    WHERE tech IS NOT NULL

    RETURN tech as technology,
           min(date) as firstSeen,
           max(date) as lastSeen,
           count(*) as assessmentCount
    ORDER BY firstSeen ASC
  `

  const result = await executeRead<{
    technology: string
    firstSeen: string
    lastSeen: string
    assessmentCount: number
  }>(query, { orgId: organizationId })

  return result
}

/**
 * Get maturity level distribution across industry
 */
export async function getIndustryMaturityDistribution(
  industry: string
): Promise<Array<{
  level: number
  count: number
  percentage: number
}>> {
  const query = `
    MATCH (ind:Industry {name: $industry})<-[:BELONGS_TO_INDUSTRY]-(o:Organization)
    WHERE o.maturityLevel IS NOT NULL

    WITH count(o) as total
    MATCH (ind:Industry {name: $industry})<-[:BELONGS_TO_INDUSTRY]-(o:Organization)
    WHERE o.maturityLevel IS NOT NULL

    RETURN o.maturityLevel as level,
           count(o) as count,
           (toFloat(count(o)) / toFloat(total) * 100.0) as percentage
    ORDER BY level ASC
  `

  const result = await executeRead<{
    level: number
    count: number
    percentage: number
  }>(query, { industry })

  return result
}

/**
 * Create relationships between users and organizations
 */
export async function linkUserToOrganization(
  userId: string,
  organizationId: string,
  role: string
): Promise<void> {
  const supabase = await createClient()

  // Get user data
  const { data: user } = await supabase
    .from('users')
    .select('email, full_name')
    .eq('id', userId)
    .single()

  if (!user) {
    throw new Error(`User not found: ${userId}`)
  }

  const query = `
    MERGE (u:User {id: $userId})
    SET u.email = $email,
        u.fullName = $fullName,
        u.updatedAt = datetime()
    ON CREATE SET u.createdAt = datetime()

    WITH u
    MATCH (o:Organization {id: $orgId})
    MERGE (u)-[r:MEMBER_OF {role: $role}]->(o)
    SET r.linkedAt = datetime()
  `

  await executeWrite(query, {
    userId,
    email: user.email,
    fullName: user.full_name,
    orgId: organizationId,
    role,
  })
}

/**
 * Get organization's network of relationships
 */
export async function getOrganizationNetwork(
  organizationId: string
): Promise<{
  organization: DigitalTwinNode
  members: Array<{ id: string; email: string; role: string }>
  assessments: Array<{ id: string; score: number; completedAt: string }>
  peers: Array<{ id: string; name: string; similarity: number }>
}> {
  // Get organization node
  const orgQuery = `
    MATCH (o:Organization {id: $orgId})
    RETURN o.id as id, o.name as name, o.domain as domain,
           o.maturityLevel as maturityLevel, o.createdAt as createdAt,
           o.updatedAt as updatedAt
  `
  const orgResult = await executeRead<DigitalTwinNode>(orgQuery, { orgId: organizationId })

  // Get members
  const membersQuery = `
    MATCH (u:User)-[r:MEMBER_OF]->(o:Organization {id: $orgId})
    RETURN u.id as id, u.email as email, r.role as role
  `
  const membersResult = await executeRead<{ id: string; email: string; role: string }>(
    membersQuery,
    { orgId: organizationId }
  )

  // Get assessments
  const assessmentsQuery = `
    MATCH (o:Organization {id: $orgId})-[:HAS_ASSESSMENT]->(s:AssessmentSnapshot)
    RETURN s.id as id, s.score as score, s.completedAt as completedAt
    ORDER BY s.completedAt DESC
    LIMIT 10
  `
  const assessmentsResult = await executeRead<{
    id: string
    score: number
    completedAt: string
  }>(assessmentsQuery, { orgId: organizationId })

  // Get peers
  const peers = await findSimilarOrganizations(organizationId, 5)

  return {
    organization: orgResult[0],
    members: membersResult,
    assessments: assessmentsResult,
    peers,
  }
}

/**
 * Delete organization's digital twin and all related data
 */
export async function deleteDigitalTwin(organizationId: string): Promise<void> {
  const query = `
    MATCH (o:Organization {id: $orgId})
    OPTIONAL MATCH (o)-[r1]-()
    OPTIONAL MATCH (o)-[:HAS_ASSESSMENT]->(s:AssessmentSnapshot)
    OPTIONAL MATCH (s)-[r2]-()
    DELETE r1, r2, s, o
  `

  await executeWrite(query, { orgId: organizationId })
}
