import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const ADMIN_ALERT_EMAIL = process.env.ADMIN_ALERT_EMAIL || '34johnertan@gmail.com'
const RESEND_FROM = 'FlushPin <onboarding@resend.dev>'

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').trim()
  const subject = String(body.subject ?? '').trim()
  const message = String(body.message ?? '').trim()
  const website = String(body.website ?? '').trim()

  // Honeypot — bots fill hidden fields; accept silently.
  if (website) {
    return NextResponse.json({ ok: true })
  }

  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
  }
  if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 })

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY not configured')
    return NextResponse.json(
      { error: 'Messaging is temporarily unavailable. Email admin@flushpin.com instead.' },
      { status: 503 },
    )
  }

  const resend = new Resend(apiKey)
  const topic = subject || 'FlushPin contact form'
  const text = [
    `New FlushPin contact message`,
    '',
    `From: ${name}`,
    `Email: ${email}`,
    `Subject: ${topic}`,
    '',
    message,
    '',
    'Submitted via https://www.flushpin.com/contact',
  ].join('\n')

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || RESEND_FROM,
    to: [ADMIN_ALERT_EMAIL],
    replyTo: email,
    subject: `Contact: ${topic} — ${name}`,
    text,
  })

  if (error) {
    console.error('[contact] Email send failed:', error)
    return NextResponse.json(
      { error: 'Could not send your message. Please email admin@flushpin.com.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
