/**
 * POST /api/outreach/research
 * Research a prospect using web scraping and AI analysis
 * Supports deep research mode and Neo4j graph storage
 *
 * Input: { linkedinUrl?: string, websiteUrl?: string, name: string, deepResearch?: boolean, storeInGraph?: boolean }
 * Output: { prospect: ProspectProfile, suggestedEmail: GeneratedEmail, storedInGraph?: boolean }
 */

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { executeWrite, executeRead } from '@/lib/neo4j/client'
import { v4 as uuidv4 } from 'uuid'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ProspectProfile {
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
  rawData: string
  researchedAt: string
  prospectType?: 'expert' | 'instructor' | 'student' | 'partner'
}

interface ScrapedContent {
  url: string
  content: string
  title?: string
}

// Deep research using Firecrawl's comprehensive search
async function deepResearch(name: string, company?: string): Promise<ScrapedContent[]> {
  const results: ScrapedContent[] = []

  // Multiple search queries to gather comprehensive information
  const searchQueries = [
    `${name}${company ? ` ${company}` : ''} professional background`,
    `${name} achievements awards recognition`,
    `${name} publications articles interviews`,
    `${name} AI artificial intelligence machine learning`,
    `${name} speaking conferences keynote`,
  ]

  console.log(`[Outreach Research] Deep research with ${searchQueries.length} queries`)

  for (const query of searchQueries) {
    try {
      const response = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit: 3,
          scrapeOptions: {
            formats: ['markdown'],
            onlyMainContent: true,
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const searchResults = (data.data || []).map((result: any) => ({
          url: result.url,
          content: result.markdown || result.description || '',
          title: result.title,
        }))
        results.push(...searchResults)
      }
    } catch (error) {
      console.error(`[Outreach Research] Deep search query failed: ${query}`, error)
    }
  }

  // Deduplicate by URL
  const uniqueResults = results.filter((item, index, self) =>
    index === self.findIndex((t) => t.url === item.url)
  )

  console.log(`[Outreach Research] Deep research found ${uniqueResults.length} unique sources`)
  return uniqueResults
}

// Store prospect profile in Neo4j graph database
async function storeProspectInGraph(profile: ProspectProfile): Promise<boolean> {
  try {
    // Create or update the Prospect node with all properties
    const query = `
      MERGE (p:Prospect {name: $name})
      ON CREATE SET
        p.id = $id,
        p.createdAt = datetime(),
        p.updatedAt = datetime()
      ON MATCH SET
        p.updatedAt = datetime()
      SET
        p.title = $title,
        p.company = $company,
        p.email = $email,
        p.linkedinUrl = $linkedinUrl,
        p.websiteUrl = $websiteUrl,
        p.bio = $bio,
        p.achievements = $achievements,
        p.expertise = $expertise,
        p.publications = $publications,
        p.socialProof = $socialProof,
        p.prospectType = $prospectType,
        p.researchedAt = $researchedAt

      // Create Company node if company exists
      WITH p
      WHERE $company IS NOT NULL AND $company <> ''
      MERGE (c:Company {name: $company})
      MERGE (p)-[:WORKS_AT]->(c)

      // Create Expertise nodes and relationships
      WITH p
      UNWIND $expertise AS expertiseItem
      MERGE (e:Expertise {name: expertiseItem})
      MERGE (p)-[:HAS_EXPERTISE]->(e)

      RETURN p.id as id
    `

    await executeWrite(query, {
      id: profile.id,
      name: profile.name,
      title: profile.title || null,
      company: profile.company || null,
      email: profile.email || null,
      linkedinUrl: profile.linkedinUrl || null,
      websiteUrl: profile.websiteUrl || null,
      bio: profile.bio || null,
      achievements: profile.achievements || [],
      expertise: profile.expertise || [],
      publications: profile.publications || [],
      socialProof: profile.socialProof || [],
      prospectType: profile.prospectType || 'expert',
      researchedAt: profile.researchedAt,
    })

    console.log(`[Outreach Research] Stored prospect in Neo4j: ${profile.name}`)
    return true
  } catch (error) {
    console.error('[Outreach Research] Failed to store prospect in Neo4j:', error)
    return false
  }
}

