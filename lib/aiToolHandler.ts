/**
 * AI Tool Handler - Executes actions requested by the AI assistant
 */

export interface AITool {
  name: string
  params?: Record<string, string>
}

export interface ToolExecutionResult {
  success: boolean
  action?: string
  message?: string
  data?: any
}

export class AIToolHandler {
  private onShowROI?: () => void
  private onScheduleDemo?: () => void
  private onStartAssessment?: () => void
  private onNavigate?: (page: string) => void

  constructor(callbacks: {
    onShowROI?: () => void
    onScheduleDemo?: () => void
    onStartAssessment?: () => void
    onNavigate?: (page: string) => void
  }) {
    this.onShowROI = callbacks.onShowROI
    this.onScheduleDemo = callbacks.onScheduleDemo
    this.onStartAssessment = callbacks.onStartAssessment
    this.onNavigate = callbacks.onNavigate
  }

  async executeTool(tool: AITool): Promise<ToolExecutionResult> {
    console.log('Executing AI tool:', tool.name, tool.params)

    switch (tool.name) {
      case 'show_roi_calculator':
        return this.showROICalculator()

      case 'schedule_demo':
        return this.scheduleDemo()

      case 'start_assessment':
        return this.startAssessment()

      case 'explain_solution':
        return this.explainSolution(tool.params?.solution_id)

      case 'show_case_study':
        return this.showCaseStudy(tool.params?.industry)

      case 'navigate_to':
        return this.navigateTo(tool.params?.page)

      default:
        return {
          success: false,
          message: `Unknown tool: ${tool.name}`
        }
    }
  }

  private showROICalculator(): ToolExecutionResult {
    if (this.onShowROI) {
      this.onShowROI()
      return {
        success: true,
        action: 'show_roi',
        message: 'Opening ROI calculator...'
      }
    }
    return {
      success: false,
      message: 'ROI calculator not available'
    }
  }

  private scheduleDemo(): ToolExecutionResult {
    if (this.onScheduleDemo) {
      this.onScheduleDemo()
      return {
        success: true,
        action: 'schedule_demo',
        message: 'Opening scheduling link...'
      }
    }
    // Fallback to opening Calendly
    window.open('https://calendly.com/humanglue/demo', '_blank')
    return {
      success: true,
      action: 'schedule_demo',
      message: 'Opening demo scheduling...'
    }
  }

  private startAssessment(): ToolExecutionResult {
    if (this.onStartAssessment) {
      this.onStartAssessment()
      return {
        success: true,
        action: 'start_assessment',
        message: 'Starting your AI maturity assessment...'
      }
    }
    return {
      success: false,
      message: 'Assessment not available'
    }
  }

  private explainSolution(solutionId?: string): ToolExecutionResult {
    const solutions = {
      assessment: {
        title: 'AI Maturity Assessment',
        description: 'Our AI-powered assessment analyzes your organization across 10 critical dimensions to reveal your true AI readiness. Unlike traditional surveys, this is a natural conversation that adapts to your responses.',
        benefits: [
          'Detailed scoring across 10 transformation dimensions',
          'Personalized roadmap with prioritized next steps',
          'ROI projections for recommended initiatives',
          'Comprehensive PDF report emailed to you'
        ],
        timeline: '10-15 minutes',
        pricing: 'FREE to start'
      },
      workshops: {
        title: 'Live Workshops & Strategic Sessions',
        description: 'Interactive, hands-on workshops that build AI literacy and transformation capabilities across your organization.',
        benefits: [
          'Executive alignment on AI strategy',
          'Company-wide AI literacy building',
          'Internal change champion training',
          'Industry-specific use case development'
        ],
        timeline: 'Half-day to multi-day programs',
        pricing: '$15K-50K depending on scope'
      },
      toolbox: {
        title: 'The Human Glue Toolbox',
        description: 'A comprehensive collection of 60+ tools organized into 5 categories, covering every phase of your AI transformation journey.',
        benefits: [
          'Assessment tools (readiness scorecards, culture surveys)',
          'Strategy tools (roadmap templates, ROI calculators)',
          'Implementation tools (project plans, change scripts)',
          'Adoption tools (training materials, feedback loops)',
          'Optimization tools (performance dashboards)'
        ],
        timeline: 'Immediate access',
        pricing: 'Included with transformation programs'
      }
    }

    const solution = solutionId ? solutions[solutionId as keyof typeof solutions] : null

    if (!solution) {
      return {
        success: false,
        message: 'Unknown solution'
      }
    }

    return {
      success: true,
      action: 'explain_solution',
      data: solution,
      message: `Here's detailed information about ${solution.title}`
    }
  }

  private showCaseStudy(industry?: string): ToolExecutionResult {
    const caseStudies = {
      healthcare: {
        title: 'Healthcare System AI Transformation',
        company: 'Major Regional Healthcare Network',
        challenge: 'High administrative burden, inconsistent patient outcomes, staff burnout',
        solution: 'AI-powered clinical decision support, automated patient triage, intelligent scheduling',
        results: [
          '40% reduction in administrative time',
          '25% improvement in patient satisfaction',
          '15% decrease in staff turnover',
          '$12M annual savings'
        ]
      },
      finance: {
        title: 'Financial Services AI Adoption',
        company: 'Global Investment Bank',
        challenge: 'Slow fraud detection, manual risk assessment, customer service bottlenecks',
        solution: 'Real-time fraud detection, AI-powered risk models, conversational banking',
        results: [
          '90% faster fraud detection',
          '60% more accurate risk assessment',
          '50% reduction in support tickets',
          '$25M in prevented losses'
        ]
      },
      retail: {
        title: 'Retail Chain Digital Transformation',
        company: 'National Retail Chain',
        challenge: 'Inventory waste, suboptimal pricing, poor demand forecasting',
        solution: 'AI demand forecasting, dynamic pricing, personalized recommendations',
        results: [
          '30% reduction in inventory waste',
          '20% increase in revenue per customer',
          '45% more accurate demand forecasts',
          '$50M revenue increase'
        ]
      }
    }

    const caseStudy = industry ? caseStudies[industry as keyof typeof caseStudies] : null

    if (!caseStudy) {
      return {
        success: true,
        action: 'show_case_study',
        message: 'We have success stories across healthcare, finance, retail, and manufacturing. Which industry interests you most?'
      }
    }

    return {
      success: true,
      action: 'show_case_study',
      data: caseStudy,
      message: `Here's a relevant case study from ${industry}`
    }
  }

  private navigateTo(page?: string): ToolExecutionResult {
    if (!page) {
      return {
        success: false,
        message: 'No page specified'
      }
    }

    if (this.onNavigate) {
      this.onNavigate(page)
    } else {
      // Fallback to direct navigation
      window.location.href = `/${page}`
    }

    return {
      success: true,
      action: 'navigate',
      message: `Navigating to ${page}...`
    }
  }
}
