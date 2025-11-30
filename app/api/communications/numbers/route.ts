/**
 * Bird Numbers API Routes
 * Manage phone numbers and their configurations
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import BirdService from '@/lib/services/bird-communications'

/**
 * GET /api/communications/numbers
 * List all phone numbers in the workspace
 */
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

    const numbers = await BirdService.listNumbers()

    // Transform for cleaner response
    const formattedNumbers = numbers.results.map((num) => ({
      id: num.id,
      number: num.number,
      type: num.type,
      country: num.country,
      capabilities: num.capabilities,
      status: num.status,
    }))

    return NextResponse.json({
      numbers: formattedNumbers,
      count: formattedNumbers.length,
    })
  } catch (error) {
    console.error('List numbers error:', error)
    return NextResponse.json(
      { error: 'Failed to list numbers' },
      { status: 500 }
    )
  }
}
