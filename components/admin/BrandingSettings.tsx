'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Save,
  Palette,
  Mail,
  Globe,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Eye,
  Link as LinkIcon,
} from 'lucide-react'
import { useBranding, OrgBranding } from '@/lib/contexts/BrandingContext'

interface BrandingSettingsProps {
  organizationId: string
}

export function BrandingSettings({ organizationId }: BrandingSettingsProps) {
  const { branding: contextBranding, isLoading, refreshBranding } = useBranding()
  const [localBranding, setLocalBranding] = useState<Partial<OrgBranding>>({})
  const [customDomain, setCustomDomain] = useState<string>('')
  const [isDomainSaving, setIsDomainSaving] = useState(false)
  const [domainSuccess, setDomainSuccess] = useState(false)
  const [domainError, setDomainError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('colors')

  // Initialize local state from context
  useEffect(() => {
    if (contextBranding) {
      setLocalBranding(contextBranding)
    }
  }, [contextBranding])

  // Fetch custom domain on load
  useEffect(() => {
    async function fetchCustomDomain() {
      try {
        const response = await fetch(`/api/organizations/${organizationId}/domain`)
        if (response.ok) {
          const data = await response.json()
          setCustomDomain(data.domain || '')
        }
      } catch (error) {
        console.error('Failed to fetch custom domain:', error)
      }
    }
    fetchCustomDomain()
  }, [organizationId])

  // Save custom domain
  const handleSaveDomain = async () => {
    setIsDomainSaving(true)
    setDomainError(null)
    setDomainSuccess(false)

    try {
      const response = await fetch(`/api/organizations/${organizationId}/domain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: customDomain || null })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save domain')
      }

      setDomainSuccess(true)
      setTimeout(() => setDomainSuccess(false), 3000)
    } catch (error) {
      setDomainError(error instanceof Error ? error.message : 'Failed to save domain')
    } finally {
      setIsDomainSaving(false)
    }
  }

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Validate hex color
  const isValidHexColor = (color: string): boolean => {
    return /^#[0-9A-F]{6}$/i.test(color)
  }

  // Validate URL
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return url.startsWith('/')
    }
  }

  // Validate all branding fields
  const validateBranding = (): string[] => {
    const errors: string[] = []

    if (localBranding.email?.sender_email && !isValidEmail(localBranding.email.sender_email)) {
      errors.push('Invalid sender email address')
    }

    if (localBranding.email?.support_email && !isValidEmail(localBranding.email.support_email)) {
      errors.push('Invalid support email address')
    }

    if (localBranding.colors?.primary && !isValidHexColor(localBranding.colors.primary)) {
      errors.push('Invalid primary color (must be hex format like #3b82f6)')
    }

    if (localBranding.colors?.secondary && !isValidHexColor(localBranding.colors.secondary)) {
      errors.push('Invalid secondary color (must be hex format like #8b5cf6)')
    }

    if (localBranding.colors?.accent && !isValidHexColor(localBranding.colors.accent)) {
      errors.push('Invalid accent color (must be hex format like #10b981)')
    }

    if (localBranding.logo?.url && !isValidUrl(localBranding.logo.url)) {
      errors.push('Invalid logo URL')
    }

    if (localBranding.social?.website && !isValidUrl(localBranding.social.website)) {
      errors.push('Invalid website URL')
    }

    return errors
  }

  // Handle save
  const handleSave = async () => {
    const errors = validateBranding()
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    setValidationErrors([])
    setIsSaving(true)

    try {
      const response = await fetch(`/api/organizations/${organizationId}/branding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localBranding)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save branding')
      }

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)

      // Refresh context
      await refreshBranding()
    } catch (error) {
      console.error('Save error:', error)
      setValidationErrors([error instanceof Error ? error.message : 'Failed to save branding'])
    } finally {
      setIsSaving(false)
    }
  }

  // Update nested branding fields
  const updateColors = (field: 'primary' | 'secondary' | 'accent', value: string) => {
    setLocalBranding({
      ...localBranding,
      colors: {
        ...localBranding.colors,
        primary: localBranding.colors?.primary || '',
        secondary: localBranding.colors?.secondary || '',
        [field]: value
      }
    })
  }

  const updateLogo = (field: keyof OrgBranding['logo'], value: string | number) => {
    setLocalBranding({
      ...localBranding,
      logo: {
        ...localBranding.logo,
        url: localBranding.logo?.url || '',
        [field]: value
      }
    })
  }

  const updateEmail = (field: keyof OrgBranding['email'], value: string) => {
    setLocalBranding({
      ...localBranding,
      email: {
        ...localBranding.email,
        sender_name: localBranding.email?.sender_name || '',
        sender_email: localBranding.email?.sender_email || '',
        support_email: localBranding.email?.support_email || '',
        footer_text: localBranding.email?.footer_text || '',
        [field]: value
      }
    })
  }

  const updateSocial = (field: keyof NonNullable<OrgBranding['social']>, value: string) => {
    setLocalBranding({
      ...localBranding,
      social: {
        ...localBranding.social,
        [field]: value
      }
    })
  }

  const tabs = [
    { id: 'colors', name: 'Colors', icon: Palette },
    { id: 'logo', name: 'Logo & Assets', icon: ImageIcon },
    { id: 'email', name: 'Email Settings', icon: Mail },
    { id: 'social', name: 'Social Links', icon: Globe },
    { id: 'domain', name: 'Custom Domain', icon: LinkIcon },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 font-gendy">White-Label Branding</h2>
          <p className="text-gray-400 font-diatype">
            Customize emails, PDFs, and platform branding for this organization
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            onClick={() => setShowPreview(!showPreview)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all flex items-center gap-2 font-diatype"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </motion.button>
          <motion.button
            onClick={handleSave}
            disabled={isSaving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-diatype disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-400 font-semibold mb-2 font-diatype">Validation Errors</h3>
              <ul className="space-y-1">
                {validationErrors.map((error, i) => (
                  <li key={i} className="text-sm text-red-300 font-diatype">• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sticky top-24">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-diatype ${
                      activeTab === tab.id
                        ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                        : 'bg-transparent hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            {/* Company Info */}
            <div className="space-y-6 mb-8 pb-8 border-b border-white/10">
              <h3 className="text-lg font-bold text-white font-gendy">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={localBranding.company_name || ''}
                    onChange={(e) => setLocalBranding({ ...localBranding, company_name: e.target.value })}
                    placeholder="Your Company Name"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                    Tagline <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={localBranding.tagline || ''}
                    onChange={(e) => setLocalBranding({ ...localBranding, tagline: e.target.value })}
                    placeholder="Innovation Through AI"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
                  />
                </div>
              </div>
            </div>

            {/* Colors Tab */}
            {activeTab === 'colors' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white font-gendy">Brand Colors</h3>
                <p className="text-sm text-gray-400 font-diatype">
                  These colors will be used throughout emails, PDFs, and platform UI
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Primary Color
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={localBranding.colors?.primary || '#3b82f6'}
                        onChange={(e) => updateColors('primary', e.target.value)}
                        className="w-16 h-12 rounded-lg cursor-pointer border-2 border-white/20"
                      />
                      <input
                        type="text"
                        value={localBranding.colors?.primary || '#3b82f6'}
                        onChange={(e) => updateColors('primary', e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Secondary Color
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={localBranding.colors?.secondary || '#8b5cf6'}
                        onChange={(e) => updateColors('secondary', e.target.value)}
                        className="w-16 h-12 rounded-lg cursor-pointer border-2 border-white/20"
                      />
                      <input
                        type="text"
                        value={localBranding.colors?.secondary || '#8b5cf6'}
                        onChange={(e) => updateColors('secondary', e.target.value)}
                        placeholder="#8b5cf6"
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Accent Color <span className="text-gray-500 font-normal">(optional)</span>
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={localBranding.colors?.accent || '#10b981'}
                        onChange={(e) => updateColors('accent', e.target.value)}
                        className="w-16 h-12 rounded-lg cursor-pointer border-2 border-white/20"
                      />
                      <input
                        type="text"
                        value={localBranding.colors?.accent || '#10b981'}
                        onChange={(e) => updateColors('accent', e.target.value)}
                        placeholder="#10b981"
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h4 className="text-white font-semibold mb-4 font-diatype">Color Preview</h4>
                  <div className="flex gap-4">
                    <div className="flex-1 h-32 rounded-lg" style={{ background: `linear-gradient(135deg, ${localBranding.colors?.primary || '#3b82f6'} 0%, ${localBranding.colors?.secondary || '#8b5cf6'} 100%)` }}></div>
                    <div className="w-32 h-32 rounded-lg" style={{ backgroundColor: localBranding.colors?.accent || '#10b981' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Logo Tab */}
            {activeTab === 'logo' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white font-gendy">Logo & Assets</h3>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={localBranding.logo?.url || ''}
                    onChange={(e) => updateLogo('url', e.target.value)}
                    placeholder="https://cdn.example.com/logo.png or /logo.png"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
                  />
                  <p className="text-xs text-gray-500 mt-1 font-diatype">
                    Used in emails and PDFs. Can be absolute URL or relative path.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                    Favicon URL <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={localBranding.logo?.favicon_url || ''}
                    onChange={(e) => updateLogo('favicon_url', e.target.value)}
                    placeholder="https://cdn.example.com/favicon.ico"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Logo Width (px) <span className="text-gray-500 font-normal">(optional)</span>
                    </label>
                    <input
                      type="number"
                      value={localBranding.logo?.width || ''}
                      onChange={(e) => updateLogo('width', parseInt(e.target.value))}
                      placeholder="200"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Logo Height (px) <span className="text-gray-500 font-normal">(optional)</span>
                    </label>
                    <input
                      type="number"
                      value={localBranding.logo?.height || ''}
                      onChange={(e) => updateLogo('height', parseInt(e.target.value))}
                      placeholder="50"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email Tab */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white font-gendy">Email Configuration</h3>
                <p className="text-sm text-gray-400 font-diatype">
                  These settings control how emails are sent from your platform
                </p>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                    Sender Name
                  </label>
                  <input
                    type="text"
                    value={localBranding.email?.sender_name || ''}
                    onChange={(e) => updateEmail('sender_name', e.target.value)}
                    placeholder="Your Company AI Platform"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
                  />
                  <p className="text-xs text-gray-500 mt-1 font-diatype">
                    Displayed as the "From" name in emails
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                    Sender Email
                  </label>
                  <input
                    type="email"
                    value={localBranding.email?.sender_email || ''}
                    onChange={(e) => updateEmail('sender_email', e.target.value)}
                    placeholder="noreply@yourcompany.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
                  />
                  <p className="text-xs text-gray-500 mt-1 font-diatype">
                    Must be a verified email address
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={localBranding.email?.support_email || ''}
                    onChange={(e) => updateEmail('support_email', e.target.value)}
                    placeholder="support@yourcompany.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
                  />
                  <p className="text-xs text-gray-500 mt-1 font-diatype">
                    Shown in email footers for customer support
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                    Footer Text
                  </label>
                  <textarea
                    value={localBranding.email?.footer_text || ''}
                    onChange={(e) => updateEmail('footer_text', e.target.value)}
                    placeholder="© 2025 Your Company. All rights reserved."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype resize-none"
                  />
                </div>
              </div>
            )}

            {/* Social Tab */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white font-gendy">Social & Web Links</h3>
                <p className="text-sm text-gray-400 font-diatype">
                  Optional links to include in emails and PDFs
                </p>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                    Website <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={localBranding.social?.website || ''}
                    onChange={(e) => updateSocial('website', e.target.value)}
                    placeholder="https://yourcompany.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                    Twitter/X <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={localBranding.social?.twitter || ''}
                    onChange={(e) => updateSocial('twitter', e.target.value)}
                    placeholder="@yourcompany"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                    LinkedIn <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={localBranding.social?.linkedin || ''}
                    onChange={(e) => updateSocial('linkedin', e.target.value)}
                    placeholder="company/yourcompany"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
                  />
                </div>
              </div>
            )}

            {/* Domain Tab */}
            {activeTab === 'domain' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white font-gendy">Custom Domain</h3>
                  <p className="text-sm text-gray-400 font-diatype mt-2">
                    Configure a custom domain for white-label access to the platform
                  </p>
                </div>

                {/* Domain Input */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                    Domain <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="platform.yourcompany.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
                  />
                  <p className="text-xs text-gray-500 mt-2 font-diatype">
                    Enter your custom domain without https:// (e.g., platform.yourcompany.com)
                  </p>
                </div>

                {/* Success Message */}
                {domainSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/20 border border-green-500/30 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <p className="text-green-400 font-diatype">
                        Custom domain saved successfully!
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                {domainError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-500/30 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <p className="text-red-400 font-diatype">{domainError}</p>
                    </div>
                  </motion.div>
                )}

                {/* DNS Setup Instructions */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-blue-400 font-semibold mb-2 font-diatype">DNS Configuration Required</h4>
                      <p className="text-sm text-gray-400 font-diatype mb-3">
                        After saving your custom domain, you'll need to configure DNS settings:
                      </p>
                      <ol className="text-sm text-gray-400 font-diatype space-y-2 list-decimal list-inside">
                        <li>Add a CNAME record pointing to <code className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">hmnglue.com</code></li>
                        <li>Wait for DNS propagation (typically 5-30 minutes)</li>
                        <li>SSL certificate will be automatically provisioned</li>
                        <li>Access the platform at your custom domain</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveDomain}
                    disabled={isDomainSaving}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-diatype"
                  >
                    {isDomainSaving ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Domain
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Preview */}
      {showPreview && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4 font-gendy">Live Preview</h3>
          <div className="bg-gray-900 rounded-xl p-8 border border-white/10">
            {/* Email Preview */}
            <div className="max-w-2xl mx-auto bg-white rounded-lg overflow-hidden shadow-2xl">
              {/* Email Header */}
              <div
                className="p-8 text-center"
                style={{
                  background: `linear-gradient(135deg, ${localBranding.colors?.primary || '#3b82f6'} 0%, ${localBranding.colors?.secondary || '#8b5cf6'} 100%)`
                }}
              >
                <h2 className="text-2xl font-bold text-white font-gendy">
                  {localBranding.company_name || 'Your Company'}
                </h2>
                {localBranding.tagline && (
                  <p className="text-white/90 mt-2 font-diatype">{localBranding.tagline}</p>
                )}
              </div>

              {/* Email Body */}
              <div className="p-8">
                <p className="text-gray-700 mb-4 font-diatype">Dear Customer,</p>
                <p className="text-gray-700 mb-4 font-diatype">
                  This is a preview of how your branded emails will appear to recipients.
                </p>
                <div
                  className="inline-block px-6 py-3 rounded-lg text-white font-semibold font-diatype"
                  style={{
                    background: `linear-gradient(135deg, ${localBranding.colors?.primary || '#3b82f6'} 0%, ${localBranding.colors?.secondary || '#8b5cf6'} 100%)`
                  }}
                >
                  Call to Action
                </div>
              </div>

              {/* Email Footer */}
              <div className="bg-gray-100 p-6 text-center text-sm text-gray-600">
                <p className="mb-2 font-diatype">
                  Questions? Contact us at{' '}
                  <a href={`mailto:${localBranding.email?.support_email || 'support@example.com'}`} className="text-blue-600">
                    {localBranding.email?.support_email || 'support@example.com'}
                  </a>
                </p>
                <p className="font-diatype">
                  {localBranding.email?.footer_text || '© 2025 Your Company. All rights reserved.'}
                </p>
                {localBranding.social?.website && (
                  <p className="mt-2 font-diatype">
                    <a href={localBranding.social.website} className="text-blue-600">
                      {localBranding.social.website.replace('https://', '').replace('http://', '')}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-8 right-8 z-[60] bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3"
        >
          <CheckCircle className="w-6 h-6" />
          <span className="font-semibold font-diatype">Branding saved successfully!</span>
        </motion.div>
      )}
    </div>
  )
}
