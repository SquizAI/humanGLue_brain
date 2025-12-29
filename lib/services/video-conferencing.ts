/**
 * Video Conferencing Integration Service
 * Supports Zoom, Google Meet, and Microsoft Teams
 */

export type VideoProvider = 'zoom' | 'google_meet' | 'microsoft_teams'

export interface MeetingDetails {
  id: string
  provider: VideoProvider
  title: string
  description?: string
  startTime: Date
  endTime: Date
  timezone: string
  joinUrl: string
  hostUrl?: string
  password?: string
  dialIn?: {
    number: string
    pin?: string
  }[]
  recordingEnabled?: boolean
  waitingRoomEnabled?: boolean
  participants?: string[]
  metadata?: Record<string, unknown>
}

export interface CreateMeetingParams {
  provider: VideoProvider
  title: string
  description?: string
  startTime: Date
  duration: number // minutes
  timezone?: string
  participants?: string[] // email addresses
  recordingEnabled?: boolean
  waitingRoomEnabled?: boolean
}

export interface VideoConferencingConfig {
  zoom?: {
    clientId: string
    clientSecret: string
    accountId: string
  }
  googleMeet?: {
    clientId: string
    clientSecret: string
    refreshToken: string
  }
  microsoftTeams?: {
    clientId: string
    clientSecret: string
    tenantId: string
  }
}

/**
 * Zoom API Integration
 */
class ZoomService {
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor(
    private clientId: string,
    private clientSecret: string,
    private accountId: string
  ) {}

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken!
    }

    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')

    const response = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'account_credentials',
        account_id: this.accountId,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to get Zoom access token: ${response.statusText}`)
    }

    const data = await response.json()
    this.accessToken = data.access_token
    this.tokenExpiry = new Date(Date.now() + (data.expires_in - 60) * 1000)

    return this.accessToken!!
  }

  async createMeeting(params: CreateMeetingParams): Promise<MeetingDetails> {
    const token = await this.getAccessToken()

    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: params.title,
        type: 2, // Scheduled meeting
        start_time: params.startTime.toISOString(),
        duration: params.duration,
        timezone: params.timezone || 'UTC',
        agenda: params.description,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: params.waitingRoomEnabled ?? true,
          auto_recording: params.recordingEnabled ? 'cloud' : 'none',
          meeting_invitees: params.participants?.map(email => ({ email })),
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create Zoom meeting: ${error}`)
    }

    const data = await response.json()

    return {
      id: data.id.toString(),
      provider: 'zoom',
      title: data.topic,
      description: data.agenda,
      startTime: new Date(data.start_time),
      endTime: new Date(new Date(data.start_time).getTime() + data.duration * 60000),
      timezone: data.timezone,
      joinUrl: data.join_url,
      hostUrl: data.start_url,
      password: data.password,
      recordingEnabled: params.recordingEnabled,
      waitingRoomEnabled: params.waitingRoomEnabled,
      metadata: { zoomMeetingId: data.id },
    }
  }

  async getMeeting(meetingId: string): Promise<MeetingDetails | null> {
    const token = await this.getAccessToken()

    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Failed to get Zoom meeting: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      id: data.id.toString(),
      provider: 'zoom',
      title: data.topic,
      description: data.agenda,
      startTime: new Date(data.start_time),
      endTime: new Date(new Date(data.start_time).getTime() + data.duration * 60000),
      timezone: data.timezone,
      joinUrl: data.join_url,
      hostUrl: data.start_url,
      password: data.password,
      metadata: { zoomMeetingId: data.id },
    }
  }

  async deleteMeeting(meetingId: string): Promise<boolean> {
    const token = await this.getAccessToken()

    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    return response.ok || response.status === 404
  }

  async getRecordings(meetingId: string): Promise<{ downloadUrl: string; type: string }[]> {
    const token = await this.getAccessToken()

    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}/recordings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) return []
      throw new Error(`Failed to get Zoom recordings: ${response.statusText}`)
    }

    const data = await response.json()

    return (data.recording_files || []).map((file: any) => ({
      downloadUrl: file.download_url,
      type: file.recording_type,
    }))
  }
}

/**
 * Google Meet API Integration (via Google Calendar API)
 */
class GoogleMeetService {
  constructor(
    private clientId: string,
    private clientSecret: string,
    private refreshToken: string
  ) {}

