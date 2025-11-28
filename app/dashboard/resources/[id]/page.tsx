'use client'

import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Download,
  BookmarkPlus,
  Clock,
  FileText,
  CheckCircle2,
  Star,
  Users,
  Calendar,
  Share2,
  Eye,
  ChevronRight,
  Lightbulb,
  Target,
  TrendingUp,
  Award,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
interface Section {
  title: string
  content: string
  subsections?: Array<{
    title: string
    content: string
    bullets?: string[]
  }>
}

interface KeyTakeaway {
  title: string
  description: string
  icon: 'target' | 'lightbulb' | 'trending' | 'award'
}

interface ResourceData {
  id: string
  title: string
  description: string
  type: 'Guide' | 'Playbook' | 'Framework' | 'Template' | 'Case Study'
  category: string
  readTime: string
  downloads: number
  pages: number
  publishedDate: string
  heroImage: string
  overview: string
  keyTakeaways: KeyTakeaway[]
  tableOfContents: string[]
  sections: Section[]
  downloadables: Array<{
    name: string
    description: string
    format: string
    size: string
  }>
  relatedResources: Array<{
    id: string
    title: string
    type: string
  }>
  author: {
    name: string
    title: string
    image: string
  }
  tags: string[]
  rating: number
  reviews: number
}

