import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    const cookies = request.cookies.getAll()
    const hasAuth = cookies.some(c => 
      c.name.includes('auth') || 
      c.name.includes('token') || 
      c.name.includes('session') ||
      c.name.includes('sb-')
    )

    if (!hasAuth) {
      return NextResponse.redirect(new URL('/?signin=true', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