  private async getAccessToken(): Promise<string> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to get Google access token: ${response.statusText}`)
    }

    const data = await response.json()
    return data.access_token
  }

  async createMeeting(params: CreateMeetingParams): Promise<MeetingDetails> {
    const token = await this.getAccessToken()

    const startTime = params.startTime.toISOString()
    const endTime = new Date(params.startTime.getTime() + params.duration * 60000).toISOString()

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: params.title,
        description: params.description,
        start: {
          dateTime: startTime,
          timeZone: params.timezone || 'UTC',
        },
        end: {
          dateTime: endTime,
          timeZone: params.timezone || 'UTC',
        },
        attendees: params.participants?.map(email => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: `humanglue-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create Google Meet: ${error}`)
    }

    const data = await response.json()
    const meetUri = data.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video')?.uri

    return {
      id: data.id,
      provider: 'google_meet',
      title: data.summary,
      description: data.description,
      startTime: new Date(data.start.dateTime),
      endTime: new Date(data.end.dateTime),
      timezone: data.start.timeZone,
      joinUrl: meetUri || data.hangoutLink,
      dialIn: data.conferenceData?.entryPoints
        ?.filter((ep: any) => ep.entryPointType === 'phone')
        ?.map((ep: any) => ({
          number: ep.uri.replace('tel:', ''),
          pin: ep.pin,
        })),
      metadata: { googleEventId: data.id },
    }
  }

  async getMeeting(eventId: string): Promise<MeetingDetails | null> {
    const token = await this.getAccessToken()

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Failed to get Google Meet: ${response.statusText}`)
    }

    const data = await response.json()
    const meetUri = data.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video')?.uri

    return {
      id: data.id,
      provider: 'google_meet',
      title: data.summary,
      description: data.description,
      startTime: new Date(data.start.dateTime),
      endTime: new Date(data.end.dateTime),
      timezone: data.start.timeZone,
      joinUrl: meetUri || data.hangoutLink,
      metadata: { googleEventId: data.id },
    }
  }

  async deleteMeeting(eventId: string): Promise<boolean> {
    const token = await this.getAccessToken()

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    return response.ok || response.status === 404
  }
}

/**
 * Microsoft Teams API Integration (via Microsoft Graph API)
 */
class MicrosoftTeamsService {
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor(
    private clientId: string,
    private clientSecret: string,
    private tenantId: string
  ) {}

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken!
    }

    const response = await fetch(`https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to get Microsoft access token: ${response.statusText}`)
    }

    const data = await response.json()
    this.accessToken = data.access_token
    this.tokenExpiry = new Date(Date.now() + (data.expires_in - 60) * 1000)

    return this.accessToken!
  }

  async createMeeting(params: CreateMeetingParams, userId: string): Promise<MeetingDetails> {
    const token = await this.getAccessToken()

    const startTime = params.startTime.toISOString()
    const endTime = new Date(params.startTime.getTime() + params.duration * 60000).toISOString()

    const response = await fetch(`https://graph.microsoft.com/v1.0/users/${userId}/onlineMeetings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: params.title,
        startDateTime: startTime,
        endDateTime: endTime,
        lobbyBypassSettings: {
          scope: params.waitingRoomEnabled ? 'organizer' : 'everyone',
        },
        recordAutomatically: params.recordingEnabled ?? false,
        participants: {
          attendees: params.participants?.map(email => ({
            upn: email,
            role: 'attendee',
          })),
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create Teams meeting: ${error}`)
    }

    const data = await response.json()

    return {
      id: data.id,
      provider: 'microsoft_teams',
      title: data.subject,
      startTime: new Date(data.startDateTime),
      endTime: new Date(data.endDateTime),
      timezone: params.timezone || 'UTC',
      joinUrl: data.joinWebUrl,
      dialIn: data.audioConferencing ? [{
        number: data.audioConferencing.tollNumber,
        pin: data.audioConferencing.conferenceId,
      }] : undefined,
      recordingEnabled: params.recordingEnabled,
      waitingRoomEnabled: params.waitingRoomEnabled,
      metadata: { teamsMeetingId: data.id },
    }
  }

  async getMeeting(meetingId: string, userId: string): Promise<MeetingDetails | null> {
    const token = await this.getAccessToken()

    const response = await fetch(`https://graph.microsoft.com/v1.0/users/${userId}/onlineMeetings/${meetingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Failed to get Teams meeting: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      id: data.id,
      provider: 'microsoft_teams',
      title: data.subject,
      startTime: new Date(data.startDateTime),
      endTime: new Date(data.endDateTime),
      timezone: 'UTC',
      joinUrl: data.joinWebUrl,
      metadata: { teamsMeetingId: data.id },
    }
  }

  async deleteMeeting(meetingId: string, userId: string): Promise<boolean> {
    const token = await this.getAccessToken()

    const response = await fetch(`https://graph.microsoft.com/v1.0/users/${userId}/onlineMeetings/${meetingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    return response.ok || response.status === 404
  }
}

