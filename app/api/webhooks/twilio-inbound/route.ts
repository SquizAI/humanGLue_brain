/**
 * Twilio Inbound SMS Webhook
 * POST /api/webhooks/twilio-inbound
 *
 * Configure this URL in Twilio console:
 * https://hmnglue.com/api/webhooks/twilio-inbound
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { getTwilioSMSService, COMPLIANCE_MESSAGES } from '@/lib/services/twilio-sms'

// Twilio sends form-urlencoded data
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract Twilio webhook data
    const messageSid = formData.get('MessageSid') as string
    const from = formData.get('From') as string
    const to = formData.get('To') as string
    const body = formData.get('Body') as string
    const numMedia = parseInt(formData.get('NumMedia') as string || '0')

    console.log('Twilio inbound SMS:', { messageSid, from, to, body })

    const supabase = createClient()
    const twilioService = getTwilioSMSService()

    // Check for compliance keywords and auto-respond
    const keyword = body?.trim().toUpperCase()
    let responseMessage: string | null = null
    let optStatus: 'opted_in' | 'opted_out' | null = null

    switch (keyword) {
      case 'STOP':
      case 'CANCEL':
      case 'END':
      case 'QUIT':
      case 'UNSUBSCRIBE':
        responseMessage = COMPLIANCE_MESSAGES.optOut
        optStatus = 'opted_out'
        break

      case 'START':
      case 'YES':
      case 'UNSTOP':
        responseMessage = COMPLIANCE_MESSAGES.optIn
        optStatus = 'opted_in'
        break

      case 'HELP':
      case 'INFO':
        responseMessage = COMPLIANCE_MESSAGES.help
        break
    }

    // Update opt-in/opt-out status in database
    if (optStatus) {
      try {
        await supabase
          .from('sms_subscribers')
          .upsert({
            phone_number: from,
            status: optStatus,
            provider: 'twilio',
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'phone_number',
          })
      } catch (error) {
        console.error('Error updating subscriber status:', error)
      }
    }

    // Log inbound message
    try {
      await supabase.from('communication_logs').insert({
        channel: 'sms',
        provider: 'twilio',
        direction: 'inbound',
        recipient: to,
        sender: from,
        content: body,
        external_id: messageSid,
        status: 'received',
        metadata: {
          numMedia,
          keyword: keyword || null,
          autoResponse: !!responseMessage,
        },
      })
    } catch (error) {
      console.error('Error logging inbound SMS:', error)
    }

    // Create notification for non-keyword messages
    if (!responseMessage && body) {
      try {
        // Find user by phone number
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('phone', from)
          .single()

        if (profile) {
          await supabase.from('notifications').insert({
            user_id: profile.id,
            type: 'sms_received',
            title: 'New SMS Message',
            message: body.substring(0, 200),
            metadata: { from, messageSid },
          })
        }
      } catch (error) {
        console.error('Error creating notification:', error)
      }
    }

    // Return TwiML response
    // If we have an auto-response, include it
    if (responseMessage) {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${responseMessage}</Message>
</Response>`

      return new NextResponse(twiml, {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      })
    }

    // Empty TwiML response (no auto-reply)
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>`

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  } catch (error) {
    console.error('Twilio webhook error:', error)

    // Return empty TwiML to prevent Twilio from retrying
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>`

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  }
}
