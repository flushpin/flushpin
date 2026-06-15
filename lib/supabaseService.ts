import { createClient, SupabaseClient } from '@supabase/supabase-js'

type ServiceClientResult =
  | { client: SupabaseClient; error?: undefined }
  | { client?: undefined; error: string; status: 503 | 500 }

function supabaseProjectRef(url: string): string | null {
  return url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? null
}

export function validateServiceRoleKey(rawKey: string | undefined): { key: string } | { error: string } {
  if (!rawKey?.trim()) {
    return { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server.' }
  }

  const key = rawKey.trim()
  const parts = key.split('.')
  if (parts.length !== 3) {
    return { error: 'SUPABASE_SERVICE_ROLE_KEY is not a valid JWT (check for extra spaces or a truncated copy).' }
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString()) as { role?: string; ref?: string }
    if (payload.role === 'anon') {
      return {
        error:
          'SUPABASE_SERVICE_ROLE_KEY is the anon (public) key. In Supabase → Project Settings → API, copy the service_role secret instead.',
      }
    }
    if (payload.role !== 'service_role') {
      return { error: `SUPABASE_SERVICE_ROLE_KEY has role "${payload.role ?? 'unknown'}" — it must be service_role.` }
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
    const urlRef = url ? supabaseProjectRef(url) : null
    if (urlRef && payload.ref && urlRef !== payload.ref) {
      return {
        error: `SUPABASE_SERVICE_ROLE_KEY belongs to project "${payload.ref}" but NEXT_PUBLIC_SUPABASE_URL points to "${urlRef}". Use keys from the same Supabase project.`,
      }
    }
  } catch {
    return { error: 'SUPABASE_SERVICE_ROLE_KEY is not a valid JWT (check for extra spaces or a truncated copy).' }
  }

  return { key }
}

export function getServiceClient(): ServiceClientResult {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  if (!url) {
    return { error: 'NEXT_PUBLIC_SUPABASE_URL is not configured on the server.', status: 503 }
  }

  const keyResult = validateServiceRoleKey(process.env.SUPABASE_SERVICE_ROLE_KEY)
  if ('error' in keyResult) {
    return { error: keyResult.error, status: 503 }
  }

  return {
    client: createClient(url, keyResult.key, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  }
}