/**
 * Unified Video Conferencing Service
 */
export class VideoConferencingService {
  private zoomService?: ZoomService
  private googleMeetService?: GoogleMeetService
  private teamsService?: MicrosoftTeamsService

  constructor(config: VideoConferencingConfig) {
    if (config.zoom) {
      this.zoomService = new ZoomService(
        config.zoom.clientId,
        config.zoom.clientSecret,
        config.zoom.accountId
      )
    }

    if (config.googleMeet) {
      this.googleMeetService = new GoogleMeetService(
        config.googleMeet.clientId,
        config.googleMeet.clientSecret,
        config.googleMeet.refreshToken
      )
    }

    if (config.microsoftTeams) {
      this.teamsService = new MicrosoftTeamsService(
        config.microsoftTeams.clientId,
        config.microsoftTeams.clientSecret,
        config.microsoftTeams.tenantId
      )
    }
  }

  async createMeeting(params: CreateMeetingParams, userId?: string): Promise<MeetingDetails> {
    switch (params.provider) {
      case 'zoom':
        if (!this.zoomService) throw new Error('Zoom is not configured')
        return this.zoomService.createMeeting(params)

      case 'google_meet':
        if (!this.googleMeetService) throw new Error('Google Meet is not configured')
        return this.googleMeetService.createMeeting(params)

      case 'microsoft_teams':
        if (!this.teamsService) throw new Error('Microsoft Teams is not configured')
        if (!userId) throw new Error('User ID required for Teams meetings')
        return this.teamsService.createMeeting(params, userId)

      default:
        throw new Error(`Unsupported video provider: ${params.provider}`)
    }
  }

  async getMeeting(provider: VideoProvider, meetingId: string, userId?: string): Promise<MeetingDetails | null> {
    switch (provider) {
      case 'zoom':
        if (!this.zoomService) throw new Error('Zoom is not configured')
        return this.zoomService.getMeeting(meetingId)

      case 'google_meet':
        if (!this.googleMeetService) throw new Error('Google Meet is not configured')
        return this.googleMeetService.getMeeting(meetingId)

      case 'microsoft_teams':
        if (!this.teamsService) throw new Error('Microsoft Teams is not configured')
        if (!userId) throw new Error('User ID required for Teams meetings')
        return this.teamsService.getMeeting(meetingId, userId)

      default:
        throw new Error(`Unsupported video provider: ${provider}`)
    }
  }

  async deleteMeeting(provider: VideoProvider, meetingId: string, userId?: string): Promise<boolean> {
    switch (provider) {
      case 'zoom':
        if (!this.zoomService) throw new Error('Zoom is not configured')
        return this.zoomService.deleteMeeting(meetingId)

      case 'google_meet':
        if (!this.googleMeetService) throw new Error('Google Meet is not configured')
        return this.googleMeetService.deleteMeeting(meetingId)

      case 'microsoft_teams':
        if (!this.teamsService) throw new Error('Microsoft Teams is not configured')
        if (!userId) throw new Error('User ID required for Teams meetings')
        return this.teamsService.deleteMeeting(meetingId, userId)

      default:
        throw new Error(`Unsupported video provider: ${provider}`)
    }
  }

  async getRecordings(provider: VideoProvider, meetingId: string): Promise<{ downloadUrl: string; type: string }[]> {
    switch (provider) {
      case 'zoom':
        if (!this.zoomService) throw new Error('Zoom is not configured')
        return this.zoomService.getRecordings(meetingId)

      default:
        // Google Meet and Teams require different approaches for recordings
        return []
    }
  }

  getAvailableProviders(): VideoProvider[] {
    const providers: VideoProvider[] = []
    if (this.zoomService) providers.push('zoom')
    if (this.googleMeetService) providers.push('google_meet')
    if (this.teamsService) providers.push('microsoft_teams')
    return providers
  }
}

/**
 * Factory function to create VideoConferencingService from environment variables
 */
export function createVideoConferencingService(): VideoConferencingService {
  const config: VideoConferencingConfig = {}

  // Zoom configuration
  if (process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET && process.env.ZOOM_ACCOUNT_ID) {
    config.zoom = {
      clientId: process.env.ZOOM_CLIENT_ID,
      clientSecret: process.env.ZOOM_CLIENT_SECRET,
      accountId: process.env.ZOOM_ACCOUNT_ID,
    }
  }

  // Google Meet configuration
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
    config.googleMeet = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    }
  }

  // Microsoft Teams configuration
  if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET && process.env.MICROSOFT_TENANT_ID) {
    config.microsoftTeams = {
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      tenantId: process.env.MICROSOFT_TENANT_ID,
    }
  }

  return new VideoConferencingService(config)
}
