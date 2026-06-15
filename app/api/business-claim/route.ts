import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabaseService'

export const dynamic = 'force-dynamic'

const FORMSPREE_ID = process.env.FORMSPREE_BUSINESS_ID || 'maqkrnep'
const ADMIN_ALERT_EMAIL = process.env.ADMIN_ALERT_EMAIL || '34johnertan@gmail.com'

type ClaimType = 'claim' | 'update' | 'removal'

function getEmailTrust(email: string): 'generic' | 'business' {
  const genericDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'me.com', 'mac.com']
  const domain = email.split('@')[1]?.toLowerCase()
  return genericDomains.includes(domain) ? 'generic' : 'business'
}

function requestTypeLabel(type: ClaimType): string {
  if (type === 'removal') return 'Removal / opt-out (hide PIN & listing)'
  if (type === 'update') return 'Update access info'
  return 'Claim listing'
}

async function sendAdminEmail(payload: {
  request_type: ClaimType
  business_name: string
  business_address: string | null
  contact_name: string
  contact_email: string
  contact_phone: string | null
  message: string | null
  record_id: number
}) {
  const subject = `🚨 FlushPin business request: ${requestTypeLabel(payload.request_type)} — ${payload.business_name}`
  const bodyText = [
    `New business owner request (#${payload.record_id})`,
    '',
    `Type: ${requestTypeLabel(payload.request_type)}`,
    `Business: ${payload.business_name}`,
    `Address: ${payload.business_address || '—'}`,
    `Contact: ${payload.contact_name} <${payload.contact_email}>`,
    `Phone: ${payload.contact_phone || '—'}`,
    `Message: ${payload.message || '—'}`,
    '',
    'Review in admin: https://www.flushpin.com/admin (Business Claims tab)',
    'You can manually lock or hide the listing after review.',
  ].join('\n')

  if (process.env.RESEND_API_KEY) {
    const from = process.env.RESEND_FROM_EMAIL || 'FlushPin <onboarding@resend.dev>'
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [ADMIN_ALERT_EMAIL],
        subject,
        text: bodyText,
      }),
    })
    if (res.ok) return { channel: 'resend' as const }
  }

  await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      _subject: subject,
      _replyto: payload.contact_email,
      alert_type: 'business_claim_admin',
      admin_email: ADMIN_ALERT_EMAIL,
      record_id: payload.record_id,
      request_type: payload.request_type,
      business_name: payload.business_name,
      business_address: payload.business_address || '—',
      contact_name: payload.contact_name,
      contact_email: payload.contact_email,
      contact_phone: payload.contact_phone || '—',
      message: payload.message || '—',
      body: bodyText,
    }),
  })

  return { channel: 'formspree' as const }
}

export async function POST(request: NextRequest) {
  const service = getServiceClient()
  if (!service.client) {
    return NextResponse.json({ error: service.error }, { status: service.status })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const requestType = String(body.request_type ?? body.type ?? '') as ClaimType
  const businessName = String(body.business_name ?? body.business ?? '').trim()
  const contactName = String(body.contact_name ?? body.name ?? '').trim()
  const contactEmail = String(body.contact_email ?? body.email ?? '').trim()

  if (!['claim', 'update', 'removal'].includes(requestType)) {
    return NextResponse.json({ error: 'Invalid request_type' }, { status: 400 })
  }
  if (!businessName || !contactName || !contactEmail) {
    return NextResponse.json({ error: 'business_name, contact_name, and contact_email are required' }, { status: 400 })
  }

  const row = {
    request_type: requestType,
    business_name: businessName,
    business_address: String(body.business_address ?? body.address ?? '').trim() || null,
    contact_name: contactName,
    contact_email: contactEmail,
    contact_phone: String(body.contact_phone ?? body.phone ?? '').trim() || null,
    message: String(body.message ?? '').trim() || null,
    status: 'pending',
    source: 'web',
    email_trust: getEmailTrust(contactEmail),
  }

  const { data, error } = await service.client
    .from('business_claim_requests')
    .insert(row)
    .select('id, created_at, request_type, business_name, status')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let emailChannel = 'none'
  try {
    const sent = await sendAdminEmail({
      request_type: requestType,
      business_name: businessName,
      business_address: row.business_address,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: row.contact_phone,
      message: row.message,
      record_id: data.id,
    })
    emailChannel = sent.channel
  } catch {
    emailChannel = 'failed'
  }

  await service.client.from('admin_logs').insert({
    admin_email: 'system',
    action: 'business_claim_submitted',
    target_type: 'business_claim_requests',
    target_id: String(data.id),
    details: {
      request_type: requestType,
      business_name: businessName,
      contact_email: contactEmail,
      email_channel: emailChannel,
      priority: requestType === 'removal' ? 'high' : 'normal',
    },
  })

  return NextResponse.json({
    ok: true,
    id: data.id,
    status: data.status,
    email_sent: emailChannel !== 'failed' && emailChannel !== 'none',
  })
}
