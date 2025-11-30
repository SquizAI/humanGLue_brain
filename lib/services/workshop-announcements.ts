/**
 * Workshop Announcement Service
 *
 * Handles automated announcements for workshops across multiple channels:
 * - Social media platforms (LinkedIn, Twitter, Facebook, Instagram, etc.)
 * - Email notifications
 * - Newsletter integration
 *
 * White-label aware: All announcements are organization-scoped
 */

import { createClient } from '@/lib/supabase/server'
import { socialPostingService } from './social-posting'
import { newsletterService } from './newsletter'

export interface Workshop {
  id: string
  title: string
  description: string
  date: string
  time: string
  timezone: string
  duration_minutes: number
  location?: string
  location_type: 'online' | 'in_person' | 'hybrid'
  meeting_url?: string
  max_attendees?: number
  current_attendees?: number
  price?: number
  currency?: string
  registration_url?: string
  image_url?: string
  organization_id: string
  created_at: string
}

export interface AnnouncementSettings {
  id: string
  organization_id: string
  auto_announce_new_workshops: boolean
  announce_on_social: boolean
  social_platforms: string[]
  announce_via_email: boolean
  email_template_id?: string
  announce_in_newsletter: boolean
  newsletter_list_ids: string[]
  default_announcement_time: string
  days_before_reminder: number[]
  created_at: string
  updated_at: string
}

export interface AnnouncementResult {
  channel: string
  platform?: string
  success: boolean
  messageId?: string
  error?: string
}

interface GeneratedContent {
  title: string
  socialPost: string
  emailSubject: string
  emailBody: string
  newsletterContent: string
}

