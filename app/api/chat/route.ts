import { NextRequest, NextResponse } from 'next/server'
import { handler } from '../../../netlify/functions/chat'

export async function GET(request: NextRequest) {
  const event = {
    httpMethod: 'GET',
    headers: Object.fromEntries(request.headers.entries()),
    body: null,
    rawUrl: request.url,
    rawQuery: request.nextUrl.search,
  }
  
  try {
    const response = await handler(event as any, {} as any)
    
    // Handler might return void, so we need to check
    if (!response) {
      return new NextResponse('Internal Server Error', { status: 500 })
    }
    
    return new NextResponse(response.body, {
      status: response.statusCode,
      headers: response.headers as any
    })
  } catch (error) {
    console.error('API Error:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  
  const event = {
    httpMethod: 'POST',
    headers: Object.fromEntries(request.headers.entries()),
    body,
    rawUrl: request.url,
    rawQuery: request.nextUrl.search,
  }
  
  try {
    const response = await handler(event as any, {} as any)
    
    // Handler might return void, so we need to check
    if (!response) {
      return new NextResponse('Internal Server Error', { status: 500 })
    }
    
    return new NextResponse(response.body, {
      status: response.statusCode,
      headers: response.headers as any
    })
  } catch (error) {
    console.error('API Error:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 