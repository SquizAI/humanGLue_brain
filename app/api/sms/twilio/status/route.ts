/**
 * Twilio SMS Status API Route
 * GET /api/sms/twilio/status - Get service status and phone numbers
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTwilioSMSService } from '@/lib/services/twilio-sms'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const twilioService = getTwilioSMSService()
    const isAvailable = twilioService.isAvailable()

    if (!isAvailable) {
      return NextResponse.json({
        available: false,
        message: 'Twilio not fully configured',
        configured: {
          credentials: !!process.env.TWILIO_ACCOUNT_SID && !!process.env.TWILIO_AUTH_TOKEN,
          phoneNumber: !!process.env.TWILIO_PHONE_NUMBER,
        },
      })
    }

    // Get list of phone numbers
    const phoneNumbers = await twilioService.listPhoneNumbers()

    return NextResponse.json({
      available: true,
      defaultPhoneNumber: twilioService.getPhoneNumber(),
      phoneNumbers,
    })
  } catch (error) {
    console.error('Twilio status error:', error)
    return NextResponse.json(
      { error: 'Failed to get Twilio status' },
      { status: 500 }
    )
  }
}
