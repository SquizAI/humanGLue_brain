'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Sparkles,
  Eye,
  Copy,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  FileText,
  Wand2,
  Save,
  X,
  ArrowLeft,
  Code,
  Type,
  Image as ImageIcon,
  Link2,
  Zap,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Layers,
} from 'lucide-react'
import Link from 'next/link'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { useChat } from '@/lib/contexts/ChatContext'
import { signOut } from '@/lib/auth/hooks'

// =============================================================================
// TYPES
// =============================================================================

interface EmailTemplate {
  id: string
  name: string
  subject: string
  preheader: string
  category: 'promotional' | 'newsletter' | 'transactional' | 'automated' | 'workshop'
  content: string
  variables: TemplateVariable[]
  thumbnail?: string
  usageCount: number
  lastUsed?: Date
  createdAt: Date
  updatedAt: Date
  isDefault?: boolean
}

interface TemplateVariable {
  key: string
  label: string
  defaultValue?: string
  required: boolean
  type: 'text' | 'url' | 'date' | 'number'
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// =============================================================================
// MOCK DATA
// =============================================================================

const mockTemplates: EmailTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Workshop Invitation',
    subject: 'Join Our {{workshop_name}} - Limited Seats Available',
    preheader: 'Transform your {{skill_area}} with expert guidance',
    category: 'workshop',
    content: `<div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
  <div style="background: linear-gradient(135deg, #61D8FE 0%, #3B82F6 100%); padding: 40px 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">{{workshop_name}}</h1>
  </div>

  <div style="padding: 40px 20px;">
    <p style="font-size: 16px; line-height: 1.6; color: #334155;">Hi {{first_name}},</p>

    <p style="font-size: 16px; line-height: 1.6; color: #334155;">
      We're excited to invite you to our upcoming workshop on <strong>{{workshop_topic}}</strong>.
      This hands-on session will help you {{value_proposition}}.
    </p>

    <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <h3 style="margin-top: 0; color: #1E293B;">Workshop Details</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="margin: 10px 0;">📅 <strong>Date:</strong> {{workshop_date}}</li>
        <li style="margin: 10px 0;">⏰ <strong>Time:</strong> {{workshop_time}}</li>
        <li style="margin: 10px 0;">📍 <strong>Location:</strong> {{location}}</li>
        <li style="margin: 10px 0;">💰 <strong>Investment:</strong> {{price}}</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 40px 0;">
      <a href="{{registration_url}}" style="display: inline-block; background: linear-gradient(135deg, #61D8FE 0%, #3B82F6 100%); color: white; padding: 16px 48px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Register Now
      </a>
    </div>

    <p style="font-size: 14px; color: #64748B; text-align: center;">
      Limited to {{max_participants}} participants. Reserve your spot today!
    </p>
  </div>

  <div style="background: #F1F5F9; padding: 20px; text-align: center;">
    <p style="font-size: 12px; color: #64748B; margin: 0;">
      © {{current_year}} HMN. All rights reserved.
    </p>
  </div>
</div>`,
    variables: [
      { key: 'workshop_name', label: 'Workshop Name', required: true, type: 'text' },
      { key: 'workshop_topic', label: 'Workshop Topic', required: true, type: 'text' },
      { key: 'workshop_date', label: 'Workshop Date', required: true, type: 'date' },
      { key: 'workshop_time', label: 'Workshop Time', required: true, type: 'text' },
      { key: 'location', label: 'Location', required: true, type: 'text' },
      { key: 'price', label: 'Price', required: true, type: 'text' },
      { key: 'registration_url', label: 'Registration URL', required: true, type: 'url' },
      { key: 'max_participants', label: 'Max Participants', required: false, type: 'number', defaultValue: '30' },
      { key: 'first_name', label: 'First Name', required: true, type: 'text' },
      { key: 'value_proposition', label: 'Value Proposition', required: true, type: 'text' },
      { key: 'current_year', label: 'Current Year', required: false, type: 'text', defaultValue: '2025' },
    ],
    usageCount: 47,
    lastUsed: new Date('2025-01-25'),
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2025-01-15'),
    isDefault: true,
  },
  {
    id: 'tpl-2',
    name: 'Newsletter - Industry Insights',
    subject: '{{newsletter_title}} | {{month}} Edition',
    preheader: 'Your monthly dose of {{industry}} insights and trends',
    category: 'newsletter',
    content: `<div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
  <div style="padding: 20px; text-align: center;">
    <h2 style="color: #1E293B; margin: 0;">{{newsletter_title}}</h2>
    <p style="color: #64748B; margin: 10px 0;">{{month}} {{current_year}}</p>
  </div>

  <div style="padding: 20px;">
    <p style="font-size: 16px; line-height: 1.6; color: #334155;">Hi {{first_name}},</p>

    <p style="font-size: 16px; line-height: 1.6; color: #334155;">
      Welcome to this month's edition of our newsletter. Here's what we're covering:
    </p>

    <div style="margin: 30px 0;">
      <h3 style="color: #1E293B; border-bottom: 2px solid #61D8FE; padding-bottom: 10px;">
        {{article_1_title}}
      </h3>
      <p style="font-size: 15px; line-height: 1.6; color: #475569;">
        {{article_1_excerpt}}
      </p>
      <a href="{{article_1_url}}" style="color: #61D8FE; text-decoration: none; font-weight: 600;">Read more →</a>
    </div>

    <div style="margin: 30px 0;">
      <h3 style="color: #1E293B; border-bottom: 2px solid #61D8FE; padding-bottom: 10px;">
        {{article_2_title}}
      </h3>
      <p style="font-size: 15px; line-height: 1.6; color: #475569;">
        {{article_2_excerpt}}
      </p>
      <a href="{{article_2_url}}" style="color: #61D8FE; text-decoration: none; font-weight: 600;">Read more →</a>
    </div>

    <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #61D8FE;">
      <p style="margin: 0; font-size: 15px; color: #475569;">
        <strong>💡 Pro Tip:</strong> {{pro_tip}}
      </p>
    </div>
  </div>

  <div style="background: #F1F5F9; padding: 20px; text-align: center;">
    <p style="font-size: 12px; color: #64748B; margin: 0;">
      © {{current_year}} HMN. <a href="{{unsubscribe_url}}" style="color: #64748B;">Unsubscribe</a>
    </p>
  </div>
</div>`,
    variables: [
      { key: 'newsletter_title', label: 'Newsletter Title', required: true, type: 'text' },
      { key: 'month', label: 'Month', required: true, type: 'text' },
      { key: 'industry', label: 'Industry', required: true, type: 'text' },
      { key: 'first_name', label: 'First Name', required: true, type: 'text' },
      { key: 'article_1_title', label: 'Article 1 Title', required: true, type: 'text' },
      { key: 'article_1_excerpt', label: 'Article 1 Excerpt', required: true, type: 'text' },
      { key: 'article_1_url', label: 'Article 1 URL', required: true, type: 'url' },
      { key: 'article_2_title', label: 'Article 2 Title', required: true, type: 'text' },
      { key: 'article_2_excerpt', label: 'Article 2 Excerpt', required: true, type: 'text' },
      { key: 'article_2_url', label: 'Article 2 URL', required: true, type: 'url' },
      { key: 'pro_tip', label: 'Pro Tip', required: false, type: 'text' },
      { key: 'current_year', label: 'Current Year', required: false, type: 'text', defaultValue: '2025' },
      { key: 'unsubscribe_url', label: 'Unsubscribe URL', required: true, type: 'url' },
    ],
    usageCount: 12,
    lastUsed: new Date('2025-01-20'),
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2025-01-10'),
  },
  {
    id: 'tpl-3',
    name: 'Feature Announcement',
    subject: 'Introducing {{feature_name}} - {{value_headline}}',
    preheader: 'Discover how {{feature_name}} can {{benefit}}',
    category: 'promotional',
    content: `<div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
  <div style="padding: 40px 20px; text-align: center;">
    <div style="width: 80px; height: 80px; margin: 0 auto; background: linear-gradient(135deg, #61D8FE 0%, #3B82F6 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
      <span style="font-size: 36px;">✨</span>
    </div>
    <h1 style="color: #1E293B; margin: 20px 0 10px; font-size: 32px;">{{feature_name}}</h1>
    <p style="color: #64748B; font-size: 18px; margin: 0;">{{value_headline}}</p>
  </div>

  <div style="padding: 0 20px 40px;">
    <p style="font-size: 16px; line-height: 1.6; color: #334155;">Hi {{first_name}},</p>

    <p style="font-size: 16px; line-height: 1.6; color: #334155;">
      We're thrilled to announce {{feature_name}}, a game-changing addition to HMN that will {{primary_benefit}}.
    </p>

    <div style="background: #F8FAFC; padding: 30px; border-radius: 12px; margin: 30px 0;">
      <h3 style="color: #1E293B; margin-top: 0;">Key Benefits</h3>
      <ul style="padding-left: 20px; color: #475569; line-height: 2;">
        <li>{{benefit_1}}</li>
        <li>{{benefit_2}}</li>
        <li>{{benefit_3}}</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 40px 0;">
      <a href="{{cta_url}}" style="display: inline-block; background: linear-gradient(135deg, #61D8FE 0%, #3B82F6 100%); color: white; padding: 16px 48px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        {{cta_text}}
      </a>
    </div>

    <p style="font-size: 14px; color: #64748B; text-align: center; font-style: italic;">
      {{additional_info}}
    </p>
  </div>

  <div style="background: #F1F5F9; padding: 20px; text-align: center;">
    <p style="font-size: 12px; color: #64748B; margin: 0;">
      © {{current_year}} HMN. All rights reserved.
    </p>
  </div>
</div>`,
    variables: [
      { key: 'feature_name', label: 'Feature Name', required: true, type: 'text' },
      { key: 'value_headline', label: 'Value Headline', required: true, type: 'text' },
      { key: 'first_name', label: 'First Name', required: true, type: 'text' },
      { key: 'primary_benefit', label: 'Primary Benefit', required: true, type: 'text' },
      { key: 'benefit_1', label: 'Benefit 1', required: true, type: 'text' },
      { key: 'benefit_2', label: 'Benefit 2', required: true, type: 'text' },
      { key: 'benefit_3', label: 'Benefit 3', required: true, type: 'text' },
      { key: 'cta_text', label: 'CTA Button Text', required: true, type: 'text', defaultValue: 'Learn More' },
      { key: 'cta_url', label: 'CTA URL', required: true, type: 'url' },
      { key: 'additional_info', label: 'Additional Info', required: false, type: 'text' },
      { key: 'current_year', label: 'Current Year', required: false, type: 'text', defaultValue: '2025' },
    ],
    usageCount: 8,
    lastUsed: new Date('2025-01-18'),
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2025-01-05'),
  },
]

