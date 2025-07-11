import { Handler } from '@netlify/functions'

export const handler: Handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { url, companyName } = JSON.parse(event.body || '{}')
    
    if (!url || !companyName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'URL and company name are required' })
      }
    }
    
    // Use Firecrawl to get actual website content
    const content = await fetchWebsiteContent(url)
    const insights = analyzeContent(content, companyName, url)
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(insights)
    }
  } catch (error) {
    console.error('Website analysis error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to analyze website' })
    }
  }
}

async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY
    
    if (!firecrawlApiKey) {
      console.warn('Firecrawl API key not found, using mock content')
      // Return generic content if no API key
      return `
        Leading organization focused on delivering exceptional value to customers and stakeholders.
        We leverage innovative approaches and technology to drive growth and transformation.
        Our team of dedicated professionals is committed to excellence and continuous improvement.
        Building a culture of innovation, collaboration, and data-driven decision making.
        Focused on sustainable growth and creating positive impact in our community.
      `
    }
    
    console.log('Fetching content for:', url)
    
    // Use Firecrawl API to scrape the website
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 2000, // Wait 2 seconds for dynamic content
      }),
    })
    
    if (!response.ok) {
      console.error('Firecrawl API error:', response.status, response.statusText)
      throw new Error(`Firecrawl API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success && data.data && data.data.markdown) {
      console.log('Successfully scraped website content')
      return data.data.markdown
    } else {
      console.warn('No content found in Firecrawl response')
      throw new Error('No content found')
    }
  } catch (error) {
    console.error('Error fetching website content:', error)
    // Return fallback content on error
    return `
      Leading organization focused on delivering exceptional value to customers and stakeholders.
      We leverage innovative approaches and technology to drive growth and transformation.
      Our team of dedicated professionals is committed to excellence and continuous improvement.
      Building a culture of innovation, collaboration, and data-driven decision making.
      Focused on sustainable growth and creating positive impact in our community.
    `
  }
}

function analyzeContent(content: string, companyName: string, url: string) {
  // Extract insights from content
  const industry = detectIndustry(content)
  const aiReadiness = assessAIReadiness(content)
  const techStack = extractTechStack(content)
  
  // Build insights that can be industry-specific or generic
  const keyInsights = []
  
  // Add industry insight if detected
  if (industry !== 'General Business') {
    keyInsights.push(`${companyName} operates in the ${industry} sector with ${aiReadiness.score > 60 ? 'strong' : 'growing'} AI transformation potential`)
  } else {
    keyInsights.push(`${companyName} has ${aiReadiness.score > 60 ? 'strong' : 'growing'} potential for AI-driven transformation`)
  }
  
  // Tech stack insight
  keyInsights.push(
    techStack.length > 0 
      ? `Digital capabilities include ${techStack.slice(0, 3).join(', ')}` 
      : 'Opportunities to enhance digital infrastructure'
  )
  
  // AI readiness insight
  keyInsights.push(`Current AI readiness: ${aiReadiness.score}% - ${aiReadiness.score > 60 ? 'ready to scale' : 'perfect time to start'}`)
  
  return {
    companyName,
    url,
    industry: industry !== 'General Business' ? industry : undefined,
    description: industry !== 'General Business' 
      ? `${companyName} is a ${industry.toLowerCase()} organization focused on innovation and growth`
      : `${companyName} is focused on delivering value through innovation and growth`,
    teamSize: extractTeamSize(content),
    techStack,
    aiReadiness,
    keyInsights,
    recommendations: generateRecommendations(aiReadiness.score, industry)
  }
}

function detectIndustry(content: string): string {
  const lower = content.toLowerCase()
  
  // Check for specific industry keywords
  if (lower.includes('fitness') || lower.includes('gym') || lower.includes('wellness') || lower.includes('exercise') || lower.includes('workout')) return 'Fitness & Wellness'
  if (lower.includes('software') || lower.includes('saas') || lower.includes('platform') || lower.includes('developer')) return 'Technology'
  if (lower.includes('health') || lower.includes('medical') || lower.includes('patient') || lower.includes('clinical')) return 'Healthcare'
  if (lower.includes('finance') || lower.includes('banking') || lower.includes('investment') || lower.includes('fintech')) return 'Finance'
  if (lower.includes('retail') || lower.includes('ecommerce') || lower.includes('shopping') || lower.includes('store')) return 'Retail'
  if (lower.includes('education') || lower.includes('learning') || lower.includes('training') || lower.includes('academic')) return 'Education'
  if (lower.includes('manufacturing') || lower.includes('production') || lower.includes('factory') || lower.includes('industrial')) return 'Manufacturing'
  if (lower.includes('hospitality') || lower.includes('hotel') || lower.includes('restaurant') || lower.includes('tourism')) return 'Hospitality'
  
  // Return generic if no specific industry detected
  return 'General Business'
}

function assessAIReadiness(content: string): { score: number; indicators: string[] } {
  const indicators: string[] = []
  let score = 40 // Base score
  
  const lower = content.toLowerCase()
  
  if (lower.includes('artificial intelligence') || lower.includes(' ai ')) {
    indicators.push('AI initiatives mentioned')
    score += 20
  }
  
  if (lower.includes('machine learning') || lower.includes(' ml ')) {
    indicators.push('ML capabilities present')
    score += 15
  }
  
  if (lower.includes('data-driven') || lower.includes('analytics')) {
    indicators.push('Data-driven culture')
    score += 10
  }
  
  if (lower.includes('cloud') || lower.includes('api')) {
    indicators.push('Modern infrastructure')
    score += 10
  }
  
  if (lower.includes('transform') || lower.includes('innovation')) {
    indicators.push('Innovation mindset')
    score += 5
  }
  
  return {
    score: Math.min(score, 95),
    indicators
  }
}

function extractTechStack(content: string): string[] {
  const techKeywords = [
    'React', 'Angular', 'Vue', 'Node.js', 'Python', 'Java', 'AWS', 'Azure', 
    'Google Cloud', 'Docker', 'Kubernetes', 'AI', 'Machine Learning', 'API',
    'Microservices', 'Cloud', 'SaaS', 'Mobile', 'Analytics', 'Blockchain'
  ]
  
  return techKeywords.filter(tech => 
    content.toLowerCase().includes(tech.toLowerCase())
  )
}

function extractTeamSize(content: string): string {
  const match = content.match(/(\d+)\+?\s*(employees|people|professionals)/i)
  if (match) {
    const size = parseInt(match[1])
    if (size < 100) return '50-100 employees'
    if (size < 500) return '100-500 employees'
    if (size < 5000) return '500-5,000 employees'
    return '5,000+ employees'
  }
  return 'Not specified'
}

function generateRecommendations(aiScore: number, industry?: string): string[] {
  const baseRecs = []
  
  // Base recommendations based on AI readiness score
  if (aiScore < 50) {
    baseRecs.push('Start with AI literacy programs for leadership')
    baseRecs.push('Conduct comprehensive data infrastructure assessment')
    baseRecs.push('Develop AI governance framework and ethical guidelines')
    baseRecs.push('Identify quick-win AI use cases for your organization')
    baseRecs.push('Build cross-functional AI transformation team')
  } else if (aiScore < 75) {
    baseRecs.push('Scale existing AI pilots across departments')
    baseRecs.push('Implement MLOps best practices for production AI')
    baseRecs.push('Create AI center of excellence')
    baseRecs.push('Develop employee AI skills training program')
    baseRecs.push('Establish AI performance metrics and KPIs')
  } else {
    baseRecs.push('Focus on AI-driven innovation and new business models')
    baseRecs.push('Develop proprietary AI solutions for competitive advantage')
    baseRecs.push('Lead organizational transformation through AI')
    baseRecs.push('Create AI partnership ecosystem')
    baseRecs.push('Implement advanced AI governance and ethics framework')
  }
  
  // Add industry-specific recommendations if industry is detected
  if (industry && industry !== 'General Business') {
    if (industry === 'Fitness & Wellness') {
      baseRecs.push('Implement AI for personalized workout plans and nutrition')
      baseRecs.push('Use predictive analytics for member retention')
    } else if (industry === 'Healthcare') {
      baseRecs.push('Ensure HIPAA compliance for AI systems')
      baseRecs.push('Explore AI for clinical decision support')
    } else if (industry === 'Finance') {
      baseRecs.push('Implement AI for risk assessment and fraud detection')
      baseRecs.push('Explore AI-driven customer insights')
    } else if (industry === 'Retail') {
      baseRecs.push('Deploy AI for personalization and inventory optimization')
      baseRecs.push('Implement predictive analytics for demand forecasting')
    } else if (industry === 'Technology') {
      baseRecs.push('Integrate AI into product development lifecycle')
      baseRecs.push('Build AI-powered developer productivity tools')
    } else if (industry === 'Education') {
      baseRecs.push('Implement AI for personalized learning paths')
      baseRecs.push('Use analytics to improve student outcomes')
    }
  }
  
  return baseRecs.slice(0, 5)
} 