class WorkshopAnnouncementService {
  /**
   * Generate announcement content for a workshop
   */
  generateContent(workshop: Workshop, organizationName: string): GeneratedContent {
    const workshopDate = new Date(workshop.date)
    const formattedDate = workshopDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const locationText =
      workshop.location_type === 'online'
        ? 'Online'
        : workshop.location_type === 'hybrid'
          ? `Hybrid - ${workshop.location || 'Location TBA'}`
          : workshop.location || 'Location TBA'

    const priceText = workshop.price
      ? `${workshop.currency || '$'}${workshop.price}`
      : 'Free'

    // Social post (concise for platforms with character limits)
    const socialPost = `${workshop.title}

${formattedDate} at ${workshop.time} ${workshop.timezone}
${locationText}
${priceText}

${workshop.description.substring(0, 200)}${workshop.description.length > 200 ? '...' : ''}

Register now: ${workshop.registration_url || '[Link in bio]'}

#workshop #learning #${organizationName.replace(/\s+/g, '')}`.trim()

    // Email subject
    const emailSubject = `New Workshop: ${workshop.title} - ${formattedDate}`

    // Email body (HTML)
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .detail-row { display: flex; margin-bottom: 10px; }
    .detail-label { font-weight: bold; width: 100px; }
    .cta { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
    .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${workshop.title}</h1>
    </div>
    <div class="content">
      ${workshop.image_url ? `<img src="${workshop.image_url}" alt="${workshop.title}" style="width: 100%; border-radius: 8px; margin-bottom: 15px;">` : ''}

      <p>${workshop.description}</p>

      <div class="details">
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span>${formattedDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time:</span>
          <span>${workshop.time} ${workshop.timezone}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Duration:</span>
          <span>${workshop.duration_minutes} minutes</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Location:</span>
          <span>${locationText}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Price:</span>
          <span>${priceText}</span>
        </div>
        ${workshop.max_attendees ? `
        <div class="detail-row">
          <span class="detail-label">Spots:</span>
          <span>${workshop.max_attendees - (workshop.current_attendees || 0)} remaining</span>
        </div>
        ` : ''}
      </div>

      ${workshop.registration_url ? `<a href="${workshop.registration_url}" class="cta">Register Now</a>` : ''}
    </div>
    <div class="footer">
      <p>Sent by ${organizationName}</p>
    </div>
  </div>
</body>
</html>
`.trim()

    // Newsletter content (markdown-style)
    const newsletterContent = `
## ${workshop.title}

**Date:** ${formattedDate} at ${workshop.time} ${workshop.timezone}
**Location:** ${locationText}
**Price:** ${priceText}

${workshop.description}

${workshop.registration_url ? `[Register Now](${workshop.registration_url})` : ''}
`.trim()

    return {
      title: workshop.title,
      socialPost,
      emailSubject,
      emailBody,
      newsletterContent,
    }
  }

  /**
   * Get announcement settings for an organization
   */
  async getSettings(organizationId: string): Promise<AnnouncementSettings | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('workshop_announcement_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('[Workshop Announcements] Error fetching settings:', error)
      throw error
    }

    return data
  }

  /**
   * Update announcement settings
   */
  async updateSettings(
    organizationId: string,
    settings: Partial<AnnouncementSettings>
  ): Promise<AnnouncementSettings> {
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('workshop_announcement_settings')
      .select('id')
      .eq('organization_id', organizationId)
      .single()

    if (existing) {
      const { data, error } = await supabase
        .from('workshop_announcement_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('organization_id', organizationId)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('workshop_announcement_settings')
        .insert({
          organization_id: organizationId,
          auto_announce_new_workshops: settings.auto_announce_new_workshops ?? true,
          announce_on_social: settings.announce_on_social ?? true,
          social_platforms: settings.social_platforms ?? ['linkedin', 'twitter'],
          announce_via_email: settings.announce_via_email ?? false,
          email_template_id: settings.email_template_id,
          announce_in_newsletter: settings.announce_in_newsletter ?? false,
          newsletter_list_ids: settings.newsletter_list_ids ?? [],
          default_announcement_time: settings.default_announcement_time ?? '09:00',
          days_before_reminder: settings.days_before_reminder ?? [7, 1],
        })
        .select()
        .single()

      if (error) throw error
      return data
    }
  }

  /**
   * Announce a workshop across all configured channels
   */
  async announceWorkshop(
    workshop: Workshop,
    options?: {
      channels?: ('social' | 'email' | 'newsletter')[]
      customContent?: Partial<GeneratedContent>
    }
  ): Promise<AnnouncementResult[]> {
    const supabase = await createClient()
    const results: AnnouncementResult[] = []

    // Get organization details
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', workshop.organization_id)
      .single()

    const organizationName = org?.name || 'Our Organization'

    // Get announcement settings
    const settings = await this.getSettings(workshop.organization_id)

    if (!settings) {
      return [
        {
          channel: 'system',
          success: false,
          error: 'No announcement settings configured',
        },
      ]
    }

    // Generate content
    const content = {
      ...this.generateContent(workshop, organizationName),
      ...options?.customContent,
    }

    const channelsToAnnounce = options?.channels || []

    // If no specific channels requested, use settings
    if (channelsToAnnounce.length === 0) {
      if (settings.announce_on_social) channelsToAnnounce.push('social')
      if (settings.announce_via_email) channelsToAnnounce.push('email')
      if (settings.announce_in_newsletter) channelsToAnnounce.push('newsletter')
    }

    // Post to social media
    if (channelsToAnnounce.includes('social') && settings.social_platforms.length > 0) {
      try {
        const socialResults = await socialPostingService.postToMultiplePlatforms(
          workshop.organization_id,
          {
            text: content.socialPost,
            mediaUrls: workshop.image_url ? [workshop.image_url] : undefined,
            link: workshop.registration_url,
            linkTitle: content.title,
          },
          settings.social_platforms as ('linkedin' | 'twitter' | 'facebook' | 'instagram' | 'threads')[]
        )

        for (const result of socialResults) {
          results.push({
            channel: 'social',
            platform: result.platform,
            success: result.success,
            messageId: result.postId,
            error: result.error,
          })
        }
      } catch (error) {
        results.push({
          channel: 'social',
          success: false,
          error: error instanceof Error ? error.message : 'Social posting failed',
        })
      }
    }

    // Send email notification
    if (channelsToAnnounce.includes('email')) {
      try {
        // Get email configuration
        const { data: emailConfig } = await supabase
          .from('email_configurations')
          .select('*')
          .eq('organization_id', workshop.organization_id)
          .eq('is_default', true)
          .single()

        if (emailConfig) {
          // Get subscriber lists that want workshop notifications
          const { data: subscribers } = await supabase
            .from('newsletter_subscribers')
            .select('email, first_name')
            .eq('organization_id', workshop.organization_id)
            .eq('subscribed', true)
            .contains('tags', ['workshops'])
            .limit(1000)

          if (subscribers && subscribers.length > 0) {
            let successCount = 0
            let failCount = 0

            for (const subscriber of subscribers) {
              try {
                // Personalize email
                const personalizedBody = content.emailBody.replace(
                  'Sent by',
                  `Hi ${subscriber.first_name || 'there'},\n\nSent by`
                )

                await newsletterService.sendEmail(
                  workshop.organization_id,
                  {
                    to: subscriber.email,
                    subject: content.emailSubject,
                    html: personalizedBody,
                    tags: ['workshop-announcement', `workshop-${workshop.id}`],
                  }
                )
                successCount++
              } catch {
                failCount++
              }
            }

            results.push({
              channel: 'email',
              success: successCount > 0,
              messageId: `${successCount} sent, ${failCount} failed`,
            })
          } else {
            results.push({
              channel: 'email',
              success: false,
              error: 'No subscribers with workshop tag',
            })
          }
        } else {
          results.push({
            channel: 'email',
            success: false,
            error: 'No email configuration found',
          })
        }
      } catch (error) {
        results.push({
          channel: 'email',
          success: false,
          error: error instanceof Error ? error.message : 'Email sending failed',
        })
      }
    }

    // Include in newsletter
    if (channelsToAnnounce.includes('newsletter') && settings.newsletter_list_ids.length > 0) {
      try {
        // Save workshop content for next newsletter
        const { error } = await supabase.from('channel_content').insert({
          organization_id: workshop.organization_id,
          channel_type: 'newsletter',
          title: `Workshop: ${content.title}`,
          content: content.newsletterContent,
          status: 'draft',
          metadata: {
            type: 'workshop_announcement',
            workshop_id: workshop.id,
            target_lists: settings.newsletter_list_ids,
          },
        })

        if (error) throw error

        results.push({
          channel: 'newsletter',
          success: true,
          messageId: 'Queued for next newsletter',
        })
      } catch (error) {
        results.push({
          channel: 'newsletter',
          success: false,
          error: error instanceof Error ? error.message : 'Newsletter queue failed',
        })
      }
    }

    // Log announcement
    await this.logAnnouncement(workshop, results)

    return results
  }

  /**
   * Schedule a reminder for an upcoming workshop
   */
  async scheduleReminder(
    workshopId: string,
    daysBefore: number,
    scheduledAt: Date
  ): Promise<string> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('scheduled_tasks')
      .insert({
        task_type: 'workshop_reminder',
        payload: {
          workshop_id: workshopId,
          days_before: daysBefore,
        },
        scheduled_at: scheduledAt.toISOString(),
        status: 'pending',
      })
      .select('id')
      .single()

    if (error) throw error
    return data.id
  }

  /**
   * Get upcoming workshops that need reminders
   */
  async getUpcomingWorkshopsForReminders(organizationId: string): Promise<Workshop[]> {
    const supabase = await createClient()

    const settings = await this.getSettings(organizationId)
    if (!settings || settings.days_before_reminder.length === 0) {
      return []
    }

    // Get workshops in the reminder window
    const maxDays = Math.max(...settings.days_before_reminder)
    const now = new Date()
    const futureDate = new Date(now.getTime() + maxDays * 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('date', now.toISOString().split('T')[0])
      .lte('date', futureDate.toISOString().split('T')[0])
      .eq('status', 'published')
      .order('date', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * Log an announcement for tracking
   */
  private async logAnnouncement(
    workshop: Workshop,
    results: AnnouncementResult[]
  ): Promise<void> {
    const supabase = await createClient()

    const successCount = results.filter((r) => r.success).length
    const totalCount = results.length

    await supabase.from('announcement_logs').insert({
      organization_id: workshop.organization_id,
      workshop_id: workshop.id,
      announcement_type: 'initial',
      channels_attempted: results.map((r) => r.channel),
      channels_succeeded: results.filter((r) => r.success).map((r) => r.channel),
      results: results,
      success_rate: totalCount > 0 ? successCount / totalCount : 0,
    })
  }

  /**
   * Get announcement history for a workshop
   */
  async getAnnouncementHistory(workshopId: string): Promise<{
    logs: Array<{
      id: string
      announcement_type: string
      channels_succeeded: string[]
      created_at: string
    }>
  }> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('announcement_logs')
      .select('id, announcement_type, channels_succeeded, created_at')
      .eq('workshop_id', workshopId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { logs: data || [] }
  }
}

export const workshopAnnouncementService = new WorkshopAnnouncementService()
