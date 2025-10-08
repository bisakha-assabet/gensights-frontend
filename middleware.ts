import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const allowedOrigins = [
  'http://pratigya.gensights:3000',
  'http://localhost:3000',
  'http://pratigya.gensights:8000'
]

export function middleware(request: NextRequest) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin')
    if (origin && allowedOrigins.includes(origin)) {
      const response = new NextResponse(null, { status: 204 })
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRFToken')
      return response
    }
    return new NextResponse(null, { status: 403 })
  }

  // Handle regular requests
  const origin = request.headers.get('origin')
  if (origin && allowedOrigins.includes(origin)) {
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    
    // Important for CSRF cookie
    if (request.nextUrl.pathname === '/api/csrf') {
      response.headers.set('Access-Control-Expose-Headers', 'Set-Cookie')
    }
    
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/csrf' // Explicitly include CSRF endpoint
  ]
}