import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdminRequest } from '@/lib/adminRequestAuth'
import type { FounderAnalyticsPayload, MetricValue } from '@/lib/founderAnalyticsTypes'
import {
  collectProductMetrics,
  dayKeys,
  vercelDayToChart,
} from '@/lib/founderMetrics'
import { getServiceClient } from '@/lib/supabaseService'
import { fetchVercelAnalyticsBundle } from '@/lib/vercelAnalytics'

export const dynamic = 'force-dynamic'

export type { FounderAnalyticsPayload }

function metric(value: number, unavailable = false, note?: string): MetricValue {
  if (unavailable) return { value: null, status: 'unavailable', note }
  return { value, status: 'ready', note }
}

export async function GET(request: NextRequest) {
  const authorization = await authorizeAdminRequest(request)
  if (!authorization.authorized) return authorization.response

  const investorSafe = request.nextUrl.searchParams.get('investor') === '1'

  const service = getServiceClient()
  if (!service.client) {
    console.error('[admin/analytics] service unavailable')
    return NextResponse.json(
      { error: 'admin_service_unavailable' },
      { status: 503, headers: { 'Cache-Control': 'private, no-store, max-age=0' } },
    )
  }

  try {
    const [vercel, product] = await Promise.all([
      fetchVercelAnalyticsBundle(),
      collectProductMetrics(service.client),
    ])

    const trafficUnavailableNote = 'Connect traffic analytics to unlock'

    const payload: FounderAnalyticsPayload = {
      generatedAt: new Date().toISOString(),
      investorSafe,
      today: {
        uniqueVisitors: vercel.configured
          ? metric(vercel.today.visitors)
          : metric(0, true, trafficUnavailableNote),
        pageViews: vercel.configured
          ? metric(vercel.today.pageviews)
          : metric(0, true, trafficUnavailableNote),
        newRegisteredUsers: metric(product.today.newRegisteredUsers),
        signedInActiveUsers: metric(product.today.signedInActiveUsers),
        restroomSearches: product.today.restroomSearches,
        restroomDetailViews: product.today.restroomDetailViews,
        accessViews: metric(product.today.accessViews),
        communityContributions: metric(product.today.communityContributions),
        appStoreClicks: product.today.appStoreClicks,
      },
      trends: {
        visitors7d: vercel.configured
          ? vercelDayToChart(vercel.visitorsByDay7, dayKeys(7))
          : dayKeys(7).map((date) => ({
              date,
              label: date,
              count: 0,
            })),
        visitors30d: vercel.configured
          ? vercelDayToChart(vercel.visitorsByDay30, dayKeys(30))
          : dayKeys(30).map((date) => ({
              date,
              label: date,
              count: 0,
            })),
        newUsers7d: product.trends.newUsers7d,
        newUsers30d: product.trends.newUsers30d,
        accessViews7d: product.trends.accessViews7d,
        accessViews30d: product.trends.accessViews30d,
        contributions7d: product.trends.contributions7d,
        contributions30d: product.trends.contributions30d,
      },
      geography: {
        topCountries: vercel.topCountries.map((row) => ({
          name: row.key,
          visitors: row.visitors,
          pageviews: row.pageviews,
        })),
        topCities: product.geography.topCities,
        topRestrooms: product.geography.topRestrooms,
        topRoutes: vercel.topRoutes.map((row) => ({
          route: row.key,
          pageviews: row.pageviews,
          visitors: row.visitors,
        })),
        topReferrers: vercel.topReferrers.map((row) => ({
          host: row.key,
          visitors: row.visitors,
          pageviews: row.pageviews,
        })),
        topDevices: vercel.topDevices.map((row) => ({
          device: row.key,
          visitors: row.visitors,
          pageviews: row.pageviews,
        })),
      },
      community: product.community,
      business: product.business,
      sources: {
        vercelConfigured: vercel.configured,
        // Never echo raw upstream errors (may include request metadata).
        vercelError: vercel.configured ? undefined : 'traffic_analytics_unavailable',
      },
    }

    if (investorSafe) {
      delete payload.sources.vercelError
    }

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'private, no-store, max-age=0' },
    })
  } catch (err) {
    console.error('[admin/analytics] failed', err)
    return NextResponse.json(
      { error: 'founder_analytics_unavailable' },
      { status: 500, headers: { 'Cache-Control': 'private, no-store, max-age=0' } },
    )
  }
}
