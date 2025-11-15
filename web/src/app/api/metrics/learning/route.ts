import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://api:8080'
    const response = await fetch(`${apiBase}/metrics/learning`)
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch learning metrics' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error proxying learning metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