// Check if prospect already exists in graph
async function findExistingProspect(name: string): Promise<ProspectProfile | null> {
  try {
    const query = `
      MATCH (p:Prospect {name: $name})
      OPTIONAL MATCH (p)-[:WORKS_AT]->(c:Company)
      OPTIONAL MATCH (p)-[:HAS_EXPERTISE]->(e:Expertise)
      RETURN p {
        .id, .name, .title, .email, .linkedinUrl, .websiteUrl,
        .bio, .achievements, .publications, .socialProof,
        .prospectType, .researchedAt,
        company: c.name,
        expertise: collect(DISTINCT e.name)
      } as prospect
    `

    const results = await executeRead<{ prospect: any }>(query, { name })

    if (results.length > 0 && results[0].prospect) {
      const p = results[0].prospect
      return {
        id: p.id,
        name: p.name,
        title: p.title,
        company: p.company,
        email: p.email,
        linkedinUrl: p.linkedinUrl,
        websiteUrl: p.websiteUrl,
        bio: p.bio,
        achievements: p.achievements || [],
        expertise: p.expertise || [],
        publications: p.publications || [],
        socialProof: p.socialProof || [],
        prospectType: p.prospectType,
        researchedAt: p.researchedAt,
        rawData: '',
      }
    }

    return null
  } catch (error) {
    console.error('[Outreach Research] Failed to find existing prospect:', error)
    return null
  }
}

// Scrape a URL using Firecrawl
async function scrapeUrl(url: string): Promise<ScrapedContent | null> {
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    })

    if (!response.ok) {
      console.error(`[Outreach Research] Firecrawl error for ${url}:`, response.status)
      return null
    }

    const data = await response.json()
    return {
      url,
      content: data.data?.markdown || '',
      title: data.data?.metadata?.title,
    }
  } catch (error) {
    console.error(`[Outreach Research] Error scraping ${url}:`, error)
    return null
  }
}

// Search for additional information about the prospect
async function searchProspect(name: string, company?: string): Promise<ScrapedContent[]> {
  try {
    const query = company ? `${name} ${company}` : name
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 5,
      }),
    })

    if (!response.ok) {
      console.error('[Outreach Research] Firecrawl search error:', response.status)
      return []
    }

    const data = await response.json()
    return (data.data || []).map((result: any) => ({
      url: result.url,
      content: result.markdown || result.description || '',
      title: result.title,
    }))
  } catch (error) {
    console.error('[Outreach Research] Search error:', error)
    return []
  }
}

