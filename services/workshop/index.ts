/**
 * Workshop Service
 * Manages workshop registration, retrieval, and attendance
 */

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client for service calls
const getSupabaseClient = () => {
  if (typeof window !== 'undefined') {
    // Client-side
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  // Server-side (Netlify functions)
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ============================================================
// TYPES
// ============================================================

export interface Workshop {
  id: string
  title: string
  description: string
  slug: string
  instructor_id: string
  pillar: 'adaptability' | 'coaching' | 'marketplace'
  level: 'beginner' | 'intermediate' | 'advanced'
  format: 'live' | 'hybrid' | 'recorded'
  schedule_date?: string
  schedule_time?: string
  duration_minutes: number
  timezone?: string
  capacity_total: number
  capacity_remaining: number
  price_amount: number
  price_early_bird?: number
  price_currency: string
  outcomes?: string[]
  tags?: string[]
  syllabus?: any
  thumbnail_url?: string
  video_url?: string
  status: 'draft' | 'published' | 'archived' | 'cancelled'
  is_featured: boolean
  metadata?: any
  created_at: string
  updated_at: string
  published_at?: string
  instructor?: {
    full_name: string
    email: string
    avatar_url?: string
  }
}

export interface WorkshopRegistration {
  id: string
  workshop_id: string
  user_id: string
  status: 'registered' | 'completed' | 'cancelled' | 'no_show'
  price_paid: number
  payment_id?: string
  attended: boolean
  attendance_percentage?: number
  completed_at?: string
  certificate_id?: string
  rating?: number
  review?: string
  metadata?: any
  registered_at: string
  updated_at: string
  workshop?: Workshop
}

export interface WorkshopFilters {
  pillar?: 'adaptability' | 'coaching' | 'marketplace'
  level?: 'beginner' | 'intermediate' | 'advanced'
  format?: 'live' | 'hybrid' | 'recorded'
  is_featured?: boolean
  search?: string
  limit?: number
  offset?: number
}

export interface RegisterWorkshopData {
  workshopId: string
  userId: string
  paymentId: string
  pricePaid: number
}

// ============================================================
// WORKSHOP SERVICE CLASS
// ============================================================

export class WorkshopService {
  private static instance: WorkshopService

  static getInstance(): WorkshopService {
    if (!WorkshopService.instance) {
      WorkshopService.instance = new WorkshopService()
    }
    return WorkshopService.instance
  }

  /**
   * Get all published workshops with optional filters
   */
  async getWorkshops(filters: WorkshopFilters = {}): Promise<{
    workshops: Workshop[]
    total: number
  }> {
    const supabase = getSupabaseClient()
    const {
      pillar,
      level,
      format,
      is_featured,
      search,
      limit = 20,
      offset = 0,
    } = filters

    let query = supabase
      .from('workshops')
      .select(
        `
        *,
        instructor:users!instructor_id(
          full_name,
          email,
          avatar_url
        )
      `,
        { count: 'exact' }
      )
      .eq('status', 'published')

    // Apply filters
    if (pillar) {
      query = query.eq('pillar', pillar)
    }
    if (level) {
      query = query.eq('level', level)
    }
    if (format) {
      query = query.eq('format', format)
    }
    if (is_featured !== undefined) {
      query = query.eq('is_featured', is_featured)
    }

    // Full-text search
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`
      )
    }

    // Order by featured first, then by date
    query = query.order('is_featured', { ascending: false })
    query = query.order('schedule_date', { ascending: true, nullsFirst: false })

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch workshops: ${error.message}`)
    }

    return {
      workshops: data || [],
      total: count || 0,
    }
  }

  /**
   * Get workshop by ID with full details
   */
  async getWorkshopById(id: string): Promise<Workshop | null> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('workshops')
      .select(
        `
        *,
        instructor:users!instructor_id(
          full_name,
          email,
          avatar_url
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error(`Failed to fetch workshop: ${error.message}`)
    }

    return data
  }

  /**
   * Register user for a workshop
   * Validates capacity and creates registration
   */
  async registerForWorkshop(
    data: RegisterWorkshopData
  ): Promise<WorkshopRegistration> {
    const supabase = getSupabaseClient()
    const { workshopId, userId, paymentId, pricePaid } = data

    // Check if workshop exists and has capacity
    const { data: workshop, error: workshopError } = await supabase
      .from('workshops')
      .select('id, title, capacity_remaining, status')
      .eq('id', workshopId)
      .single()

    if (workshopError || !workshop) {
      throw new Error('Workshop not found')
    }

    if (workshop.status !== 'published') {
      throw new Error('Workshop is not available for registration')
    }

    if (workshop.capacity_remaining <= 0) {
      throw new Error('Workshop is fully booked')
    }

    // Check if user is already registered
    const { data: existingRegistration } = await supabase
      .from('workshop_registrations')
      .select('id, status')
      .eq('workshop_id', workshopId)
      .eq('user_id', userId)
      .single()

    if (existingRegistration) {
      if (existingRegistration.status === 'registered') {
        throw new Error('You are already registered for this workshop')
      }
      if (existingRegistration.status === 'completed') {
        throw new Error('You have already completed this workshop')
      }
    }

    // Create registration
    const { data: registration, error: registrationError } = await supabase
      .from('workshop_registrations')
      .insert({
        workshop_id: workshopId,
        user_id: userId,
        payment_id: paymentId,
        price_paid: pricePaid,
        status: 'registered',
      })
      .select(
        `
        *,
        workshop:workshops(*)
      `
      )
      .single()

    if (registrationError) {
      throw new Error(`Failed to register for workshop: ${registrationError.message}`)
    }

    return registration
  }

  /**
   * Get user's workshop registrations
   */
  async getUserWorkshops(userId: string): Promise<WorkshopRegistration[]> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('workshop_registrations')
      .select(
        `
        *,
        workshop:workshops(
          *,
          instructor:users!instructor_id(
            full_name,
            email,
            avatar_url
          )
        )
      `
      )
      .eq('user_id', userId)
      .order('registered_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch user workshops: ${error.message}`)
    }

    return data || []
  }

  /**
   * Update workshop attendance
   * Only instructors or admins can mark attendance
   */
  async updateWorkshopAttendance(
    registrationId: string,
    attended: boolean,
    attendancePercentage?: number
  ): Promise<WorkshopRegistration> {
    const supabase = getSupabaseClient()

    const updateData: any = {
      attended,
      updated_at: new Date().toISOString(),
    }

    if (attendancePercentage !== undefined) {
      updateData.attendance_percentage = attendancePercentage
    }

    // If attended and not already completed, mark as completed
    if (attended && attendancePercentage && attendancePercentage >= 80) {
      updateData.status = 'completed'
      updateData.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('workshop_registrations')
      .update(updateData)
      .eq('id', registrationId)
      .select(
        `
        *,
        workshop:workshops(*)
      `
      )
      .single()

    if (error) {
      throw new Error(`Failed to update attendance: ${error.message}`)
    }

    return data
  }

  /**
   * Cancel workshop registration
   */
  async cancelRegistration(
    registrationId: string,
    userId: string
  ): Promise<WorkshopRegistration> {
    const supabase = getSupabaseClient()

    // Verify ownership
    const { data: registration, error: fetchError } = await supabase
      .from('workshop_registrations')
      .select('user_id, status')
      .eq('id', registrationId)
      .single()

    if (fetchError || !registration) {
      throw new Error('Registration not found')
    }

    if (registration.user_id !== userId) {
      throw new Error('Unauthorized to cancel this registration')
    }

    if (registration.status === 'completed') {
      throw new Error('Cannot cancel a completed workshop')
    }

    if (registration.status === 'cancelled') {
      throw new Error('Registration is already cancelled')
    }

    const { data, error } = await supabase
      .from('workshop_registrations')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', registrationId)
      .select(
        `
        *,
        workshop:workshops(*)
      `
      )
      .single()

    if (error) {
      throw new Error(`Failed to cancel registration: ${error.message}`)
    }

    return data
  }

  /**
   * Get workshop statistics (for instructors/admins)
   */
  async getWorkshopStats(workshopId: string): Promise<{
    total_registered: number
    attended: number
    completed: number
    cancelled: number
    no_show: number
    average_rating: number | null
  }> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('workshop_registrations')
      .select('status, attended, rating')
      .eq('workshop_id', workshopId)

    if (error) {
      throw new Error(`Failed to fetch workshop stats: ${error.message}`)
    }

    const stats = {
      total_registered: data.length,
      attended: data.filter((r) => r.attended).length,
      completed: data.filter((r) => r.status === 'completed').length,
      cancelled: data.filter((r) => r.status === 'cancelled').length,
      no_show: data.filter((r) => r.status === 'no_show').length,
      average_rating: null as number | null,
    }

    const ratings = data.filter((r) => r.rating).map((r) => r.rating)
    if (ratings.length > 0) {
      stats.average_rating =
        ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    }

    return stats
  }

  /**
   * Check if workshop has available capacity
   */
  async checkAvailability(workshopId: string): Promise<{
    available: boolean
    capacity_remaining: number
  }> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('workshops')
      .select('capacity_remaining, status')
      .eq('id', workshopId)
      .single()

    if (error || !data) {
      return { available: false, capacity_remaining: 0 }
    }

    return {
      available: data.status === 'published' && data.capacity_remaining > 0,
      capacity_remaining: data.capacity_remaining,
    }
  }
}

export const workshopService = WorkshopService.getInstance()
