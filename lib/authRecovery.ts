/** Canonical redirect target for Supabase resetPasswordForEmail. */
export function getPasswordResetRedirectUrl(origin: string): string {
  const base = origin.replace(/\/$/, '')
  return `${base}/signup`
}

/** True when the auth event is a password-recovery session. */
export function isPasswordRecoveryEvent(event: string): boolean {
  return event === 'PASSWORD_RECOVERY'
}

/**
 * Detect recovery tokens in the URL hash (implicit / older Supabase links).
 * Example: #access_token=...&type=recovery&refresh_token=...
 */
export function isRecoveryHash(hash: string): boolean {
  if (!hash) return false
  const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
  return params.get('type') === 'recovery'
}

/**
 * Detect recovery intent in the query string.
 * PKCE links often look like /signup?code=... (session exchanged by client).
 * Explicit ?type=recovery is also accepted.
 */
export function isRecoverySearch(search: string): boolean {
  if (!search) return false
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  return params.get('type') === 'recovery'
}

/** Strip auth params from the current URL without a full reload. */
export function cleanAuthParamsFromUrl(href: string): string {
  const url = new URL(href)
  ;['code', 'type', 'error', 'error_description', 'error_code'].forEach((key) => {
    url.searchParams.delete(key)
  })
  url.hash = ''
  return `${url.pathname}${url.search}`
}