const CATEGORY_COLORS: Record<EmailTemplate['category'], { bg: string; text: string; icon: React.ReactNode }> = {
  promotional: { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: <Sparkles className="w-4 h-4" /> },
  newsletter: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', icon: <FileText className="w-4 h-4" /> },
  transactional: { bg: 'bg-green-500/20', text: 'text-[var(--hg-cyan-text)]', icon: <CheckCircle className="w-4 h-4" /> },
  automated: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: <Zap className="w-4 h-4" /> },
  workshop: { bg: 'bg-blue-500/20', text: 'text-[var(--hg-cyan-text)]', icon: <Calendar className="w-4 h-4" /> },
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function EmailTemplatesPage() {
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // View state
  const [activeView, setActiveView] = useState<'list' | 'edit' | 'preview'>('list')
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<EmailTemplate['category'] | 'all'>('all')

  // Templates data
  const [templates, setTemplates] = useState<EmailTemplate[]>(mockTemplates)

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editSubject, setEditSubject] = useState('')
  const [editPreheader, setEditPreheader] = useState('')
  const [editCategory, setEditCategory] = useState<EmailTemplate['category']>('promotional')
  const [editContent, setEditContent] = useState('')
  const [editVariables, setEditVariables] = useState<TemplateVariable[]>([])

  // Preview state
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({})

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your email template assistant. I can help you create compelling email templates, suggest variable fields, and optimize your content for engagement. What kind of template would you like to create?",
      timestamp: new Date(),
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authLoading && userData?.isAdmin) {
      setShowContent(true)
      return
    }
    const timeout = setTimeout(() => setShowContent(true), 2000)
    return () => clearTimeout(timeout)
  }, [authLoading, userData])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      await signOut()
      localStorage.removeItem('humanglue_user')
      localStorage.removeItem('demoUser')
      document.cookie = 'demoUser=; path=/; max-age=0'
      localStorage.removeItem('sb-egqqdscvxvtwcdwknbnt-auth-token')
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/login'
    }
  }

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setEditName(template.name)
    setEditSubject(template.subject)
    setEditPreheader(template.preheader)
    setEditCategory(template.category)
    setEditContent(template.content)
    setEditVariables(template.variables)
    setActiveView('edit')
  }

  const handleCreateNew = () => {
    setSelectedTemplate(null)
    setEditName('')
    setEditSubject('')
    setEditPreheader('')
    setEditCategory('promotional')
    setEditContent('')
    setEditVariables([])
    setActiveView('edit')
  }

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    // Initialize preview variables with defaults
    const initialVars: Record<string, string> = {}
    template.variables.forEach((v) => {
      initialVars[v.key] = v.defaultValue || ''
    })
    setPreviewVariables(initialVars)
    setActiveView('preview')
  }

  const handleSaveTemplate = async () => {
    setLoading(true)
    try {
      const newTemplate: EmailTemplate = {
        id: selectedTemplate?.id || `tpl-${Date.now()}`,
        name: editName,
        subject: editSubject,
        preheader: editPreheader,
        category: editCategory,
        content: editContent,
        variables: editVariables,
        usageCount: selectedTemplate?.usageCount || 0,
        lastUsed: selectedTemplate?.lastUsed,
        createdAt: selectedTemplate?.createdAt || new Date(),
        updatedAt: new Date(),
      }

      if (selectedTemplate) {
        setTemplates(templates.map((t) => (t.id === selectedTemplate.id ? newTemplate : t)))
      } else {
        setTemplates([...templates, newTemplate])
      }

      setActiveView('list')
    } catch (error) {
      console.error('Error saving template:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return
    setTemplates(templates.filter((t) => t.id !== id))
  }

  const handleDuplicateTemplate = (template: EmailTemplate) => {
    const duplicate: EmailTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      name: `${template.name} (Copy)`,
      usageCount: 0,
      lastUsed: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: false,
    }
    setTemplates([...templates, duplicate])
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setChatInput('')
    setIsGenerating(true)

    try {
      // Call AI to generate template content
      const response = await fetch('/api/communications/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'email-template',
          organizationId: userData?.organizationId || 'default',
          topic: chatInput,
          tone: 'professional',
        }),
      })

      const data = await response.json()

      let assistantContent = ''
      if (data.success && data.content) {
        // Update template editor with generated content
        if (data.content.emailMetadata) {
          setEditSubject(data.content.emailMetadata.subject || editSubject)
          setEditPreheader(data.content.emailMetadata.preheader || editPreheader)
        }
        if (data.content.content) {
          setEditContent(data.content.content)
        }
        if (data.content.variables) {
          setEditVariables(data.content.variables)
        }

        assistantContent = `I've created a template for you! Check the editor on the right. ${
          data.suggestions?.length > 0 ? `\n\nSuggestions:\n${data.suggestions.map((s: string) => `- ${s}`).join('\n')}` : ''
        }`
      } else {
        assistantContent =
          "I'll help you create that template. Could you tell me:\n1. What's the main purpose of this email?\n2. Who is the target audience?\n3. What key information should it include?"
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      }

      setChatMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error generating content:', error)
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I encountered an issue. Let me help you manually. What type of email template are you looking to create?",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsGenerating(false)
    }
  }

  const addVariable = () => {
    const newVar: TemplateVariable = {
      key: `variable_${editVariables.length + 1}`,
      label: 'New Variable',
      required: false,
      type: 'text',
    }
    setEditVariables([...editVariables, newVar])
  }

  const updateVariable = (index: number, updates: Partial<TemplateVariable>) => {
    const updated = [...editVariables]
    updated[index] = { ...updated[index], ...updates }
    setEditVariables(updated)
  }

  const removeVariable = (index: number) => {
    setEditVariables(editVariables.filter((_, i) => i !== index))
  }

  const renderPreview = () => {
    if (!selectedTemplate) return null

    let renderedContent = selectedTemplate.content
    selectedTemplate.variables.forEach((v) => {
      const value = previewVariables[v.key] || v.defaultValue || `{{${v.key}}}`
      renderedContent = renderedContent.replace(new RegExp(`{{${v.key}}}`, 'g'), value)
    })

    return (
      <div
        dangerouslySetInnerHTML={{ __html: renderedContent }}
        className="email-preview"
        style={{ maxWidth: '600px', margin: '0 auto' }}
      />
    )
  }

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  if (!showContent) {
    return (
      <div className="min-h-screen bg-black">
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <LoadingSpinner variant="neural" size="xl" text="Loading email templates..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center gap-4 mb-2">
              <Link
                href="/admin/outreach"
                className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-xl">
                <Layers className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white font-gendy">Email Templates</h1>
                <p className="text-gray-400 font-diatype">Create, manage, and reuse email templates</p>
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex gap-2 mt-4">
              {[
                { id: 'list', label: 'Templates', icon: <Layers className="w-4 h-4" /> },
                { id: 'edit', label: activeView === 'edit' ? (selectedTemplate ? 'Edit Template' : 'Create Template') : 'Editor', icon: <Edit className="w-4 h-4" /> },
                { id: 'preview', label: 'Preview', icon: <Eye className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as 'list' | 'edit' | 'preview')}
                  disabled={tab.id === 'preview' && !selectedTemplate}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    activeView === tab.id
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {/* Templates List View */}
            {activeView === 'list' && (
              <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                {/* Search & Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as EmailTemplate['category'] | 'all')}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="all">All Categories</option>
                    <option value="promotional">Promotional</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="transactional">Transactional</option>
                    <option value="automated">Automated</option>
                    <option value="workshop">Workshop</option>
                  </select>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-cyan-500/25"
                  >
                    <Plus className="w-5 h-5" />
                    New Template
                  </motion.button>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredTemplates.map((template) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all group"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${CATEGORY_COLORS[template.category].bg}`}>
                            {CATEGORY_COLORS[template.category].icon}
                            <span className={`text-sm font-medium capitalize ${CATEGORY_COLORS[template.category].text}`}>
                              {template.category}
                            </span>
                          </div>
                          {template.isDefault && (
                            <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">Default</span>
                          )}
                        </div>

                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">{template.name}</h3>
                        <p className="text-sm text-cyan-400 mb-1 line-clamp-1">{template.subject}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{template.preheader}</p>

                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Code className="w-4 h-4" />
                            {template.variables.length} vars
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {template.usageCount} uses
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handlePreviewTemplate(template)}
                            className="flex-1 py-2 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-sm text-cyan-400 transition-all flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Preview
                          </button>
                          <button
                            onClick={() => handleDuplicateTemplate(template)}
                            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          {!template.isDefault && (
                            <button
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredTemplates.length === 0 && (
                  <div className="text-center py-20">
                    <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No templates found</h3>
                    <p className="text-gray-400 mb-6">Create your first email template to get started</p>
                    <button
                      onClick={handleCreateNew}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium"
                    >
                      Create Template
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Template Editor View */}
            {activeView === 'edit' && (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 xl:grid-cols-2 gap-8"
              >
                {/* AI Chat Assistant */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden flex flex-col h-[calc(100vh-280px)]">
                  <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">AI Template Assistant</h3>
                      <p className="text-xs text-gray-400">Describe your template and I'll help create it</p>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                            msg.role === 'user'
                              ? 'bg-cyan-500/20 text-white rounded-br-none'
                              : 'bg-white/10 text-gray-200 rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {isGenerating && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-none">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/10">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Describe the email template you want to create..."
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                        disabled={isGenerating}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={isGenerating || !chatInput.trim()}
                        className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl disabled:opacity-50"
                      >
                        <Wand2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </form>
                </div>

                {/* Template Editor Form */}
                <div className="space-y-6 h-[calc(100vh-280px)] overflow-y-auto pr-2">
                  {/* Basic Info */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      Template Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Template Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="e.g., Monthly Newsletter"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                        <div className="flex flex-wrap gap-2">
                          {(['promotional', 'newsletter', 'transactional', 'automated', 'workshop'] as const).map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setEditCategory(cat)}
                              className={`px-4 py-2 rounded-lg capitalize transition-all ${
                                editCategory === cat
                                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Subject Line</label>
                        <input
                          type="text"
                          value={editSubject}
                          onChange={(e) => setEditSubject(e.target.value)}
                          placeholder="Use {{variables}} for dynamic content"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Preheader Text</label>
                        <input
                          type="text"
                          value={editPreheader}
                          onChange={(e) => setEditPreheader(e.target.value)}
                          placeholder="Preview text shown in email clients"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Template Content */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Code className="w-5 h-5 text-cyan-400" />
                      HTML Content
                    </h3>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Enter HTML template code here..."
                      rows={12}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none font-mono text-sm"
                    />
                  </div>

                  {/* Template Variables */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        <Type className="w-5 h-5 text-cyan-400" />
                        Template Variables
                      </h3>
                      <button
                        onClick={addVariable}
                        className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-all flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Variable
                      </button>
                    </div>

                    <div className="space-y-3">
                      {editVariables.map((variable, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-3 flex items-start gap-3">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={variable.key}
                              onChange={(e) => updateVariable(index, { key: e.target.value })}
                              placeholder="variable_key"
                              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                            />
                            <input
                              type="text"
                              value={variable.label}
                              onChange={(e) => updateVariable(index, { label: e.target.value })}
                              placeholder="Display Label"
                              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                            />
                            <select
                              value={variable.type}
                              onChange={(e) => updateVariable(index, { type: e.target.value as TemplateVariable['type'] })}
                              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                            >
                              <option value="text">Text</option>
                              <option value="url">URL</option>
                              <option value="date">Date</option>
                              <option value="number">Number</option>
                            </select>
                            <input
                              type="text"
                              value={variable.defaultValue || ''}
                              onChange={(e) => updateVariable(index, { defaultValue: e.target.value })}
                              placeholder="Default value (optional)"
                              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                            />
                          </div>
                          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={variable.required}
                              onChange={(e) => updateVariable(index, { required: e.target.checked })}
                              className="rounded border-gray-600 text-cyan-500 focus:ring-cyan-500"
                            />
                            Required
                          </label>
                          <button
                            onClick={() => removeVariable(index)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveView('list')}
                      className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveTemplate}
                      disabled={loading || !editName || !editSubject || !editContent}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-cyan-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <LoadingSpinner size="sm" variant="pulse" />
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Template
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Preview View */}
            {activeView === 'preview' && selectedTemplate && (
              <motion.div key="preview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Variables Panel */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Type className="w-5 h-5 text-cyan-400" />
                      Preview Variables
                    </h3>
                    <div className="space-y-3">
                      {selectedTemplate.variables.map((variable) => (
                        <div key={variable.key}>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            {variable.label}
                            {variable.required && <span className="text-red-400 ml-1">*</span>}
                          </label>
                          <input
                            type={variable.type === 'url' ? 'url' : variable.type === 'date' ? 'date' : variable.type === 'number' ? 'number' : 'text'}
                            value={previewVariables[variable.key] || ''}
                            onChange={(e) => setPreviewVariables({ ...previewVariables, [variable.key]: e.target.value })}
                            placeholder={variable.defaultValue || `Enter ${variable.label.toLowerCase()}`}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Email Preview */}
                  <div className="lg:col-span-2">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                          <Eye className="w-5 h-5 text-cyan-400" />
                          Email Preview
                        </h3>
                        <button
                          onClick={() => handleEditTemplate(selectedTemplate)}
                          className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-all flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Template
                        </button>
                      </div>
                      <div className="bg-white rounded-xl p-4 overflow-auto max-h-[calc(100vh-300px)]">{renderPreview()}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
