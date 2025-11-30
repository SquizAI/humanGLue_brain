'use client'

import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Download,
  Share2,
  Play,
  CheckCircle2,
  Clock,
  Star,
  TrendingUp,
  Users,
  Zap,
  Settings,
  AlertCircle,
  Target,
  BarChart3,
  FileText,
  Lightbulb,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
interface WorkflowStep {
  number: number
  title: string
  description: string
  duration: string
  actions: string[]
  tips?: string[]
}

interface WorkflowData {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  duration: string
  rating: number
  downloads: number
  useCases: string[]
  heroImage: string
  overview: string
  benefits: string[]
  prerequisites: string[]
  toolsNeeded: string[]
  steps: WorkflowStep[]
  successMetrics: Array<{metric: string; target: string; description: string}>
  commonPitfalls: Array<{issue: string; solution: string}>
  nextSteps: string[]
}

const workflowData: Record<string, WorkflowData> = {
  '1': {
    id: '1',
    title: 'Customer Onboarding Automation',
    description: 'Streamline new customer onboarding with AI-powered document processing and personalized workflows',
    category: 'Sales',
    difficulty: 'Beginner',
    duration: '30 mins',
    rating: 4.8,
    downloads: 1243,
    useCases: ['SaaS', 'E-commerce', 'B2B'],
    heroImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
    overview: 'This workflow automates the customer onboarding process from initial signup through account activation. By leveraging AI-powered document verification and intelligent routing, you can reduce onboarding time by 60% while improving data accuracy and customer experience.',
    benefits: [
      'Reduce onboarding time from days to hours',
      'Improve data accuracy with AI-powered verification',
      'Provide personalized onboarding experiences',
      'Free up team time for high-value activities',
      'Track onboarding progress in real-time'
    ],
    prerequisites: [
      'CRM system (Salesforce, HubSpot, or similar)',
      'Customer data platform access',
      'Email automation tool',
      'Document management system'
    ],
    toolsNeeded: [
      'Zapier or Make.com for workflow automation',
      'OpenAI API for document processing',
      'SendGrid or similar for email automation',
      'Your CRM API access'
    ],
    steps: [
      {
        number: 1,
        title: 'Set Up Customer Data Capture',
        description: 'Configure forms and data collection points for new customer information',
        duration: '5 mins',
        actions: [
          'Create signup form in your system',
          'Configure required fields (name, email, company, etc.)',
          'Set up form validation rules',
          'Connect form to your CRM via API'
        ],
        tips: [
          'Keep initial form short to reduce friction',
          'Use progressive profiling to gather more data over time'
        ]
      },
      {
        number: 2,
        title: 'Configure AI Document Verification',
        description: 'Set up automated document processing for KYC and compliance',
        duration: '8 mins',
        actions: [
          'Connect to OpenAI Vision API or similar service',
          'Define document types to accept (ID, business license, etc.)',
          'Set up automatic data extraction rules',
          'Configure verification thresholds'
        ],
        tips: [
          'Start with common document types and expand gradually',
          'Always include manual review option for edge cases'
        ]
      },
      {
        number: 3,
        title: 'Build Personalized Email Sequences',
        description: 'Create dynamic email workflows based on customer profile',
        duration: '7 mins',
        actions: [
          'Design welcome email template',
          'Create role-based email variants (decision maker, user, admin)',
          'Set up educational content sequences',
          'Configure trigger conditions'
        ]
      },
      {
        number: 4,
        title: 'Automate Account Setup',
        description: 'Trigger automatic account provisioning upon verification',
        duration: '5 mins',
        actions: [
          'Create API workflow for account creation',
          'Set up user permissions based on role',
          'Configure initial account settings',
          'Send login credentials securely'
        ]
      },
      {
        number: 5,
        title: 'Implement Progress Tracking',
        description: 'Monitor onboarding completion and engagement',
        duration: '3 mins',
        actions: [
          'Set up onboarding milestone tracking',
          'Create completion dashboard',
          'Configure alerts for stalled onboarding',
          'Build reporting views'
        ]
      },
      {
        number: 6,
        title: 'Test and Launch',
        description: 'Validate workflow end-to-end and deploy to production',
        duration: '2 mins',
        actions: [
          'Run test onboarding with sample data',
          'Verify all integrations are working',
          'Check email delivery and formatting',
          'Enable workflow for new signups'
        ]
      }
    ],
    successMetrics: [
      {metric: 'Time to Activation', target: '< 24 hours', description: 'Time from signup to first use'},
      {metric: 'Completion Rate', target: '> 85%', description: 'Percentage of users completing onboarding'},
      {metric: 'Manual Interventions', target: '< 10%', description: 'Cases requiring human review'},
      {metric: 'Customer Satisfaction', target: '> 4.5/5', description: 'Onboarding experience rating'}
    ],
    commonPitfalls: [
      {issue: 'Too many required fields causing drop-off', solution: 'Use progressive profiling - collect minimum data upfront'},
      {issue: 'AI misclassifying documents', solution: 'Implement confidence thresholds and manual review queue'},
      {issue: 'Generic email content feels impersonal', solution: 'Personalize with name, company, role, and use case'}
    ],
    nextSteps: [
      'Add behavioral triggers for re-engagement',
      'Implement predictive lead scoring',
      'Build customer success handoff workflow'
    ]
  },
  '2': {
    id: '2',
    title: 'Intelligent Lead Scoring',
    description: 'Automatically score and prioritize leads using predictive AI models',
    category: 'Marketing',
    difficulty: 'Intermediate',
    duration: '45 mins',
    rating: 4.9,
    downloads: 987,
    useCases: ['B2B', 'Enterprise', 'SaaS'],
    heroImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
    overview: 'Transform your lead qualification process with AI-powered predictive scoring. This workflow analyzes behavioral data, firmographic information, and engagement patterns to automatically identify your highest-value leads, helping sales teams focus on opportunities most likely to convert.',
    benefits: [
      'Increase conversion rates by 30-40%',
      'Reduce time spent on low-quality leads',
      'Prioritize sales team efforts effectively',
      'Identify hidden high-value opportunities',
      'Continuously improve scoring accuracy'
    ],
    prerequisites: [
      'Marketing automation platform (Marketo, HubSpot, etc.)',
      'CRM with lead data',
      'Historical conversion data (at least 6 months)',
      'Web analytics integration'
    ],
    toolsNeeded: [
      'Python environment for model training',
      'Scikit-learn or similar ML library',
      'CRM API access',
      'Cloud function service (AWS Lambda, Google Cloud Functions)'
    ],
    steps: [
      {
        number: 1,
        title: 'Data Collection & Preparation',
        description: 'Gather and clean historical lead data for model training',
        duration: '10 mins',
        actions: [
          'Export lead data from CRM (firmographics, demographics)',
          'Collect behavioral data (page visits, downloads, email engagement)',
          'Add conversion outcomes (win/loss, deal value)',
          'Clean data and handle missing values'
        ],
        tips: [
          'Include at least 1000 historical leads for accurate model',
          'Balance dataset between converted and non-converted leads'
        ]
      },
      {
        number: 2,
        title: 'Feature Engineering',
        description: 'Create meaningful variables that predict conversion',
        duration: '8 mins',
        actions: [
          'Calculate engagement scores (email opens, content downloads)',
          'Create time-based features (days since first touch)',
          'Add firmographic signals (company size, industry, revenue)',
          'Generate interaction features (engagement × fit)'
        ]
      },
      {
        number: 3,
        title: 'Model Training',
        description: 'Build and validate predictive scoring model',
        duration: '10 mins',
        actions: [
          'Split data into training/validation sets (80/20)',
          'Train gradient boosting classifier',
          'Evaluate model accuracy and precision',
          'Tune hyperparameters for optimal performance'
        ],
        tips: [
          'Focus on precision for high scores to avoid false positives',
          'Use cross-validation to ensure model generalizes well'
        ]
      },
      {
        number: 4,
        title: 'Score Calibration',
        description: 'Map model predictions to business-friendly scores',
        duration: '5 mins',
        actions: [
          'Convert probabilities to 0-100 point scale',
          'Define score tiers (Hot: 80+, Warm: 50-79, Cold: <50)',
          'Set thresholds for sales routing',
          'Create score change alerts'
        ]
      },
      {
        number: 5,
        title: 'CRM Integration',
        description: 'Deploy model and sync scores to CRM automatically',
        duration: '8 mins',
        actions: [
          'Deploy model as cloud function/API',
          'Set up real-time scoring on lead updates',
          'Create custom field in CRM for AI score',
          'Build dashboard views sorted by score'
        ]
      },
      {
        number: 6,
        title: 'Sales Workflow Automation',
        description: 'Route leads based on scores and trigger appropriate actions',
        duration: '4 mins',
        actions: [
          'Auto-assign hot leads to senior reps',
          'Create nurture campaigns for warm leads',
          'Set up re-engagement workflows for cold leads',
          'Configure score change notifications'
        ]
      },
      {
        number: 7,
        title: 'Model Monitoring',
        description: 'Track model performance and retrain as needed',
        duration: '2 mins',
        actions: [
          'Monitor prediction accuracy weekly',
          'Track conversion rates by score tier',
          'Set up data drift alerts',
          'Schedule monthly model retraining'
        ]
      },
      {
        number: 8,
        title: 'Optimization Loop',
        description: 'Continuously improve scoring based on outcomes',
        duration: '3 mins',
        actions: [
          'Analyze false positives and false negatives',
          'Add new behavioral signals',
          'Refine score thresholds based on sales feedback',
          'A/B test model variations'
        ]
      }
    ],
    successMetrics: [
      {metric: 'Model Accuracy', target: '> 75%', description: 'Correct classification rate'},
      {metric: 'Conversion Rate (Hot Leads)', target: '> 40%', description: 'High-score lead conversion'},
      {metric: 'Sales Cycle Reduction', target: '25%', description: 'Time saved focusing on qualified leads'},
      {metric: 'Pipeline Value', target: '+35%', description: 'Increase in qualified opportunities'}
    ],
    commonPitfalls: [
      {issue: 'Model overfitting on historical data', solution: 'Use cross-validation and test on recent leads'},
      {issue: 'Ignoring model drift over time', solution: 'Monitor performance weekly and retrain monthly'},
      {issue: 'Salespeople ignoring AI scores', solution: 'Show correlation between scores and win rates'}
    ],
    nextSteps: [
      'Add competitive intelligence signals',
      'Build next-best-action recommendations',
      'Implement account-level scoring for ABM'
    ]
  },
  '3': {
    id: '3',
    title: 'Automated Report Generation',
    description: 'Generate comprehensive business reports automatically with AI-driven insights',
    category: 'Analytics',
    difficulty: 'Intermediate',
    duration: '1 hour',
    rating: 4.7,
    downloads: 2156,
    useCases: ['Finance', 'Operations', 'Executive'],
    heroImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
    overview: 'Eliminate manual report creation with AI-powered automation. This workflow connects to your data sources, generates visualizations, applies natural language insights, and distributes polished reports on schedule - saving 10+ hours per week.',
    benefits: [
      'Save 80% of time on report creation',
      'Ensure consistency and accuracy',
      'Deliver insights faster to stakeholders',
      'Surface hidden patterns automatically',
      'Enable self-service analytics'
    ],
    prerequisites: [
      'Data warehouse or analytics database',
      'BI tool (Tableau, Power BI, Looker)',
      'Report template designs',
      'Distribution list and schedule'
    ],
    toolsNeeded: [
      'Python for data processing',
      'OpenAI API for narrative generation',
      'BI tool API or Python connector',
      'Email/Slack for distribution'
    ],
    steps: [
      {
        number: 1,
        title: 'Define Report Requirements',
        description: 'Specify metrics, visualizations, and distribution parameters',
        duration: '8 mins',
        actions: [
          'List all required KPIs and metrics',
          'Define visualization types for each metric',
          'Determine report frequency (daily, weekly, monthly)',
          'Identify stakeholders and access levels'
        ]
      },
      {
        number: 2,
        title: 'Set Up Data Connections',
        description: 'Connect to all required data sources',
        duration: '7 mins',
        actions: [
          'Configure database connections',
          'Write SQL queries for metric calculation',
          'Test data extraction and validation',
          'Set up incremental refresh logic'
        ]
      },
      {
        number: 3,
        title: 'Build Visualization Pipeline',
        description: 'Create charts and graphs programmatically',
        duration: '10 mins',
        actions: [
          'Generate charts using Plotly or similar',
          'Apply consistent styling and branding',
          'Add dynamic filtering capabilities',
          'Export visualizations as images'
        ]
      },
      {
        number: 4,
        title: 'Implement AI Narrative Generation',
        description: 'Use LLMs to write executive summaries and insights',
        duration: '12 mins',
        actions: [
          'Send metrics to GPT-4 with context prompt',
          'Generate trend analysis and anomaly detection',
          'Create plain-language explanations',
          'Add actionable recommendations'
        ],
        tips: [
          'Provide historical context in prompts for better insights',
          'Use few-shot examples to guide narrative style'
        ]
      },
      {
        number: 5,
        title: 'Assemble Report Document',
        description: 'Combine text, visualizations, and formatting',
        duration: '8 mins',
        actions: [
          'Use report template (PDF, PowerPoint, or HTML)',
          'Insert AI-generated narrative',
          'Embed charts and visualizations',
          'Add branding and metadata'
        ]
      },
      {
        number: 6,
        title: 'Configure Distribution',
        description: 'Set up automated delivery on schedule',
        duration: '6 mins',
        actions: [
          'Create email distribution list',
          'Set up Slack/Teams notifications',
          'Configure scheduling (cron job)',
          'Add links to interactive dashboards'
        ]
      },
      {
        number: 7,
        title: 'Add Quality Checks',
        description: 'Validate data and catch errors before distribution',
        duration: '5 mins',
        actions: [
          'Implement data completeness checks',
          'Validate metric calculations',
          'Check for unusual values or anomalies',
          'Send alerts if validation fails'
        ]
      },
      {
        number: 8,
        title: 'Build Feedback Loop',
        description: 'Collect stakeholder input for continuous improvement',
        duration: '4 mins',
        actions: [
          'Add feedback form to reports',
          'Track report open rates and engagement',
          'Survey stakeholders on usefulness',
          'Iterate based on feedback'
        ]
      }
    ],
    successMetrics: [
      {metric: 'Time Savings', target: '10+ hours/week', description: 'Reduction in manual reporting time'},
      {metric: 'Report Accuracy', target: '> 99%', description: 'Correct calculations and data'},
      {metric: 'Stakeholder Satisfaction', target: '> 4.0/5', description: 'Report usefulness rating'},
      {metric: 'Delivery Timeliness', target: '100%', description: 'On-schedule distribution rate'}
    ],
    commonPitfalls: [
      {issue: 'AI narratives lacking business context', solution: 'Include domain knowledge in prompts and use examples'},
      {issue: 'Data refresh failures causing stale reports', solution: 'Implement robust error handling and alerting'},
      {issue: 'Reports becoming too long and unreadable', solution: 'Use executive summary + detailed appendix structure'}
    ],
    nextSteps: [
      'Add interactive drill-down capabilities',
      'Implement anomaly detection alerts',
      'Build conversational query interface'
    ]
  }
}

