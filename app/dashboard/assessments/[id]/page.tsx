'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
  Target,
  Users,
  Database,
  Code,
  Shield,
  Brain,
  Download,
  Share2,
  Calendar,
  BarChart3,
} from 'lucide-react'

interface DimensionScore {
  dimension: string
  score: number
  maxScore: number
  level: string
  description: string
  strengths: string[]
  gaps: string[]
  trend: 'up' | 'down' | 'stable'
  icon: any
}

interface Insight {
  id: string
  category: 'strength' | 'opportunity' | 'risk' | 'critical'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  effort: 'high' | 'medium' | 'low'
  priority: number
  affectedAreas: string[]
}

interface Recommendation {
  id: string
  title: string
  description: string
  impact: string
  implementation: {
    timeframe: string
    effort: string
    resources: string[]
    steps: string[]
  }
  dependencies: string[]
  expectedOutcomes: string[]
  risks: string[]
}

interface Benchmark {
  metric: string
  yourScore: number
  industryAvg: number
  topPerformers: number
  unit: string
}

export default function AssessmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { userData } = useChat()

  useEffect(() => {
    if (!userData || !userData.authenticated) {
      router.push('/login')
    }
  }, [userData, router])

  if (!userData || !userData.authenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  // Mock detailed assessment data
  const assessmentData = {
    id: params?.id as string,
    title: 'Engineering Department AI Maturity Assessment',
    date: 'November 12, 2024',
    department: 'Engineering',
    assessmentType: 'Departmental Deep Dive',
    overallScore: 72,
    maxScore: 100,
    maturityLevel: 'Adaptive (Level 6/10)',
    previousScore: 65,
    executiveSummary: `The Engineering department demonstrates strong technical foundations with a maturity score of 72%, placing you at the Adaptive level (Level 6 of 10). This assessment evaluated 47 distinct capabilities across 5 key dimensions of AI readiness. Your team shows exceptional strengths in technical capability and data infrastructure, with particularly impressive cloud-native architectures and modern data engineering practices. However, significant gaps exist in AI strategy alignment and governance frameworks. The assessment reveals a critical opportunity window: your technical team is ready to scale AI initiatives, but organizational readiness and strategic frameworks are lagging. Without addressing these gaps, you risk building AI solutions that don't align with business objectives or meet regulatory requirements. This report provides a comprehensive roadmap to bridge these gaps and advance to Level 7 (Transformative) within 12-18 months.`,
    keyFindings: [
      'Technical infrastructure is advanced, with 92% cloud adoption and modern MLOps practices in place',
      'Data engineering capabilities exceed industry benchmarks by 34%, enabling rapid AI development',
      'Critical governance gap: Only 23% of AI projects have documented ethical review processes',
      'Strategy misalignment: 67% of engineering AI initiatives lack clear business outcome metrics',
      'Talent density is strong with 18 ML engineers, but specialized roles (MLOps, AI Ethics) are understaffed',
      'Model deployment velocity is 3.2x industry average, but production monitoring coverage is only 41%',
      'Experimental culture is thriving with 23 active POCs, but only 19% reach production deployment',
      'Cross-functional collaboration gaps: Engineering-Business alignment rated 4.2/10 by stakeholders',
    ],
    dimensions: [
      {
        dimension: 'Strategy Alignment',
        score: 58,
        maxScore: 100,
        level: 'Developing',
        description: 'Measures how well AI initiatives align with business objectives, strategic planning maturity, and executive sponsorship.',
        strengths: [
          'CTO has established quarterly AI innovation reviews with executive team',
          'Dedicated AI Center of Excellence formed with cross-functional representation',
          'Clear budget allocation ($2.4M annually) for AI research and development',
          'Strategic roadmap exists for next 18 months with defined milestones',
          'Regular stakeholder communication through monthly AI newsletter and demos',
        ],
        gaps: [
          'No formalized process for prioritizing AI projects based on business value',
          'Limited executive understanding of AI capabilities and limitations',
          'Business case development is inconsistent across AI initiatives',
          'ROI tracking mechanisms are not standardized or enforced',
          'Strategic alignment workshops happen ad-hoc rather than systematically',
          'No clear criteria for graduating projects from POC to production',
          'Disconnect between engineering roadmap and sales/marketing needs',
        ],
        trend: 'up',
        icon: Target,
      },
      {
        dimension: 'Data Infrastructure',
        score: 88,
        maxScore: 100,
        level: 'Advanced',
        description: 'Evaluates data architecture, quality, accessibility, governance, and engineering practices supporting AI development.',
        strengths: [
          'Modern data lakehouse architecture (Databricks) with 12+ data sources integrated',
          'Real-time streaming pipelines processing 2.4TB daily with <30 second latency',
          'Comprehensive data catalog with 847 documented datasets and lineage tracking',
          'Automated data quality monitoring covering 89% of critical datasets',
          'Feature store implementation enabling 73% feature reuse across ML models',
          'Strong data engineering team (12 engineers) with modern tooling (dbt, Airflow)',
          'Cloud-native infrastructure (AWS) with auto-scaling and cost optimization',
          'API layer provides clean access to data for 156 internal consumers',
          'Data versioning and reproducibility practices well-established',
          'Privacy-preserving techniques (differential privacy, anonymization) deployed',
        ],
        gaps: [
          'Data governance policies exist but enforcement is inconsistent across teams',
          'Some legacy systems (3 mainframe sources) still create integration bottlenecks',
          'Data labeling capabilities limited - no systematic labeling infrastructure',
          'Cross-regional data compliance (GDPR, CCPA) processes need standardization',
          'Unstructured data (images, documents) less mature than structured data pipelines',
        ],
        trend: 'stable',
        icon: Database,
      },
      {
        dimension: 'Technical Capability',
        score: 82,
        maxScore: 100,
        level: 'Advanced',
        description: 'Assesses ML/AI engineering skills, infrastructure, tools, development practices, and deployment capabilities.',
        strengths: [
          'Strong ML engineering team: 18 ML engineers, 5 research scientists, 3 ML platform engineers',
          'Modern MLOps platform (MLflow + Kubeflow) supporting full model lifecycle',
          'Containerized deployment (Kubernetes) with automated CI/CD for ML models',
          'Comprehensive experimentation framework tracking 2,400+ experiments annually',
          'Model registry with version control, metadata tracking, and audit trails',
          'A/B testing infrastructure enabling safe production rollouts',
          'Strong software engineering practices: code review, testing, documentation',
          'Multi-cloud capability (AWS primary, GCP for specific ML workloads)',
          'GPU infrastructure (48 V100s) supporting large-scale model training',
        ],
        gaps: [
          'Production monitoring coverage only 41% - many models lack performance tracking',
          'No centralized model governance or approval process for production deployment',
          'Specialized expertise gaps: NLP (2 engineers), Computer Vision (1 engineer)',
          'Model explainability and interpretability tools underutilized',
          'Technical debt in 8 production models requiring refactoring',
          'Edge deployment capabilities nascent - only 2 edge ML use cases',
          'Real-time inference latency SLAs not formally defined or monitored',
        ],
        trend: 'up',
        icon: Code,
      },
      {
        dimension: 'People & Culture',
        score: 67,
        maxScore: 100,
        level: 'Developing',
        description: 'Evaluates team capabilities, learning culture, change readiness, collaboration, and talent development.',
        strengths: [
          'Strong learning culture: 87% of engineers completed AI/ML training in past year',
          'Dedicated learning budget ($3,200 per engineer annually) for courses and conferences',
          'Internal knowledge sharing: bi-weekly ML paper reading groups, monthly tech talks',
          'Innovation time: 20% time policy allowing experimentation on new AI approaches',
          'Cross-functional AI projects involving engineering, product, and design',
          'Mentorship program pairing senior and junior ML engineers',
          'Competitive compensation attracting strong AI talent (top 25th percentile)',
        ],
        gaps: [
          'Change management capabilities rated low - resistance to new AI tools and processes',
          'Limited AI literacy outside engineering - business teams struggle to leverage AI effectively',
          'Talent retention challenges: 23% annual turnover in ML engineering roles',
          'No formal career development paths for AI specialists vs. traditional engineers',
          'Diversity gaps: only 12% women in ML engineering roles, 8% underrepresented minorities',
          'Siloed teams: collaboration between ML researchers and product engineers needs improvement',
          'Business stakeholder AI education programs are ad-hoc and inconsistent',
          'No systematic approach to identifying and developing AI champions across organization',
        ],
        trend: 'down',
        icon: Users,
      },
      {
        dimension: 'Governance & Ethics',
        score: 45,
        maxScore: 100,
        level: 'Initial',
        description: 'Examines AI governance frameworks, ethical guidelines, risk management, compliance, and responsible AI practices.',
        strengths: [
          'AI Ethics Committee formed with representation from legal, engineering, and business',
          'Bias detection tools integrated into ML pipeline for 34% of production models',
          'Privacy-by-design principles documented and communicated to engineering teams',
          'Incident response playbook exists for AI/ML system failures',
          'Regular security audits of ML infrastructure and data access controls',
        ],
        gaps: [
          'Only 23% of AI projects undergo formal ethical review before deployment',
          'No comprehensive AI governance framework or policy documentation',
          'Risk assessment processes for AI systems are informal and inconsistent',
          'Model cards and documentation incomplete for 61% of production models',
          'No systematic approach to monitoring for algorithmic bias post-deployment',
          'Regulatory compliance (e.g., EU AI Act) readiness assessment not conducted',
          'Explainability requirements not defined for different stakeholder groups',
          'Third-party AI vendor risk assessment processes are immature',
          'No formal AI ethics training required for ML practitioners',
          'Accountability and ownership structures unclear for AI system outcomes',
        ],
        trend: 'stable',
        icon: Shield,
      },
    ],
    insights: [
      {
        id: 'i1',
        category: 'strength',
        title: 'Best-in-Class Data Infrastructure Enables Rapid AI Development',
        description: 'Your data lakehouse architecture and engineering practices score in the top 10% of organizations assessed. The modern tech stack (Databricks, real-time streaming, feature store) combined with strong data engineering talent creates a significant competitive advantage. This foundation supports rapid experimentation and reduces time-to-production for new AI models by an estimated 60% compared to organizations with legacy data architectures.',
        impact: 'high',
        effort: 'low',
        priority: 1,
        affectedAreas: ['Data Infrastructure', 'Technical Capability'],
      },
      {
        id: 'i2',
        category: 'critical',
        title: 'Governance Gaps Create Regulatory and Reputational Risk',
        description: 'With only 23% of AI projects undergoing ethical review and no comprehensive governance framework, the organization faces significant regulatory risk, especially with emerging AI regulations (EU AI Act, potential US federal frameworks). The combination of rapid deployment velocity (3.2x industry average) with weak governance creates a dangerous situation. Recent high-profile AI failures at peer companies have resulted in $10M+ fines and brand damage.',
        impact: 'high',
        effort: 'high',
        priority: 1,
        affectedAreas: ['Governance & Ethics', 'Strategy Alignment'],
      },
      {
        id: 'i3',
        category: 'opportunity',
        title: 'Low POC-to-Production Conversion Rate Indicates Process Gaps',
        description: 'Only 19% of AI POCs reach production deployment, compared to industry benchmark of 35-40% for mature organizations. This suggests gaps in project selection criteria, business case development, or production readiness processes. Improving this conversion rate by just 10 percentage points would result in 5-6 additional production AI capabilities annually, with estimated business value of $2-4M based on current project portfolio.',
        impact: 'high',
        effort: 'medium',
        priority: 2,
        affectedAreas: ['Strategy Alignment', 'Technical Capability'],
      },
      {
        id: 'i4',
        category: 'risk',
        title: 'Production Monitoring Gaps Threaten Model Performance',
        description: 'Only 41% of production models have comprehensive monitoring for performance degradation, data drift, and business metrics. Without systematic monitoring, model decay goes undetected, leading to degraded business outcomes. Industry data shows unmonitored models lose 15-25% of performance within 6-12 months of deployment. This gap poses both business risk (poor decisions based on degraded models) and reputational risk (unexpected model failures).',
        impact: 'high',
        effort: 'medium',
        priority: 2,
        affectedAreas: ['Technical Capability', 'Governance & Ethics'],
      },
      {
        id: 'i5',
        category: 'opportunity',
        title: 'Strong Engineering Culture Ready for Scaled AI Adoption',
        description: 'The combination of innovation time policies, strong learning culture (87% completed AI training), and knowledge sharing practices creates fertile ground for scaling AI capabilities. Organizations with similar cultural attributes successfully scale from POC to enterprise-wide AI adoption 2.3x faster than peers. The foundation exists - what\'s needed is strategic direction and governance guardrails.',
        impact: 'medium',
        effort: 'low',
        priority: 3,
        affectedAreas: ['People & Culture', 'Strategy Alignment'],
      },
      {
        id: 'i6',
        category: 'risk',
        title: 'Talent Retention Challenges Could Slow AI Momentum',
        description: '23% annual turnover in ML engineering roles is concerning given the competitive talent market and long ramp-up times for ML engineers (6-9 months to full productivity). At current hiring velocity, this turnover rate consumes 40% of team capacity in recruiting and onboarding activities. Root cause analysis needed, but likely factors include lack of clear career paths, limited advancement opportunities, and insufficient recognition of AI contributions.',
        impact: 'medium',
        effort: 'high',
        priority: 3,
        affectedAreas: ['People & Culture'],
      },
      {
        id: 'i7',
        category: 'opportunity',
        title: 'Engineering-Business Alignment Gap Limits AI Business Value',
        description: 'Cross-functional stakeholders rate engineering-business alignment at only 4.2/10. This disconnect manifests in AI projects that solve interesting technical problems but miss business needs, and business requests that don\'t leverage AI capabilities effectively. Best practice organizations use embedded product managers, regular business stakeholder engagement, and outcome-based project charters. Improving alignment could increase AI business value delivery by 50-70%.',
        impact: 'high',
        effort: 'medium',
        priority: 2,
        affectedAreas: ['Strategy Alignment', 'People & Culture'],
      },
      {
        id: 'i8',
        category: 'strength',
        title: 'MLOps Platform Maturity Supports Enterprise Scaling',
        description: 'Your MLOps infrastructure (MLflow, Kubeflow, containerized deployment, CI/CD) is at enterprise-grade maturity. This positions the organization to scale from current state (23 active projects) to 100+ concurrent AI initiatives without major platform re-architecture. The combination of model registry, experiment tracking, and automated deployment provides a force multiplier as AI adoption expands across business units.',
        impact: 'medium',
        effort: 'low',
        priority: 4,
        affectedAreas: ['Technical Capability'],
      },
    ],
    recommendations: [
      {
        id: 'r1',
        title: 'Establish Comprehensive AI Governance Framework',
        description: 'Implement a multi-layered governance framework that balances innovation velocity with responsible AI practices. This includes creating clear policies, review processes, accountability structures, and measurement systems. The framework should cover ethical considerations, risk management, regulatory compliance, and stakeholder engagement. This is the highest priority given regulatory risk and the critical gap identified.',
        impact: 'Addresses critical governance gap (score: 45/100), reduces regulatory risk, enables compliant scaling of AI initiatives, builds stakeholder trust, and establishes foundation for responsible AI practice.',
        implementation: {
          timeframe: '6-8 months for complete implementation',
          effort: 'High - requires executive sponsorship, cross-functional working group, policy development, and organization-wide training',
          resources: [
            'AI Governance Lead (new hire or internal assignment) - 100% dedicated',
            'Legal counsel specializing in AI/ML regulation - 20% allocation',
            'AI Ethics specialist or consultant - initial 3-month engagement',
            'Working group: representatives from engineering, legal, product, security, HR (10-15 people, 10% time)',
            'Budget: $150K-$200K for external expertise, training, tools',
          ],
          steps: [
            'Month 1: Form governance working group, conduct stakeholder interviews, assess current state and gaps',
            'Month 2: Research best practices, regulatory landscape, peer approaches; draft governance framework document',
            'Month 3: Develop specific policies (AI ethics principles, risk assessment process, review criteria, incident response)',
            'Month 4: Design governance processes and workflows (project intake, ethical review, approval gates, monitoring)',
            'Month 5: Create tools and templates (risk assessment questionnaire, model cards, bias evaluation checklist)',
            'Month 6: Pilot governance process with 3-5 upcoming AI projects, gather feedback, iterate',
            'Month 7: Organization-wide training and communication campaign, launch governance process',
            'Month 8: Monitor adoption, provide ongoing support, measure effectiveness, continuous improvement',
          ],
        },
        dependencies: [
          'Executive sponsorship from CTO and Chief Legal Officer',
          'Budget approval for AI Governance Lead role and external expertise',
          'Commitment from engineering leadership to follow governance processes',
          'Integration with existing compliance and risk management processes',
        ],
        expectedOutcomes: [
          '100% of new AI projects undergo risk assessment and ethical review by month 9',
          'Documented governance framework and policies accessible to all employees',
          'Reduced regulatory risk and improved audit readiness',
          'Increased stakeholder confidence in AI initiatives',
          'Clear accountability structures for AI system outcomes',
          'Foundation for scaling AI responsibly across organization',
          'Competitive advantage through "trustworthy AI" brand positioning',
        ],
        risks: [
          'Governance processes could slow innovation if not designed thoughtfully - mitigate with risk-based approach (high-risk = thorough review, low-risk = light touch)',
          'Organization may resist new processes - mitigate through change management, pilot approach, and demonstrating value',
          'Regulatory landscape is evolving rapidly - build flexibility into framework to adapt to new regulations',
          'Resource constraints could delay implementation - prioritize minimum viable governance framework first, then iterate',
        ],
      },
      {
        id: 'r2',
        title: 'Implement Enterprise Model Monitoring and Observability Platform',
        description: 'Deploy comprehensive monitoring infrastructure to track performance, data drift, business metrics, and operational health for all production ML models. This addresses the critical gap where only 41% of models have adequate monitoring. The platform should provide automated alerting, root cause analysis capabilities, and dashboards for both technical and business stakeholders.',
        impact: 'Reduces risk of undetected model degradation, enables proactive issue resolution, improves business outcomes from AI systems, supports compliance requirements for model monitoring.',
        implementation: {
          timeframe: '4-6 months',
          effort: 'Medium-High - requires tool selection, integration, instrumentation of existing models, and team training',
          resources: [
            'ML Platform Engineer lead - 75% allocation for 4 months',
            '2 ML Engineers for model instrumentation - 50% allocation',
            'Data Engineer for metric pipeline development - 25% allocation',
            'External monitoring platform license: $50K-$80K annually (e.g., Arize, Fiddler, WhyLabs)',
            'Integration and setup budget: $30K-$50K',
          ],
          steps: [
            'Month 1: Evaluate monitoring platforms (Arize, Fiddler, WhyLabs, build vs buy), define requirements, select solution',
            'Month 1-2: Design monitoring architecture (metrics to track, alerting thresholds, integration points)',
            'Month 2-3: Implement platform infrastructure, integrate with MLOps pipeline, create baseline dashboards',
            'Month 3-4: Instrument existing production models (prioritize by business criticality), define SLAs and alerting',
            'Month 4-5: Build automated alerting and incident response workflows, create runbooks',
            'Month 5: Train ML engineers and model owners on monitoring platform and best practices',
            'Month 6: Establish monitoring as required step in production deployment process, continuous improvement',
          ],
        },
        dependencies: [
          'Budget approval for monitoring platform license and implementation',
          'Cooperation from model owners to instrument their models',
          'Integration with existing MLOps infrastructure (MLflow, Kubeflow)',
          'Definition of business metrics and SLAs for each production model',
        ],
        expectedOutcomes: [
          '100% of production models have comprehensive monitoring by month 6',
          'Automated alerts for model performance degradation, data drift, and anomalies',
          'Mean time to detection (MTTD) for model issues reduced from days/weeks to minutes/hours',
          'Reduced business impact from model degradation (estimated $200K-$500K annually)',
          'Dashboards enabling business stakeholders to track AI system performance',
          'Compliance artifact for model monitoring requirements',
          'Foundation for continuous model improvement and optimization',
        ],
        risks: [
          'Integration complexity with existing systems - mitigate through phased rollout and vendor support',
          'Alert fatigue from poorly tuned thresholds - start conservative, refine based on actual incidents',
          'Resource commitment from model owners - make monitoring a requirement for production deployment',
        ],
      },
      {
        id: 'r3',
        title: 'Create Structured AI Value Realization Framework',
        description: 'Implement systematic processes for AI project prioritization, business case development, and outcome measurement. This addresses the strategy alignment gap and low POC-to-production conversion rate (19% vs 35-40% benchmark). The framework ensures AI investments align with business priorities and deliver measurable value.',
        impact: 'Increases POC-to-production conversion from 19% to 35%+ (5-6 additional production capabilities annually), improves business value delivery by 50-70%, strengthens business-engineering alignment, builds executive confidence in AI investments.',
        implementation: {
          timeframe: '3-5 months',
          effort: 'Medium - requires process design, template creation, and cross-functional adoption',
          resources: [
            'Product Manager or Strategy Lead - 50% allocation for 3 months',
            'Finance partner for ROI framework - 20% allocation',
            'Engineering leadership engagement - ongoing facilitation time',
            'External consultant (optional) for best practice frameworks - $40K-$60K',
          ],
          steps: [
            'Month 1: Design AI project intake and prioritization framework (scoring criteria: business value, feasibility, strategic alignment)',
            'Month 2: Create business case template and guidelines (required elements: problem definition, success metrics, ROI projection, resource requirements)',
            'Month 2-3: Develop production readiness checklist (technical, operational, business criteria for POC graduation)',
            'Month 3: Design outcome measurement system (KPI dashboards, business value tracking, retrospective process)',
            'Month 4: Pilot framework with upcoming AI initiatives, gather feedback from engineering and business stakeholders',
            'Month 5: Refine based on pilot learnings, launch organization-wide, integrate into AI project lifecycle',
          ],
        },
        dependencies: [
          'Executive alignment on AI prioritization criteria and decision-making authority',
          'Finance team support for ROI frameworks and value tracking',
          'Product and business unit engagement in defining success metrics',
          'Integration with existing portfolio management and budgeting processes',
        ],
        expectedOutcomes: [
          'All new AI initiatives have documented business cases with clear success metrics',
          'POC-to-production conversion rate increases from 19% to 35%+ (5-6 additional capabilities)',
          'Portfolio-level view of AI investments, progress, and business value delivered',
          'Reduced investment in low-value AI initiatives (estimated 20-30% cost avoidance)',
          'Improved business-engineering alignment (target: 7/10 from current 4.2/10)',
          'Data-driven decision making for AI resource allocation',
          'Executive dashboard showing AI value contribution to business objectives',
        ],
        risks: [
          'Additional process could be perceived as bureaucratic - mitigate by keeping it lightweight and demonstrating value quickly',
          'Disagreement on prioritization criteria - facilitate cross-functional workshop to build consensus',
          'ROI quantification challenges for exploratory/experimental projects - allow for different business case formats based on project maturity',
        ],
      },
      {
        id: 'r4',
        title: 'Launch AI Literacy and Enablement Program for Business Stakeholders',
        description: 'Develop and deliver comprehensive AI education program for non-technical stakeholders (product managers, business leaders, sales, marketing). This addresses the people & culture gap where business teams struggle to effectively leverage AI capabilities. Program should be hands-on, role-specific, and focused on practical application rather than theory.',
        impact: 'Improves business-engineering collaboration, enables business teams to identify high-value AI use cases, reduces misalignment between AI capabilities and business requests, accelerates AI adoption across organization.',
        implementation: {
          timeframe: '3-4 months to launch, ongoing delivery',
          effort: 'Medium - requires curriculum development, facilitator training, and sustained delivery',
          resources: [
            'Learning & Development lead - 50% allocation for curriculum development',
            'Subject matter experts (ML engineers, data scientists) - 10-15% for content creation',
            'Executive facilitators for leadership program - 5-10 days',
            'External AI education platform or consultant (optional) - $30K-$50K',
            'Budget for workshop materials, tools access - $20K',
          ],
          steps: [
            'Month 1: Conduct needs assessment (survey stakeholders, identify knowledge gaps by role), define learning objectives',
            'Month 1-2: Develop curriculum for different stakeholder groups (executives: strategic overview, product managers: AI product development, business analysts: AI use case identification)',
            'Month 2-3: Create hands-on materials (case studies from your organization, AI playground environments, use case ideation workshops)',
            'Month 3: Pilot programs with 2-3 stakeholder groups, gather feedback, refine content',
            'Month 4: Launch organization-wide rollout with regular cohorts (monthly or quarterly)',
            'Ongoing: Deliver recurring programs, create AI champions network, office hours for questions',
          ],
        },
        dependencies: [
          'Executive sponsorship and encouragement for participation',
          'Protected time for business stakeholders to attend training',
          'ML engineering team commitment to provide subject matter expertise',
          'Integration with existing learning & development programs',
        ],
        expectedOutcomes: [
          '200+ business stakeholders complete AI literacy training in first year',
          'Network of 30-50 AI champions across business units',
          'Increased quality of AI use case proposals from business teams',
          'Improved business-engineering alignment score (target: 7/10 from current 4.2/10)',
          'Reduced misunderstandings about AI capabilities and limitations',
          'Accelerated identification of high-value AI opportunities',
          'Cultural shift toward AI-first thinking in business problem solving',
        ],
        risks: [
          'Low participation if perceived as optional - mitigate through executive mandate and demonstrating career value',
          'Content too technical or too basic - offer multiple tracks and gather ongoing feedback',
          'Difficulty measuring impact - use surveys, use case quality assessments, and business alignment metrics',
        ],
      },
      {
        id: 'r5',
        title: 'Develop Specialized AI Talent and Career Development Framework',
        description: 'Address 23% ML engineer turnover by creating clear career paths, specialization tracks, and development opportunities for AI talent. This includes defining role levels (junior → senior → staff → principal ML engineer), competency frameworks, and creating exciting technical challenges that retain top performers.',
        impact: 'Reduces ML engineer turnover from 23% to industry benchmark of 12-15%, increases team capacity by 40% through reduced recruiting/onboarding overhead, improves talent quality through better development, creates competitive advantage in talent market.',
        implementation: {
          timeframe: '4-6 months to implement, ongoing maintenance',
          effort: 'Medium - requires HR partnership, compensation benchmarking, and management training',
          resources: [
            'HR business partner - 40% allocation for 4 months',
            'Engineering leadership - workshops and calibration time',
            'External compensation consultant (optional) - $20K-$30K',
            'Increased compensation budget for career advancement - $200K-$400K annually',
          ],
          steps: [
            'Month 1: Benchmark industry AI career frameworks (levels, competencies, compensation), conduct retention interviews with current team',
            'Month 2: Design ML engineer career ladder (5-6 levels) with clear progression criteria and competencies',
            'Month 3: Create specialization tracks (ML engineering, research, MLOps, AI product) with distinct value propositions',
            'Month 3-4: Develop competency assessment process, map current team members to new framework',
            'Month 4: Conduct compensation benchmarking, identify adjustment needs, secure budget',
            'Month 5: Train managers on career development conversations and promotion processes',
            'Month 6: Launch new framework, communicate to team, conduct individual development planning sessions',
            'Ongoing: Quarterly career development conversations, semi-annual promotion cycles, annual comp reviews',
          ],
        },
        dependencies: [
          'Budget for compensation adjustments and expanded team',
          'HR partnership for framework design and implementation',
          'Engineering leadership buy-in and active participation',
          'Integration with company-wide performance management systems',
        ],
        expectedOutcomes: [
          'ML engineer turnover reduced from 23% to 12-15% annually',
          'Clear career progression path for 100% of ML engineering team',
          'Improved retention saves estimated $800K-$1.2M annually in recruiting and lost productivity',
          'Increased team capacity by 40% through reduced turnover overhead',
          'Higher quality candidates attracted by clear career development opportunities',
          'Improved employee engagement scores for ML engineering team',
          'Specialized expertise developed in key areas (NLP, computer vision, MLOps)',
        ],
        risks: [
          'Budget constraints limiting compensation adjustments - phase implementation starting with highest-flight-risk individuals',
          'Expectations for rapid advancement - set clear, objective criteria and calibrate across team',
          'Complexity of managing multiple career tracks - start with single track, expand based on learnings',
        ],
      },
    ],
    benchmarks: [
      {
        metric: 'AI Maturity Score',
        yourScore: 72,
        industryAvg: 58,
        topPerformers: 84,
        unit: '%',
      },
      {
        metric: 'POC to Production Rate',
        yourScore: 19,
        industryAvg: 37,
        topPerformers: 52,
        unit: '%',
      },
      {
        metric: 'Model Deployment Velocity',
        yourScore: 3.2,
        industryAvg: 1.0,
        topPerformers: 4.5,
        unit: 'x',
      },
      {
        metric: 'Data Engineering Capability',
        yourScore: 88,
        industryAvg: 54,
        topPerformers: 92,
        unit: '%',
      },
      {
        metric: 'ML Talent Density',
        yourScore: 18,
        industryAvg: 12,
        topPerformers: 28,
        unit: 'engineers',
      },
      {
        metric: 'ML Engineer Turnover',
        yourScore: 23,
        industryAvg: 15,
        topPerformers: 8,
        unit: '%',
      },
      {
        metric: 'Production Model Monitoring',
        yourScore: 41,
        industryAvg: 68,
        topPerformers: 95,
        unit: '%',
      },
      {
        metric: 'AI Governance Maturity',
        yourScore: 45,
        industryAvg: 62,
        topPerformers: 88,
        unit: '%',
      },
    ],
    nextSteps: {
      immediate: [
        'Schedule governance framework kickoff meeting with CTO, Chief Legal Officer, and key stakeholders',
        'Initiate RFP process for model monitoring platform vendors (Arize, Fiddler, WhyLabs)',
        'Conduct retention interviews with ML engineering team to understand turnover drivers',
        'Assign owner for AI value realization framework development',
      ],
      shortTerm: [
        'Implement governance framework pilot with 3-5 upcoming AI projects (months 1-6)',
        'Deploy model monitoring for top 10 business-critical production models (months 1-3)',
        'Launch first cohort of AI literacy program for business stakeholders (months 3-4)',
        'Complete career framework design and communicate to ML engineering team (months 4-6)',
      ],
      longTerm: [
        'Achieve 100% coverage of governance processes for all AI initiatives (months 6-12)',
        'Increase POC-to-production conversion rate to 35%+ through value realization framework (months 6-12)',
        'Reduce ML engineer turnover to 12-15% through career development initiatives (months 12-18)',
        'Advance overall AI maturity score from 72% to 82%+ (Transformative level) (months 12-18)',
        'Expand AI literacy program to 500+ stakeholders across organization (ongoing)',
      ],
    },
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strength':
        return 'from-green-500 to-emerald-500'
      case 'opportunity':
        return 'from-blue-500 to-cyan-500'
      case 'risk':
        return 'from-orange-500 to-yellow-500'
      case 'critical':
        return 'from-red-500 to-pink-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength':
        return CheckCircle2
      case 'opportunity':
        return Target
      case 'risk':
        return AlertCircle
      case 'critical':
        return AlertCircle
      default:
        return AlertCircle
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-400 bg-red-500/10 border-red-500/20'
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      case 'low':
        return 'text-green-400 bg-green-500/10 border-green-500/20'
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-400" />
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-400" />
      case 'stable':
        return <Minus className="w-5 h-5 text-gray-400" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500'
    if (score >= 60) return 'from-blue-500 to-cyan-500'
    if (score >= 40) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="ml-[280px]">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white font-gendy">
                    {assessmentData.title}
                  </h1>
                  <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${getScoreColor(assessmentData.overallScore)} text-white text-sm font-semibold font-diatype`}>
                    {assessmentData.maturityLevel}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-400 font-diatype">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{assessmentData.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{assessmentData.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>{assessmentData.assessmentType}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 hover:border-purple-500/30 transition-all inline-flex items-center gap-2 font-diatype"
                >
                  <Share2 className="w-5 h-5" />
                  Share Report
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all inline-flex items-center gap-2 font-diatype"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </motion.button>
                <Link href="/dashboard/assessments">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 hover:border-purple-500/30 transition-all inline-flex items-center gap-2 font-diatype"
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                    Back to Assessments
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* Overall Score */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 font-diatype">
                    Overall AI Maturity Score
                  </h2>
                  <div className="flex items-end gap-4">
                    <div className="text-6xl font-bold text-white font-gendy">
                      {assessmentData.overallScore}
                      <span className="text-3xl text-gray-400">/{assessmentData.maxScore}</span>
                    </div>
                    <div className="mb-3 flex items-center gap-2 text-green-400">
                      <TrendingUp className="w-5 h-5" />
                      <span className="text-lg font-semibold font-diatype">
                        +{assessmentData.overallScore - assessmentData.previousScore} from previous
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-48 h-48 relative">
                  <svg className="transform -rotate-90 w-48 h-48">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      className="text-white/10"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 88}`}
                      strokeDashoffset={`${2 * Math.PI * 88 * (1 - assessmentData.overallScore / 100)}`}
                      className="transition-all duration-1000"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="w-16 h-16 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8 space-y-8">
          {/* Executive Summary */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 font-gendy">Executive Summary</h2>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <p className="text-gray-300 leading-relaxed font-diatype mb-6">
                {assessmentData.executiveSummary}
              </p>
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4 font-gendy">Key Findings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {assessmentData.keyFindings.map((finding, index) => (
                    <div key={index} className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-300 text-sm font-diatype">{finding}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Dimension Scores */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 font-gendy">Dimension Analysis</h2>
            <div className="space-y-6">
              {assessmentData.dimensions.map((dimension, index) => {
                const Icon = dimension.icon
                return (
                  <motion.div
                    key={dimension.dimension}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getScoreColor(dimension.score)} flex items-center justify-center`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white font-gendy">{dimension.dimension}</h3>
                          <p className="text-sm text-gray-400 font-diatype mt-1">{dimension.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-3xl font-bold text-white font-gendy">
                            {dimension.score}
                            <span className="text-xl text-gray-400">/{dimension.maxScore}</span>
                          </div>
                          <div className={`text-sm font-semibold font-diatype px-3 py-1 rounded-full ${getImpactColor(dimension.level.toLowerCase())} inline-block mt-1`}>
                            {dimension.level}
                          </div>
                        </div>
                        <div>
                          {getTrendIcon(dimension.trend as 'up' | 'down' | 'stable')}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getScoreColor(dimension.score)} transition-all duration-1000`}
                          style={{ width: `${dimension.score}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Strengths */}
                      <div>
                        <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3 font-diatype flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Strengths ({dimension.strengths.length})
                        </h4>
                        <ul className="space-y-2">
                          {dimension.strengths.map((strength, idx) => (
                            <li key={idx} className="text-sm text-gray-300 font-diatype flex gap-2">
                              <span className="text-green-400 flex-shrink-0">•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Gaps */}
                      <div>
                        <h4 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-3 font-diatype flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Gaps to Address ({dimension.gaps.length})
                        </h4>
                        <ul className="space-y-2">
                          {dimension.gaps.map((gap, idx) => (
                            <li key={idx} className="text-sm text-gray-300 font-diatype flex gap-2">
                              <span className="text-orange-400 flex-shrink-0">•</span>
                              <span>{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </section>

          {/* Key Insights */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 font-gendy">Key Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assessmentData.insights.map((insight, index) => {
                const CategoryIcon = getCategoryIcon(insight.category)
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCategoryColor(insight.category)} flex items-center justify-center flex-shrink-0`}>
                        <CategoryIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-semibold uppercase tracking-wider font-diatype px-2 py-1 rounded-full ${getImpactColor(insight.category)}`}>
                            {insight.category}
                          </span>
                          <span className="text-xs text-gray-500 font-diatype">Priority {insight.priority}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white font-gendy mb-2">
                          {insight.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm text-gray-300 font-diatype leading-relaxed mb-4">
                      {insight.description}
                    </p>

                    <div className="flex items-center gap-4 mb-3">
                      <div className={`text-xs font-semibold px-2 py-1 rounded-full ${getImpactColor(insight.impact)} font-diatype`}>
                        {insight.impact.toUpperCase()} IMPACT
                      </div>
                      <div className={`text-xs font-semibold px-2 py-1 rounded-full ${getImpactColor(insight.effort)} font-diatype`}>
                        {insight.effort.toUpperCase()} EFFORT
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10">
                      <p className="text-xs text-gray-400 font-diatype mb-2">Affected Areas:</p>
                      <div className="flex flex-wrap gap-2">
                        {insight.affectedAreas.map((area, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full font-diatype">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </section>

          {/* Recommendations */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 font-gendy">Strategic Recommendations</h2>
            <div className="space-y-6">
              {assessmentData.recommendations.map((rec, index) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold font-gendy">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold text-white font-gendy mb-3">{rec.title}</h3>
                      <p className="text-gray-300 font-diatype leading-relaxed mb-4">{rec.description}</p>
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                        <p className="text-sm text-purple-300 font-diatype"><strong>Impact:</strong> {rec.impact}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Implementation Details */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2 font-diatype">Implementation Timeline</h4>
                        <p className="text-sm text-gray-300 font-diatype">{rec.implementation.timeframe}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2 font-diatype">Effort Required</h4>
                        <p className="text-sm text-gray-300 font-diatype">{rec.implementation.effort}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2 font-diatype">Resources Needed</h4>
                        <ul className="space-y-1">
                          {rec.implementation.resources.map((resource, idx) => (
                            <li key={idx} className="text-sm text-gray-300 font-diatype flex gap-2">
                              <span className="text-blue-400 flex-shrink-0">•</span>
                              <span>{resource}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Implementation Steps */}
                    <div>
                      <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3 font-diatype">Implementation Steps</h4>
                      <ol className="space-y-2">
                        {rec.implementation.steps.map((step, idx) => (
                          <li key={idx} className="text-sm text-gray-300 font-diatype flex gap-3">
                            <span className="text-green-400 flex-shrink-0 font-semibold">{idx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-white/10">
                    {/* Dependencies */}
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-2 font-diatype">Dependencies</h4>
                      <ul className="space-y-1">
                        {rec.dependencies.map((dep, idx) => (
                          <li key={idx} className="text-sm text-gray-300 font-diatype flex gap-2">
                            <span className="text-yellow-400 flex-shrink-0">•</span>
                            <span>{dep}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Expected Outcomes */}
                    <div>
                      <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-2 font-diatype">Expected Outcomes</h4>
                      <ul className="space-y-1">
                        {rec.expectedOutcomes.map((outcome, idx) => (
                          <li key={idx} className="text-sm text-gray-300 font-diatype flex gap-2">
                            <span className="text-purple-400 flex-shrink-0">•</span>
                            <span>{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Risks */}
                    <div>
                      <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2 font-diatype">Risk Mitigation</h4>
                      <ul className="space-y-1">
                        {rec.risks.map((risk, idx) => (
                          <li key={idx} className="text-sm text-gray-300 font-diatype flex gap-2">
                            <span className="text-red-400 flex-shrink-0">•</span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Industry Benchmarks */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 font-gendy">Industry Benchmarks</h2>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <div className="space-y-6">
                {assessmentData.benchmarks.map((benchmark, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white font-diatype">{benchmark.metric}</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-purple-400 font-semibold font-diatype">
                          You: {benchmark.yourScore}{benchmark.unit}
                        </span>
                        <span className="text-gray-400 font-diatype">
                          Avg: {benchmark.industryAvg}{benchmark.unit}
                        </span>
                        <span className="text-blue-400 font-semibold font-diatype">
                          Top: {benchmark.topPerformers}{benchmark.unit}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-3 bg-white/10 rounded-full overflow-visible">
                      {/* Industry Average Marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
                        style={{ left: `${(benchmark.industryAvg / benchmark.topPerformers) * 100}%` }}
                      />
                      {/* Top Performers Marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-blue-400"
                        style={{ left: '100%' }}
                      />
                      {/* Your Score Bar */}
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000"
                        style={{ width: `${(benchmark.yourScore / benchmark.topPerformers) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Next Steps */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 font-gendy">Next Steps</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white font-gendy">Immediate (0-30 days)</h3>
                </div>
                <ul className="space-y-2">
                  {assessmentData.nextSteps.immediate.map((step, idx) => (
                    <li key={idx} className="text-sm text-gray-300 font-diatype flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white font-gendy">Short-Term (1-6 months)</h3>
                </div>
                <ul className="space-y-2">
                  {assessmentData.nextSteps.shortTerm.map((step, idx) => (
                    <li key={idx} className="text-sm text-gray-300 font-diatype flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white font-gendy">Long-Term (6-18 months)</h3>
                </div>
                <ul className="space-y-2">
                  {assessmentData.nextSteps.longTerm.map((step, idx) => (
                    <li key={idx} className="text-sm text-gray-300 font-diatype flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
