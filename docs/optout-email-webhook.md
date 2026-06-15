# Opt-out email alerts (Supabase Edge Function + Database Webhook)

When a row is inserted into `public.optout_requests`, Supabase calls the `notify-optout` Edge Function, which sends an email via Resend.

**Web only.** The mobile app repo is not involved.

## Email

| Field | Value |
|-------|--------|
| To | `ADMIN_ALERT_EMAIL` secret (default: `34johnertan@gmail.com`) |
| Subject | `⚠️ New Opt-Out Request — FlushPin` |
| Body | Business name, location (`city`), contact email, reason, submitted at |

Note: `optout_requests` has `city`, not a full street `address`.

## 1. Edge Function secrets (Supabase Dashboard)

Project → **Edge Functions** → **Secrets**:

| Secret | Example |
|--------|---------|
| `RESEND_API_KEY` | `re_...` from [Resend](https://resend.com) |
| `ADMIN_ALERT_EMAIL` | `34johnertan@gmail.com` |
| `RESEND_FROM_EMAIL` | `FlushPin <alerts@flushpin.com>` (must be verified in Resend) |

## 2. Deploy the function (from web repo)

```bash
cd ~/flushpin
supabase link --project-ref ygpsgolbxyychdnzeorj
supabase functions deploy notify-optout
```

## 3. Database Webhook (Supabase Dashboard)

Project → **Database** → **Webhooks** → **Create a new hook**:

| Setting | Value |
|---------|--------|
| Name | `notify-optout-on-insert` |
| Table | `optout_requests` |
| Events | **Insert** |
| Type | **Supabase Edge Functions** |
| Function | `notify-optout` |
| HTTP method | POST |

Save the webhook.

## 4. Test

1. Submit a test request at https://www.flushpin.com/optout  
2. Check **Edge Functions → notify-optout → Logs** in Supabase  
3. Confirm email at `34johnertan@gmail.com`  
4. Confirm row appears in admin → **Business Claims** → opt-out section  

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| No email | Set `RESEND_API_KEY` + verified `RESEND_FROM_EMAIL` on Edge Function secrets |
| 500 in function logs | Resend domain/sender not verified |
| Webhook never fires | Confirm Database Webhook is enabled on `INSERT` for `optout_requests` |
| Duplicate emails | One webhook only; avoid also sending from Next.js API for the same insert |