export default function ResourceDetailPage() {
  const router = useRouter()
  const params = useParams()
    const id = params?.id as string

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const resourceData: Record<string, ResourceData> = {
    '1': {
      id: '1',
      title: 'AI Strategy Implementation Guide',
      description: 'Comprehensive guide to developing and executing an effective AI strategy',
      type: 'Guide',
      category: 'Strategy',
      readTime: '45 mins',
      downloads: 2341,
      pages: 87,
      publishedDate: 'Dec 2024',
      heroImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop',
      overview: 'This comprehensive guide provides a structured approach to developing and implementing an AI strategy that aligns with your organizational goals. Drawing from real-world implementations across Fortune 500 companies, this guide walks you through assessment, planning, execution, and measurement phases.',
      keyTakeaways: [
        {
          title: 'Strategic Alignment',
          description: 'Ensure your AI initiatives directly support business objectives and create measurable value',
          icon: 'target'
        },
        {
          title: 'Stakeholder Buy-in',
          description: 'Build consensus across leadership and secure the commitment needed for transformation',
          icon: 'lightbulb'
        },
        {
          title: 'Phased Approach',
          description: 'Start with quick wins to build momentum, then scale to enterprise-wide initiatives',
          icon: 'trending'
        },
        {
          title: 'Continuous Learning',
          description: 'Establish feedback loops and metrics to continuously improve your AI capabilities',
          icon: 'award'
        }
      ],
      tableOfContents: [
        'Executive Summary',
        'Assessing AI Readiness',
        'Defining Strategic Objectives',
        'Building the Business Case',
        'Technology Stack Selection',
        'Talent and Capability Development',
        'Implementation Roadmap',
        'Governance and Ethics',
        'Measuring Success',
        'Case Studies and Examples'
      ],
      sections: [
        {
          title: 'Executive Summary',
          content: 'AI transformation requires a holistic approach that goes beyond technology implementation. This guide provides a framework for developing an AI strategy that aligns with business goals, secures stakeholder buy-in, and delivers measurable ROI.',
          subsections: [
            {
              title: 'Who This Guide Is For',
              content: 'This guide is designed for C-suite executives, strategy leaders, and transformation teams responsible for driving AI adoption within their organizations.',
              bullets: [
                'CEOs and business unit leaders setting strategic direction',
                'CTOs and technology leaders evaluating AI capabilities',
                'Strategy and transformation teams building roadmaps',
                'Innovation leaders identifying opportunities for AI application'
              ]
            }
          ]
        },
        {
          title: 'Assessing AI Readiness',
          content: 'Before embarking on AI implementation, organizations must honestly assess their current state across technology, data, talent, and culture dimensions.',
          subsections: [
            {
              title: 'Technology Infrastructure',
              content: 'Evaluate your current technology stack for AI readiness.',
              bullets: [
                'Cloud infrastructure and compute capabilities',
                'Data storage and processing systems',
                'Integration architecture and APIs',
                'Security and compliance frameworks'
              ]
            },
            {
              title: 'Data Maturity',
              content: 'Assess the quality, accessibility, and governance of your data assets.',
              bullets: [
                'Data quality and completeness',
                'Data governance policies and practices',
                'Accessibility across the organization',
                'Real-time vs batch processing capabilities'
              ]
            },
            {
              title: 'Organizational Culture',
              content: 'Measure your organization\'s readiness for AI-driven change.',
              bullets: [
                'Leadership commitment to AI transformation',
                'Employee attitudes toward automation',
                'Change management capabilities',
                'Learning and experimentation culture'
              ]
            }
          ]
        },
        {
          title: 'Defining Strategic Objectives',
          content: 'Successful AI strategies start with clear objectives tied to business outcomes. This section helps you identify and prioritize AI use cases that deliver the greatest value.',
          subsections: [
            {
              title: 'Identifying High-Value Use Cases',
              content: 'Use a systematic approach to identify where AI can create the most value.',
              bullets: [
                'Revenue growth opportunities (personalization, recommendation engines)',
                'Cost reduction initiatives (automation, optimization)',
                'Risk mitigation (fraud detection, compliance monitoring)',
                'Customer experience enhancement (chatbots, predictive service)'
              ]
            },
            {
              title: 'Prioritization Framework',
              content: 'Not all AI initiatives are created equal. Use this framework to prioritize.',
              bullets: [
                'Business impact: Revenue potential and cost savings',
                'Technical feasibility: Data availability and complexity',
                'Time to value: How quickly you can deliver results',
                'Strategic alignment: Fit with long-term vision'
              ]
            }
          ]
        },
        {
          title: 'Building the Business Case',
          content: 'A compelling business case is essential for securing investment and resources. This section provides templates and examples for quantifying AI ROI.',
          subsections: [
            {
              title: 'Cost-Benefit Analysis',
              content: 'Develop a comprehensive view of costs and benefits.',
              bullets: [
                'Technology costs: Cloud infrastructure, software licenses, tools',
                'Talent costs: Hiring, training, consulting',
                'Change management: Communications, training programs',
                'Expected benefits: Revenue growth, cost savings, efficiency gains'
              ]
            },
            {
              title: 'ROI Calculation',
              content: 'Use proven models to project return on investment.',
              bullets: [
                'Direct cost savings from automation (labor, time)',
                'Revenue increases from personalization and optimization',
                'Risk reduction value (fraud prevention, compliance)',
                'Soft benefits (customer satisfaction, employee engagement)'
              ]
            }
          ]
        }
      ],
      downloadables: [
        {
          name: 'AI Readiness Assessment Template',
          description: 'Comprehensive checklist to evaluate your organization\'s AI readiness',
          format: 'XLSX',
          size: '245 KB'
        },
        {
          name: 'Business Case Calculator',
          description: 'Excel tool to calculate ROI for AI initiatives',
          format: 'XLSX',
          size: '180 KB'
        },
        {
          name: 'Strategy Presentation Template',
          description: 'PowerPoint template for presenting AI strategy to stakeholders',
          format: 'PPTX',
          size: '3.2 MB'
        },
        {
          name: 'Complete Guide PDF',
          description: 'Full 87-page guide with all frameworks and templates',
          format: 'PDF',
          size: '12.5 MB'
        }
      ],
      relatedResources: [
        { id: '3', title: 'AI Maturity Assessment Framework', type: 'Framework' },
        { id: '2', title: 'Change Management Playbook', type: 'Playbook' },
        { id: '6', title: 'AI Ethics and Governance Framework', type: 'Framework' }
      ],
      author: {
        name: 'Dr. Sarah Chen',
        title: 'AI Strategy Director',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
      },
      tags: ['AI Strategy', 'Digital Transformation', 'Business Case', 'ROI', 'Implementation'],
      rating: 4.8,
      reviews: 156
    },
    '2': {
      id: '2',
      title: 'Change Management Playbook',
      description: 'Step-by-step playbook for leading AI transformation initiatives',
      type: 'Playbook',
      category: 'Leadership',
      readTime: '30 mins',
      downloads: 1876,
      pages: 62,
      publishedDate: 'Nov 2024',
      heroImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',
      overview: 'Leading AI transformation requires more than technical implementation—it demands a structured approach to organizational change. This playbook provides proven strategies, communication templates, and tactical playbooks for successfully navigating the human side of AI adoption.',
      keyTakeaways: [
        {
          title: 'Leadership Alignment',
          description: 'Get all leaders on the same page about vision, objectives, and their role in the transformation',
          icon: 'target'
        },
        {
          title: 'Stakeholder Mapping',
          description: 'Identify champions, resisters, and fence-sitters to tailor your change approach',
          icon: 'lightbulb'
        },
        {
          title: 'Communication Strategy',
          description: 'Craft messages that resonate with different audiences and address their concerns',
          icon: 'trending'
        },
        {
          title: 'Momentum Building',
          description: 'Create early wins and celebrate progress to build organizational confidence',
          icon: 'award'
        }
      ],
      tableOfContents: [
        'Change Management Fundamentals',
        'Stakeholder Analysis and Mapping',
        'Creating a Compelling Vision',
        'Communication Strategy',
        'Building Coalition of Champions',
        'Addressing Resistance',
        'Training and Capability Building',
        'Measuring Change Adoption',
        'Sustaining Momentum'
      ],
      sections: [
        {
          title: 'Change Management Fundamentals',
          content: 'Successful AI transformation follows proven change management principles. Understanding these fundamentals is critical before launching any initiative.',
          subsections: [
            {
              title: 'Why AI Transformations Fail',
              content: 'Most AI initiatives fail not because of technology, but because of inadequate change management.',
              bullets: [
                'Lack of clear vision and communication (60% of failures)',
                'Insufficient leadership commitment (45% of failures)',
                'Underestimating cultural resistance (55% of failures)',
                'Inadequate training and support (40% of failures)'
              ]
            },
            {
              title: 'The ADKAR Model for AI',
              content: 'Apply the ADKAR framework specifically to AI transformation.',
              bullets: [
                'Awareness: Why AI is necessary for our future',
                'Desire: Personal motivation to support the change',
                'Knowledge: How to work with AI systems',
                'Ability: Skills to operate in AI-augmented environment',
                'Reinforcement: Mechanisms to sustain the change'
              ]
            }
          ]
        },
        {
          title: 'Stakeholder Analysis and Mapping',
          content: 'Not all stakeholders have the same level of influence or the same concerns. Effective change management requires understanding and addressing each group differently.',
          subsections: [
            {
              title: 'Stakeholder Segmentation',
              content: 'Identify and categorize key stakeholder groups.',
              bullets: [
                'Executive sponsors: Need business case and strategic alignment',
                'Middle managers: Need clarity on changing roles and responsibilities',
                'Front-line employees: Need reassurance about job security',
                'IT teams: Need technical roadmap and resource allocation'
              ]
            },
            {
              title: 'Power-Interest Matrix',
              content: 'Map stakeholders based on their power and interest.',
              bullets: [
                'High power, high interest: Closely manage and engage',
                'High power, low interest: Keep satisfied with updates',
                'Low power, high interest: Keep informed and address concerns',
                'Low power, low interest: Monitor with minimal effort'
              ]
            }
          ]
        },
        {
          title: 'Communication Strategy',
          content: 'Communication is the most critical element of change management. This section provides templates and timing for effective communication.',
          subsections: [
            {
              title: 'Communication Channels',
              content: 'Use multiple channels to ensure messages reach all stakeholders.',
              bullets: [
                'Town halls for broad announcements and Q&A',
                'Department meetings for team-specific impacts',
                'Email for detailed written communication',
                'Intranet for ongoing updates and resources',
                'One-on-ones for addressing individual concerns'
              ]
            },
            {
              title: 'Message Framework',
              content: 'Structure your messages to address key questions.',
              bullets: [
                'Why: The business imperative for AI adoption',
                'What: Specific changes to expect',
                'When: Timeline and milestones',
                'How: Training and support available',
                'Who: Roles and responsibilities'
              ]
            }
          ]
        }
      ],
      downloadables: [
        {
          name: 'Stakeholder Analysis Template',
          description: 'Excel template for mapping stakeholders by power and interest',
          format: 'XLSX',
          size: '156 KB'
        },
        {
          name: 'Communication Plan Template',
          description: 'Comprehensive plan for all change communications',
          format: 'DOCX',
          size: '89 KB'
        },
        {
          name: 'Email Templates Library',
          description: '20+ pre-written email templates for different audiences and stages',
          format: 'DOCX',
          size: '245 KB'
        },
        {
          name: 'Complete Playbook PDF',
          description: 'Full 62-page playbook with all frameworks and tools',
          format: 'PDF',
          size: '8.7 MB'
        }
      ],
      relatedResources: [
        { id: '1', title: 'AI Strategy Implementation Guide', type: 'Guide' },
        { id: '4', title: 'AI Project Kickoff Template', type: 'Template' },
        { id: '5', title: 'Enterprise AI Transformation Case Study', type: 'Case Study' }
      ],
      author: {
        name: 'Michael Chen',
        title: 'Organizational Change Consultant',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      tags: ['Change Management', 'Leadership', 'Communication', 'Stakeholder Engagement', 'Adoption'],
      rating: 4.9,
      reviews: 132
    },
    '3': {
      id: '3',
      title: 'AI Maturity Assessment Framework',
      description: 'Framework for assessing and improving organizational AI maturity',
      type: 'Framework',
      category: 'Assessment',
      readTime: '25 mins',
      downloads: 3412,
      pages: 45,
      publishedDate: 'Dec 2024',
      heroImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop',
      overview: 'This framework provides a structured methodology for assessing your organization\'s AI maturity across five key dimensions: Strategy, Data, Technology, People, and Culture. Use this to identify gaps, benchmark against industry peers, and create targeted improvement plans.',
      keyTakeaways: [
        {
          title: 'Five Maturity Dimensions',
          description: 'Comprehensive assessment across Strategy, Data, Technology, People, and Culture',
          icon: 'target'
        },
        {
          title: 'Maturity Levels',
          description: 'Clear progression from Initial (Level 1) to Optimizing (Level 5)',
          icon: 'lightbulb'
        },
        {
          title: 'Gap Analysis',
          description: 'Identify specific gaps between current and target state for each dimension',
          icon: 'trending'
        },
        {
          title: 'Action Planning',
          description: 'Prioritized roadmap to advance from one maturity level to the next',
          icon: 'award'
        }
      ],
      tableOfContents: [
        'Introduction to AI Maturity',
        'The Five Dimensions',
        'Maturity Level Descriptions',
        'Assessment Methodology',
        'Scoring and Benchmarking',
        'Gap Analysis',
        'Creating Improvement Plans',
        'Case Examples'
      ],
      sections: [
        {
          title: 'Introduction to AI Maturity',
          content: 'AI maturity is not just about having the latest technology. It\'s about the organization\'s ability to consistently deliver value from AI across strategy, operations, and culture.',
          subsections: [
            {
              title: 'Why Maturity Matters',
              content: 'Organizations with higher AI maturity see significantly better outcomes.',
              bullets: [
                '3x more likely to achieve AI ROI targets',
                '2.5x faster time to value for AI projects',
                '60% lower project failure rates',
                '45% higher employee satisfaction with AI tools'
              ]
            },
            {
              title: 'The Five Maturity Levels',
              content: 'Each level represents a distinct stage of organizational capability.',
              bullets: [
                'Level 1 - Initial: Ad hoc, experimental AI initiatives',
                'Level 2 - Developing: Some standardization, limited scale',
                'Level 3 - Defined: Established processes and governance',
                'Level 4 - Managed: Data-driven optimization and measurement',
                'Level 5 - Optimizing: Continuous innovation and improvement'
              ]
            }
          ]
        },
        {
          title: 'The Five Dimensions',
          content: 'AI maturity must be assessed holistically across five interconnected dimensions.',
          subsections: [
            {
              title: 'Strategy Dimension',
              content: 'How well AI aligns with and enables business strategy.',
              bullets: [
                'Clear AI vision and roadmap tied to business goals',
                'Executive sponsorship and governance',
                'Budget allocation and ROI tracking',
                'Portfolio management of AI initiatives'
              ]
            },
            {
              title: 'Data Dimension',
              content: 'Quality, accessibility, and governance of data assets.',
              bullets: [
                'Data quality and completeness',
                'Data governance policies and practices',
                'Real-time data access and processing',
                'Data security and privacy compliance'
              ]
            },
            {
              title: 'Technology Dimension',
              content: 'Infrastructure, tools, and platforms for AI.',
              bullets: [
                'Cloud infrastructure and compute capabilities',
                'ML/AI platforms and tools',
                'Integration with existing systems',
                'MLOps and model lifecycle management'
              ]
            },
            {
              title: 'People Dimension',
              content: 'Skills, roles, and organization design for AI.',
              bullets: [
                'AI talent acquisition and retention',
                'Training and upskilling programs',
                'Clear roles and responsibilities',
                'Cross-functional collaboration'
              ]
            },
            {
              title: 'Culture Dimension',
              content: 'Organizational mindset and behaviors around AI.',
              bullets: [
                'Leadership commitment to AI transformation',
                'Experimentation and learning culture',
                'Trust in AI systems and data',
                'Change readiness and adaptability'
              ]
            }
          ]
        },
        {
          title: 'Assessment Methodology',
          content: 'A rigorous assessment methodology ensures accurate and actionable results.',
          subsections: [
            {
              title: 'Data Collection',
              content: 'Gather evidence from multiple sources.',
              bullets: [
                'Leadership interviews (C-suite, business unit heads)',
                'Employee surveys (AI users, data teams)',
                'Document review (strategies, policies, metrics)',
                'System assessments (technology stack, data architecture)'
              ]
            },
            {
              title: 'Scoring Approach',
              content: 'Use a consistent rubric to score each dimension.',
              bullets: [
                'Each dimension scored 1-5 (aligned with maturity levels)',
                'Evidence-based scoring using defined criteria',
                'Weighted average for overall maturity score',
                'Sub-dimension scoring for detailed insights'
              ]
            }
          ]
        }
      ],
      downloadables: [
        {
          name: 'Maturity Assessment Questionnaire',
          description: '50-question assessment tool with scoring guide',
          format: 'DOCX',
          size: '312 KB'
        },
        {
          name: 'Scoring Calculator',
          description: 'Excel tool to calculate maturity scores across all dimensions',
          format: 'XLSX',
          size: '189 KB'
        },
        {
          name: 'Gap Analysis Template',
          description: 'Template for documenting gaps and improvement priorities',
          format: 'PPTX',
          size: '1.8 MB'
        },
        {
          name: 'Complete Framework PDF',
          description: 'Full 45-page framework with assessment tools',
          format: 'PDF',
          size: '6.2 MB'
        }
      ],
      relatedResources: [
        { id: '1', title: 'AI Strategy Implementation Guide', type: 'Guide' },
        { id: '4', title: 'AI Project Kickoff Template', type: 'Template' },
        { id: '6', title: 'AI Ethics and Governance Framework', type: 'Framework' }
      ],
      author: {
        name: 'Dr. Sarah Chen',
        title: 'AI Strategy Director',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
      },
      tags: ['Maturity Model', 'Assessment', 'Benchmarking', 'Gap Analysis', 'Strategy'],
      rating: 4.9,
      reviews: 203
    },
    '4': {
      id: '4',
      title: 'AI Project Kickoff Template',
      description: 'Template for planning and launching AI initiatives',
      type: 'Template',
      category: 'Project Management',
      readTime: '15 mins',
      downloads: 1543,
      pages: 28,
      publishedDate: 'Oct 2024',
      heroImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop',
      overview: 'This comprehensive project kickoff template ensures your AI initiatives start with clarity and alignment. Includes sections for objectives, success criteria, team roles, timeline, risks, and stakeholder management—everything needed for a strong launch.',
      keyTakeaways: [
        {
          title: 'Clear Objectives',
          description: 'Define specific, measurable goals that align with business outcomes',
          icon: 'target'
        },
        {
          title: 'Team Alignment',
          description: 'Establish roles, responsibilities, and communication protocols from day one',
          icon: 'lightbulb'
        },
        {
          title: 'Risk Mitigation',
          description: 'Identify and plan for potential risks before they become blockers',
          icon: 'trending'
        },
        {
          title: 'Success Metrics',
          description: 'Set quantifiable KPIs to measure progress and demonstrate value',
          icon: 'award'
        }
      ],
      tableOfContents: [
        'Project Charter',
        'Business Case and Objectives',
        'Scope Definition',
        'Team Structure and Roles',
        'Timeline and Milestones',
        'Budget and Resources',
        'Risk Assessment',
        'Success Criteria',
        'Stakeholder Communication Plan'
      ],
      sections: [
        {
          title: 'Project Charter',
          content: 'The project charter is your north star—a single page that defines why this project exists and what success looks like.',
          subsections: [
            {
              title: 'Charter Components',
              content: 'Essential elements every AI project charter should include.',
              bullets: [
                'Project name and brief description',
                'Executive sponsor and project owner',
                'Business problem being solved',
                'Expected outcomes and benefits',
                'High-level timeline and budget',
                'Key stakeholders and their interests'
              ]
            },
            {
              title: 'Writing Effective Charters',
              content: 'Best practices for charter creation.',
              bullets: [
                'Keep it to one page for executive consumption',
                'Use specific metrics, not vague aspirations',
                'Get sign-off from sponsor before proceeding',
                'Reference the charter in all project communications'
              ]
            }
          ]
        },
        {
          title: 'Business Case and Objectives',
          content: 'A strong business case articulates the "why" and quantifies the expected return on investment.',
          subsections: [
            {
              title: 'Defining SMART Objectives',
              content: 'Ensure objectives are Specific, Measurable, Achievable, Relevant, and Time-bound.',
              bullets: [
                'Specific: "Reduce customer service response time" not "Improve customer service"',
                'Measurable: "Decrease average handle time by 30%"',
                'Achievable: Based on realistic benchmarks and capabilities',
                'Relevant: Tied to strategic business priorities',
                'Time-bound: "Within 6 months of deployment"'
              ]
            },
            {
              title: 'ROI Projection',
              content: 'Quantify expected costs and benefits.',
              bullets: [
                'Implementation costs: Technology, talent, consulting',
                'Ongoing costs: Maintenance, compute, operations',
                'Expected benefits: Revenue increase, cost savings, risk reduction',
                'Payback period: When cumulative benefits exceed costs'
              ]
            }
          ]
        },
        {
          title: 'Team Structure and Roles',
          content: 'Clear roles and responsibilities prevent confusion and ensure accountability.',
          subsections: [
            {
              title: 'Core Team Roles',
              content: 'Essential roles for any AI project.',
              bullets: [
                'Executive Sponsor: Provides resources and removes blockers',
                'Project Manager: Coordinates activities and tracks progress',
                'Product Owner: Defines requirements and prioritizes features',
                'Tech Lead: Oversees technical architecture and implementation',
                'Data Scientist/ML Engineer: Builds and trains models',
                'Data Engineer: Manages data pipelines and infrastructure'
              ]
            },
            {
              title: 'Extended Team',
              content: 'Additional roles based on project needs.',
              bullets: [
                'Business Analyst: Gathers requirements and documents processes',
                'UX Designer: Designs user interfaces and experiences',
                'Change Manager: Manages organizational adoption',
                'Legal/Compliance: Ensures regulatory compliance'
              ]
            }
          ]
        },
        {
          title: 'Timeline and Milestones',
          content: 'Break the project into phases with clear milestones and deliverables.',
          subsections: [
            {
              title: 'Typical AI Project Phases',
              content: 'Standard phases for most AI initiatives.',
              bullets: [
                'Phase 1: Discovery & Planning (2-4 weeks)',
                'Phase 2: Data Preparation (4-6 weeks)',
                'Phase 3: Model Development (6-8 weeks)',
                'Phase 4: Testing & Validation (2-4 weeks)',
                'Phase 5: Deployment (2-3 weeks)',
                'Phase 6: Monitoring & Optimization (Ongoing)'
              ]
            }
          ]
        }
      ],
      downloadables: [
        {
          name: 'Project Charter Template',
          description: 'One-page charter template in PowerPoint',
          format: 'PPTX',
          size: '892 KB'
        },
        {
          name: 'Project Plan Template',
          description: 'Detailed Excel project plan with Gantt chart',
          format: 'XLSX',
          size: '234 KB'
        },
        {
          name: 'RACI Matrix Template',
          description: 'Roles and responsibilities matrix',
          format: 'XLSX',
          size: '67 KB'
        },
        {
          name: 'Complete Template Package',
          description: 'All templates plus 28-page implementation guide',
          format: 'ZIP',
          size: '4.3 MB'
        }
      ],
      relatedResources: [
        { id: '1', title: 'AI Strategy Implementation Guide', type: 'Guide' },
        { id: '2', title: 'Change Management Playbook', type: 'Playbook' },
        { id: '5', title: 'Enterprise AI Transformation Case Study', type: 'Case Study' }
      ],
      author: {
        name: 'Lisa Anderson',
        title: 'AI Product Manager',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      tags: ['Project Management', 'Planning', 'Templates', 'Kickoff', 'Charter'],
      rating: 4.7,
      reviews: 98
    },
    '5': {
      id: '5',
      title: 'Enterprise AI Transformation Case Study',
      description: 'Real-world case study of Fortune 500 AI transformation',
      type: 'Case Study',
      category: 'Best Practices',
      readTime: '35 mins',
      downloads: 2987,
      pages: 56,
      publishedDate: 'Nov 2024',
      heroImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',
      overview: 'This in-depth case study examines how a Fortune 500 manufacturing company achieved a successful AI transformation over 18 months. Learn from their challenges, decisions, and outcomes as they scaled AI from pilot projects to enterprise-wide adoption.',
      keyTakeaways: [
        {
          title: 'Start Small, Think Big',
          description: 'Begin with high-impact pilots to prove value, then scale methodically',
          icon: 'target'
        },
        {
          title: 'Data First',
          description: 'Invest in data infrastructure before attempting large-scale AI deployment',
          icon: 'lightbulb'
        },
        {
          title: 'Change Management',
          description: 'Dedicate 30% of budget to change management and training',
          icon: 'trending'
        },
        {
          title: 'Measure Everything',
          description: 'Track metrics religiously to prove ROI and guide optimization',
          icon: 'award'
        }
      ],
      tableOfContents: [
        'Company Background',
        'The Challenge',
        'Strategic Approach',
        'Phase 1: Pilot Projects',
        'Phase 2: Data Infrastructure',
        'Phase 3: Scaling AI',
        'Results and Outcomes',
        'Lessons Learned',
        'Key Takeaways'
      ],
      sections: [
        {
          title: 'Company Background',
          content: 'GlobalManufacture Inc. is a $15B manufacturing company with 45,000 employees across 23 countries. They produce industrial equipment and parts for automotive, aerospace, and construction industries.',
          subsections: [
            {
              title: 'Business Context',
              content: 'The company faced increasing pressure from market dynamics.',
              bullets: [
                'Margin compression from low-cost competitors',
                'Customer demands for faster delivery and customization',
                'Aging workforce with institutional knowledge at risk',
                'Industry shift toward predictive maintenance and smart products'
              ]
            },
            {
              title: 'Initial AI Maturity',
              content: 'Starting point assessment revealed significant gaps.',
              bullets: [
                'Strategy: Level 1 (No formal AI strategy)',
                'Data: Level 2 (Siloed data, limited governance)',
                'Technology: Level 1 (Minimal AI infrastructure)',
                'People: Level 1 (No dedicated AI talent)',
                'Culture: Level 2 (Some pockets of innovation)'
              ]
            }
          ]
        },
        {
          title: 'The Challenge',
          content: 'Leadership recognized AI as critical to competitiveness but faced significant hurdles.',
          subsections: [
            {
              title: 'Key Challenges',
              content: 'Major obstacles to AI adoption.',
              bullets: [
                'Legacy systems with limited integration capabilities',
                'Data scattered across 50+ different systems',
                'Workforce skeptical of automation',
                'No AI expertise in-house',
                'Limited budget for transformation ($25M over 3 years)'
              ]
            },
            {
              title: 'Strategic Imperatives',
              content: 'Leadership defined three must-win battles.',
              bullets: [
                'Reduce manufacturing defects by 40%',
                'Decrease unplanned downtime by 50%',
                'Improve supply chain forecast accuracy to >90%'
              ]
            }
          ]
        },
        {
          title: 'Strategic Approach',
          content: 'The company adopted a phased approach balancing quick wins with foundational capabilities.',
          subsections: [
            {
              title: 'Three-Phase Roadmap',
              content: 'Structured approach to transformation.',
              bullets: [
                'Phase 1 (Months 1-6): Pilot projects for quick wins',
                'Phase 2 (Months 7-12): Build data and AI infrastructure',
                'Phase 3 (Months 13-18): Scale AI across the enterprise'
              ]
            },
            {
              title: 'Governance Model',
              content: 'Established clear oversight and decision-making.',
              bullets: [
                'AI Steering Committee: C-suite leaders, monthly reviews',
                'Center of Excellence: Centralized AI talent and standards',
                'Business Unit Champions: Embedded in each major division',
                'Ethics Board: Oversight for responsible AI practices'
              ]
            }
          ]
        },
        {
          title: 'Phase 1: Pilot Projects',
          content: 'Three high-impact pilots were selected to demonstrate value and build organizational confidence.',
          subsections: [
            {
              title: 'Pilot #1: Predictive Quality',
              content: 'ML model to predict defects before they occur.',
              bullets: [
                'Scope: Single production line, 3-month pilot',
                'Approach: Computer vision to detect micro-defects',
                'Results: 35% reduction in defects, $2.1M annual savings',
                'Timeline: Deployed in 10 weeks'
              ]
            },
            {
              title: 'Pilot #2: Predictive Maintenance',
              content: 'Anticipate equipment failures before they cause downtime.',
              bullets: [
                'Scope: Critical assembly robots in one factory',
                'Approach: Sensor data + ML to predict failures',
                'Results: 60% reduction in unplanned downtime, $3.5M savings',
                'Timeline: 12 weeks from data collection to deployment'
              ]
            },
            {
              title: 'Pilot #3: Demand Forecasting',
              content: 'Improve supply chain planning with AI-powered forecasts.',
              bullets: [
                'Scope: Top 100 SKUs in North American market',
                'Approach: Ensemble ML models with external data',
                'Results: Forecast accuracy improved from 72% to 88%',
                'Timeline: 14 weeks including data preparation'
              ]
            }
          ]
        },
        {
          title: 'Results and Outcomes',
          content: 'After 18 months, GlobalManufacture achieved transformative results.',
          subsections: [
            {
              title: 'Business Impact',
              content: 'Quantifiable business outcomes.',
              bullets: [
                '$47M in annual cost savings (from initial $15M investment)',
                '42% reduction in manufacturing defects',
                '55% reduction in unplanned downtime',
                '91% supply chain forecast accuracy',
                '3.2x ROI in first 18 months'
              ]
            },
            {
              title: 'Organizational Transformation',
              content: 'Broader organizational impacts.',
              bullets: [
                'AI Center of Excellence with 45 dedicated staff',
                '2,500+ employees trained in AI fundamentals',
                'AI maturity improved from Level 1.2 to Level 3.8',
                '23 AI use cases in production across business units',
                'Executive commitment secured for $100M 5-year AI investment'
              ]
            }
          ]
        },
        {
          title: 'Lessons Learned',
          content: 'Key insights from the transformation journey.',
          subsections: [
            {
              title: 'What Worked Well',
              content: 'Critical success factors.',
              bullets: [
                'Starting with pilots that solved real business problems',
                'Executive sponsor (COO) actively championed the initiative',
                'Dedicated change management alongside technical work',
                'Celebrating and communicating wins broadly',
                'Building foundational data infrastructure early'
              ]
            },
            {
              title: 'What We Would Do Differently',
              content: 'Areas for improvement.',
              bullets: [
                'Invest in data infrastructure even earlier (parallel with pilots)',
                'Allocate more budget to change management (we underfunded at 20%)',
                'Establish AI ethics board from day one, not month 8',
                'Hire external AI talent sooner rather than relying only on training'
              ]
            }
          ]
        }
      ],
      downloadables: [
        {
          name: 'Complete Case Study PDF',
          description: 'Full 56-page case study with detailed timeline and metrics',
          format: 'PDF',
          size: '9.8 MB'
        },
        {
          name: 'Lessons Learned Summary',
          description: 'Executive summary of key insights and recommendations',
          format: 'PPTX',
          size: '2.1 MB'
        },
        {
          name: 'ROI Calculation Methodology',
          description: 'How costs and benefits were calculated',
          format: 'XLSX',
          size: '178 KB'
        }
      ],
      relatedResources: [
        { id: '1', title: 'AI Strategy Implementation Guide', type: 'Guide' },
        { id: '2', title: 'Change Management Playbook', type: 'Playbook' },
        { id: '4', title: 'AI Project Kickoff Template', type: 'Template' }
      ],
      author: {
        name: 'Dr. Sarah Chen',
        title: 'AI Strategy Director',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
      },
      tags: ['Case Study', 'Transformation', 'ROI', 'Best Practices', 'Manufacturing'],
      rating: 4.8,
      reviews: 187
    },
    '6': {
      id: '6',
      title: 'AI Ethics and Governance Framework',
      description: 'Framework for establishing AI ethics and governance policies',
      type: 'Framework',
      category: 'Ethics',
      readTime: '40 mins',
      downloads: 2156,
      pages: 73,
      publishedDate: 'Dec 2024',
      heroImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=1200&h=600&fit=crop',
      overview: 'As AI becomes more prevalent, organizations must establish robust governance frameworks to ensure responsible, ethical, and compliant AI development and deployment. This framework provides practical guidance for creating AI governance policies, processes, and oversight structures.',
      keyTakeaways: [
        {
          title: 'Ethical Principles',
          description: 'Establish core principles including fairness, transparency, accountability, and privacy',
          icon: 'target'
        },
        {
          title: 'Governance Structure',
          description: 'Create clear oversight with AI Ethics Board and review processes',
          icon: 'lightbulb'
        },
        {
          title: 'Risk Assessment',
          description: 'Systematic evaluation of AI systems for ethical and compliance risks',
          icon: 'trending'
        },
        {
          title: 'Continuous Monitoring',
          description: 'Ongoing audits and monitoring to ensure AI systems remain ethical over time',
          icon: 'award'
        }
      ],
      tableOfContents: [
        'Introduction to AI Ethics',
        'Core Ethical Principles',
        'Governance Structure',
        'AI Risk Assessment',
        'Data Privacy and Security',
        'Bias Detection and Mitigation',
        'Transparency and Explainability',
        'Monitoring and Auditing',
        'Implementation Roadmap'
      ],
      sections: [
        {
          title: 'Introduction to AI Ethics',
          content: 'AI ethics isn\'t just about compliance—it\'s about building trust with customers, employees, and society while mitigating risks to your organization.',
          subsections: [
            {
              title: 'Why AI Ethics Matters',
              content: 'The business case for ethical AI.',
              bullets: [
                'Regulatory compliance: Avoid fines and legal liability',
                'Brand protection: Prevent reputation damage from AI failures',
                'Customer trust: Build confidence in AI-powered products',
                'Employee confidence: Ensure workforce trusts AI tools',
                'Competitive advantage: Differentiate with responsible AI'
              ]
            },
            {
              title: 'Common AI Ethics Failures',
              content: 'Real-world examples of what can go wrong.',
              bullets: [
                'Hiring algorithms that discriminate by gender or race',
                'Credit scoring models that perpetuate economic inequality',
                'Facial recognition with higher error rates for minorities',
                'Chatbots that learn and amplify harmful biases',
                'Recommendation engines that radicalize users'
              ]
            }
          ]
        },
        {
          title: 'Core Ethical Principles',
          content: 'Five foundational principles should guide all AI development and deployment.',
          subsections: [
            {
              title: 'Fairness and Non-Discrimination',
              content: 'AI systems must treat all individuals and groups equitably.',
              bullets: [
                'Test for bias across protected characteristics',
                'Ensure training data represents diverse populations',
                'Monitor outcomes for disparate impact',
                'Provide remediation when bias is detected'
              ]
            },
            {
              title: 'Transparency and Explainability',
              content: 'Stakeholders should understand how AI systems work and make decisions.',
              bullets: [
                'Document how models are trained and what data is used',
                'Provide explanations for AI decisions when requested',
                'Disclose when AI is being used in decision-making',
                'Enable human review of high-stakes AI decisions'
              ]
            },
            {
              title: 'Privacy and Data Protection',
              content: 'Protect individual privacy and comply with data regulations.',
              bullets: [
                'Minimize data collection to what\'s necessary',
                'Obtain informed consent for data use',
                'Implement strong data security measures',
                'Provide mechanisms for data deletion (right to be forgotten)'
              ]
            },
            {
              title: 'Accountability',
              content: 'Clear responsibility for AI system development and outcomes.',
              bullets: [
                'Assign ownership for each AI system',
                'Document decisions and trade-offs made',
                'Establish channels for reporting concerns',
                'Define consequences for ethical violations'
              ]
            },
            {
              title: 'Safety and Reliability',
              content: 'AI systems must be robust, secure, and fail safely.',
              bullets: [
                'Rigorous testing before deployment',
                'Monitoring for degradation over time',
                'Fail-safes and human override capabilities',
                'Incident response plans for AI failures'
              ]
            }
          ]
        },
        {
          title: 'Governance Structure',
          content: 'Effective AI governance requires clear structures, roles, and processes.',
          subsections: [
            {
              title: 'AI Ethics Board',
              content: 'Cross-functional board to oversee AI ethics.',
              bullets: [
                'Composition: Legal, compliance, technology, business leaders',
                'Mandate: Review high-risk AI systems, set policies',
                'Meeting cadence: Quarterly reviews, ad-hoc for urgent issues',
                'Authority: Can block deployment of non-compliant AI'
              ]
            },
            {
              title: 'AI Review Process',
              content: 'Structured review at key stages of AI development.',
              bullets: [
                'Stage 1: Concept review (is this use case ethical?)',
                'Stage 2: Design review (data sources, model approach)',
                'Stage 3: Pre-deployment review (testing results, safeguards)',
                'Stage 4: Post-deployment audit (ongoing monitoring)'
              ]
            }
          ]
        },
        {
          title: 'AI Risk Assessment',
          content: 'Systematic methodology for evaluating ethical and compliance risks.',
          subsections: [
            {
              title: 'Risk Classification',
              content: 'Categorize AI systems by level of risk.',
              bullets: [
                'Low risk: Minimal impact on individuals (e.g., product recommendations)',
                'Medium risk: Moderate impact (e.g., marketing personalization)',
                'High risk: Significant impact on rights or opportunities (e.g., hiring, lending)',
                'Unacceptable risk: Prohibited uses (e.g., social scoring)'
              ]
            },
            {
              title: 'Risk Assessment Criteria',
              content: 'Factors to consider when assessing risk.',
              bullets: [
                'Scope: How many people affected?',
                'Impact: What\'s at stake for individuals?',
                'Reversibility: Can decisions be appealed/reversed?',
                'Transparency: Can the system be explained?',
                'Alternatives: Are there non-AI alternatives?'
              ]
            }
          ]
        }
      ],
      downloadables: [
        {
          name: 'AI Ethics Policy Template',
          description: 'Customizable policy template covering all key areas',
          format: 'DOCX',
          size: '145 KB'
        },
        {
          name: 'AI Risk Assessment Tool',
          description: 'Excel tool to evaluate and classify AI system risks',
          format: 'XLSX',
          size: '267 KB'
        },
        {
          name: 'Ethics Review Checklist',
          description: 'Comprehensive checklist for AI ethics reviews',
          format: 'PDF',
          size: '892 KB'
        },
        {
          name: 'Complete Framework PDF',
          description: 'Full 73-page framework with policies and tools',
          format: 'PDF',
          size: '11.2 MB'
        }
      ],
      relatedResources: [
        { id: '1', title: 'AI Strategy Implementation Guide', type: 'Guide' },
        { id: '3', title: 'AI Maturity Assessment Framework', type: 'Framework' },
        { id: '5', title: 'Enterprise AI Transformation Case Study', type: 'Case Study' }
      ],
      author: {
        name: 'Dr. Emily Rodriguez',
        title: 'AI Ethics Specialist',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop'
      },
      tags: ['Ethics', 'Governance', 'Compliance', 'Risk Management', 'Responsible AI'],
      rating: 5.0,
      reviews: 124
    }
  }

  const resource = resourceData[id]

  if (!resource) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Resource Not Found</h1>
          <Link href="/dashboard/resources">
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Back to Resources
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const getIconComponent = (icon: string) => {
    switch (icon) {
      case 'target':
        return Target
      case 'lightbulb':
        return Lightbulb
      case 'trending':
        return TrendingUp
      case 'award':
        return Award
      default:
        return Target
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Guide':
        return 'from-purple-500 to-blue-500'
      case 'Playbook':
        return 'from-blue-500 to-cyan-500'
      case 'Framework':
        return 'from-cyan-500 to-green-500'
      case 'Template':
        return 'from-green-500 to-yellow-500'
      case 'Case Study':
        return 'from-yellow-500 to-orange-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all">
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/dashboard/resources">
                <button className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 hover:border-purple-500/30 transition-all inline-flex items-center gap-2 font-diatype">
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Back to Resources
                </button>
              </Link>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all inline-flex items-center gap-2">
                  <BookmarkPlus className="w-4 h-4" />
                  <span className="font-diatype">Save</span>
                </button>
                <button className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all inline-flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  <span className="font-diatype">Share</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="relative h-[400px] overflow-hidden">
          <Image
            src={resource.heroImage}
            alt={resource.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-8 pb-8">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${getTypeColor(resource.type)} text-white text-sm font-semibold font-diatype`}>
                  {resource.type}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-sm font-semibold font-diatype">
                  {resource.category}
                </span>
              </div>
              <h1 className="text-5xl font-bold text-white mb-4 font-gendy">
                {resource.title}
              </h1>
              <p className="text-xl text-gray-300 font-diatype">
                {resource.description}
              </p>
            </div>
          </div>
        </div>

        <main className="px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-white mb-6 font-gendy">Overview</h2>
                <p className="text-gray-300 text-lg leading-relaxed font-diatype">
                  {resource.overview}
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-white mb-6 font-gendy">Key Takeaways</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resource.keyTakeaways.map((takeaway, index) => {
                    const IconComponent = getIconComponent(takeaway.icon)
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:border-purple-500/30 transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-2 font-gendy">
                              {takeaway.title}
                            </h3>
                            <p className="text-gray-400 text-sm font-diatype">
                              {takeaway.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-white mb-6 font-gendy">Table of Contents</h2>
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                  <div className="space-y-3">
                    {resource.tableOfContents.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 text-gray-300 hover:text-purple-400 transition-colors cursor-pointer group"
                      >
                        <span className="text-purple-400 font-semibold font-gendy w-8">
                          {index + 1}.
                        </span>
                        <span className="font-diatype">{item}</span>
                        <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-white mb-6 font-gendy">Detailed Content</h2>
                <div className="space-y-8">
                  {resource.sections.map((section, sIndex) => (
                    <div key={sIndex} className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-semibold text-white mb-4 font-gendy">
                          {section.title}
                        </h3>
                        <p className="text-gray-300 leading-relaxed font-diatype">
                          {section.content}
                        </p>
                      </div>

                      {section.subsections && section.subsections.map((sub, subIndex) => (
                        <div key={subIndex} className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                          <h4 className="text-xl font-semibold text-white mb-3 font-gendy">
                            {sub.title}
                          </h4>
                          <p className="text-gray-300 mb-4 font-diatype">{sub.content}</p>
                          {sub.bullets && (
                            <ul className="space-y-2">
                              {sub.bullets.map((bullet, bIndex) => (
                                <li key={bIndex} className="flex items-start gap-3">
                                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-300 font-diatype">{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-white mb-6 font-gendy">Downloadable Resources</h2>
                <div className="space-y-4">
                  {resource.downloadables.map((download, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:border-purple-500/30 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors font-gendy">
                            {download.name}
                          </h3>
                          <p className="text-gray-400 text-sm mb-3 font-diatype">
                            {download.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="font-diatype">{download.format}</span>
                            <span className="font-diatype">{download.size}</span>
                          </div>
                        </div>
                        <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all inline-flex items-center gap-2 shadow-lg shadow-purple-500/50 font-diatype">
                          <Download className="w-5 h-5" />
                          Download
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-white mb-6 font-gendy">Related Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {resource.relatedResources.map((related) => (
                    <Link key={related.id} href={`/dashboard/resources/${related.id}`}>
                      <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:border-purple-500/30 transition-all cursor-pointer group"
                      >
                        <span className="text-xs text-purple-400 font-semibold font-diatype">
                          {related.type}
                        </span>
                        <h3 className="text-white font-semibold mt-2 group-hover:text-purple-400 transition-colors font-gendy">
                          {related.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-3 text-purple-400">
                          <span className="text-sm font-diatype">View resource</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                  <h3 className="text-xl font-semibold text-white mb-6 font-gendy">Resource Details</h3>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-xs text-gray-400 font-diatype">Read Time</p>
                        <p className="text-white font-semibold font-diatype">{resource.readTime}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-xs text-gray-400 font-diatype">Pages</p>
                        <p className="text-white font-semibold font-diatype">{resource.pages}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-xs text-gray-400 font-diatype">Downloads</p>
                        <p className="text-white font-semibold font-diatype">{resource.downloads.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="text-xs text-gray-400 font-diatype">Published</p>
                        <p className="text-white font-semibold font-diatype">{resource.publishedDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <div>
                        <p className="text-xs text-gray-400 font-diatype">Rating</p>
                        <p className="text-white font-semibold font-diatype">
                          {resource.rating} ({resource.reviews} reviews)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <button className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-purple-500/50 font-diatype">
                      <Download className="w-5 h-5" />
                      Download Full Resource
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 font-gendy">Author</h3>
                  <div className="flex items-center gap-4">
                    <Image
                      src={resource.author.image}
                      alt={resource.author.name}
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                    <div>
                      <p className="text-white font-semibold font-gendy">{resource.author.name}</p>
                      <p className="text-gray-400 text-sm font-diatype">{resource.author.title}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 font-gendy">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {resource.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-semibold font-diatype"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
