/**
 * Generate Apple OAuth client secret (JWT) for Supabase Apple provider.
 *
 * Usage:
 *   APPLE_TEAM_ID=XXXXXXXXXX \
 *   APPLE_KEY_ID=YYYYYYYYYY \
 *   APPLE_CLIENT_ID=com.flushpin.app.web \
 *   APPLE_PRIVATE_KEY="$(cat AuthKey_YYYYYYYYYY.p8)" \
 *   npm run generate:apple-secret
 *
 * Paste output into Supabase → Authentication → Providers → Apple → Secret Key.
 * Regenerate every ~6 months.
 */
import { SignJWT, importPKCS8 } from 'jose'

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    console.error(`Missing ${name}`)
    process.exit(1)
  }
  return value
}

async function main() {
  const teamId = requireEnv('APPLE_TEAM_ID')
  const keyId = requireEnv('APPLE_KEY_ID')
  const clientId = requireEnv('APPLE_CLIENT_ID')
  const privateKeyPem = requireEnv('APPLE_PRIVATE_KEY').replace(/\\n/g, '\n')

  const key = await importPKCS8(privateKeyPem, 'ES256')
  const secret = await new SignJWT({})
    .setAudience('https://appleid.apple.com')
    .setIssuer(teamId)
    .setSubject(clientId)
    .setIssuedAt()
    .setExpirationTime('180d')
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .sign(key)

  console.log('\nApple OAuth client secret (valid ~180 days):\n')
  console.log(secret)
  console.log('\nPaste into Supabase → Authentication → Apple → Secret Key')
  console.log(`Services ID (APPLE_CLIENT_ID): ${clientId}`)
  console.log('Client IDs order in Supabase: Services ID first, then com.flushpin.app')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
