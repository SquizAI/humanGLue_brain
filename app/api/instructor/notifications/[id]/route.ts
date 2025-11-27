/**
 * Single Notification API
 * PUT /api/instructor/notifications/[id] - Mark as read/unread
 * DELETE /api/instructor/notifications/[id] - Delete notification
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

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

    const { id } = await params
    const body = await request.json()
    const { action } = body // 'read' or 'unread'

    if (!action || !['read', 'unread'].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid action. Must be "read" or "unread"',
          },
        },
        { status: 400 }
      )
    }

    // Verify ownership
    const { data: notification, error: checkError } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', id)
      .single()

    if (checkError || !notification) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Notification not found',
          },
        },
        { status: 404 }
      )
    }

    if (notification.user_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Cannot modify this notification',
          },
        },
        { status: 403 }
      )
    }

    // Update notification
    const { data: updatedNotification, error: updateError } = await supabase
      .from('notifications')
      .update({
        read_at: action === 'read' ? new Date().toISOString() : null,
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      data: updatedNotification,
    })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update notification',
        },
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

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

    const { id } = await params

    // Verify ownership before deleting
    const { data: notification, error: checkError } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', id)
      .single()

    if (checkError || !notification) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Notification not found',
          },
        },
        { status: 404 }
      )
    }

    if (notification.user_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Cannot delete this notification',
          },
        },
        { status: 403 }
      )
    }

    // Delete notification
    const { error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete notification',
        },
      },
      { status: 500 }
    )
  }
}
