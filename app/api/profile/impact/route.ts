import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  EMPTY_PROFILE_IMPACT,
  isAccessCodeSubmission,
  isPositiveAmenityReport,
  normalizeImpactMetrics,
  startOfUtcMonth,
  type ProfileImpactMetrics,
} from '@/lib/profileImpact'

export const dynamic = 'force-dynamic'

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { 'Cache-Control': 'private, no-store, max-age=0' },
  })
}

/**
 * GET /api/profile/impact
 * Authenticated user-only monthly + lifetime contribution counts.
 */
export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anonKey || !serviceKey) {
    return json({ error: 'Server not configured', month: EMPTY_PROFILE_IMPACT, lifetime: EMPTY_PROFILE_IMPACT }, 503)
  }

  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  if (!token) {
    return json({ error: 'Sign in required' }, 401)
  }

  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: authData, error: authError } = await authClient.auth.getUser(token)
  if (authError || !authData.user) {
    return json({ error: 'Invalid or expired session' }, 401)
  }

  const userId = authData.user.id
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const monthStart = startOfUtcMonth().toISOString()

  try {
    const [viewsMonth, viewsLife, subsMonth, subsLife, feedbackMonth, feedbackLife, reportsMonth, reportsLife] =
      await Promise.all([
        supabase
          .from('pin_views')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('viewed_at', monthStart),
        supabase
          .from('pin_views')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('pin_submissions')
          .select('submitted_pin, access_type, created_at')
          .eq('user_id', userId)
          .gte('created_at', monthStart)
          .limit(500),
        supabase
          .from('pin_submissions')
          .select('submitted_pin, access_type')
          .eq('user_id', userId)
          .limit(2000),
        supabase
          .from('pin_feedback')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'green')
          .gte('created_at', monthStart),
        supabase
          .from('pin_feedback')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'green'),
        supabase
          .from('restroom_reports')
          .select('report_type, created_at')
          .eq('created_by', userId)
          .gte('created_at', monthStart)
          .limit(500),
        supabase
          .from('restroom_reports')
          .select('report_type')
          .eq('created_by', userId)
          .limit(2000),
      ])

    // Soft-fail individual sources so one missing column/table never blanks the page.
    if (viewsMonth.error) console.warn('[profile/impact] pin_views month', viewsMonth.error.message)
    if (subsMonth.error) console.warn('[profile/impact] pin_submissions month', subsMonth.error.message)
    if (feedbackMonth.error) console.warn('[profile/impact] pin_feedback month', feedbackMonth.error.message)
    if (reportsMonth.error) console.warn('[profile/impact] restroom_reports month', reportsMonth.error.message)

    const countCodes = (
      rows: Array<{ submitted_pin?: string | null; access_type?: string | null }> | null,
    ) => (rows ?? []).filter(isAccessCodeSubmission).length

    const countAmenityYes = (rows: Array<{ report_type?: string | null }> | null) =>
      (rows ?? []).filter((r) => isPositiveAmenityReport(r.report_type)).length

    const countReports = (rows: Array<{ report_type?: string | null }> | null) =>
      (rows ?? []).length

    const month: ProfileImpactMetrics = normalizeImpactMetrics({
      restroomsViewed: viewsMonth.error ? 0 : viewsMonth.count ?? 0,
      codesContributed: subsMonth.error ? 0 : countCodes(subsMonth.data),
      codesVerified: feedbackMonth.error ? 0 : feedbackMonth.count ?? 0,
      amenitiesConfirmed: reportsMonth.error ? 0 : countAmenityYes(reportsMonth.data),
      communityReports: reportsMonth.error ? 0 : countReports(reportsMonth.data),
    })

    const lifetime: ProfileImpactMetrics = normalizeImpactMetrics({
      restroomsViewed: viewsLife.error ? 0 : viewsLife.count ?? 0,
      codesContributed: subsLife.error ? 0 : countCodes(subsLife.data),
      codesVerified: feedbackLife.error ? 0 : feedbackLife.count ?? 0,
      amenitiesConfirmed: reportsLife.error ? 0 : countAmenityYes(reportsLife.data),
      communityReports: reportsLife.error ? 0 : countReports(reportsLife.data),
    })

    return json({
      month,
      lifetime,
      monthStart,
    })
  } catch (err) {
    console.error('[profile/impact]', err instanceof Error ? err.message : err)
    return json({ month: EMPTY_PROFILE_IMPACT, lifetime: EMPTY_PROFILE_IMPACT, degraded: true })
  }
}
