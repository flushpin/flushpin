/**
 * Server-only Vercel Web Analytics API client.
 * Never import this from client components.
 */

export type VercelVisitTotals = {
  pageviews: number
  visitors: number
}

export type VercelDayRow = {
  timestamp: string
  pageviews: number
  visitors: number
}

export type VercelDimensionRow = {
  key: string
  pageviews: number
  visitors: number
}

export type VercelShareMethodCounts = {
  whatsapp: number
  sms: number
  email: number
  copy: number
  native: number
}

export type VercelShareMetrics = {
  opened: number
  completed: number
  byMethod: VercelShareMethodCounts
}

export type VercelAnalyticsBundle = {
  configured: boolean
  error?: string
  today: VercelVisitTotals
  last7Days: VercelVisitTotals
  last30Days: VercelVisitTotals
  visitorsByDay7: VercelDayRow[]
  visitorsByDay30: VercelDayRow[]
  topCountries: VercelDimensionRow[]
  topRoutes: VercelDimensionRow[]
  topReferrers: VercelDimensionRow[]
  topDevices: VercelDimensionRow[]
  share: VercelShareMetrics
}

type CountResponse = {
  data?: { pageviews?: number; visitors?: number }
}

type AggregateDayResponse = {
  data?: Array<{ timestamp?: string; pageviews?: number; visitors?: number }>
}

type AggregateDimResponse = {
  data?: Array<Record<string, unknown> & { pageviews?: number; visitors?: number }>
}

function assertServerRuntime(): void {
  if (typeof window !== 'undefined') {
    throw new Error('vercelAnalytics cannot run in the browser')
  }
}

function config() {
  const token = process.env.VERCEL_TOKEN?.trim()
  const projectId = process.env.VERCEL_PROJECT_ID?.trim()
  const teamId = process.env.VERCEL_TEAM_ID?.trim()
  return { token, projectId, teamId }
}

function emptyShareMetrics(): VercelShareMetrics {
  return {
    opened: 0,
    completed: 0,
    byMethod: { whatsapp: 0, sms: 0, email: 0, copy: 0, native: 0 },
  }
}

function emptyBundle(error?: string): VercelAnalyticsBundle {
  return {
    configured: false,
    error,
    today: { pageviews: 0, visitors: 0 },
    last7Days: { pageviews: 0, visitors: 0 },
    last30Days: { pageviews: 0, visitors: 0 },
    visitorsByDay7: [],
    visitorsByDay30: [],
    topCountries: [],
    topRoutes: [],
    topReferrers: [],
    topDevices: [],
    share: emptyShareMetrics(),
  }
}

type EventCountResponse = {
  data?: { count?: number; visitors?: number }
}

async function eventsCount(since: string, until: string, filter: string): Promise<number> {
  const json = await vercelGet<EventCountResponse>('/v1/query/web-analytics/events/count', {
    since,
    until,
    filter,
  })
  return Number(json.data?.count ?? 0)
}

async function shareMethodCounts(since: string, until: string): Promise<VercelShareMethodCounts> {
  const methods = ['whatsapp', 'sms', 'email', 'copy', 'native'] as const
  const counts = await Promise.all(
    methods.map((method) =>
      eventsCount(since, until, `eventName eq 'share_completed' and eventData/method eq '${method}'`).catch(
        () => 0,
      ),
    ),
  )
  return {
    whatsapp: counts[0],
    sms: counts[1],
    email: counts[2],
    copy: counts[3],
    native: counts[4],
  }
}

