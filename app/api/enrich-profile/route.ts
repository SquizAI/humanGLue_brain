import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { companyName, personName, companyUrl } = await request.json()

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY

    if (!firecrawlApiKey) {
      console.warn('Firecrawl API key not found, using mock enrichment')
      return NextResponse.json({
        companyName,
        location: null,
        industry: null,
        employeeCount: null,
        description: null,
        insights: ['Unable to enrich profile - Firecrawl API key not configured']
      })
    }

    // Search for company information
    const companyData = await searchCompanyInfo(companyName, firecrawlApiKey)

    // If person name provided, enrich with LinkedIn/professional data
    let personData = null
    if (personName) {
      personData = await searchPersonInfo(personName, companyName, firecrawlApiKey)
    }

    // If company URL provided, scrape it for additional context
    let websiteData = null
    if (companyUrl) {
      websiteData = await scrapeCompanyWebsite(companyUrl, firecrawlApiKey)
    }

    // Combine all data sources
    const enrichedProfile = combineEnrichmentData(companyName, companyData, personData, websiteData)

    return NextResponse.json(enrichedProfile)
  } catch (error) {
    console.error('Profile enrichment error:', error)
    return NextResponse.json(
      { error: 'Failed to enrich profile' },
      { status: 500 }
    )
  }
}

async function searchCompanyInfo(companyName: string, apiKey: string) {
  try {
    console.log('Searching for company:', companyName)

    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `${companyName} company headquarters location industry employees`,
        limit: 5,
        sources: [{ type: 'web' }],
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true
        }
      }),
    })

    if (!response.ok) {
      console.error('Firecrawl search error:', response.status)
      return null
    }

    const data = await response.json()

    if (data.success && data.data && data.data.length > 0) {
      // Extract insights from search results
      const allContent = data.data.map((result: any) => result.markdown || '').join('\n')
      return extractCompanyInsights(allContent, companyName)
    }

    return null
  } catch (error) {
    console.error('Error searching company info:', error)
    return null
  }
}

async function searchPersonInfo(personName: string, companyName: string, apiKey: string) {
  try {
    console.log('Searching for person:', personName, 'at', companyName)

    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `${personName} ${companyName} LinkedIn executive profile`,
        limit: 3,
        sources: [{ type: 'web' }]
      }),
    })

    if (!response.ok) {
      console.error('Firecrawl person search error:', response.status)
      return null
    }

    const data = await response.json()

    if (data.success && data.data && data.data.length > 0) {
      return extractPersonInsights(data.data)
    }

    return null
  } catch (error) {
    console.error('Error searching person info:', error)
    return null
  }
}

async function scrapeCompanyWebsite(url: string, apiKey: string) {
  try {
    console.log('Scraping company website:', url)

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 2000,
      }),
    })

    if (!response.ok) {
      console.error('Firecrawl scrape error:', response.status)
      return null
    }

    const data = await response.json()

    if (data.success && data.data && data.data.markdown) {
      return data.data.markdown
    }

    return null
  } catch (error) {
    console.error('Error scraping website:', error)
    return null
  }
}

function extractCompanyInsights(content: string, companyName: string) {
  const lower = content.toLowerCase()

  // Extract location
  const locationPatterns = [
    /headquarter(?:ed|s)?\s+in\s+([^,.]+(?:,\s*[^,.]+)?)/i,
    /based\s+in\s+([^,.]+(?:,\s*[^,.]+)?)/i,
    /located\s+in\s+([^,.]+(?:,\s*[^,.]+)?)/i
  ]

  let location = null
  for (const pattern of locationPatterns) {
    const match = content.match(pattern)
    if (match) {
      location = match[1].trim()
      break
    }
  }

  // Extract industry
  const industries = [
    'technology', 'software', 'saas', 'healthcare', 'finance', 'fintech',
    'retail', 'ecommerce', 'education', 'manufacturing', 'consulting',
    'fitness', 'wellness', 'hospitality', 'real estate', 'insurance',
    'telecommunications', 'media', 'entertainment', 'energy', 'automotive'
  ]

  let industry = null
  for (const ind of industries) {
    if (lower.includes(ind)) {
      industry = ind.charAt(0).toUpperCase() + ind.slice(1)
      break
    }
  }

  // Extract employee count
  const employeeMatch = content.match(/(\d+[\d,]*)\+?\s*(?:employees|people|staff|professionals)/i)
  const employeeCount = employeeMatch ? employeeMatch[1].replace(/,/g, '') : null

  return {
    location,
    industry,
    employeeCount,
    foundInSearch: true
  }
}

function extractPersonInsights(searchResults: any[]) {
  // Extract role/title information from search results
  const allText = searchResults.map((r: any) => r.markdown || r.content || '').join(' ')

  const titlePatterns = [
    /(?:CEO|Chief Executive Officer|President|Founder|Co-Founder|Director|VP|Vice President|Manager|Head of)/i
  ]

  let title = null
  for (const pattern of titlePatterns) {
    const match = allText.match(pattern)
    if (match) {
      title = match[0]
      break
    }
  }

  return {
    title,
    foundInSearch: true
  }
}

function combineEnrichmentData(
  companyName: string,
  companyData: any,
  personData: any,
  websiteData: any
) {
  const insights: string[] = []

  // Build contextual insights
  if (companyData?.location) {
    insights.push(`${companyName} is headquartered in ${companyData.location}`)
  }

  if (companyData?.industry) {
    insights.push(`Operating in the ${companyData.industry} sector`)
  }

  if (companyData?.employeeCount) {
    const count = parseInt(companyData.employeeCount)
    let size = 'mid-size'
    if (count < 100) size = 'small to mid-size'
    else if (count > 1000) size = 'large-scale'
    insights.push(`A ${size} organization with approximately ${companyData.employeeCount}+ employees`)
  }

  if (personData?.title) {
    insights.push(`Leadership role identified: ${personData.title}`)
  }

  return {
    companyName,
    location: companyData?.location || null,
    industry: companyData?.industry || null,
    employeeCount: companyData?.employeeCount || null,
    personTitle: personData?.title || null,
    insights,
    enriched: !!(companyData || personData || websiteData)
  }
}
