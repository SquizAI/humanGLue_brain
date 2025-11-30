/**
 * GET /api/outreach/prospects
 * Retrieve prospects from the Neo4j graph database
 *
 * Query params:
 * - type: Filter by prospect type (expert, instructor, student, partner)
 * - limit: Max number to return (default 50)
 * - search: Search by name
 */

import { NextRequest, NextResponse } from 'next/server'
import { executeRead } from '@/lib/neo4j/client'

interface ProspectRecord {
  id: string
  name: string
  title?: string
  company?: string
  email?: string
  linkedinUrl?: string
  websiteUrl?: string
  bio?: string
  achievements: string[]
  expertise: string[]
  publications?: string[]
  socialProof: string[]
  prospectType?: string
  researchedAt?: string
  createdAt?: string
  updatedAt?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const search = searchParams.get('search')

    let query = `
      MATCH (p:Prospect)
      ${type ? 'WHERE p.prospectType = $type' : ''}
      ${search ? (type ? 'AND' : 'WHERE') + ' toLower(p.name) CONTAINS toLower($search)' : ''}
      OPTIONAL MATCH (p)-[:WORKS_AT]->(c:Company)
      OPTIONAL MATCH (p)-[:HAS_EXPERTISE]->(e:Expertise)
      WITH p, c, collect(DISTINCT e.name) as expertiseList
      RETURN p {
        .id, .name, .title, .email, .linkedinUrl, .websiteUrl,
        .bio, .achievements, .publications, .socialProof,
        .prospectType, .researchedAt, .createdAt, .updatedAt,
        company: c.name,
        expertise: expertiseList
      } as prospect
      ORDER BY p.updatedAt DESC
      LIMIT $limit
    `

    const results = await executeRead<{ prospect: ProspectRecord }>(query, {
      type,
      search,
      limit,
    })

    const prospects = results.map(r => r.prospect).filter(Boolean)

    return NextResponse.json({
      success: true,
      prospects,
      count: prospects.length,
    })

  } catch (error) {
    console.error('[Outreach Prospects] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve prospects',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/outreach/prospects
 * Delete a prospect from the Neo4j graph database
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const name = searchParams.get('name')

    if (!id && !name) {
      return NextResponse.json(
        { success: false, error: 'Either id or name is required' },
        { status: 400 }
      )
    }

    const query = `
      MATCH (p:Prospect)
      WHERE ${id ? 'p.id = $id' : 'p.name = $name'}
      DETACH DELETE p
      RETURN count(p) as deleted
    `

    const results = await executeRead<{ deleted: number }>(query, { id, name })

    return NextResponse.json({
      success: true,
      deleted: results[0]?.deleted || 0,
    })

  } catch (error) {
    console.error('[Outreach Prospects] Delete error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete prospect',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
