import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getServiceClient } from '@/lib/supabaseService'

export const dynamic = 'force-dynamic'

const ADMIN_ALERT_EMAIL = process.env.ADMIN_ALERT_EMAIL || '34johnertan@gmail.com'
const RESEND_FROM = 'FlushPin <onboarding@resend.dev>'

const BUSINESS_TYPES = new Set(['cafe', 'restaurant', 'retail', 'gas', 'other'])
const FOOT_TRAFFIC = new Set(['under_50', '50_150', '150_400', '400_plus'])
const CODE_FREQUENCY = new Set(['rarely', 'few_times_daily', 'constantly'])
const PLANS = new Set(['free', 'starter', 'business', 'multi', 'not_sure'])

const PLAN_LABELS: Record<string, string> = {
  free: 'Free Listing',
  starter: 'Starter QR ($9/mo)',
  business: 'Business ($29/mo)',
  multi: 'Multi-Location ($49/mo)',
  not_sure: 'Not sure yet',
}

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  cafe: 'Cafe',
  restaurant: 'Restaurant',
  retail: 'Retail',
  gas: 'Gas station',
  other: 'Other',
}

const FOOT_TRAFFIC_LABELS: Record<string, string> = {
  under_50: 'Under 50',
  '50_150': '50–150',
  '150_400': '150–400',
  '400_plus': '400+',
}

const CODE_FREQUENCY_LABELS: Record<string, string> = {
  rarely: 'Rarely',
  few_times_daily: 'A few times a day',
  constantly: 'Constantly',
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function buildEmailBody(payload: {
  business_name: string
  business_type: string
  street_address: string
  city: string
  contact_name: string
  contact_email: string
  contact_phone: string | null
  daily_foot_traffic: string
  restroom_code_frequency: string
  plan: string
  location_count: number | null
  notes: string | null
  record_id: number
}): string {
  return [
    `New FlushPin business lead (#${payload.record_id})`,
    '',
    `Business: ${payload.business_name}`,
    `Type: ${BUSINESS_TYPE_LABELS[payload.business_type] ?? payload.business_type}`,
    `Address: ${payload.street_address}, ${payload.city}`,
    '',
    `Contact: ${payload.contact_name}`,
    `Email: ${payload.contact_email}`,
    `Phone: ${payload.contact_phone || '—'}`,
    '',
    `Busy-day foot traffic: ${FOOT_TRAFFIC_LABELS[payload.daily_foot_traffic] ?? payload.daily_foot_traffic}`,
    `Restroom code asks: ${CODE_FREQUENCY_LABELS[payload.restroom_code_frequency] ?? payload.restroom_code_frequency}`,
    `Plan: ${PLAN_LABELS[payload.plan] ?? payload.plan}`,
    payload.location_count != null ? `Locations: ${payload.location_count}` : null,
    '',
    `Notes: ${payload.notes || '—'}`,
    '',
    'Submitted via https://www.flushpin.com/business/start',
  ]
    .filter((line) => line !== null)
    .join('\n')
}

async function sendLeadEmail(payload: Parameters<typeof buildEmailBody>[0]): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[business-lead] RESEND_API_KEY not configured — email skipped')
    return
  }

  const resend = new Resend(apiKey)
  const planLabel = PLAN_LABELS[payload.plan] ?? payload.plan
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || RESEND_FROM,
    to: [ADMIN_ALERT_EMAIL],
    subject: `New FlushPin lead: ${payload.business_name} (${planLabel})`,
    text: buildEmailBody(payload),
  })

  if (error) {
    throw new Error(error.message)
  }
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

  if (String(body.website ?? body.company_url ?? '').trim()) {
    return NextResponse.json({ ok: true })
  }

  const businessName = String(body.business_name ?? '').trim()
  const businessType = String(body.business_type ?? '').trim()
  const streetAddress = String(body.street_address ?? '').trim()
  const city = String(body.city ?? '').trim()
  const contactName = String(body.contact_name ?? '').trim()
  const contactEmail = String(body.contact_email ?? '').trim()
  const contactPhone = String(body.contact_phone ?? '').trim() || null
  const dailyFootTraffic = String(body.daily_foot_traffic ?? '').trim()
  const restroomCodeFrequency = String(body.restroom_code_frequency ?? '').trim()
  const plan = String(body.plan ?? '').trim()
  const notes = String(body.notes ?? '').trim() || null

  let locationCount: number | null = null
  if (body.location_count != null && String(body.location_count).trim() !== '') {
    const parsed = Number(body.location_count)
    if (!Number.isInteger(parsed) || parsed < 2) {
      return NextResponse.json({ error: 'location_count must be a whole number of at least 2' }, { status: 400 })
    }
    locationCount = parsed
  }

  if (!businessName) return NextResponse.json({ error: 'business_name is required' }, { status: 400 })
  if (!BUSINESS_TYPES.has(businessType)) return NextResponse.json({ error: 'Invalid business_type' }, { status: 400 })
  if (!streetAddress) return NextResponse.json({ error: 'street_address is required' }, { status: 400 })
  if (!city) return NextResponse.json({ error: 'city is required' }, { status: 400 })
  if (!contactName) return NextResponse.json({ error: 'contact_name is required' }, { status: 400 })
  if (!contactEmail || !isValidEmail(contactEmail)) {
    return NextResponse.json({ error: 'A valid contact_email is required' }, { status: 400 })
  }
  if (!FOOT_TRAFFIC.has(dailyFootTraffic)) {
    return NextResponse.json({ error: 'Invalid daily_foot_traffic' }, { status: 400 })
  }
  if (!CODE_FREQUENCY.has(restroomCodeFrequency)) {
    return NextResponse.json({ error: 'Invalid restroom_code_frequency' }, { status: 400 })
  }
  if (!PLANS.has(plan)) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  if (plan === 'multi' && locationCount == null) {
    return NextResponse.json({ error: 'location_count is required for Multi-Location plan' }, { status: 400 })
  }

  const row = {
    business_name: businessName,
    business_type: businessType,
    street_address: streetAddress,
    city,
    contact_name: contactName,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    daily_foot_traffic: dailyFootTraffic,
    restroom_code_frequency: restroomCodeFrequency,
    plan,
    location_count: plan === 'multi' ? locationCount : null,
    notes,
    status: 'new',
    source: 'web',
  }

  const { data, error } = await service.client
    .from('business_leads')
    .insert(row)
    .select('id, created_at, business_name, plan')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  try {
    await sendLeadEmail({
      ...row,
      record_id: data.id,
    })
  } catch (emailError) {
    console.error('[business-lead] Email send failed:', emailError)
  }

  return NextResponse.json({
    ok: true,
    id: data.id,
  })
}
