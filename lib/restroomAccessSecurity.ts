export const PUBLIC_RESTROOM_ACCESS_FIELDS =
  'id, name, address, score, pin_updated_at, status, verified, accessible, has_baby_changing, access_type, has_code, lat, lng, place_id'

export const SENSITIVE_PIN_FIELDS = new Set(['pin', 'pin_male', 'pin_female'])

export type AuthorizedAccessResult =
  | { status: 'success'; pin: string | null }
  | { status: 'unauthenticated' }
  | { status: 'denied'; message: string }
  | { status: 'invalid_restroom' }

export type AccessRpcClient = {
  auth: {
    getSession: () => Promise<{
      data: { session: { access_token?: string } | null }
      error?: unknown
    }>
  }
  rpc: (
    name: string,
    args: { restroom_id: number },
  ) => Promise<{
    data: unknown
    error: { message?: string } | null
  }>
}

export function sensitivePinFieldInPayload(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = sensitivePinFieldInPayload(item)
      if (found) return found
    }
    return null
  }

  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_PIN_FIELDS.has(key.toLowerCase())) return key
    const found = sensitivePinFieldInPayload(nested)
    if (found) return found
  }
  return null
}

export function assertPinFreePayload(value: unknown, surface = 'Public response'): void {
  const field = sensitivePinFieldInPayload(value)
  if (field) throw new Error(`${surface} must not contain ${field}`)
}

export function stripSensitivePinFields<T extends Record<string, unknown>>(record: T): Omit<T, 'pin' | 'pin_male' | 'pin_female'> {
  const { pin: _pin, pin_male: _pinMale, pin_female: _pinFemale, ...safe } = record
  void _pin
  void _pinMale
  void _pinFemale
  return safe
}

export async function requestAuthorizedRestroomAccess(
  restroomId: number,
  client: AccessRpcClient,
): Promise<AuthorizedAccessResult> {
  if (!Number.isInteger(restroomId) || restroomId <= 0) return { status: 'invalid_restroom' }

  const { data: sessionData } = await client.auth.getSession()
  if (!sessionData.session?.access_token) return { status: 'unauthenticated' }

  const { data, error } = await client.rpc('get_restroom_access_code', {
    restroom_id: restroomId,
  })
  if (error) {
    return {
      status: 'denied',
      message: 'You are not authorized to view this restroom access code.',
    }
  }

  const row = Array.isArray(data) ? data[0] : data
  if (!row || typeof row !== 'object') return { status: 'success', pin: null }
  const rawPin = (row as { pin?: unknown }).pin
  return {
    status: 'success',
    pin: typeof rawPin === 'string' && rawPin.trim() ? rawPin.trim() : null,
  }
}
