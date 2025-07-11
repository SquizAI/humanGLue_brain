// Dynamic UI state management for intent-based modifications
import { UIIntent } from './intentParser'

export interface DynamicSection {
  id: string
  title: string
  content: React.ReactNode
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  animation: 'slide' | 'fade' | 'scale' | 'rotate'
  priority: number
  relatedIntents: UIIntent[]
}

export interface UITransformation {
  type: 'add' | 'remove' | 'modify' | 'highlight' | 'expand'
  targetId: string
  properties?: Record<string, any>
  duration?: number
}

export class DynamicUIStateManager {
  private activeSections = new Map<string, DynamicSection>()
  private transformationQueue: UITransformation[] = []
  private listeners: ((sections: DynamicSection[]) => void)[] = []

  // Subscribe to UI state changes
  subscribe(listener: (sections: DynamicSection[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Notify all listeners of state changes
  private notify() {
    const sections = Array.from(this.activeSections.values())
      .sort((a, b) => b.priority - a.priority)
    
    this.listeners.forEach(listener => listener(sections))
  }

  // Handle intent-based UI modifications
  handleIntent(intent: UIIntent, entities: Record<string, any>) {
    switch (intent) {
      case 'show_assessment':
        this.showAssessmentDetails(entities)
        break
      case 'show_workshops':
        this.showWorkshopOptions(entities)
        break
      case 'show_results':
        this.showResultsMetrics(entities)
        break
      case 'compare_solutions':
        this.showComparison(entities)
        break
      case 'schedule_demo':
        this.showScheduler(entities)
        break
      case 'explore_case_study':
        this.showCaseStudies(entities)
        break
      case 'view_pricing':
        this.showPricing(entities)
        break
      case 'customize_solution':
        this.showCustomizer(entities)
        break
    }
  }

  private showAssessmentDetails(entities: Record<string, any>) {
    this.addSection({
      id: 'assessment-details',
      title: 'AI-Powered Assessment',
      content: this.createAssessmentContent(entities),
      position: 'top-right',
      animation: 'slide',
      priority: 100,
      relatedIntents: ['show_assessment', 'compare_solutions']
    })

    // Add visual demo
    this.addSection({
      id: 'assessment-demo',
      title: 'Live Demo',
      content: this.createAssessmentDemo(),
      position: 'bottom-right',
      animation: 'scale',
      priority: 90,
      relatedIntents: ['show_assessment']
    })
  }

  private showWorkshopOptions(entities: Record<string, any>) {
    this.addSection({
      id: 'workshop-catalog',
      title: 'Workshop Programs',
      content: this.createWorkshopCatalog(entities),
      position: 'top-left',
      animation: 'fade',
      priority: 100,
      relatedIntents: ['show_workshops']
    })
  }

  private showResultsMetrics(entities: Record<string, any>) {
    this.addSection({
      id: 'results-dashboard',
      title: 'Proven Results',
      content: this.createResultsDashboard(entities),
      position: 'bottom-left',
      animation: 'slide',
      priority: 100,
      relatedIntents: ['show_results']
    })

    // Add interactive chart
    this.addSection({
      id: 'roi-calculator',
      title: 'ROI Calculator',
      content: this.createROICalculator(entities),
      position: 'top-right',
      animation: 'scale',
      priority: 95,
      relatedIntents: ['show_results', 'view_pricing']
    })
  }

  private showComparison(entities: Record<string, any>) {
    this.addSection({
      id: 'solution-comparison',
      title: 'Compare Solutions',
      content: this.createComparisonTable(entities),
      position: 'center',
      animation: 'fade',
      priority: 110,
      relatedIntents: ['compare_solutions']
    })
  }

  private showScheduler(entities: Record<string, any>) {
    this.addSection({
      id: 'demo-scheduler',
      title: 'Schedule Your Demo',
      content: this.createScheduler(entities),
      position: 'center',
      animation: 'scale',
      priority: 120,
      relatedIntents: ['schedule_demo']
    })
  }

  private showCaseStudies(entities: Record<string, any>) {
    const industry = entities.industry || 'all'
    this.addSection({
      id: 'case-studies',
      title: `${industry === 'all' ? '' : industry.charAt(0).toUpperCase() + industry.slice(1)} Success Stories`,
      content: this.createCaseStudyCarousel(entities),
      position: 'top-left',
      animation: 'slide',
      priority: 100,
      relatedIntents: ['explore_case_study']
    })
  }

  private showPricing(entities: Record<string, any>) {
    this.addSection({
      id: 'pricing-tiers',
      title: 'Transparent Pricing',
      content: this.createPricingTiers(entities),
      position: 'center',
      animation: 'fade',
      priority: 110,
      relatedIntents: ['view_pricing']
    })
  }

  private showCustomizer(entities: Record<string, any>) {
    this.addSection({
      id: 'solution-customizer',
      title: 'Build Your Solution',
      content: this.createCustomizer(entities),
      position: 'center',
      animation: 'scale',
      priority: 115,
      relatedIntents: ['customize_solution']
    })
  }

  // Add a section with animation
  private addSection(section: DynamicSection) {
    this.activeSections.set(section.id, section)
    this.transformationQueue.push({
      type: 'add',
      targetId: section.id,
      duration: 500
    })
    this.notify()
  }

  // Remove a section with animation
  removeSection(sectionId: string) {
    this.transformationQueue.push({
      type: 'remove',
      targetId: sectionId,
      duration: 300
    })
    setTimeout(() => {
      this.activeSections.delete(sectionId)
      this.notify()
    }, 300)
  }

  // Clear all sections
  clearAll() {
    const ids = Array.from(this.activeSections.keys())
    ids.forEach(id => this.removeSection(id))
  }

  // Content creation methods (simplified for example)
  private createAssessmentContent(entities: Record<string, any>) {
    return `AI-powered assessment tailored for ${entities.industry || 'your industry'}`
  }

  private createAssessmentDemo() {
    return 'Interactive assessment preview'
  }

  private createWorkshopCatalog(entities: Record<string, any>) {
    return 'Workshop options and schedules'
  }

  private createResultsDashboard(entities: Record<string, any>) {
    return 'Metrics and success indicators'
  }

  private createROICalculator(entities: Record<string, any>) {
    return 'Interactive ROI calculation tool'
  }

  private createComparisonTable(entities: Record<string, any>) {
    return 'Side-by-side solution comparison'
  }

  private createScheduler(entities: Record<string, any>) {
    return 'Calendar integration for demo booking'
  }

  private createCaseStudyCarousel(entities: Record<string, any>) {
    return `Case studies for ${entities.industry || 'various industries'}`
  }

  private createPricingTiers(entities: Record<string, any>) {
    return 'Pricing options based on company size'
  }

  private createCustomizer(entities: Record<string, any>) {
    return 'Interactive solution builder'
  }
}

export const uiStateManager = new DynamicUIStateManager()