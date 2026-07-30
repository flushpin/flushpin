type ReleaseEnvironment = Record<string, string | undefined>

function explicitlyEnabled(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === 'true'
}

function assertServerRuntime(): void {
  if (typeof window !== 'undefined') {
    throw new Error('Server release flags cannot be read in the browser')
  }
}

export function isTripStopsEnabled(
  env: ReleaseEnvironment = process.env,
): boolean {
  assertServerRuntime()
  return explicitlyEnabled(env.TRIP_STOPS_ENABLED)
}
