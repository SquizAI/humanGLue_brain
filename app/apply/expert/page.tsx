'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import {
  Sparkles,
  GraduationCap,
  Briefcase,
  Award,
  Globe,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface EducationEntry {
  degree: string
  institution: string
  year?: number
}

interface CertificationEntry {
  name: string
  issuer: string
  year?: number
  url?: string
}

interface WorkHistoryEntry {
  title: string
  company: string
  startYear?: number
  endYear?: number | null
  description?: string
}

interface ReferenceEntry {
  name: string
  title?: string
  email?: string
  phone?: string
  relationship?: string
}

interface SampleTopicEntry {
  title: string
  description?: string
  format?: string
}

export default function ExpertApplicationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saveAsDraft, setSaveAsDraft] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    email: '',
    phone: '',
    location: '',
    timezone: '',

    // Professional Information
    professionalTitle: '',
    headline: '',
    bio: '',

    // Visual Assets
    profileImageUrl: '',
    videoIntroUrl: '',

    // Experience
    yearsExperience: 0,
    expertiseAreas: [] as string[],
    aiPillars: [] as string[],
    industries: [] as string[],

    // Credentials
    education: [] as EducationEntry[],
    certifications: [] as CertificationEntry[],
    workHistory: [] as WorkHistoryEntry[],

    // Social Links
    linkedinUrl: '',
    twitterUrl: '',
    websiteUrl: '',
    githubUrl: '',
    portfolioUrls: [] as string[],

    // Service Info
    desiredHourlyRate: undefined as number | undefined,
    availability: '' as 'full_time' | 'part_time' | 'limited' | '',
    servicesOffered: [] as string[],

    // Application Details
    whyJoin: '',
    uniqueValue: '',
    sampleTopics: [] as SampleTopicEntry[],
    references: [] as ReferenceEntry[],

    // Legal
    agreedToTerms: false,
    backgroundCheckConsent: false,
  })

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (checkAll = false) => {
    const newErrors: Record<string, string> = {}

    // Only validate required fields if submitting (not drafting)
    if (checkAll || !saveAsDraft) {
      if (!formData.fullName || formData.fullName.length < 2) {
        newErrors.fullName = 'Full name is required (min 2 characters)'
      }

      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Valid email is required'
      }

      if (!formData.professionalTitle || formData.professionalTitle.length < 5) {
        newErrors.professionalTitle = 'Professional title is required (min 5 characters)'
      }

      if (!formData.bio || formData.bio.length < 100) {
        newErrors.bio = 'Bio must be at least 100 characters'
      } else if (formData.bio.length > 3000) {
        newErrors.bio = 'Bio must be less than 3000 characters'
      }

      if (formData.yearsExperience < 0) {
        newErrors.yearsExperience = 'Years of experience must be 0 or greater'
      }

      if (!formData.agreedToTerms) {
        newErrors.agreedToTerms = 'You must agree to the terms to submit'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, draft = false) => {
    e.preventDefault()
    setSaveAsDraft(draft)

    if (!draft && !validateForm(true)) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/expert-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          submitNow: !draft,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to submit application')
      }

      toast({
        title: draft ? 'Draft Saved' : 'Application Submitted!',
        description: draft
          ? 'You can continue editing your application later'
          : 'We\'ll review your application and get back to you soon',
      })

      // Redirect to success page or dashboard
      if (!draft) {
        router.push('/apply/expert/success')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const addArrayItem = (field: string) => {
    setFormData({
      ...formData,
      [field]: [...(formData[field as keyof typeof formData] as unknown[]), {}],
    })
  }

  const removeArrayItem = (field: string, index: number) => {
    const array = formData[field as keyof typeof formData] as unknown[]
    setFormData({
      ...formData,
      [field]: array.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Join Our Expert Network</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Become a HMN Expert
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share your AI expertise, help organizations transform, and build your personal brand
            as a recognized thought leader in the AI space.
          </p>
        </div>

        {/* Benefits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Why Join HMN?
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <DollarSign className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Set Your Own Rates</h3>
                <p className="text-sm text-gray-600">Control your pricing and availability</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Globe className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Global Reach</h3>
                <p className="text-sm text-gray-600">Work with clients worldwide</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Award className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Build Your Brand</h3>
                <p className="text-sm text-gray-600">Showcase your expertise and thought leadership</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Briefcase className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Flexible Work</h3>
                <p className="text-sm text-gray-600">Choose projects that align with your interests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <form onSubmit={(e) => handleSubmit(e, false)}>
          {/* Personal Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Tell us about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="John Doe"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Professional Profile
              </CardTitle>
              <CardDescription>Showcase your expertise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="professionalTitle">
                  Professional Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="professionalTitle"
                  value={formData.professionalTitle}
                  onChange={(e) => setFormData({ ...formData, professionalTitle: e.target.value })}
                  placeholder="AI Strategy Consultant & Transformation Expert"
                />
                {errors.professionalTitle && (
                  <p className="text-sm text-red-500 mt-1">{errors.professionalTitle}</p>
                )}
              </div>

              <div>
                <Label htmlFor="headline">Professional Headline</Label>
                <Input
                  id="headline"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="Helping organizations unlock AI potential"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.headline.length}/200 characters
                </p>
              </div>

              <div>
                <Label htmlFor="bio">
                  Professional Bio <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Share your background, expertise, and what makes you unique..."
                  rows={8}
                  maxLength={3000}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.bio && (
                    <p className="text-sm text-red-500">{errors.bio}</p>
                  )}
                  <p className="text-xs text-gray-500 ml-auto">
                    {formData.bio.length}/3000 characters (min 100)
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  min="0"
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) || 0 })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Service Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Service Details
              </CardTitle>
              <CardDescription>Define your offerings and availability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="desiredHourlyRate">Desired Hourly Rate (USD)</Label>
                  <Input
                    id="desiredHourlyRate"
                    type="number"
                    min="0"
                    step="10"
                    value={formData.desiredHourlyRate || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      desiredHourlyRate: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    placeholder="150"
                  />
                </div>

                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Select
                    value={formData.availability}
                    onValueChange={(value) =>
                      setFormData({ ...formData, availability: value as 'full_time' | 'part_time' | 'limited' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full-time (40+ hrs/week)</SelectItem>
                      <SelectItem value="part_time">Part-time (20-40 hrs/week)</SelectItem>
                      <SelectItem value="limited">Limited (&lt;20 hrs/week)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="whyJoin">Why do you want to join HMN?</Label>
                <Textarea
                  id="whyJoin"
                  value={formData.whyJoin}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, whyJoin: e.target.value })}
                  placeholder="Share your motivation and what you hope to achieve..."
                  rows={4}
                  maxLength={2000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.whyJoin.length}/2000 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Online Presence
              </CardTitle>
              <CardDescription>Share your professional profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkedinUrl">LinkedIn</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div>
                  <Label htmlFor="twitterUrl">Twitter/X</Label>
                  <Input
                    id="twitterUrl"
                    type="url"
                    value={formData.twitterUrl}
                    onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                    placeholder="https://twitter.com/..."
                  />
                </div>

                <div>
                  <Label htmlFor="websiteUrl">Personal Website</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label htmlFor="githubUrl">GitHub</Label>
                  <Input
                    id="githubUrl"
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Terms & Agreements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, agreedToTerms: checked })
                  }
                />
                <Label htmlFor="agreedToTerms" className="cursor-pointer leading-relaxed">
                  I agree to the{' '}
                  <a href="/terms" target="_blank" className="text-purple-600 hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" target="_blank" className="text-purple-600 hover:underline">
                    Privacy Policy
                  </a>{' '}
                  <span className="text-red-500">*</span>
                </Label>
              </div>
              {errors.agreedToTerms && (
                <p className="text-sm text-red-500">{errors.agreedToTerms}</p>
              )}

              <div className="flex items-start gap-3">
                <Checkbox
                  id="backgroundCheckConsent"
                  checked={formData.backgroundCheckConsent}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, backgroundCheckConsent: checked })
                  }
                />
                <Label htmlFor="backgroundCheckConsent" className="cursor-pointer leading-relaxed">
                  I consent to a background check as part of the application process
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.preventDefault()
                const fakeFormEvent = {
                  ...e,
                  currentTarget: e.currentTarget.form || e.currentTarget,
                  target: e.currentTarget.form || e.currentTarget,
                  preventDefault: () => {},
                } as React.FormEvent<HTMLFormElement>
                handleSubmit(fakeFormEvent, true)
              }}
              disabled={loading}
            >
              {loading && saveAsDraft ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save as Draft'
              )}
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading && !saveAsDraft ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
