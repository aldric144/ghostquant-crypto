import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://ghostquant-mewzi.ondigitalocean.app'

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const url = `${API_BASE}/system/danger/${path}`
  
  try {
    let body = null
    try {
      body = await request.json()
    } catch {
      // No body or invalid JSON - that's okay for some POST requests
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend returned ${response.status}` },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error proxying to ${url}:`, error)
    return NextResponse.json(
      { error: 'Failed to connect to backend' },
      { status: 502 }
    )
  }
}
