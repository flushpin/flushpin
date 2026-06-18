import { NextRequest, NextResponse } from 'next/server'

function unauthorized() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="FlushPin Admin", charset="UTF-8"',
    },
  })
}

export function middleware(request: NextRequest) {
  const user = process.env.ADMIN_BASIC_USER || 'admin@flushpin.com'
  const pass = process.env.ADMIN_BASIC_PASS || 'Exxa2020@'
  const auth = request.headers.get('authorization')

  if (!auth?.startsWith('Basic ')) return unauthorized()

  try {
    const decoded = atob(auth.slice('Basic '.length))
    const separator = decoded.indexOf(':')
    const submittedUser = decoded.slice(0, separator)
    const submittedPass = decoded.slice(separator + 1)

    if (submittedUser === user && submittedPass === pass) {
      return NextResponse.next()
    }
  } catch {
    return unauthorized()
  }

  return unauthorized()
}

export const config = {
  matcher: ['/admin/:path*'],
}
