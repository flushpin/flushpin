import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabaseService'

export const dynamic = 'force-dynamic'

function nameFromMetadata(metadata: Record<string, unknown> | null | undefined, email: string | null | undefined) {
  const fullName = metadata?.full_name || metadata?.name || metadata?.display_name
  if (typeof fullName === 'string' && fullName.trim()) return fullName.trim()
  return email?.split('@')[0] ?? 'Unknown member'
}

function providerFromUser(user: any) {
  const identities = Array.isArray(user.identities) ? user.identities : []
  const providers = identities.map((identity: any) => identity.provider).filter(Boolean)
  return providers.length ? [...new Set(providers)].join(', ') : (user.app_metadata?.provider ?? 'email')
}

export async function GET() {
  const service = getServiceClient()
  if (!service.client) {
    return NextResponse.json({ error: service.error }, { status: service.status })
  }

  try {
    const users: any[] = []
    let page = 1

    while (true) {
      const { data, error } = await service.client.auth.admin.listUsers({ page, perPage: 1000 })
      if (error) throw error
      users.push(...data.users)
      if (data.users.length < 1000) break
      page++
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const rows = users
      .map((user) => ({
        id: user.id,
        email: user.email ?? null,
        name: nameFromMetadata(user.user_metadata, user.email),
        provider: providerFromUser(user),
        created_at: user.created_at ?? null,
        last_sign_in_at: user.last_sign_in_at ?? null,
        email_confirmed_at: user.email_confirmed_at ?? null,
        phone: user.phone ?? null,
        role: user.role ?? null,
        banned_until: user.banned_until ?? null,
        metadata: {
          profile_color: user.user_metadata?.profile_color ?? null,
          locale: user.user_metadata?.locale ?? null,
        },
      }))
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())

    return NextResponse.json({
      users: rows,
      summary: {
        totalMembers: rows.length,
        newToday: rows.filter((user) => user.created_at && new Date(user.created_at) >= today).length,
        confirmedEmails: rows.filter((user) => user.email_confirmed_at).length,
        googleMembers: rows.filter((user) => String(user.provider).includes('google')).length,
        emailMembers: rows.filter((user) => String(user.provider).includes('email')).length,
      },
      newestUser: rows[0] ?? null,
      loadedAt: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load admin users'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
