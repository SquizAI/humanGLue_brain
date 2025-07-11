// Intent parser for dynamic UI modifications based on chat
export type UIIntent = 
  | 'show_assessment'
  | 'show_workshops'
  | 'show_results'
  | 'compare_solutions'
  | 'schedule_demo'
  | 'explore_case_study'
  | 'view_pricing'
  | 'customize_solution'

export interface ParsedIntent {
  type: UIIntent
  entities: Record<string, any>
  confidence: number
  suggestedAction: () => void
}

export class IntentParser {
  private patterns = {
    show_assessment: [
      /show.*assessment/i,
      /how.*assess/i,
      /tell.*about.*assessment/i,
      /what.*AI.*assessment/i
    ],
    show_workshops: [
      /workshop/i,
      /training/i,
      /team.*session/i,
      /collaborative/i
    ],
    show_results: [
      /results/i,
      /ROI/i,
      /outcomes/i,
      /success.*stories/i,
      /metrics/i
    ],
    compare_solutions: [
      /compare/i,
      /difference.*between/i,
      /which.*solution/i,
      /options/i
    ],
    schedule_demo: [
      /schedule/i,
      /book.*demo/i,
      /speak.*to.*someone/i,
      /contact/i
    ],
    explore_case_study: [
      /case.*study/i,
      /example/i,
      /similar.*company/i,
      /who.*else/i
    ],
    view_pricing: [
      /price/i,
      /cost/i,
      /how.*much/i,
      /investment/i
    ],
    customize_solution: [
      /customize/i,
      /tailor/i,
      /specific.*needs/i,
      /our.*situation/i
    ]
  }

  parseIntent(message: string): ParsedIntent | null {
    const lowerMessage = message.toLowerCase()
    
    for (const [intent, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        if (pattern.test(lowerMessage)) {
          return {
            type: intent as UIIntent,
            entities: this.extractEntities(message, intent as UIIntent),
            confidence: this.calculateConfidence(message, pattern),
            suggestedAction: () => this.getSuggestedAction(intent as UIIntent)
          }
        }
      }
    }
    
    return null
  }

  private extractEntities(message: string, intent: UIIntent): Record<string, any> {
    const entities: Record<string, any> = {}
    
    // Extract company size
    const sizeMatch = message.match(/(\d+)[\s-]*(?:to|-)[\s-]*(\d+).*employees/i)
    if (sizeMatch) {
      entities.companySize = {
        min: parseInt(sizeMatch[1]),
        max: parseInt(sizeMatch[2])
      }
    }
    
    // Extract industry
    const industries = ['technology', 'healthcare', 'finance', 'retail', 'manufacturing']
    for (const industry of industries) {
      if (message.toLowerCase().includes(industry)) {
        entities.industry = industry
      }
    }
    
    // Extract urgency
    if (/urgent|immediately|asap|quickly/i.test(message)) {
      entities.urgency = 'high'
    }
    
    return entities
  }

  private calculateConfidence(message: string, pattern: RegExp): number {
    // Simple confidence calculation based on match quality
    const match = message.match(pattern)
    if (!match) return 0
    
    const matchLength = match[0].length
    const messageLength = message.length
    const ratio = matchLength / messageLength
    
    // Boost confidence for exact matches
    if (ratio > 0.5) return 0.95
    if (ratio > 0.3) return 0.85
    return 0.75
  }

  private getSuggestedAction(intent: UIIntent): void {
    // These would trigger UI changes in the main app
    const actions: Record<UIIntent, () => void> = {
      show_assessment: () => console.log('Showing assessment details'),
      show_workshops: () => console.log('Displaying workshop information'),
      show_results: () => console.log('Presenting results and metrics'),
      compare_solutions: () => console.log('Showing solution comparison'),
      schedule_demo: () => console.log('Opening scheduling interface'),
      explore_case_study: () => console.log('Loading case studies'),
      view_pricing: () => console.log('Displaying pricing information'),
      customize_solution: () => console.log('Starting customization flow')
    }
    
    actions[intent]()
  }

  // Generate contextual suggestions based on current intent
  getContextualSuggestions(currentIntent: UIIntent | null): string[] {
    const suggestions: Record<UIIntent | 'default', string[]> = {
      default: [
        "Tell me about your AI assessment",
        "Show me some results",
        "What workshops do you offer?",
        "I need a custom solution"
      ],
      show_assessment: [
        "How long does the assessment take?",
        "What data do you analyze?",
        "Show me a sample report",
        "Compare with traditional surveys"
      ],
      show_workshops: [
        "What topics do you cover?",
        "How many people can attend?",
        "Virtual or in-person options?",
        "See workshop outcomes"
      ],
      show_results: [
        "Industry-specific metrics",
        "ROI calculator",
        "Implementation timeline",
        "Success factors"
      ],
      compare_solutions: [
        "Assessment vs Workshop focus",
        "Best for my company size",
        "Integration options",
        "Pricing comparison"
      ],
      schedule_demo: [
        "Available time slots",
        "What to expect",
        "Preparation needed",
        "Contact sales directly"
      ],
      explore_case_study: [
        "Technology companies",
        "Healthcare organizations",
        "Similar company size",
        "Transformation stories"
      ],
      view_pricing: [
        "Enterprise pricing",
        "Pilot program options",
        "Payment terms",
        "Volume discounts"
      ],
      customize_solution: [
        "Our specific challenges",
        "Integration requirements",
        "Timeline constraints",
        "Budget considerations"
      ]
    }
    
    return suggestions[currentIntent || 'default']
  }
}

export const intentParser = new IntentParser()