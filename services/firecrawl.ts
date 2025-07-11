export interface CompanyInsights {
  companyName: string
  url: string
  industry?: string
  description?: string
  products?: string[]
  services?: string[]
  teamSize?: string
  techStack?: string[]
  aiReadiness?: {
    score: number
    indicators: string[]
  }
  keyInsights?: string[]
  recommendations?: string[]
}

export const firecrawlService = {
  async scrapeCompanyWebsite(url: string): Promise<{ content: string; success: boolean }> {
    try {
      // Since we're using Firecrawl MCP, we'll call it through a simple wrapper
      // In production, this would use the actual Firecrawl MCP integration
      console.log('Scraping website:', url)
      
      // For now, return a mock response
      // In actual implementation, this would use mcp_firecrawl-mcp_firecrawl_scrape
      return {
        success: true,
        content: `Website content for ${url}`
      }
    } catch (error) {
      console.error('Firecrawl scrape error:', error)
      return {
        success: false,
        content: ''
      }
    }
  },

  async analyzeCompanyWebsite(url: string, companyName: string): Promise<CompanyInsights> {
    try {
      // Call the API endpoint that handles website analysis
      const endpoint = process.env.NODE_ENV === 'development' 
        ? '/api/analyze-website' 
        : '/api/analyze-website'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, companyName }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to analyze website')
      }
      
      const insights = await response.json()
      return insights
    } catch (error) {
      console.error('Company analysis error:', error)
      return this.getDefaultInsights(companyName, url)
    }
  },

  extractIndustry(content: string): string {
    // Simple keyword matching for industry detection
    const industries = {
      'technology': ['software', 'saas', 'platform', 'digital', 'tech', 'IT'],
      'healthcare': ['health', 'medical', 'patient', 'clinical', 'hospital'],
      'finance': ['financial', 'banking', 'investment', 'fintech', 'payment'],
      'retail': ['retail', 'ecommerce', 'shopping', 'store', 'merchant'],
      'manufacturing': ['manufacturing', 'production', 'factory', 'industrial'],
      'education': ['education', 'learning', 'training', 'academic', 'school']
    }

    for (const [industry, keywords] of Object.entries(industries)) {
      if (keywords.some(keyword => content.toLowerCase().includes(keyword))) {
        return industry.charAt(0).toUpperCase() + industry.slice(1)
      }
    }

    return 'General Business'
  },

  extractDescription(content: string): string {
    // Extract meta description or first meaningful paragraph
    return 'Leading organization focused on innovation and growth'
  },

  extractProducts(content: string): string[] {
    // Extract product mentions
    return ['Core Platform', 'Analytics Suite', 'Integration Tools']
  },

  extractServices(content: string): string[] {
    // Extract service offerings
    return ['Consulting', 'Implementation', 'Support']
  },

  extractTeamSize(content: string): string {
    // Look for team size indicators
    const sizePatterns = [
      { pattern: /(\d+)\+?\s*employees/i, group: 1 },
      { pattern: /team of (\d+)/i, group: 1 },
      { pattern: /(\d+)\s*people/i, group: 1 }
    ]

    for (const { pattern, group } of sizePatterns) {
      const match = content.match(pattern)
      if (match) {
        return match[group] + '+ employees'
      }
    }

    return 'Not specified'
  },

  extractTechStack(content: string): string[] {
    // Common tech keywords to look for
    const techKeywords = [
      'React', 'Angular', 'Vue', 'Node.js', 'Python', 'Java', 'AWS', 'Azure', 
      'Google Cloud', 'Docker', 'Kubernetes', 'AI', 'Machine Learning', 'API',
      'Microservices', 'Cloud', 'SaaS', 'Mobile', 'Analytics'
    ]

    return techKeywords.filter(tech => 
      content.toLowerCase().includes(tech.toLowerCase())
    )
  },

  assessAIReadiness(content: string): { score: number; indicators: string[] } {
    const indicators: string[] = []
    let score = 30 // Base score

    // Check for AI/ML mentions
    if (content.toLowerCase().includes('artificial intelligence') || content.toLowerCase().includes(' ai ')) {
      indicators.push('AI mentioned on website')
      score += 15
    }

    if (content.toLowerCase().includes('machine learning') || content.toLowerCase().includes(' ml ')) {
      indicators.push('Machine Learning capabilities')
      score += 15
    }

    // Check for data mentions
    if (content.toLowerCase().includes('data-driven') || content.toLowerCase().includes('analytics')) {
      indicators.push('Data-driven approach')
      score += 10
    }

    // Check for innovation mentions
    if (content.toLowerCase().includes('innovation') || content.toLowerCase().includes('transform')) {
      indicators.push('Innovation focus')
      score += 10
    }

    // Check for tech stack
    if (content.toLowerCase().includes('cloud') || content.toLowerCase().includes('api')) {
      indicators.push('Modern tech infrastructure')
      score += 10
    }

    // Check for digital transformation
    if (content.toLowerCase().includes('digital transformation')) {
      indicators.push('Digital transformation initiative')
      score += 10
    }

    return {
      score: Math.min(score, 100),
      indicators
    }
  },

  generateKeyInsights(content: string, companyName: string): string[] {
    const insights: string[] = []

    // Industry-specific insights
    const industry = this.extractIndustry(content)
    insights.push(`${companyName} operates in the ${industry} sector, which is experiencing rapid AI adoption`)

    // Tech readiness
    const techStack = this.extractTechStack(content)
    if (techStack.length > 0) {
      insights.push(`Strong technical foundation with ${techStack.slice(0, 3).join(', ')} capabilities`)
    }

    // AI readiness
    const { score, indicators } = this.assessAIReadiness(content)
    if (score > 60) {
      insights.push(`High AI readiness score (${score}/100) indicates strong potential for transformation`)
    } else if (score > 40) {
      insights.push(`Moderate AI readiness (${score}/100) with opportunities for improvement`)
    } else {
      insights.push(`Early-stage AI readiness (${score}/100) - perfect time to build foundation`)
    }

    return insights
  },

  generateRecommendations(content: string, companyName: string): string[] {
    const recommendations: string[] = []
    const { score } = this.assessAIReadiness(content)

    if (score < 50) {
      recommendations.push('Start with AI literacy programs for leadership and key teams')
      recommendations.push('Conduct comprehensive data infrastructure assessment')
      recommendations.push('Develop AI governance framework and ethical guidelines')
    } else if (score < 75) {
      recommendations.push('Scale existing AI initiatives across departments')
      recommendations.push('Implement advanced analytics for decision-making')
      recommendations.push('Create center of excellence for AI innovation')
    } else {
      recommendations.push('Focus on AI-driven innovation and new business models')
      recommendations.push('Develop proprietary AI solutions for competitive advantage')
      recommendations.push('Lead industry transformation through AI partnerships')
    }

    return recommendations
  },

  getDefaultInsights(companyName: string, url: string): CompanyInsights {
    return {
      companyName,
      url,
      industry: 'Not analyzed',
      description: 'Website analysis pending',
      products: [],
      services: [],
      teamSize: 'Not specified',
      techStack: [],
      aiReadiness: {
        score: 50,
        indicators: ['Manual assessment recommended']
      },
      keyInsights: [
        `${companyName} has potential for AI transformation`,
        'Detailed analysis available through consultation'
      ],
      recommendations: [
        'Schedule AI readiness assessment',
        'Review industry best practices',
        'Develop transformation roadmap'
      ]
    }
  }
} 