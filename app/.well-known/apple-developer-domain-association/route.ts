/** Serves Apple domain verification file from Vercel env (paste from Apple Developer → Services ID → Configure). */
export async function GET() {
  const body = process.env.APPLE_DOMAIN_ASSOCIATION?.trim()
  if (!body) {
    return new Response('Apple domain verification not configured yet.', { status: 404 })
  }

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
