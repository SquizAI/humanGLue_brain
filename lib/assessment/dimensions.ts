/**
 * HumanGlue Multi-Dimensional Assessment Framework
 * 23 dimensions across 4 categories
 */

export type DimensionCategory = 'technical' | 'human' | 'business' | 'ai_adoption'

export interface AssessmentDimension {
  id: string
  name: string
  category: DimensionCategory
  description: string
  weight: number // 0-1, importance in overall score
  questions: AssessmentQuestion[]
  metrics: string[]
  maturityIndicators: {
    level: number
    indicators: string[]
  }[]
}

export interface AssessmentQuestion {
  id: string
  text: string
  type: 'scale' | 'multiple_choice' | 'yes_no' | 'text'
  options?: string[]
  weight: number
  followUp?: {
    condition: string
    question: AssessmentQuestion
  }
}

export const assessmentDimensions: AssessmentDimension[] = [
  // Technical Dimensions
  {
    id: 'tech_infrastructure',
    name: 'Technical Infrastructure',
    category: 'technical',
    description: 'Evaluation of current IT infrastructure and its readiness for AI',
    weight: 0.8,
    questions: [
      {
        id: 'cloud_adoption',
        text: 'What is your current cloud adoption level?',
        type: 'multiple_choice',
        options: ['No cloud', 'Hybrid cloud', 'Cloud-first', 'Multi-cloud', 'Cloud-native'],
        weight: 0.3
      },
      {
        id: 'data_architecture',
        text: 'How would you rate your data architecture maturity?',
        type: 'scale',
        weight: 0.4
      },
      {
        id: 'api_integration',
        text: 'Do you have API-first architecture?',
        type: 'yes_no',
        weight: 0.3
      }
    ],
    metrics: ['System uptime', 'API response time', 'Data processing capacity'],
    maturityIndicators: [
      {
        level: 0,
        indicators: ['On-premise only', 'Siloed systems', 'Manual processes']
      },
      {
        level: 5,
        indicators: ['Cloud-native', 'Microservices', 'Real-time processing']
      }
    ]
  },
  {
    id: 'data_quality',
    name: 'Data Quality & Governance',
    category: 'technical',
    description: 'Assessment of data quality, governance, and management practices',
    weight: 0.9,
    questions: [
      {
        id: 'data_governance',
        text: 'Do you have a formal data governance framework?',
        type: 'yes_no',
        weight: 0.4
      },
      {
        id: 'data_quality_score',
        text: 'Rate your organization\'s data quality (1-10)',
        type: 'scale',
        weight: 0.6
      }
    ],
    metrics: ['Data accuracy rate', 'Data completeness', 'Governance compliance'],
    maturityIndicators: [
      {
        level: 0,
        indicators: ['No data governance', 'Poor data quality', 'Data silos']
      },
      {
        level: 5,
        indicators: ['Automated governance', 'Real-time quality monitoring', 'Golden records']
      }
    ]
  },
  {
    id: 'security_compliance',
    name: 'Security & Compliance',
    category: 'technical',
    description: 'Cybersecurity posture and regulatory compliance readiness',
    weight: 0.9,
    questions: [
      {
        id: 'security_framework',
        text: 'Which security frameworks do you follow?',
        type: 'multiple_choice',
        options: ['None', 'ISO 27001', 'SOC 2', 'NIST', 'Multiple frameworks'],
        weight: 0.5
      },
      {
        id: 'ai_ethics',
        text: 'Do you have AI ethics guidelines?',
        type: 'yes_no',
        weight: 0.5
      }
    ],
    metrics: ['Security incidents', 'Compliance score', 'Audit findings'],
    maturityIndicators: [
      {
        level: 0,
        indicators: ['Basic security', 'No compliance framework', 'Reactive approach']
      },
      {
        level: 5,
        indicators: ['Zero-trust architecture', 'Proactive compliance', 'AI ethics board']
      }
    ]
  },
  {
    id: 'integration_capability',
    name: 'Integration & Interoperability',
    category: 'technical',
    description: 'Ability to integrate systems and ensure interoperability',
    weight: 0.7,
    questions: [
      {
        id: 'integration_platform',
        text: 'Do you have an enterprise integration platform?',
        type: 'yes_no',
        weight: 0.5
      },
      {
        id: 'api_maturity',
        text: 'What percentage of your systems expose APIs?',
        type: 'scale',
        weight: 0.5
      }
    ],
    metrics: ['Integration success rate', 'API availability', 'System connectivity'],
    maturityIndicators: [
      {
        level: 0,
        indicators: ['Point-to-point integrations', 'Manual data transfer', 'Isolated systems']
      },
      {
        level: 5,
        indicators: ['Event-driven architecture', 'API gateway', 'Real-time sync']
      }
    ]
  },
  {
    id: 'scalability',
    name: 'Scalability & Performance',
    category: 'technical',
    description: 'System scalability and performance optimization capabilities',
    weight: 0.7,
    questions: [
      {
        id: 'auto_scaling',
        text: 'Do your systems support auto-scaling?',
        type: 'yes_no',
        weight: 0.5
      },
      {
        id: 'performance_monitoring',
        text: 'How comprehensive is your performance monitoring?',
        type: 'scale',
        weight: 0.5
      }
    ],
    metrics: ['Response time', 'Throughput', 'Resource utilization'],
    maturityIndicators: [
      {
        level: 0,
        indicators: ['Manual scaling', 'Basic monitoring', 'Performance issues']
      },
      {
        level: 5,
        indicators: ['Auto-scaling', 'Predictive optimization', 'Edge computing']
      }
    ]
  },

  // Human Dimensions
  {
    id: 'leadership_vision',
    name: 'Leadership & Vision',
    category: 'human',
    description: 'Leadership commitment and vision for AI transformation',
    weight: 0.9,
    questions: [
      {
        id: 'ceo_commitment',
        text: 'How committed is your CEO to AI transformation?',
        type: 'scale',
        weight: 0.6
      },
      {
        id: 'ai_strategy',
        text: 'Do you have a formal AI strategy?',
        type: 'yes_no',
        weight: 0.4
      }
    ],
    metrics: ['Leadership engagement score', 'Strategy execution', 'Vision clarity'],
    maturityIndicators: [
      {
        level: 0,
        indicators: ['No AI vision', 'Limited leadership buy-in', 'Tactical thinking']
      },
      {
        level: 5,
        indicators: ['AI-first leadership', 'Clear vision', 'Strategic execution']
      }
    ]
  },
  {
    id: 'culture_change',
    name: 'Culture & Change Readiness',
    category: 'human',
    description: 'Organizational culture and readiness for change',
    weight: 0.8,
    questions: [
      {
        id: 'innovation_culture',
        text: 'How would you describe your innovation culture?',
        type: 'scale',
        weight: 0.5
      },
      {
        id: 'change_history',
        text: 'How successful have past transformation initiatives been?',
        type: 'scale',
        weight: 0.5
      }
    ],
    metrics: ['Employee engagement', 'Innovation index', 'Change success rate'],
    maturityIndicators: [
      {
        level: 0,
        indicators: ['Resistance to change', 'Risk-averse culture', 'Siloed thinking']
      },
      {
        level: 5,
        indicators: ['Innovation culture', 'Embrace change', 'Collaborative mindset']
      }
    ]
  },
  {
    id: 'skills_talent',
    name: 'Skills & Talent',
    category: 'human',
    description: 'AI and digital skills availability and development',
    weight: 0.9,
    questions: [
      {
        id: 'ai_skills',
        text: 'What percentage of your workforce has AI/ML skills?',
        type: 'scale',
        weight: 0.5
      },
      {
        id: 'training_program',
        text: 'Do you have an AI training program?',
        type: 'yes_no',
        weight: 0.5
      }
    ],
    metrics: ['Skills gap analysis', 'Training completion', 'Talent retention'],
    maturityIndicators: [
      {
        level: 0,
        indicators: ['Major skills gap', 'No training program', 'Talent shortage']
      },
      {
        level: 5,
        indicators: ['AI-literate workforce', 'Continuous learning', 'Talent magnet']
      }
    ]
  },
  {
    id: 'collaboration',
    name: 'Collaboration & Communication',
    category: 'human',
    description: 'Cross-functional collaboration and communication effectiveness',
    weight: 0.7,
    questions: [
      {
        id: 'cross_functional',
        text: 'How effective is cross-functional collaboration?',
        type: 'scale',
        weight: 0.5
      },
      {
        id: 'communication_tools',
        text: 'Do you use modern collaboration tools?',
        type: 'yes_no',
        weight: 0.5
      }
    ],
    metrics: ['Collaboration score', 'Communication effectiveness', 'Team productivity'],
    maturityIndicators: [
      {
        level: 0,
        indicators: ['Siloed departments', 'Email-only communication', 'Limited sharing']
      },
      {
        level: 5,
        indicators: ['Seamless collaboration', 'Real-time communication', 'Knowledge sharing']
      }
    ]
  },
  {
    id: 'employee_experience',
    name: 'Employee Experience',
    category: 'human',
    description: 'Quality of employee experience and engagement',
    weight: 0.8,
    questions: [
      {
        id: 'employee_nps',
        text: 'What is your employee Net Promoter Score?',
        type: 'scale',
        weight: 0.5
      },
      {
        id: 'digital_workplace',
        text: 'How digital is your workplace?',
        type: 'scale',
        weight: 0.5
      }
    ],
    metrics: ['Employee satisfaction', 'Retention rate', 'Productivity'],
    maturityIndicators: [
      {
        level: 0,
        indicators: ['Low engagement', 'High turnover', 'Traditional workplace']
      },
      {
        level: 5,
        indicators: ['High engagement', 'Low turnover', 'Digital-first workplace']
      }
    ]
  },

  // Business Dimensions
  {
    id: 'strategy_alignment',
    name: 'Strategy & Alignment',
    category: 'business',
    description: 'AI alignment with business strategy',
    weight: 0.9,
    questions: [
      {
        id: 'ai_business_alignment',
        text: 'How well is AI aligned with business strategy?',
        type: 'scale',
        weight: 0.6
      },
      {
        id: 'strategic_priorities',
        text: 'Is AI in your top 3 strategic priorities?',
        type: 'yes_no',
        weight: 0.4
      }
    ],
    metrics: ['Strategy execution', 'Goal achievement', 'ROI realization'],
    maturityIndicators: [
      {
        level: 0,
        indicators: ['No AI strategy', 'Misaligned initiatives', 'Tactical focus']
      },
      {
        level: 5,
        indicators: ['AI-driven strategy', 'Full alignment', 'Strategic excellence']
      }
    ]
  },
  {
    id: 'process_optimization',
    name: 'Process Optimization',
    category: 'business',
    description: 'Business process maturity and optimization',
    weight: 0.8,
    questions: [
      {
        id: 'process_automation',
        text: 'What percentage of processes are automated?',
        type: 'scale',
        weight: 0.5
      },
      {
        id: 'process_documentation',
        text: 'Are your processes well-documented?',
        type: 'yes_no',
        weight: 0.5
      }
    ],
    metrics: ['Process efficiency', 'Automation rate', 'Error reduction'],
    maturityIndicators: [
      {
        level: 0,
        indicators: ['Manual processes', 'No documentation', 'Inefficient workflows']
      },
      {
        level: 5,
        indicators: ['Intelligent automation', 'Self-optimizing processes', 'Zero-touch workflows']
      }
    ]
  },
  {
    id: 'customer_centricity',
    name: 'Customer Centricity',
    category: 'business',
    description: 'Customer focus and experience optimization',
    weight: 0.8,
    questions: [
      {
        id: 'customer_data',
        text: 'How well do you understand your customers through data?',
        type: 'scale',
        weight: 0.5
      },
      {
        id: 'personalization',
        text: 'Do you offer personalized experiences?',
        type: 'yes_no',
        weight: 0.5
      }
    ],
    metrics: ['Customer satisfaction', 'NPS score', 'Customer lifetime value'],
    maturityIndicators: [
      {
        level: 0,
        indicators: ['Limited customer insight', 'Generic experiences', 'Reactive service']
      },
      {
        level: 5,
        indicators: ['360° customer view', 'Hyper-personalization', 'Predictive service']
      }
    ]
  },
  {
    id: 'innovation_capability',
    name: 'Innovation Capability',
    category: 'business',
    description: 'Ability to innovate and create new value',
    weight: 0.7,
    questions: [
      {
        id: 'innovation_process',
        text: 'Do you have a formal innovation process?',
        type: 'yes_no',
        weight: 0.5
      },
      {
        id: 'innovation_budget',
        text: 'What percentage of revenue goes to innovation?',
        type: 'scale',
        weight: 0.5
      }
    ],
    metrics: ['Innovation pipeline', 'New product revenue', 'Time to market'],
    maturityIndicators: [
      {
        level: 0,
        indicators: ['No innovation process', 'Risk aversion', 'Slow to market']
      },
      {
        level: 5,
        indicators: ['Innovation engine', 'Fail fast culture', 'Market leader']
      }
    ]
  },
  {
    id: 'financial_performance',
    name: 'Financial Performance',
    category: 'business',
    description: 'Financial health and investment capacity',
    weight: 0.8,
    questions: [
      {
        id: 'revenue_growth',
        text: 'What is your revenue growth rate?',
        type: 'scale',
        weight: 0.5
      },
      {
        id: 'ai_budget',
        text: 'Do you have dedicated AI budget?',
        type: 'yes_no',
        weight: 0.5
      }
    ],
    metrics: ['Revenue growth', 'Profit margins', 'AI ROI'],
    maturityIndicators: [
      {
        level: 0,
        indicators: ['Limited budget', 'Cost focus', 'No AI investment']
      },
      {
        level: 5,
        indicators: ['Strong growth', 'AI-driven revenue', 'Strategic investments']
      }
    ]
  },
  {
    id: 'partner_ecosystem',
    name: 'Partner Ecosystem',
    category: 'business',
    description: 'Strength of partner and vendor relationships',
    weight: 0.6,
    questions: [
      {
        id: 'strategic_partners',
        text: 'Do you have strategic AI partners?',
        type: 'yes_no',
        weight: 0.5
      },
      {
        id: 'ecosystem_maturity',
        text: 'How mature is your partner ecosystem?',
        type: 'scale',
        weight: 0.5
      }
    ],
    metrics: ['Partner satisfaction', 'Ecosystem value', 'Collaboration effectiveness'],
    maturityIndicators: [
      {
        level: 0,
        indicators: ['Limited partnerships', 'Transactional relationships', 'Vendor lock-in']
      },
      {
        level: 5,
        indicators: ['Strategic ecosystem', 'Value co-creation', 'Platform approach']
      }
    ]
  },
  {
    id: 'risk_management',
    name: 'Risk Management',
    category: 'business',
    description: 'Risk identification and management capabilities',
    weight: 0.7,
    questions: [
      {
        id: 'risk_framework',
        text: 'Do you have an AI risk framework?',
        type: 'yes_no',
        weight: 0.5
      },
      {
        id: 'risk_mitigation',
        text: 'How proactive is your risk management?',
        type: 'scale',
        weight: 0.5
      }
    ],
    metrics: ['Risk score', 'Incident rate', 'Mitigation effectiveness'],
    maturityIndicators: [
      {
        level: 0,
        indicators: ['No risk framework', 'Reactive approach', 'High exposure']
      },
      {
        level: 5,
        indicators: ['Comprehensive framework', 'Predictive risk management', 'Resilient']
      }
    ]
  },

  // AI Adoption Dimensions
  {
    id: 'ai_use_cases',
    name: 'AI Use Cases',
    category: 'ai_adoption',
    description: 'Current and planned AI use cases',
    weight: 0.8,
    questions: [
      {
        id: 'current_use_cases',
        text: 'How many AI use cases are in production?',
        type: 'scale',
        weight: 0.5
      },
      {
        id: 'use_case_impact',
        text: 'What is the business impact of your AI use cases?',
        type: 'scale',
        weight: 0.5
      }
    ],
    metrics: ['Use case count', 'Business impact', 'Success rate'],
    maturityIndicators: [
      {
        level: 0,
        indicators: ['No AI use cases', 'Experimental only', 'No clear value']
      },
      {
        level: 5,
        indicators: ['Enterprise-wide AI', 'Transformative impact', 'Continuous innovation']
      }
    ]
  },
  {
    id: 'ml_operations',
    name: 'ML Operations',
    category: 'ai_adoption',
    description: 'Machine learning operations maturity',
    weight: 0.7,
    questions: [
      {
        id: 'mlops_platform',
        text: 'Do you have an MLOps platform?',
        type: 'yes_no',
        weight: 0.5
      },
      {
        id: 'model_governance',
        text: 'How mature is your model governance?',
        type: 'scale',
        weight: 0.5
      }
    ],
    metrics: ['Model accuracy', 'Deployment frequency', 'Model drift'],
    maturityIndicators: [
      {
        level: 0,
        indicators: ['No MLOps', 'Manual deployment', 'No monitoring']
      },
      {
        level: 5,
        indicators: ['Automated MLOps', 'Continuous deployment', 'Self-healing models']
      }
    ]
  },
  {
    id: 'ai_governance',
    name: 'AI Governance',
    category: 'ai_adoption',
    description: 'AI governance and ethical frameworks',
    weight: 0.8,
    questions: [
      {
        id: 'ai_ethics_board',
        text: 'Do you have an AI ethics board?',
        type: 'yes_no',
        weight: 0.5
      },
      {
        id: 'bias_monitoring',
        text: 'Do you monitor for AI bias?',
        type: 'yes_no',
        weight: 0.5
      }
    ],
    metrics: ['Compliance score', 'Bias incidents', 'Transparency index'],
    maturityIndicators: [
      {
        level: 0,
        indicators: ['No governance', 'No ethics framework', 'Black box AI']
      },
      {
        level: 5,
        indicators: ['Comprehensive governance', 'Ethical AI leader', 'Full transparency']
      }
    ]
  },
  {
    id: 'data_science_maturity',
    name: 'Data Science Maturity',
    category: 'ai_adoption',
    description: 'Data science capabilities and practices',
    weight: 0.8,
    questions: [
      {
        id: 'data_science_team',
        text: 'Do you have a dedicated data science team?',
        type: 'yes_no',
        weight: 0.5
      },
      {
        id: 'advanced_analytics',
        text: 'How advanced are your analytics capabilities?',
        type: 'scale',
        weight: 0.5
      }
    ],
    metrics: ['Model performance', 'Insights generated', 'Business value'],
    maturityIndicators: [
      {
        level: 0,
        indicators: ['No data science', 'Basic analytics', 'Descriptive only']
      },
      {
        level: 5,
        indicators: ['Advanced data science', 'Prescriptive analytics', 'AI research']
      }
    ]
  },
  {
    id: 'automation_level',
    name: 'Automation Level',
    category: 'ai_adoption',
    description: 'Degree of intelligent automation',
    weight: 0.7,
    questions: [
      {
        id: 'rpa_adoption',
        text: 'What is your RPA adoption level?',
        type: 'scale',
        weight: 0.4
      },
      {
        id: 'intelligent_automation',
        text: 'Do you use intelligent automation (RPA + AI)?',
        type: 'yes_no',
        weight: 0.6
      }
    ],
    metrics: ['Automation rate', 'Cost savings', 'Error reduction'],
    maturityIndicators: [
      {
        level: 0,
        indicators: ['No automation', 'Manual processes', 'High error rate']
      },
      {
        level: 5,
        indicators: ['Intelligent automation', 'Self-learning systems', 'Zero-touch processes']
      }
    ]
  },
  {
    id: 'ai_infrastructure',
    name: 'AI Infrastructure',
    category: 'ai_adoption',
    description: 'Technical infrastructure for AI workloads',
    weight: 0.7,
    questions: [
      {
        id: 'gpu_infrastructure',
        text: 'Do you have GPU infrastructure for AI?',
        type: 'yes_no',
        weight: 0.5
      },
      {
        id: 'ai_platform',
        text: 'Do you have an enterprise AI platform?',
        type: 'yes_no',
        weight: 0.5
      }
    ],
    metrics: ['Computing capacity', 'Platform utilization', 'Cost efficiency'],
    maturityIndicators: [
      {
        level: 0,
        indicators: ['No AI infrastructure', 'Limited compute', 'Ad-hoc tools']
      },
      {
        level: 5,
        indicators: ['Advanced infrastructure', 'Elastic compute', 'Unified platform']
      }
    ]
  }
]

