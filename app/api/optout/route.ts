import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabaseService'

export const dynamic = 'force-dynamic'

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const RATE_LIMIT_MAX = 5
const requestLog = new Map<string, number[]>()

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
}

function rateLimited(key: string): boolean {
  const now = Date.now()
  const recent = (requestLog.get(key) ?? []).filter(
    (timestamp) => timestamp > now - RATE_LIMIT_WINDOW_MS,
  )
  if (recent.length >= RATE_LIMIT_MAX) {
    requestLog.set(key, recent)
    return true
  }
  recent.push(now)
  requestLog.set(key, recent)
  return false
}

function cleanText(value: unknown, maxLength: number): string {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, maxLength)
    : ''
}

function emailTrust(email: string): 'generic' | 'business' {
  const genericDomains = new Set([
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'aol.com',
    'icloud.com',
    'me.com',
    'mac.com',
  ])
  return genericDomains.has(email.split('@')[1]?.toLowerCase() ?? '')
    ? 'generic'
    : 'business'
}

export async function POST(request: NextRequest) {
  if (rateLimited(clientKey(request))) {
    return NextResponse.json(
      { error: 'rate_limited' },
      {
        status: 429,
        headers: { 'Retry-After': '3600', 'Cache-Control': 'private, no-store' },
      },
    )
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  if (cleanText(body.website, 200)) return NextResponse.json({ ok: true })

  const businessName = cleanText(body.business_name, 120)
  const contactName = cleanText(body.contact_name, 120)
  const contactTitle = cleanText(body.contact_title, 120)
  const city = cleanText(body.city, 120)
  const email = cleanText(body.email, 254).toLowerCase()
  const reason = cleanText(body.reason, 1000)
  const authorized = body.authorized === true

  if (!businessName || !contactName || !city || !email || !authorized) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  const service = getServiceClient()
  if (!service.client) {
    return NextResponse.json({ error: 'service_unavailable' }, { status: 503 })
  }

  const { error } = await service.client.from('optout_requests').insert({
    business_name: businessName,
    contact_name: contactName,
    contact_title: contactTitle,
    city,
    email,
    reason,
    status: 'pending',
    email_trust: emailTrust(email),
  })
  if (error) {
    console.error('[optout] request insert failed')
    return NextResponse.json({ error: 'request_failed' }, { status: 500 })
  }

  return NextResponse.json(
    { ok: true, status: 'pending' },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
