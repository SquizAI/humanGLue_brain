'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Mail,
  Share2,
  Newspaper,
  Calendar,
  Settings,
  Link,
  Unlink,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

// Platform icons/logos as simple components
const PlatformIcon = ({ platform }: { platform: string }) => {
  const icons: Record<string, string> = {
    linkedin: 'in',
    twitter: 'X',
    instagram: 'IG',
    facebook: 'fb',
    youtube: 'YT',
    tiktok: 'TT',
    threads: '@',
  }
  return (
    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs font-bold">
      {icons[platform] || '?'}
    </div>
  )
}

interface ChannelConfig {
  id: string
  channel_type: string
  is_enabled: boolean
  tier_required: string
  hasAccess: boolean
  currentTier: string
  settings: Record<string, any>
}

interface SocialConnection {
  id: string
  platform: string
  status: string
  platformUsername: string
  platformDisplayName: string
  platformAvatarUrl?: string
  tokenExpiresAt?: string
}

interface SocialPage {
  id: string
  platform: string
  pageId: string
  pageName: string
  pageType: string
  pageUrl?: string
  isDefault: boolean
}

interface ChannelData {
  organization: {
    id: string
    name: string
    subscriptionTier: string
  }
  channels: ChannelConfig[]
  social: {
    configuredPlatforms: string[]
    connections: SocialConnection[]
    pages: SocialPage[]
  }
  email: any
  newsletter: any
  workshop: any
}