// Use AI to extract structured profile from scraped content
async function extractProfile(
  name: string,
  scrapedContent: ScrapedContent[],
  prospectType: 'expert' | 'instructor' | 'student' | 'partner' = 'expert'
): Promise<ProspectProfile> {
  const combinedContent = scrapedContent
    .map(s => `## Source: ${s.url}\n${s.content}`)
    .join('\n\n---\n\n')

  const sourceUrls = scrapedContent.map(s => s.url)

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a research analyst extracting professional information about a person.
Extract structured data from the provided content. Be thorough but accurate - only include information that is clearly stated.

Return a JSON object with these fields:
- name: Full name
- title: Current job title
- company: Current company/organization
- bio: Brief professional bio (2-3 sentences)
- achievements: Array of notable achievements, awards, or recognitions
- expertise: Array of areas of expertise or skills
- publications: Array of books, articles, or notable publications
- socialProof: Array of impressive stats (followers, citations, features, etc.)
- aiRelevance: Array of any AI/ML-related experience, projects, or interests
- connectionOpportunities: Array of potential ways to connect (shared interests, mutual connections, recent news)

Be specific and quote numbers/stats when available. Focus on impressive, verifiable facts.
Look for any AI transformation, digital innovation, or technology leadership angles.`
      },
      {
        role: 'user',
        content: `Extract professional information for ${name} from the following scraped content:\n\n${combinedContent.slice(0, 20000)}`
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  const extracted = JSON.parse(response.choices[0]?.message?.content || '{}')

  return {
    id: uuidv4(),
    name: extracted.name || name,
    title: extracted.title,
    company: extracted.company,
    bio: extracted.bio,
    achievements: extracted.achievements || [],
    expertise: extracted.expertise || [],
    publications: extracted.publications || [],
    socialProof: extracted.socialProof || [],
    rawData: combinedContent,
    researchedAt: new Date().toISOString(),
    prospectType,
  }
}

// Generate personalized recruitment email
async function generateRecruitmentEmail(
  profile: ProspectProfile,
  prospectType: 'expert' | 'instructor' | 'student' | 'partner',
  senderName: string,
  senderTitle: string
): Promise<{
  subject: string
  personalizedIntro: string
  discoveredFacts: string[]
  whyTheyFit: string
  opportunity: string[]
}> {
  const opportunityContext = {
    expert: {
      role: 'Expert Advisor',
      benefits: [
        'Shape our AI maturity assessment methodology',
        'Influence product direction as a founding advisor',
        'Equity participation opportunity',
        'Amplify your thought leadership through our platform',
        'Connect with enterprise clients seeking AI transformation',
      ],
    },
    instructor: {
      role: 'Instructor Partner',
      benefits: [
        'Develop and deliver premium AI training content',
        'Revenue share on course enrollments',
        'Access to our enterprise client network',
        'Co-branded certification programs',
        'Platform to reach thousands of learners',
      ],
    },
    student: {
      role: 'Beta Program Participant',
      benefits: [
        'Free access to our AI maturity assessment platform',
        'Early access to new features and tools',
        'Direct feedback channel to product team',
        'Certification upon program completion',
        'Networking with AI transformation leaders',
      ],
    },
    partner: {
      role: 'Strategic Partner',
      benefits: [
        'Joint go-to-market opportunities',
        'Revenue sharing on referred clients',
        'Co-development of AI transformation solutions',
        'Access to our growing client base',
        'Combined thought leadership initiatives',
      ],
    },
  }

  const context = opportunityContext[prospectType]

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a skilled business development writer creating personalized outreach emails for HMN.

About HMN:
- AI transformation platform measuring organizational AI maturity (0-10 scale)
- Four dimensions: People, Process, Technology, Strategy
- Founded by Alex Schwartz and Matty Squarzoni
- Mission: Help organizations achieve sustainable AI transformation

Your task: Create compelling, personalized outreach based on the prospect's profile.
Be specific, reference actual facts from their background, and show genuine understanding of their work.
Avoid generic statements - make every sentence show you've done your research.

Return JSON with:
- subject: Email subject line (compelling, specific to them)
- personalizedIntro: 2-3 paragraph intro that shows deep research (reference specific work, achievements)
- discoveredFacts: Array of 5-7 impressive facts with context (use <strong> tags for emphasis)
- whyTheyFit: 1-2 paragraphs explaining why their specific background makes them perfect
- opportunity: Array of 4-5 specific opportunities tailored to their interests`
      },
      {
        role: 'user',
        content: `Create a recruitment email for this ${prospectType}:

PROFILE:
Name: ${profile.name}
Title: ${profile.title || 'Unknown'}
Company: ${profile.company || 'Unknown'}
Bio: ${profile.bio || 'Not available'}

ACHIEVEMENTS:
${profile.achievements.join('\n') || 'None found'}

EXPERTISE:
${profile.expertise.join(', ') || 'Not specified'}

PUBLICATIONS:
${profile.publications?.join('\n') || 'None found'}

SOCIAL PROOF:
${profile.socialProof.join('\n') || 'None found'}

TARGET ROLE: ${context.role}
POSSIBLE BENEFITS TO OFFER:
${context.benefits.join('\n')}

Sender: ${senderName}, ${senderTitle}`
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  })

  const generated = JSON.parse(response.choices[0]?.message?.content || '{}')

  return {
    subject: generated.subject || `${profile.name}, Your Expertise Caught Our Attention`,
    personalizedIntro: generated.personalizedIntro || '',
    discoveredFacts: generated.discoveredFacts || profile.achievements.slice(0, 5),
    whyTheyFit: generated.whyTheyFit || '',
    opportunity: generated.opportunity || context.benefits,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      linkedinUrl,
      websiteUrl,
      email,
      prospectType = 'expert',
      senderName = 'Matty Squarzoni',
      senderTitle = 'Co-Founder & CTO, HMN',
      senderEmail = 'matty@humanglue.ai',
      deepResearch: enableDeepResearch = false,
      storeInGraph = false,
      skipCache = false,
    } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    console.log(`[Outreach Research] Researching: ${name}`)
    console.log(`[Outreach Research] Deep research: ${enableDeepResearch}, Store in graph: ${storeInGraph}`)

    // Check if we already have this prospect in Neo4j (unless skipCache)
    if (!skipCache && storeInGraph) {
      const existingProspect = await findExistingProspect(name)
      if (existingProspect) {
        console.log(`[Outreach Research] Found existing prospect in Neo4j: ${name}`)

        // Generate fresh email but use cached profile
        const emailContent = await generateRecruitmentEmail(
          existingProspect,
          prospectType,
          senderName,
          senderTitle
        )

        return NextResponse.json({
          success: true,
          prospect: {
            ...existingProspect,
            email: email || existingProspect.email,
            rawData: undefined,
          },
          suggestedEmail: {
            ...emailContent,
            recipientName: existingProspect.name,
            recipientEmail: email || existingProspect.email,
            senderName,
            senderTitle,
            senderEmail,
            prospectType,
          },
          storedInGraph: true,
          fromCache: true,
        })
      }
    }

    // Collect scraped content from multiple sources
    const scrapedContent: ScrapedContent[] = []

    // Scrape provided URLs
    if (linkedinUrl) {
      const linkedin = await scrapeUrl(linkedinUrl)
      if (linkedin) scrapedContent.push(linkedin)
    }

    if (websiteUrl) {
      const website = await scrapeUrl(websiteUrl)
      if (website) scrapedContent.push(website)
    }

    // Use deep research or standard search based on flag
    if (enableDeepResearch) {
      console.log(`[Outreach Research] Running deep research for: ${name}`)
      const deepResults = await deepResearch(name)
      scrapedContent.push(...deepResults)
    } else {
      // Standard search
      const searchResults = await searchProspect(name)
      scrapedContent.push(...searchResults)
    }

    if (scrapedContent.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Could not find any information about this prospect' },
        { status: 404 }
      )
    }

    console.log(`[Outreach Research] Found ${scrapedContent.length} sources`)

    // Extract structured profile
    const profile = await extractProfile(name, scrapedContent, prospectType)
    profile.linkedinUrl = linkedinUrl
    profile.websiteUrl = websiteUrl
    profile.email = email

    console.log(`[Outreach Research] Extracted profile for ${profile.name}`)

    // Store in Neo4j if requested
    let storedInGraph = false
    if (storeInGraph) {
      storedInGraph = await storeProspectInGraph(profile)
    }

    // Generate personalized email
    const emailContent = await generateRecruitmentEmail(
      profile,
      prospectType,
      senderName,
      senderTitle
    )

    console.log(`[Outreach Research] Generated email: ${emailContent.subject}`)

    return NextResponse.json({
      success: true,
      prospect: {
        ...profile,
        rawData: undefined, // Don't send raw data to client
      },
      suggestedEmail: {
        ...emailContent,
        recipientName: profile.name,
        recipientEmail: email,
        senderName,
        senderTitle,
        senderEmail,
        prospectType,
      },
      storedInGraph,
      sourcesCount: scrapedContent.length,
    })

  } catch (error) {
    console.error('[Outreach Research] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to research prospect',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
