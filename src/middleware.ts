import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Block seed endpoint
  if (request.nextUrl.pathname === '/api/seed') {
    return new NextResponse('Not Found', { status: 404 })
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authCookie = request.cookies.get('admin-auth')
    const adminSecret = process.env.ADMIN_SECRET

    // Check if authenticated
    if (!authCookie || authCookie.value !== adminSecret) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/seed'],
}