export default function ChannelSettingsPage() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<ChannelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null)

  // Check for OAuth callback results
  useEffect(() => {
    const success = searchParams.get('success')
    const errorParam = searchParams.get('error')
    const platform = searchParams.get('platform')
    const account = searchParams.get('account')

    if (success === 'connected' && platform) {
      setSuccessMessage(`Successfully connected ${platform}${account ? ` as ${account}` : ''}`)
      // Clear URL params
      window.history.replaceState({}, '', '/admin/settings/channels')
    } else if (errorParam) {
      setError(`${platform ? `${platform}: ` : ''}${errorParam}`)
      window.history.replaceState({}, '', '/admin/settings/channels')
    }
  }, [searchParams])

  // Fetch channel data
  useEffect(() => {
    fetchChannelData()
  }, [])

  const fetchChannelData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/channels')
      const result = await response.json()

      if (result.success) {
        setData(result)
      } else {
        setError(result.error || 'Failed to load channel settings')
      }
    } catch (err) {
      setError('Failed to load channel settings')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleChannel = async (channelType: string, enabled: boolean) => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/channels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelType,
          action: 'toggle_channel',
          data: { enabled },
        }),
      })

      const result = await response.json()
      if (result.success) {
        await fetchChannelData()
        setSuccessMessage(`${channelType} channel ${enabled ? 'enabled' : 'disabled'}`)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to update channel')
    } finally {
      setSaving(false)
    }
  }

  const handleConnectPlatform = async (platform: string) => {
    try {
      setConnectingPlatform(platform)
      const response = await fetch(`/api/oauth/${platform}`)
      const result = await response.json()

      if (result.success && result.authUrl) {
        // Redirect to OAuth
        window.location.href = result.authUrl
      } else {
        setError(result.error || 'Failed to start OAuth flow')
        setConnectingPlatform(null)
      }
    } catch (err) {
      setError('Failed to connect platform')
      setConnectingPlatform(null)
    }
  }

  const handleDisconnectPlatform = async (connectionId: string, platform: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platform}?`)) return

    try {
      setSaving(true)
      const response = await fetch(`/api/oauth/${platform}?connectionId=${connectionId}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      if (result.success) {
        await fetchChannelData()
        setSuccessMessage(`Disconnected ${platform}`)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to disconnect platform')
    } finally {
      setSaving(false)
    }
  }

  const handleSetDefaultPage = async (pageId: string, platform: string) => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/channels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelType: 'social',
          action: 'set_default_page',
          data: { pageId, platform },
        }),
      })

      const result = await response.json()
      if (result.success) {
        await fetchChannelData()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to set default page')
    } finally {
      setSaving(false)
    }
  }

  // Clear messages after a delay
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, error])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load channel settings. Please try again.</AlertDescription>
      </Alert>
    )
  }

  const channelIcons: Record<string, React.ReactNode> = {
    email: <Mail className="w-5 h-5" />,
    social: <Share2 className="w-5 h-5" />,
    newsletter: <Newspaper className="w-5 h-5" />,
    workshop: <Calendar className="w-5 h-5" />,
  }

  const tierLabels: Record<string, string> = {
    free: 'Free',
    starter: 'Starter',
    professional: 'Professional',
    enterprise: 'Enterprise',
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Communication Channels</h1>
          <p className="text-muted-foreground">
            Configure channels for {data.organization.name}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {tierLabels[data.organization.subscriptionTier]} Plan
        </Badge>
      </div>

      {/* Alerts */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
          <TabsTrigger value="workshop">Workshops</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {data.channels.map((channel) => (
              <Card
                key={channel.channel_type}
                className={!channel.hasAccess ? 'opacity-60' : ''}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    {channelIcons[channel.channel_type]}
                    <div>
                      <CardTitle className="text-lg capitalize">
                        {channel.channel_type}
                      </CardTitle>
                      <CardDescription>
                        {channel.hasAccess ? (
                          channel.is_enabled ? 'Active' : 'Disabled'
                        ) : (
                          <>
                            <Lock className="w-3 h-3 inline mr-1" />
                            Requires {tierLabels[channel.tier_required]}
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={channel.is_enabled}
                    onCheckedChange={(checked) =>
                      handleToggleChannel(channel.channel_type, checked)
                    }
                    disabled={!channel.hasAccess || saving}
                  />
                </CardHeader>
                <CardContent>
                  {channel.channel_type === 'social' && (
                    <div className="flex gap-2">
                      {data.social.connections.length > 0 ? (
                        data.social.connections.map((conn) => (
                          <Badge key={conn.id} variant="secondary" className="capitalize">
                            {conn.platform}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No accounts connected</span>
                      )}
                    </div>
                  )}
                  {channel.channel_type === 'email' && (
                    <p className="text-sm text-muted-foreground">
                      {data.email?.isActive
                        ? `Sending from ${data.email.fromEmail}`
                        : 'Not configured'}
                    </p>
                  )}
                  {channel.channel_type === 'newsletter' && (
                    <p className="text-sm text-muted-foreground">
                      {data.newsletter?.isActive
                        ? data.newsletter.name
                        : 'Not configured'}
                    </p>
                  )}
                  {channel.channel_type === 'workshop' && (
                    <p className="text-sm text-muted-foreground">
                      {data.workshop?.isActive
                        ? 'Auto-announcements enabled'
                        : 'Not configured'}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upgrade prompt for locked channels */}
          {data.channels.some((c) => !c.hasAccess) && (
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Star className="w-8 h-8 text-purple-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold">Unlock More Channels</h3>
                    <p className="text-sm text-muted-foreground">
                      Upgrade your plan to access all communication channels
                    </p>
                  </div>
                  <Button>Upgrade Plan</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>
                Connect your social media accounts to post content directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Available Platforms */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {['linkedin', 'twitter', 'instagram', 'facebook', 'youtube', 'tiktok', 'threads'].map(
                  (platform) => {
                    const connection = data.social.connections.find(
                      (c) => c.platform === platform
                    )
                    const isConfigured = data.social.configuredPlatforms.includes(platform)
                    const pages = data.social.pages.filter((p) => p.platform === platform)

                    return (
                      <Card key={platform} className="relative">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <PlatformIcon platform={platform} />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium capitalize">{platform}</h4>
                              {connection ? (
                                <>
                                  <p className="text-sm text-muted-foreground truncate">
                                    @{connection.platformUsername}
                                  </p>
                                  {connection.status === 'expired' && (
                                    <Badge variant="destructive" className="mt-1">
                                      Expired
                                    </Badge>
                                  )}
                                </>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  {isConfigured ? 'Not connected' : 'Not configured'}
                                </p>
                              )}
                            </div>
                            {connection ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDisconnectPlatform(connection.id, platform)
                                }
                                disabled={saving}
                              >
                                <Unlink className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleConnectPlatform(platform)}
                                disabled={!isConfigured || connectingPlatform === platform}
                              >
                                {connectingPlatform === platform ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Link className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                          </div>

                          {/* Pages for this platform */}
                          {pages.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <Separator />
                              <p className="text-xs font-medium text-muted-foreground mt-2">
                                Pages / Accounts
                              </p>
                              {pages.map((page) => (
                                <div
                                  key={page.id}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span className="truncate">{page.pageName}</span>
                                  <div className="flex items-center gap-2">
                                    {page.isDefault && (
                                      <Badge variant="secondary" className="text-xs">
                                        Default
                                      </Badge>
                                    )}
                                    {!page.isDefault && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs"
                                        onClick={() =>
                                          handleSetDefaultPage(page.id, platform)
                                        }
                                      >
                                        Set Default
                                      </Button>
                                    )}
                                    {page.pageUrl && (
                                      <a
                                        href={page.pageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  }
                )}
              </div>

              {/* Configuration notice */}
              {data.social.configuredPlatforms.length < 7 && (
                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertTitle>Platform Configuration</AlertTitle>
                  <AlertDescription>
                    Some platforms require OAuth credentials to be configured by a system
                    administrator. Contact support if you need additional platforms enabled.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Configure email sending for outreach and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email-provider">Email Provider</Label>
                  <Select defaultValue={data.email?.provider || 'resend'}>
                    <SelectTrigger id="email-provider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resend">Resend</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailchimp">Mailchimp</SelectItem>
                      <SelectItem value="custom_smtp">Custom SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sending-domain">Sending Domain</Label>
                  <Input
                    id="sending-domain"
                    placeholder="mail.example.com"
                    defaultValue={data.email?.sendingDomain || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from-name">From Name</Label>
                  <Input
                    id="from-name"
                    placeholder="Your Company"
                    defaultValue={data.email?.fromName || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from-email">From Email</Label>
                  <Input
                    id="from-email"
                    type="email"
                    placeholder="hello@example.com"
                    defaultValue={data.email?.fromEmail || ''}
                  />
                </div>
              </div>

              {data.email?.domainVerified && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Domain verified and ready to send
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Button disabled={saving}>Save Email Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Newsletter Tab */}
        <TabsContent value="newsletter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Newsletter Settings</CardTitle>
              <CardDescription>
                Configure your newsletter branding and delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newsletter-name">Newsletter Name</Label>
                  <Input
                    id="newsletter-name"
                    placeholder="Weekly Insights"
                    defaultValue={data.newsletter?.name || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newsletter-desc">Description</Label>
                  <Input
                    id="newsletter-desc"
                    placeholder="Your weekly dose of AI insights"
                    defaultValue={data.newsletter?.description || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <Input
                    id="primary-color"
                    type="color"
                    defaultValue={data.newsletter?.primaryColor || '#0066FF'}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="send-day">Default Send Day</Label>
                  <Select defaultValue={data.newsletter?.defaultSendDay || 'tuesday'}>
                    <SelectTrigger id="send-day">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="tuesday">Tuesday</SelectItem>
                      <SelectItem value="wednesday">Wednesday</SelectItem>
                      <SelectItem value="thursday">Thursday</SelectItem>
                      <SelectItem value="friday">Friday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Tracking & Privacy</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Track Opens</Label>
                    <p className="text-sm text-muted-foreground">
                      Track when subscribers open your newsletter
                    </p>
                  </div>
                  <Switch defaultChecked={data.newsletter?.trackOpens !== false} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Track Clicks</Label>
                    <p className="text-sm text-muted-foreground">
                      Track link clicks in your newsletter
                    </p>
                  </div>
                  <Switch defaultChecked={data.newsletter?.trackClicks !== false} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Double Opt-in</Label>
                    <p className="text-sm text-muted-foreground">
                      Subscribers must confirm their email
                    </p>
                  </div>
                  <Switch defaultChecked={data.newsletter?.requireDoubleOptin !== false} />
                </div>
              </div>

              <div className="flex justify-end">
                <Button disabled={saving}>Save Newsletter Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workshop Tab */}
        <TabsContent value="workshop" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workshop Announcements</CardTitle>
              <CardDescription>
                Configure automatic announcements for your workshops
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Announce New Workshops</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically announce when workshops are published
                  </p>
                </div>
                <Switch defaultChecked={data.workshop?.autoAnnounce} />
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="announce-days">Announce Days Before</Label>
                  <Input
                    id="announce-days"
                    type="number"
                    min="1"
                    max="30"
                    defaultValue={data.workshop?.announceDaysBefore || 7}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Announcement Channels</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Post on Social Media</Label>
                  </div>
                  <Switch defaultChecked={data.workshop?.announceOnSocial !== false} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Send Email Announcement</Label>
                  </div>
                  <Switch defaultChecked={data.workshop?.announceViaEmail !== false} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Include in Newsletter</Label>
                  </div>
                  <Switch defaultChecked={data.workshop?.announceInNewsletter !== false} />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Content Options</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Include Instructor Info</Label>
                  </div>
                  <Switch defaultChecked={data.workshop?.includeInstructorInfo !== false} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Include Pricing</Label>
                  </div>
                  <Switch defaultChecked={data.workshop?.includePricing !== false} />
                </div>
              </div>

              <div className="flex justify-end">
                <Button disabled={saving}>Save Workshop Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
