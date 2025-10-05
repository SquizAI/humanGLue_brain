/**
 * Mark All Notifications As Read API
 * POST /api/instructor/notifications/mark-all-read
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      )
    }

    // Mark all unread notifications as read
    const { data, error: updateError } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null)
      .select()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      data: {
        updated_count: data?.length || 0,
      },
    })
  } catch (error) {
    console.error('Error marking all as read:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to mark all as read',
        },
      },
      { status: 500 }
    )
  }
}
