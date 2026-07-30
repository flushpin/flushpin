import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isAdminDashboardEnabled } from './serverReleaseFlags'

type AdminAuthorization =
  | { authorized: true; email: string }
  | { authorized: false; response: NextResponse }

function denied(status: number, error: string): AdminAuthorization {
  return {
    authorized: false,
    response: NextResponse.json(
      { error },
      {
        status,
        headers: { 'Cache-Control': 'private, no-store, max-age=0' },
      },
    ),
  }
}

function configuredAdminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )
}

export async function authorizeAdminRequest(
  request: NextRequest,
): Promise<AdminAuthorization> {
  if (!isAdminDashboardEnabled()) return denied(404, 'not_found')

  const authorization = request.headers.get('authorization') ?? ''
  const match = /^Bearer ([^\s]+)$/.exec(authorization)
  const token = match?.[1] ?? ''
  if (!token || token.length > 4096) return denied(401, 'authentication_required')

  const allowedEmails = configuredAdminEmails()
  if (allowedEmails.size === 0) return denied(503, 'admin_auth_not_configured')

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return denied(503, 'admin_auth_not_configured')

  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await authClient.auth.getUser(token)
  const email = data.user?.email?.trim().toLowerCase() ?? ''
  if (error || !email) return denied(401, 'invalid_session')
  if (!allowedEmails.has(email)) return denied(403, 'forbidden')

  return { authorized: true, email }
}
