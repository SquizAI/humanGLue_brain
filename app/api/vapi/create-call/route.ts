import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assistantId, phoneNumberId, customer, assistantOverrides } = body

    // Validate required fields
    if (!assistantId || !phoneNumberId || !customer?.number) {
      return NextResponse.json(
        { error: 'Missing required fields: assistantId, phoneNumberId, or customer.number' },
        { status: 400 }
      )
    }

    // For now, we'll simulate the call creation since MCP tools can't be used in API routes
    // In a real implementation, you'd use the Vapi SDK here
    const mockCallResponse = {
      id: `call_${Date.now()}`,
      assistantId,
      phoneNumberId,
      customer,
      status: 'queued',
      createdAt: new Date().toISOString(),
      message: 'Call created successfully'
    }

    // Log the call creation for debugging
    console.log('Voice assessment call created:', mockCallResponse)

    return NextResponse.json(mockCallResponse)
  } catch (error) {
    console.error('Error creating voice assessment call:', error)
    return NextResponse.json(
      { error: 'Failed to create call' },
      { status: 500 }
    )
  }
}