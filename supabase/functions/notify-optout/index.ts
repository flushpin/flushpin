import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const ADMIN_ALERT_EMAIL = Deno.env.get("ADMIN_ALERT_EMAIL") ?? "34johnertan@gmail.com"
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "FlushPin <onboarding@resend.dev>"

type OptOutRecord = {
  business_name?: string | null
  city?: string | null
  email?: string | null
  reason?: string | null
  created_at?: string | null
  contact_name?: string | null
}

type WebhookPayload = {
  type?: string
  table?: string
  schema?: string
  record?: OptOutRecord
}

function formatSubmittedAt(value: string | null | undefined): string {
  if (!value) return new Date().toISOString()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
}

async function sendOptOutEmail(record: OptOutRecord) {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured on the Edge Function")
  }

  const businessName = record.business_name?.trim() || "Unknown"
  const location = record.city?.trim() || "—"
  const contactEmail = record.email?.trim() || "—"
  const reason = record.reason?.trim() || "—"
  const submittedAt = formatSubmittedAt(record.created_at)
  const contactName = record.contact_name?.trim()

  const subject = "⚠️ New Opt-Out Request — FlushPin"
  const text = [
    "A new opt-out request was submitted on FlushPin.",
    "",
    `Business name: ${businessName}`,
    `Location: ${location}`,
    ...(contactName ? [`Contact name: ${contactName}`] : []),
    `Contact email: ${contactEmail}`,
    `Reason: ${reason}`,
    `Submitted at: ${submittedAt}`,
    "",
    "Review in admin: https://www.flushpin.com/admin",
  ].join("\n")

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: [ADMIN_ALERT_EMAIL],
      subject,
      text,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend API error (${res.status}): ${body}`)
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const payload = (await req.json()) as WebhookPayload
    const record = payload.record

    if (!record) {
      return new Response(JSON.stringify({ error: "Missing record in webhook payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (payload.table && payload.table !== "optout_requests") {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    await sendOptOutEmail(record)

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("notify-optout failed:", message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
