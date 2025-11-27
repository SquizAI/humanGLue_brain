/**
 * Netlify Function: Update Workshop Attendance
 * PATCH /.netlify/functions/workshops-attendance
 * Mark attendance for workshop registrations (instructor/admin only)
 */

import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
  'Content-Type': 'application/json',
}

export const handler: Handler = async (event, context) => {
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'PATCH') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    // Verify authentication
    const authHeader = event.headers.authorization
    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Missing authorization header' }),
      }
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid authentication token' }),
      }
    }

    // Parse request body
    const body = JSON.parse(event.body || '{}')
    const { registrationId, attended, attendancePercentage, status } = body

    if (!registrationId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required field: registrationId',
        }),
      }
    }

    if (attended === undefined && !status) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Must provide either attended or status field',
        }),
      }
    }

    // Get registration with workshop details
    const { data: registration, error: regError } = await supabase
      .from('workshop_registrations')
      .select(
        `
        *,
        workshop:workshops(
          id,
          instructor_id,
          title
        )
      `
      )
      .eq('id', registrationId)
      .single()

    if (regError || !registration) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Registration not found' }),
      }
    }

    // Check authorization: must be workshop instructor or admin
    const isInstructor = registration.workshop.instructor_id === user.id

    // Check if user is admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const isAdmin = userRole?.role === 'admin'

    if (!isInstructor && !isAdmin) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          error: 'Only workshop instructors and admins can update attendance',
        }),
      }
    }

    // Build update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    // Update attendance
    if (attended !== undefined) {
      updateData.attended = attended
    }

    if (attendancePercentage !== undefined) {
      // Validate percentage
      if (attendancePercentage < 0 || attendancePercentage > 100) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Attendance percentage must be between 0 and 100',
          }),
        }
      }
      updateData.attendance_percentage = attendancePercentage
    }

    // Update status
    if (status) {
      if (!['registered', 'completed', 'cancelled', 'no_show'].includes(status)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Invalid status value',
          }),
        }
      }
      updateData.status = status
    }

    // Auto-complete if attendance is high enough
    if (
      (updateData.attended || registration.attended) &&
      (updateData.attendance_percentage !== undefined
        ? updateData.attendance_percentage >= 80
        : registration.attendance_percentage && registration.attendance_percentage >= 80)
    ) {
      if (updateData.status !== 'cancelled' && registration.status !== 'completed') {
        updateData.status = 'completed'
        updateData.completed_at = new Date().toISOString()
      }
    }

    // Mark as no-show if explicitly setting attended to false with 0% attendance
    if (
      updateData.attended === false &&
      (updateData.attendance_percentage === 0 ||
        (registration.attendance_percentage === 0 && updateData.attendance_percentage === undefined))
    ) {
      if (!updateData.status) {
        updateData.status = 'no_show'
      }
    }

    // Update registration
    const { data: updatedRegistration, error: updateError } = await supabase
      .from('workshop_registrations')
      .update(updateData)
      .eq('id', registrationId)
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
        ),
        user:users!workshop_registrations_user_id_fkey(
          full_name,
          email
        )
      `
      )
      .single()

    if (updateError) {
      console.error('Error updating attendance:', updateError)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Failed to update attendance',
          message: updateError.message,
        }),
      }
    }

    // TODO: Send notification to user if status changed to completed
    // TODO: Trigger certificate generation if completed

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Attendance updated successfully',
        data: updatedRegistration,
      }),
    }
  } catch (error) {
    console.error('Workshop attendance endpoint error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    }
  }
}
