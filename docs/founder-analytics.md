# Founder Dashboard

Private founder-only dashboard at **https://www.flushpin.com/admin**.

## Login method

1. Open `https://www.flushpin.com/admin`
2. Sign in with your **FlushPin Supabase email + password** (the founder account)
3. Server checks your session JWT, then allowlists your email via `ADMIN_EMAILS`
4. Authorized → Founder Dashboard  
   Unauthorized → **Access Denied (403)** with Sign out  
   Flag off / unauthenticated page probe → **404** when `ADMIN_DASHBOARD_ENABLED` is not `true`

Session persists across refresh via Supabase client auth.

## Required Vercel environment variables (Production)

| Variable | Required | Purpose |
|---|---|---|
| `ADMIN_DASHBOARD_ENABLED` | **Yes** | Must be `true` or `/admin` returns 404 |
| `ADMIN_EMAILS` | **Yes** | Comma-separated founder emails (e.g. `you@flushpin.com`) |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Validates Bearer JWT (public anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Server-only metrics (Auth Admin, pin_views, etc.) |
| `VERCEL_TOKEN` | For traffic metrics | Web Analytics API token |
| `VERCEL_PROJECT_ID` | For traffic metrics | FlushPin Vercel project id |
| `VERCEL_TEAM_ID` | If team-owned project | Team id for Analytics API |

Never put `SUPABASE_SERVICE_ROLE_KEY` or `VERCEL_TOKEN` in `NEXT_PUBLIC_*` vars.

## Security model

1. Layout gate: `ADMIN_DASHBOARD_ENABLED`
2. Client: Supabase email/password session
3. `/admin/session` + every admin API: `Authorization: Bearer <access_token>`
4. `lib/adminRequestAuth.ts`: validate JWT → email must be in `ADMIN_EMAILS`
5. Service role + Vercel token used only in server route handlers
6. `robots.txt` disallows `/admin`
7. Investor view: aggregates only; Workspace/Ops hidden

Protected routes (all call `authorizeAdminRequest`):

- `/admin/session`
- `/admin/analytics`
- `/admin/data`
- `/admin/live`
- `/admin/moderation`
- `/admin/business-claims`
- `/api/admin/stats`

## Real vs pending metrics

**Real today:** visitors/page views (when Vercel Analytics API configured), new members, signed-in actives, access views, community contributions, business offer funnel, geography (countries/routes from Vercel; cities + top restrooms from `pin_views`).

**Tracking coming soon** (no fake numbers): restroom searches, detail views, App Store clicks, QR redemptions.

Proposed schema (not applied): `migrations-proposed/analytics-events.sql`

## Local enablement

Add to `.env.local` (never commit):

```bash
ADMIN_DASHBOARD_ENABLED=true
ADMIN_EMAILS=your-founder@email.com
# plus existing Supabase keys
# optional: VERCEL_TOKEN, VERCEL_PROJECT_ID, VERCEL_TEAM_ID
```
