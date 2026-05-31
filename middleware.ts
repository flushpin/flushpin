import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.getAll().find(c => c.name.includes('auth-token') || c.name.includes('access-token'))

    if (!token) {
      return NextResponse.redirect(new URL('/?signin=true', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
