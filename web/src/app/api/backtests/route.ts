import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://api:8080'
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()
    const url = queryString ? `${apiBase}/backtests?${queryString}` : `${apiBase}/backtests`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch backtests' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error proxying backtests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