export default function WorkflowDetailPage() {
  const router = useRouter()
  const params = useParams()
    const workflowId = params.id as string

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const workflow = workflowData[workflowId] || workflowData['1']

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'Intermediate': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      case 'Advanced': return 'text-red-400 bg-red-500/10 border-red-500/20'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all">
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard/workflows">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-cyan-500/30 transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </motion.button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-white font-gendy">
                    {workflow.title}
                  </h1>
                  <p className="text-gray-400 font-diatype text-sm">
                    {workflow.category} Workflow
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 hover:border-cyan-500/30 transition-all inline-flex items-center gap-2 font-diatype"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all inline-flex items-center gap-2 shadow-lg shadow-cyan-500/50 font-diatype"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </motion.button>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative h-[300px] rounded-2xl overflow-hidden"
              >
                <Image
                  src={workflow.heroImage}
                  alt={workflow.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
                <div className="absolute bottom-6 left-6 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-semibold font-diatype">
                    {workflow.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full border text-sm font-semibold font-diatype ${getDifficultyColor(workflow.difficulty)}`}>
                    {workflow.difficulty}
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-4 font-gendy">Overview</h2>
                <p className="text-gray-300 font-diatype leading-relaxed mb-6">
                  {workflow.overview}
                </p>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 font-gendy">Key Benefits</h3>
                  <ul className="space-y-2">
                    {workflow.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-300 font-diatype">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-semibold mb-3 font-gendy">Prerequisites</h4>
                    <ul className="space-y-2">
                      {workflow.prerequisites.map((req, i) => (
                        <li key={i} className="text-gray-400 text-sm flex items-start gap-2 font-diatype">
                          <Settings className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-3 font-gendy">Tools Needed</h4>
                    <ul className="space-y-2">
                      {workflow.toolsNeeded.map((tool, i) => (
                        <li key={i} className="text-gray-400 text-sm flex items-start gap-2 font-diatype">
                          <Zap className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                          {tool}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6 font-gendy">Implementation Steps</h2>
                <div className="space-y-6">
                  {workflow.steps.map((step, i) => (
                    <div key={step.number} className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold font-gendy flex-shrink-0">
                          {step.number}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xl font-semibold text-white font-gendy">{step.title}</h4>
                            <span className="flex items-center gap-1 text-cyan-400 text-sm font-diatype">
                              <Clock className="w-4 h-4" />
                              {step.duration}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm font-diatype mb-4">{step.description}</p>

                          <div className="mb-4">
                            <h5 className="text-white font-semibold mb-2 font-diatype">Actions:</h5>
                            <ul className="space-y-1">
                              {step.actions.map((action, j) => (
                                <li key={j} className="text-gray-300 text-sm flex items-start gap-2 font-diatype">
                                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {step.tips && step.tips.length > 0 && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                              <div className="flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-blue-400 font-semibold text-sm mb-1 font-diatype">Pro Tips:</p>
                                  <ul className="space-y-1">
                                    {step.tips.map((tip, k) => (
                                      <li key={k} className="text-blue-300 text-xs font-diatype">{tip}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6 font-gendy">Success Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workflow.successMetrics.map((metric, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-semibold font-diatype">{metric.metric}</h4>
                        <span className="text-green-400 font-bold font-gendy">{metric.target}</span>
                      </div>
                      <p className="text-gray-400 text-sm font-diatype">{metric.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6 font-gendy">Common Pitfalls & Solutions</h2>
                <div className="space-y-4">
                  {workflow.commonPitfalls.map((pitfall, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-start gap-3 mb-2">
                        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-1 font-diatype">Issue: {pitfall.issue}</h4>
                          <p className="text-green-400 text-sm font-diatype">
                            <span className="font-semibold">Solution:</span> {pitfall.solution}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-4 font-gendy">Next Steps</h2>
                <ul className="space-y-2">
                  {workflow.nextSteps.map((step, i) => (
                    <li key={i} className="text-gray-300 flex items-start gap-2 font-diatype">
                      <Target className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      {step}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sticky top-24"
              >
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-bold font-gendy">{workflow.rating}</span>
                    <span className="text-gray-400 text-sm font-diatype">rating</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    <span className="font-diatype">{workflow.duration} to implement</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <span className="font-diatype">{workflow.downloads.toLocaleString()} downloads</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <span className="font-diatype">{workflow.steps.length} steps</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/50 font-diatype mb-3"
                >
                  <Play className="w-5 h-5" />
                  Start Implementation
                </motion.button>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <h4 className="text-white font-semibold mb-3 font-gendy">Use Cases</h4>
                  <div className="flex flex-wrap gap-2">
                    {workflow.useCases.map((useCase) => (
                      <span key={useCase} className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold font-diatype">
                        {useCase}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
