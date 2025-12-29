'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  DollarSign,
  Globe,
  Linkedin,
  Twitter,
  Github,
  Calendar,
  User,
  FileText,
  Loader2,
  History,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { Separator } from '@/components/ui/separator'
import { formatDistanceToNow } from 'date-fns'

interface Application {
  id: string
  full_name: string
  email: string
  phone: string | null
  location: string | null
  timezone: string | null
  professional_title: string
  headline: string | null
  bio: string
  profile_image_url: string | null
  video_intro_url: string | null
  years_experience: number
  expertise_areas: string[]
  ai_pillars: string[]
  industries: string[]
  education: Array<{ degree: string; institution: string; year?: number }>
  certifications: Array<{ name: string; issuer: string; year?: number; url?: string }>
  work_history: Array<{
    title: string
    company: string
    startYear?: number
    endYear?: number | null
    description?: string
  }>
  linkedin_url: string | null
  twitter_url: string | null
  website_url: string | null
  github_url: string | null
  portfolio_urls: string[]
  desired_hourly_rate: number | null
  availability: 'full_time' | 'part_time' | 'limited' | null
  services_offered: string[]
  why_join: string | null
  unique_value: string | null
  sample_topics: Array<{ title: string; description?: string; format?: string }>
  references: Array<{
    name: string
    title?: string
    email?: string
    phone?: string
    relationship?: string
  }>
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'withdrawn'
  submitted_at: string | null
  reviewed_at: string | null
  reviewer_id: string | null
  review_notes: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
  history?: Array<{
    id: string
    old_status: string
    new_status: string
    created_at: string
    notes: string | null
  }>
}

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: Clock },
  under_review: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-600', icon: XCircle },
}

