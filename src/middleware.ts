import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Block all admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // Block seed endpoint
  if (request.nextUrl.pathname === '/api/seed') {
    return new NextResponse('Not Found', { status: 404 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