export function getDimensionById(id: string): AssessmentDimension | undefined {
  return assessmentDimensions.find(d => d.id === id)
}

export function getDimensionsByCategory(category: DimensionCategory): AssessmentDimension[] {
  return assessmentDimensions.filter(d => d.category === category)
}

export function calculateDimensionScore(dimension: AssessmentDimension, answers: Map<string, any>): number {
  let score = 0
  let totalWeight = 0

  dimension.questions.forEach(question => {
    const answer = answers.get(question.id)
    if (answer !== undefined) {
      let questionScore = 0
      
      switch (question.type) {
        case 'scale':
          questionScore = answer / 10 // Assuming 0-10 scale
          break
        case 'yes_no':
          questionScore = answer ? 1 : 0
          break
        case 'multiple_choice':
          // Score based on option index (higher index = higher maturity)
          const optionIndex = question.options?.indexOf(answer) ?? 0
          questionScore = optionIndex / ((question.options?.length ?? 1) - 1)
          break
      }
      
      score += questionScore * question.weight
      totalWeight += question.weight
    }
  })

  return totalWeight > 0 ? score / totalWeight : 0
}

export function calculateCategoryScore(category: DimensionCategory, dimensionScores: Map<string, number>): number {
  const dimensions = getDimensionsByCategory(category)
  let totalScore = 0
  let totalWeight = 0

  dimensions.forEach(dimension => {
    const score = dimensionScores.get(dimension.id)
    if (score !== undefined) {
      totalScore += score * dimension.weight
      totalWeight += dimension.weight
    }
  })

  return totalWeight > 0 ? totalScore / totalWeight : 0
}

export function calculateOverallMaturityLevel(dimensionScores: Map<string, number>): number {
  let totalScore = 0
  let totalWeight = 0

  assessmentDimensions.forEach(dimension => {
    const score = dimensionScores.get(dimension.id)
    if (score !== undefined) {
      totalScore += score * dimension.weight
      totalWeight += dimension.weight
    }
  })

  const normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 0
  // Convert 0-1 score to 0-9 maturity level
  return Math.floor(normalizedScore * 10)
}