import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdminRequest } from '@/lib/adminRequestAuth'

export const dynamic = 'force-dynamic'

/**
 * Lightweight founder session probe.
 * Returns 200 only when Bearer token is a valid Supabase user on ADMIN_EMAILS.
 */
export async function GET(request: NextRequest) {
  const authorization = await authorizeAdminRequest(request)
  if (!authorization.authorized) return authorization.response

  return NextResponse.json(
    {
      ok: true,
      email: authorization.email,
    },
    {
      headers: { 'Cache-Control': 'private, no-store, max-age=0' },
    },
  )
}