async function fetchShareMetrics(since: string, until: string): Promise<VercelShareMetrics> {
  try {
    const [opened, completed, byMethod] = await Promise.all([
      eventsCount(since, until, "eventName eq 'share_opened'"),
      eventsCount(since, until, "eventName eq 'share_completed'"),
      shareMethodCounts(since, until),
    ])
    return { opened, completed, byMethod }
  } catch (err) {
    console.error('[vercelAnalytics] share metrics', err)
    return emptyShareMetrics()
  }
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function startOfUtcDay(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

async function vercelGet<T>(
  path: string,
  params: Record<string, string>,
): Promise<T> {
  const { token, projectId, teamId } = config()
  if (!token || !projectId) {
    throw new Error('Vercel Analytics is not configured (VERCEL_TOKEN / VERCEL_PROJECT_ID).')
  }

  const url = new URL(`https://api.vercel.com${path}`)
  url.searchParams.set('projectId', projectId)
  if (teamId) url.searchParams.set('teamId', teamId)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Vercel Analytics API ${res.status}: ${body.slice(0, 240)}`)
  }

  return (await res.json()) as T
}

async function visitsCount(since: string, until?: string): Promise<VercelVisitTotals> {
  const params: Record<string, string> = { since }
  if (until) params.until = until
  const json = await vercelGet<CountResponse>('/v1/query/web-analytics/visits/count', params)
  return {
    pageviews: Number(json.data?.pageviews ?? 0),
    visitors: Number(json.data?.visitors ?? 0),
  }
}

async function visitsByDay(since: string, until: string): Promise<VercelDayRow[]> {
  const json = await vercelGet<AggregateDayResponse>('/v1/query/web-analytics/visits/aggregate', {
    since,
    until,
    by: 'day',
  })
  return (json.data ?? []).map((row) => ({
    timestamp: String(row.timestamp ?? ''),
    pageviews: Number(row.pageviews ?? 0),
    visitors: Number(row.visitors ?? 0),
  }))
}

async function visitsByDimension(
  since: string,
  until: string,
  by: string,
  limit = 10,
): Promise<VercelDimensionRow[]> {
  const json = await vercelGet<AggregateDimResponse>('/v1/query/web-analytics/visits/aggregate', {
    since,
    until,
    by,
    limit: String(limit),
  })

  return (json.data ?? []).map((row) => {
    const key = String(row[by] ?? row.route ?? row.country ?? row.referrerHostname ?? row.deviceType ?? 'unknown')
    return {
      key,
      pageviews: Number(row.pageviews ?? 0),
      visitors: Number(row.visitors ?? 0),
    }
  })
}

export async function fetchVercelAnalyticsBundle(): Promise<VercelAnalyticsBundle> {
  assertServerRuntime()

  const { token, projectId } = config()
  if (!token || !projectId) {
    return emptyBundle('Vercel Analytics env not configured (VERCEL_TOKEN, VERCEL_PROJECT_ID).')
  }

  const today = startOfUtcDay()
  const tomorrow = new Date(today)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)

  const since7 = new Date(today)
  since7.setUTCDate(since7.getUTCDate() - 6)
  const since30 = new Date(today)
  since30.setUTCDate(since30.getUTCDate() - 29)

  const todayIso = toIsoDate(today)
  const untilIso = toIsoDate(tomorrow)
  const since7Iso = toIsoDate(since7)
  const since30Iso = toIsoDate(since30)

  try {
    const [
      todayTotals,
      last7Days,
      last30Days,
      visitorsByDay7,
      visitorsByDay30,
      topCountries,
      topRoutes,
      topReferrers,
      topDevices,
      share,
    ] = await Promise.all([
      visitsCount(todayIso, untilIso),
      visitsCount(since7Iso, untilIso),
      visitsCount(since30Iso, untilIso),
      visitsByDay(since7Iso, untilIso),
      visitsByDay(since30Iso, untilIso),
      visitsByDimension(since30Iso, untilIso, 'country', 10),
      visitsByDimension(since30Iso, untilIso, 'route', 15),
      visitsByDimension(since30Iso, untilIso, 'referrerHostname', 10),
      visitsByDimension(since30Iso, untilIso, 'deviceType', 5),
      fetchShareMetrics(todayIso, untilIso),
    ])

    return {
      configured: true,
      today: todayTotals,
      last7Days,
      last30Days,
      visitorsByDay7,
      visitorsByDay30,
      topCountries,
      topRoutes,
      topReferrers,
      topDevices,
      share,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Vercel Analytics query failed'
    console.error('[vercelAnalytics]', message)
    return emptyBundle(message)
  }
}
