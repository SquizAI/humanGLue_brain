/**
 * Twilio SMS Send API Route
 * POST /api/sms/twilio/send
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTwilioSMSService } from '@/lib/services/twilio-sms'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { to, message, from } = body

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, message' },
        { status: 400 }
      )
    }

    const twilioService = getTwilioSMSService()

    if (!twilioService.isAvailable()) {
      return NextResponse.json(
        { error: 'Twilio SMS not configured. Please add TWILIO_PHONE_NUMBER to environment.' },
        { status: 503 }
      )
    }

    const result = await twilioService.sendSMS({
      to,
      body: message,
      from,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send SMS' },
        { status: 500 }
      )
    }

    // Log to database
    try {
      await supabase.from('communication_logs').insert({
        user_id: user.id,
        channel: 'sms',
        provider: 'twilio',
        direction: 'outbound',
        recipient: to,
        content: message,
        external_id: result.messageId,
        status: result.status,
        metadata: { from: from || twilioService.getPhoneNumber() },
      })
    } catch (logError) {
      console.error('Error logging SMS:', logError)
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      status: result.status,
    })
  } catch (error) {
    console.error('Twilio send error:', error)
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    )
  }
}
