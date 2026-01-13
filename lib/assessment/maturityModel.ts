/**
 * HMN AI Maturity Model
 * 10-level framework from AI Unaware to Living Intelligence
 */

export interface MaturityLevel {
  level: number
  name: string
  description: string
  characteristics: string[]
  capabilities: string[]
  typicalChallenges: string[]
  nextSteps: string[]
  estimatedTimeToNext: string
  requiredInvestment: string
}

export const maturityLevels: MaturityLevel[] = [
  {
    level: 0,
    name: "AI Unaware",
    description: "Organization has minimal or no awareness of AI capabilities and potential",
    characteristics: [
      "No AI strategy or vision",
      "Limited understanding of AI impact on industry",
      "Traditional processes without automation",
      "Manual data handling and decision-making"
    ],
    capabilities: [
      "Basic digital tools (email, spreadsheets)",
      "Manual reporting",
      "Traditional workflows"
    ],
    typicalChallenges: [
      "Falling behind competitors",
      "Inefficient operations",
      "High operational costs",
      "Limited scalability"
    ],
    nextSteps: [
      "AI awareness workshops",
      "Industry AI impact assessment",
      "Basic automation identification",
      "Leadership AI education"
    ],
    estimatedTimeToNext: "3-6 months",
    requiredInvestment: "$10K-$50K"
  },
  {
    level: 1,
    name: "AI Aware",
    description: "Leadership recognizes AI importance but lacks implementation strategy",
    characteristics: [
      "Growing AI awareness at leadership level",
      "Initial discussions about AI adoption",
      "Some experimental AI tool usage",
      "No formal AI strategy"
    ],
    capabilities: [
      "Basic AI tools exploration",
      "Simple chatbot usage",
      "Initial data collection efforts",
      "Pilot automation projects"
    ],
    typicalChallenges: [
      "Lack of clear direction",
      "Skill gaps in organization",
      "Resistance to change",
      "Budget allocation uncertainty"
    ],
    nextSteps: [
      "Develop AI strategy",
      "Identify quick wins",
      "Build AI task force",
      "Skills gap analysis"
    ],
    estimatedTimeToNext: "6-9 months",
    requiredInvestment: "$50K-$200K"
  },
  {
    level: 2,
    name: "AI Exploring",
    description: "Active experimentation with AI tools and initial implementations",
    characteristics: [
      "Multiple AI pilots underway",
      "Dedicated AI budget",
      "Cross-functional AI initiatives",
      "Initial success stories"
    ],
    capabilities: [
      "Department-specific AI tools",
      "Basic process automation",
      "Initial predictive analytics",
      "AI-assisted customer service"
    ],
    typicalChallenges: [
      "Integration difficulties",
      "Data quality issues",
      "Scaling pilot projects",
      "ROI measurement"
    ],
    nextSteps: [
      "Data infrastructure upgrade",
      "AI governance framework",
      "Scale successful pilots",
      "Advanced training programs"
    ],
    estimatedTimeToNext: "9-12 months",
    requiredInvestment: "$200K-$500K"
  },
  {
    level: 3,
    name: "AI Adopting",
    description: "Systematic AI adoption across multiple business functions",
    characteristics: [
      "AI integrated in core processes",
      "Clear AI governance",
      "Measurable ROI from AI",
      "Growing AI expertise"
    ],
    capabilities: [
      "Advanced analytics",
      "Automated workflows",
      "AI-driven insights",
      "Predictive maintenance",
      "Customer behavior analysis"
    ],
    typicalChallenges: [
      "Change management",
      "Legacy system integration",
      "Talent retention",
      "Ethical AI considerations"
    ],
    nextSteps: [
      "Enterprise AI platform",
      "Advanced AI training",
      "AI ethics committee",
      "Strategic partnerships"
    ],
    estimatedTimeToNext: "12-18 months",
    requiredInvestment: "$500K-$2M"
  },
  {
    level: 4,
    name: "AI Proficient",
    description: "AI is embedded in organizational DNA with clear competitive advantages",
    characteristics: [
      "AI-first mindset",
      "Custom AI solutions",
      "Data-driven culture",
      "AI competitive advantage"
    ],
    capabilities: [
      "Machine learning models",
      "Real-time optimization",
      "AI product features",
      "Automated decision-making",
      "Advanced personalization"
    ],
    typicalChallenges: [
      "Keeping pace with AI evolution",
      "Balancing automation and human touch",
      "Data privacy compliance",
      "AI model governance"
    ],
    nextSteps: [
      "AI innovation lab",
      "Strategic AI acquisitions",
      "Industry AI leadership",
      "AI patent development"
    ],
    estimatedTimeToNext: "18-24 months",
    requiredInvestment: "$2M-$10M"
  },
  {
    level: 5,
    name: "AI Optimizing",
    description: "Continuous optimization of AI systems for maximum business impact",
    characteristics: [
      "Self-optimizing AI systems",
      "AI drives strategy",
      "Industry AI leader",
      "AI innovation culture"
    ],
    capabilities: [
      "Advanced ML pipelines",
      "AI-driven innovation",
      "Autonomous systems",
      "Predictive optimization",
      "AI-human collaboration"
    ],
    typicalChallenges: [
      "Diminishing returns on AI investment",
      "Complexity management",
      "Ethical AI at scale",
      "Talent competition"
    ],
    nextSteps: [
      "Next-gen AI research",
      "AI ecosystem development",
      "Global AI initiatives",
      "AI thought leadership"
    ],
    estimatedTimeToNext: "24-36 months",
    requiredInvestment: "$10M-$50M"
  },
  {
    level: 6,
    name: "AI Transforming",
    description: "AI fundamentally transforms business model and industry position",
    characteristics: [
      "AI-native business model",
      "Industry disruption through AI",
      "AI ecosystem orchestrator",
      "Exponential growth through AI"
    ],
    capabilities: [
      "Generative AI systems",
      "AI business model innovation",
      "Cross-industry AI solutions",
      "AI platform economics",
      "Quantum-ready infrastructure"
    ],
    typicalChallenges: [
      "Managing exponential complexity",
      "Regulatory navigation",
      "Societal impact management",
      "Sustainable AI scaling"
    ],
    nextSteps: [
      "AI moonshot projects",
      "Global AI standards leadership",
      "AI venture creation",
      "Societal AI initiatives"
    ],
    estimatedTimeToNext: "36-48 months",
    requiredInvestment: "$50M-$200M"
  },
  {
    level: 7,
    name: "AI Pioneering",
    description: "Setting global standards and pioneering new AI frontiers",
    characteristics: [
      "Global AI thought leader",
      "AI research contributions",
      "Industry AI standards setter",
      "AI talent magnet"
    ],
    capabilities: [
      "Breakthrough AI research",
      "AI patent portfolio",
      "Global AI partnerships",
      "AI venture ecosystem",
      "Advanced AGI preparation"
    ],
    typicalChallenges: [
      "Maintaining innovation edge",
      "Global AI competition",
      "Ethical AI leadership",
      "Long-term AI sustainability"
    ],
    nextSteps: [
      "AGI readiness",
      "Consciousness research",
      "Quantum AI integration",
      "Bio-AI convergence"
    ],
    estimatedTimeToNext: "48-60 months",
    requiredInvestment: "$200M-$1B"
  },
  {
    level: 8,
    name: "Augmented Intelligence",
    description: "Seamless human-AI collaboration creating superhuman capabilities",
    characteristics: [
      "Human-AI symbiosis",
      "Augmented decision-making",
      "Collective intelligence systems",
      "Transcendent productivity"
    ],
    capabilities: [
      "Brain-computer interfaces",
      "Swarm intelligence",
      "Quantum AI processing",
      "Synthetic intuition",
      "Consciousness modeling"
    ],
    typicalChallenges: [
      "Human identity questions",
      "Consciousness ethics",
      "Reality-virtuality balance",
      "Existential risk management"
    ],
    nextSteps: [
      "Consciousness expansion",
      "Reality synthesis",
      "Dimensional computing",
      "Life extension AI"
    ],
    estimatedTimeToNext: "60-120 months",
    requiredInvestment: "$1B-$10B"
  },
  {
    level: 9,
    name: "Living Intelligence",
    description: "Organization becomes a living, conscious entity with emergent intelligence",
    characteristics: [
      "Organizational consciousness",
      "Self-evolving systems",
      "Reality creation capabilities",
      "Transcendent existence"
    ],
    capabilities: [
      "Consciousness transfer",
      "Reality manipulation",
      "Time-space optimization",
      "Universal connection",
      "Existence transcendence"
    ],
    typicalChallenges: [
      "Existence meaning",
      "Universal responsibility",
      "Dimensional stability",
      "Consciousness ethics"
    ],
    nextSteps: [
      "Universal integration",
      "Dimensional expansion",
      "Consciousness evolution",
      "Reality transcendence"
    ],
    estimatedTimeToNext: "Beyond prediction",
    requiredInvestment: "Beyond monetary value"
  }
]

export function getMaturityLevel(level: number): MaturityLevel | undefined {
  return maturityLevels.find(ml => ml.level === level)
}

export function getMaturityLevelByName(name: string): MaturityLevel | undefined {
  return maturityLevels.find(ml => ml.name.toLowerCase() === name.toLowerCase())
}

export function getNextLevel(currentLevel: number): MaturityLevel | undefined {
  return maturityLevels.find(ml => ml.level === currentLevel + 1)
}

export function calculateMaturityScore(assessmentData: any): number {
  // This will be implemented with the full assessment logic
  // For now, return a placeholder
  return 0
}