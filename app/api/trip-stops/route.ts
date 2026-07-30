import { NextRequest, NextResponse } from 'next/server'
import {
  TRIP_STOP_CATEGORIES,
  type TripStopCategory,
  type TripStopsMode,
} from '../../../lib/tripStops'
import {
  buildTripStopsResponse,
  getTripStopsDependencies,
  type TripStopsRequest,
} from '../../../lib/tripStopsServer'
import { isTripStopsEnabled } from '../../../lib/serverReleaseFlags'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 4
const requestLog = new Map<string, number[]>()

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
}

function rateLimited(key: string): boolean {
  const now = Date.now()
  const hits = (requestLog.get(key) ?? []).filter((timestamp) => timestamp > now - RATE_LIMIT_WINDOW_MS)
  if (hits.length >= RATE_LIMIT_MAX) {
    requestLog.set(key, hits)
    return true
  }
  hits.push(now)
  requestLog.set(key, hits)
  return false
}

function cleanText(value: unknown): string {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 160)
    : ''
}

function parseRequest(raw: unknown): TripStopsRequest | { error: string } {
  if (!raw || typeof raw !== 'object') return { error: 'invalid_request' }
  const body = raw as Record<string, unknown>
  const mode: TripStopsMode = body.mode === 'destination' ? 'destination' : 'route'
  const origin = cleanText(body.origin)
  const destination = cleanText(body.destination)
  if (!destination) return { error: 'destination_required' }
  if (mode === 'route' && !origin) return { error: 'origin_required' }

  const radius = Number(body.radiusMiles)
  const radiusMiles = [0.5, 1, 2, 5].includes(radius) ? radius : 2
  const categories = Array.isArray(body.categories)
    ? body.categories.filter(
        (value): value is TripStopCategory =>
          typeof value === 'string' && TRIP_STOP_CATEGORIES.includes(value as TripStopCategory),
      )
    : undefined

  return {
    mode,
    origin: mode === 'route' ? origin : undefined,
    destination,
    radiusMiles,
    categories,
  }
}

function errorResponse(error: string): NextResponse {
  const known: Record<string, { status: number; message: string }> = {
    invalid_request: { status: 400, message: 'Invalid request.' },
    origin_required: { status: 400, message: 'Enter a starting point.' },
    destination_required: { status: 400, message: 'Enter a destination.' },
    origin_not_found: { status: 404, message: 'We could not find the starting point.' },
    destination_not_found: { status: 404, message: 'We could not find that destination or area.' },
    same_origin_destination: { status: 400, message: 'Starting point and destination must be different.' },
    route_not_found: { status: 404, message: 'No driving route was found.' },
    route_too_long: { status: 400, message: 'Trip Stops supports routes up to 600 miles.' },
  }
  const mapped = known[error] ?? { status: 502, message: 'Trip Stops is temporarily unavailable.' }
  return NextResponse.json(
    { error, message: mapped.message },
    { status: mapped.status, headers: { 'Cache-Control': 'no-store' } },
  )
}

export type TripStopsHandlerDependencies = {
  enabled: () => boolean
  getDependencies: typeof getTripStopsDependencies
  buildResponse: typeof buildTripStopsResponse
}

const productionDependencies: TripStopsHandlerDependencies = {
  enabled: isTripStopsEnabled,
  getDependencies: getTripStopsDependencies,
  buildResponse: buildTripStopsResponse,
}

export async function handleTripStopsPost(
  request: NextRequest,
  dependencies: TripStopsHandlerDependencies = productionDependencies,
) {
  if (!dependencies.enabled()) {
    return NextResponse.json(
      { error: 'not_found' },
      { status: 404, headers: { 'Cache-Control': 'private, no-store, max-age=0' } },
    )
  }

  if (rateLimited(clientKey(request))) {
    return NextResponse.json(
      { error: 'rate_limited', message: 'Please wait a minute before searching again.' },
      { status: 429, headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' } },
    )
  }

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return errorResponse('invalid_request')
  }
  const parsed = parseRequest(raw)
  if ('error' in parsed) return errorResponse(parsed.error)

  const serverDependencies = await dependencies.getDependencies()
  if ('error' in serverDependencies) {
    console.error('[trip-stops] server configuration error:', serverDependencies.error)
    return NextResponse.json(
      { error: 'server_configuration_error', message: 'Trip Stops is not configured yet.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  try {
    const result = await dependencies.buildResponse(parsed, {
      ...serverDependencies,
      sessionKey: `trip-stops:${clientKey(request)}`,
    })
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const code = error instanceof Error ? error.message.split(':')[0] : 'provider_error'
    if (!['origin_not_found', 'destination_not_found', 'same_origin_destination', 'route_not_found', 'route_too_long'].includes(code)) {
      console.error('[trip-stops] request failed:', code)
    }
    return errorResponse(code)
  }
}

export async function POST(request: NextRequest) {
  return handleTripStopsPost(request)
}
