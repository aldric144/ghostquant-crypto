/**
 * GQ-Core API Proxy Route
 * 
 * Forwards all /api/gq-core/* requests to the backend /gq-core/* endpoints.
 * This ensures the frontend can always call /api/gq-core/* regardless of
 * deployment topology (DigitalOcean routing, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || 'https://ghostquant-mewzi.ondigitalocean.app';

async function proxyRequest(request: NextRequest, path: string[]) {
  const targetPath = path.join('/');
  const targetUrl = `${BACKEND_URL}/gq-core/${targetPath}`;
  
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Forward authorization header if present
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    };
    
    // Forward body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const body = await request.json();
        fetchOptions.body = JSON.stringify(body);
      } catch {
        // No body or invalid JSON - continue without body
      }
    }
    
    const response = await fetch(targetUrl, fetchOptions);
    
    // Get response data
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    // Return response with same status
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error(`[GQ-Core Proxy] Error forwarding to ${targetUrl}:`, error);
    
    // Return synthetic fallback on error
    return NextResponse.json({
      source: 'synthetic',
      timestamp: new Date().toISOString(),
      data: null,
      fallback_reason: `Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: true
    }, { status: 503 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path);
}
