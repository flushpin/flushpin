import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabaseService'

export const dynamic = 'force-dynamic'

const BUCKET = 'campaign-creatives'
const MAX_FILE_SIZE = 2 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg'])

function slugify(value: string) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 42)
  return `${base || 'campaign'}-${Math.random().toString(36).slice(2, 8)}`
}

function text(form: FormData, key: string) {
  const value = form.get(key)
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export async function GET() {
  const service = getServiceClient()
  if (!service.client) {
    return NextResponse.json({ error: service.error }, { status: service.status })
  }

  const [campaignsRes, locationsRes, eventsRes] = await Promise.all([
    service.client
      .from('business_campaigns')
      .select('*, business_locations(*), campaign_creatives(*)')
      .order('created_at', { ascending: false })
      .limit(100),
    service.client
      .from('business_locations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
    service.client
      .from('campaign_events')
      .select('campaign_id, event_type, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(5000),
  ])

  if (campaignsRes.error) return NextResponse.json({ error: campaignsRes.error.message }, { status: 500 })
  if (locationsRes.error) return NextResponse.json({ error: locationsRes.error.message }, { status: 500 })

  const events = eventsRes.error ? [] : (eventsRes.data ?? [])
  const summary = {
    totalCampaigns: campaignsRes.data?.length ?? 0,
    activeCampaigns: (campaignsRes.data ?? []).filter((c) => c.status === 'active').length,
    pendingReview: (campaignsRes.data ?? []).filter((c) => c.status === 'pending_review').length,
    scans7d: events.filter((e) => e.event_type === 'qr_scan').length,
    completedViews7d: events.filter((e) => e.event_type === 'ad_view_complete').length,
    accessReveals7d: events.filter((e) => e.event_type === 'access_reveal').length,
  }

  return NextResponse.json({
    campaigns: campaignsRes.data ?? [],
    locations: locationsRes.data ?? [],
    summary,
    warnings: eventsRes.error ? [`campaign_events: ${eventsRes.error.message}`] : [],
  })
}

export async function POST(request: NextRequest) {
  const service = getServiceClient()
  if (!service.client) {
    return NextResponse.json({ error: service.error }, { status: service.status })
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid multipart form data' }, { status: 400 })
  }

  const file = form.get('creative')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Campaign creative file is required.' }, { status: 400 })
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Creative must be PNG or JPG.' }, { status: 400 })
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Creative must be under 2 MB.' }, { status: 400 })
  }

  const businessName = text(form, 'business_name')
  const campaignName = text(form, 'campaign_name')
  if (!businessName || !campaignName) {
    return NextResponse.json({ error: 'Business name and campaign name are required.' }, { status: 400 })
  }

  const restroomRaw = text(form, 'restroom_id')
  const restroomId = restroomRaw && Number.isFinite(Number(restroomRaw)) ? Number(restroomRaw) : null

  const { data: location, error: locationError } = await service.client
    .from('business_locations')
    .insert({
      business_name: businessName,
      location_name: text(form, 'location_name'),
      contact_name: text(form, 'contact_name'),
      contact_email: text(form, 'contact_email'),
      contact_phone: text(form, 'contact_phone'),
      address: text(form, 'address'),
      city: text(form, 'city'),
      restroom_id: restroomId,
      status: 'lead',
      plan: 'gold',
    })
    .select('*')
    .single()

  if (locationError) return NextResponse.json({ error: locationError.message }, { status: 500 })

  const { data: campaign, error: campaignError } = await service.client
    .from('business_campaigns')
    .insert({
      business_location_id: location.id,
      restroom_id: restroomId,
      name: campaignName,
      offer_title: text(form, 'offer_title'),
      offer_description: text(form, 'offer_description'),
      cta_text: text(form, 'cta_text'),
      destination_url: text(form, 'destination_url'),
      starts_at: text(form, 'starts_at'),
      ends_at: text(form, 'ends_at'),
      status: 'pending_review',
      created_by: 'admin@flushpin.com',
    })
    .select('*')
    .single()

  if (campaignError) return NextResponse.json({ error: campaignError.message }, { status: 500 })

  const ext = file.type === 'image/png' ? 'png' : 'jpg'
  const path = `${campaign.id}/${Date.now()}-${slugify(file.name)}.${ext}`
  const arrayBuffer = await file.arrayBuffer()

  const { error: uploadError } = await service.client.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: publicUrl } = service.client.storage.from(BUCKET).getPublicUrl(path)

  const { data: creative, error: creativeError } = await service.client
    .from('campaign_creatives')
    .insert({
      campaign_id: campaign.id,
      storage_bucket: BUCKET,
      storage_path: path,
      public_url: publicUrl.publicUrl,
      file_name: file.name,
      mime_type: file.type,
      file_size: file.size,
      status: 'pending_review',
    })
    .select('*')
    .single()

  if (creativeError) return NextResponse.json({ error: creativeError.message }, { status: 500 })

  const { data: qrCode } = await service.client
    .from('qr_codes')
    .insert({
      business_location_id: location.id,
      campaign_id: campaign.id,
      restroom_id: restroomId,
      slug: slugify(`${businessName}-${campaignName}`),
      status: 'active',
    })
    .select('*')
    .single()

  await service.client.from('admin_logs').insert({
    admin_email: 'admin@flushpin.com',
    action: 'campaign_created',
    target_type: 'business_campaigns',
    target_id: campaign.id,
    details: { business_location_id: location.id, creative_id: creative.id, qr_code_id: qrCode?.id ?? null },
  })

  return NextResponse.json({ ok: true, campaign, location, creative, qrCode })
}

export async function PATCH(request: NextRequest) {
  const service = getServiceClient()
  if (!service.client) {
    return NextResponse.json({ error: service.error }, { status: service.status })
  }

  let body: { campaignId?: string; status?: string; reviewNote?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.campaignId || !body.status) {
    return NextResponse.json({ error: 'campaignId and status are required' }, { status: 400 })
  }
  if (!['active', 'paused', 'rejected', 'pending_review', 'draft'].includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const patch: Record<string, unknown> = {
    status: body.status,
    review_note: body.reviewNote ?? null,
    updated_at: new Date().toISOString(),
  }
  if (body.status === 'active') {
    patch.approved_by = 'admin@flushpin.com'
    patch.approved_at = new Date().toISOString()
  }

  const { error } = await service.client
    .from('business_campaigns')
    .update(patch)
    .eq('id', body.campaignId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await service.client.from('admin_logs').insert({
    admin_email: 'admin@flushpin.com',
    action: 'campaign_status',
    target_type: 'business_campaigns',
    target_id: body.campaignId,
    details: { status: body.status },
  })

  return NextResponse.json({ ok: true })
}