export default function ApplicationReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchApplication()
  }, [id])

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/expert-applications/${id}`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to fetch application')
      }

      setApplication(result.data)
    } catch (error) {
      console.error('Fetch error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load application',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/expert-applications/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          reviewNotes,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to approve application')
      }

      toast({
        title: 'Application Approved',
        description: 'The applicant has been approved and an instructor profile has been created',
      })

      setApproveDialogOpen(false)
      fetchApplication()
    } catch (error) {
      console.error('Approve error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve application',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      })
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch(`/api/expert-applications/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          rejectionReason,
          reviewNotes,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to reject application')
      }

      toast({
        title: 'Application Rejected',
        description: 'The applicant has been notified of the decision',
      })

      setRejectDialogOpen(false)
      fetchApplication()
    } catch (error) {
      console.error('Reject error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reject application',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleMarkUnderReview = async () => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/expert-applications/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_under_review',
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to update status')
      }

      toast({
        title: 'Status Updated',
        description: 'Application marked as under review',
      })

      fetchApplication()
    } catch (error) {
      console.error('Update error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Application not found</h3>
            <Button asChild>
              <Link href="/admin/applications">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Applications
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const StatusIcon = statusConfig[application.status].icon
  const canReview = ['submitted', 'under_review'].includes(application.status)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admin/applications">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Applications
            </Link>
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {application.full_name}
              </h1>
              <p className="text-gray-600">{application.professional_title}</p>
            </div>

            <Badge
              variant="secondary"
              className={`${statusConfig[application.status].color} px-4 py-2`}
            >
              <StatusIcon className="w-4 h-4 mr-2" />
              {statusConfig[application.status].label}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        {canReview && (
          <Card className="mb-6 border-2 border-purple-200 bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Review Actions</h3>
                  <p className="text-sm text-gray-600">
                    This application is ready for your review
                  </p>
                </div>

                <div className="flex gap-3">
                  {application.status === 'submitted' && (
                    <Button
                      variant="outline"
                      onClick={handleMarkUnderReview}
                      disabled={actionLoading}
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Mark Under Review
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() => setRejectDialogOpen(true)}
                    disabled={actionLoading}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>

                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setApproveDialogOpen(true)}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${application.email}`} className="text-purple-600 hover:underline">
                    {application.email}
                  </a>
                </div>

                {application.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${application.phone}`} className="text-purple-600 hover:underline">
                      {application.phone}
                    </a>
                  </div>
                )}

                {application.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{application.location}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Professional Bio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Professional Bio
                </CardTitle>
              </CardHeader>
              <CardContent>
                {application.headline && (
                  <p className="text-lg font-medium text-gray-900 mb-4">
                    {application.headline}
                  </p>
                )}
                <p className="text-gray-700 whitespace-pre-wrap">{application.bio}</p>
              </CardContent>
            </Card>

            {/* Expertise */}
            {application.expertise_areas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Expertise Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {application.expertise_areas.map((area, idx) => (
                      <Badge key={idx} variant="secondary">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {application.education.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {application.education.map((edu, idx) => (
                    <div key={idx}>
                      <div className="font-medium text-gray-900">{edu.degree}</div>
                      <div className="text-gray-600">{edu.institution}</div>
                      {edu.year && <div className="text-sm text-gray-500">{edu.year}</div>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Work History */}
            {application.work_history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Work History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {application.work_history.map((work, idx) => (
                    <div key={idx}>
                      <div className="font-medium text-gray-900">{work.title}</div>
                      <div className="text-gray-600">{work.company}</div>
                      {(work.startYear || work.endYear) && (
                        <div className="text-sm text-gray-500">
                          {work.startYear} - {work.endYear || 'Present'}
                        </div>
                      )}
                      {work.description && (
                        <p className="text-sm text-gray-700 mt-1">{work.description}</p>
                      )}
                      {idx < application.work_history.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Why Join */}
            {application.why_join && (
              <Card>
                <CardHeader>
                  <CardTitle>Why Join HumanGlue?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{application.why_join}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Experience</div>
                  <div className="text-lg font-semibold">{application.years_experience} years</div>
                </div>

                {application.desired_hourly_rate && (
                  <div>
                    <div className="text-sm text-gray-600">Desired Rate</div>
                    <div className="text-lg font-semibold flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {application.desired_hourly_rate}/hr
                    </div>
                  </div>
                )}

                {application.availability && (
                  <div>
                    <div className="text-sm text-gray-600">Availability</div>
                    <div className="text-lg font-semibold capitalize">
                      {application.availability.replace('_', ' ')}
                    </div>
                  </div>
                )}

                {application.submitted_at && (
                  <div>
                    <div className="text-sm text-gray-600">Submitted</div>
                    <div className="text-sm font-medium">
                      {formatDistanceToNow(new Date(application.submitted_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Links */}
            {(application.linkedin_url ||
              application.twitter_url ||
              application.website_url ||
              application.github_url) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Online Presence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {application.linkedin_url && (
                    <a
                      href={application.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-purple-600 hover:underline"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}

                  {application.twitter_url && (
                    <a
                      href={application.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-purple-600 hover:underline"
                    >
                      <Twitter className="w-4 h-4" />
                      Twitter/X
                    </a>
                  )}

                  {application.website_url && (
                    <a
                      href={application.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-purple-600 hover:underline"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                    </a>
                  )}

                  {application.github_url && (
                    <a
                      href={application.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-purple-600 hover:underline"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Review History */}
            {application.history && application.history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Review History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {application.history.map((entry) => (
                      <div key={entry.id} className="text-sm">
                        <div className="font-medium">
                          {entry.old_status} → {entry.new_status}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                        </div>
                        {entry.notes && (
                          <p className="text-gray-600 mt-1">{entry.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Application</DialogTitle>
            <DialogDescription>
              This will approve the application and create an instructor profile for the applicant.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="approve-notes">Review Notes (Optional)</Label>
              <Textarea
                id="approve-notes"
                value={reviewNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReviewNotes(e.target.value)}
                placeholder="Add any internal notes about your decision..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. The applicant will be notified.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rejection-reason">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionReason(e.target.value)}
                placeholder="Why is this application being rejected?"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="reject-notes">Additional Notes (Optional)</Label>
              <Textarea
                id="reject-notes"
                value={reviewNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReviewNotes(e.target.value)}
                placeholder="Internal notes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason.trim()}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
