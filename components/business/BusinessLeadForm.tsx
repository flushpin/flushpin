'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'

type PlanId = 'free' | 'starter' | 'business' | 'multi' | 'not_sure'
type BusinessType = 'cafe' | 'restaurant' | 'retail' | 'gas' | 'other'
type FootTraffic = 'under_50' | '50_150' | '150_400' | '400_plus'
type CodeFrequency = 'rarely' | 'few_times_daily' | 'constantly'

type FormState = {
  businessName: string
  businessType: BusinessType | ''
  streetAddress: string
  city: string
  contactName: string
  contactEmail: string
  contactPhone: string
  dailyFootTraffic: FootTraffic | ''
  restroomCodeFrequency: CodeFrequency | ''
  plan: PlanId
  locationCount: string
  notes: string
  website: string
}

type FieldErrors = Partial<Record<keyof FormState | 'submit', string>>

const PLAN_OPTIONS: { id: PlanId; label: string }[] = [
  { id: 'free', label: 'Free Listing' },
  { id: 'starter', label: 'Starter QR ($9/mo)' },
  { id: 'business', label: 'Business ($29/mo)' },
  { id: 'multi', label: 'Multi-Location ($49/mo)' },
  { id: 'not_sure', label: 'Not sure yet' },
]

const BUSINESS_TYPE_OPTIONS: { id: BusinessType; label: string }[] = [
  { id: 'cafe', label: 'Cafe' },
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'retail', label: 'Retail' },
  { id: 'gas', label: 'Gas station' },
  { id: 'other', label: 'Other' },
]

const FOOT_TRAFFIC_OPTIONS: { id: FootTraffic; label: string }[] = [
  { id: 'under_50', label: 'Under 50' },
  { id: '50_150', label: '50–150' },
  { id: '150_400', label: '150–400' },
  { id: '400_plus', label: '400+' },
]

const CODE_FREQUENCY_OPTIONS: { id: CodeFrequency; label: string }[] = [
  { id: 'rarely', label: 'Rarely' },
  { id: 'few_times_daily', label: 'A few times a day' },
  { id: 'constantly', label: 'Constantly' },
]

const VALID_PLANS = new Set<string>(['free', 'starter', 'business', 'multi', 'not_sure'])

function parsePlanParam(value: string | null): PlanId {
  if (value && VALID_PLANS.has(value)) return value as PlanId
  return 'not_sure'
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function PillGroup<T extends string>({
  label,
  hint,
  options,
  value,
  onChange,
  error,
  name,
}: {
  label: string
  hint?: string
  options: { id: T; label: string }[]
  value: T | ''
  onChange: (value: T) => void
  error?: string
  name: string
}) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="mb-1 block text-sm font-semibold text-fp-ink">{label}</legend>
      {hint && <p className="mb-3 text-sm text-fp-gray-600">{hint}</p>}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const selected = value === option.id
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              name={name}
              onClick={() => onChange(option.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                selected
                  ? 'border-fp-teal bg-fp-teal-tint text-fp-teal-dark'
                  : 'border-fp-border bg-fp-white text-fp-ink hover:border-fp-teal'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </fieldset>
  )
}

export default function BusinessLeadForm() {
  const searchParams = useSearchParams()
  const initialPlan = useMemo(() => parsePlanParam(searchParams.get('plan')), [searchParams])

  const [form, setForm] = useState<FormState>({
    businessName: '',
    businessType: '',
    streetAddress: '',
    city: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    dailyFootTraffic: '',
    restroomCodeFrequency: '',
    plan: initialPlan,
    locationCount: '',
    notes: '',
    website: '',
  })

  useEffect(() => {
    setForm((prev) => ({ ...prev, plan: initialPlan }))
  }, [initialPlan])
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const inputClass =
    'w-full rounded-xl border border-fp-border px-4 py-3 text-base text-fp-ink outline-none transition-colors focus:border-fp-teal focus:ring-2 focus:ring-fp-teal/20'

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      delete next.submit
      return next
    })
    setSubmitError('')
  }

  const validate = (): FieldErrors => {
    const next: FieldErrors = {}
    if (!form.businessName.trim()) next.businessName = 'Business name is required.'
    if (!form.businessType) next.businessType = 'Please choose a business type.'
    if (!form.streetAddress.trim()) next.streetAddress = 'Street address is required.'
    if (!form.city.trim()) next.city = 'City is required.'
    if (!form.contactName.trim()) next.contactName = 'Your name is required.'
    if (!form.contactEmail.trim()) next.contactEmail = 'Email is required.'
    else if (!isValidEmail(form.contactEmail.trim())) next.contactEmail = 'Enter a valid email address.'
    if (!form.dailyFootTraffic) next.dailyFootTraffic = 'Please choose an option.'
    if (!form.restroomCodeFrequency) next.restroomCodeFrequency = 'Please choose an option.'
    if (!form.plan) next.plan = 'Please choose a plan.'
    if (form.plan === 'multi') {
      const count = Number(form.locationCount)
      if (!form.locationCount.trim() || !Number.isInteger(count) || count < 2) {
        next.locationCount = 'Enter at least 2 locations.'
      }
    }
    return next
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const validation = validate()
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/business-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: form.businessName.trim(),
          business_type: form.businessType,
          street_address: form.streetAddress.trim(),
          city: form.city.trim(),
          contact_name: form.contactName.trim(),
          contact_email: form.contactEmail.trim(),
          contact_phone: form.contactPhone.trim() || null,
          daily_foot_traffic: form.dailyFootTraffic,
          restroom_code_frequency: form.restroomCodeFrequency,
          plan: form.plan,
          location_count: form.plan === 'multi' ? Number(form.locationCount) : null,
          notes: form.notes.trim() || null,
          website: form.website,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSubmitError(typeof data.error === 'string' ? data.error : 'Something went wrong. Please try again.')
        return
      }
      setSuccess(true)
    } catch {
      setSubmitError('Network error — please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <div className="fp-card bg-fp-white p-8 md:p-10">
          <CheckCircle2 className="mx-auto h-14 w-14 text-fp-teal" aria-hidden="true" />
          <h1 className="mt-5 text-2xl font-bold text-fp-ink md:text-3xl">Got it — we&apos;ll reach out shortly!</h1>
          <p className="mt-4 text-base leading-relaxed text-fp-gray-600">
            Your QR sticker ships as soon as we confirm your details. Questions meanwhile?{' '}
            <Link href="/contact" className="font-semibold text-fp-teal no-underline hover:text-fp-teal-dark">
              Visit our contact page
            </Link>
            .
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center md:mb-10">
        <span className="inline-flex rounded-full bg-fp-teal-tint px-4 py-1.5 text-sm font-semibold text-fp-teal-dark">
          FlushPin for Businesses
        </span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-fp-ink md:text-4xl">
          Let&apos;s get your shop set up
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-fp-gray-600">
          Answer a few quick questions and we&apos;ll reach out shortly — and ship your QR sticker.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="fp-card space-y-7 bg-fp-white p-6 md:p-8" noValidate>
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => update('website', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="business-name" className="mb-2 block text-sm font-semibold text-fp-ink">
            Business name
          </label>
          <input
            id="business-name"
            className={inputClass}
            value={form.businessName}
            onChange={(e) => update('businessName', e.target.value)}
            autoComplete="organization"
          />
          {errors.businessName && <p className="mt-2 text-sm text-red-600">{errors.businessName}</p>}
        </div>

        <PillGroup
          name="business-type"
          label="Business type"
          options={BUSINESS_TYPE_OPTIONS}
          value={form.businessType}
          onChange={(value) => update('businessType', value)}
          error={errors.businessType}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="street-address" className="mb-2 block text-sm font-semibold text-fp-ink">
              Street address
            </label>
            <input
              id="street-address"
              className={inputClass}
              value={form.streetAddress}
              onChange={(e) => update('streetAddress', e.target.value)}
              autoComplete="street-address"
            />
            {errors.streetAddress && <p className="mt-2 text-sm text-red-600">{errors.streetAddress}</p>}
          </div>
          <div>
            <label htmlFor="city" className="mb-2 block text-sm font-semibold text-fp-ink">
              City
            </label>
            <input
              id="city"
              className={inputClass}
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              autoComplete="address-level2"
            />
            {errors.city && <p className="mt-2 text-sm text-red-600">{errors.city}</p>}
          </div>
        </div>
        <p className="-mt-3 text-sm text-fp-gray-600">So we can mail your QR sticker</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold text-fp-ink">
              Your name
            </label>
            <input
              id="contact-name"
              className={inputClass}
              value={form.contactName}
              onChange={(e) => update('contactName', e.target.value)}
              autoComplete="name"
            />
            {errors.contactName && <p className="mt-2 text-sm text-red-600">{errors.contactName}</p>}
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold text-fp-ink">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              className={inputClass}
              value={form.contactEmail}
              onChange={(e) => update('contactEmail', e.target.value)}
              autoComplete="email"
            />
            {errors.contactEmail && <p className="mt-2 text-sm text-red-600">{errors.contactEmail}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="contact-phone" className="mb-2 block text-sm font-semibold text-fp-ink">
            Phone <span className="font-normal text-fp-gray-600">(optional — fastest way to reach you)</span>
          </label>
          <input
            id="contact-phone"
            type="tel"
            className={inputClass}
            value={form.contactPhone}
            onChange={(e) => update('contactPhone', e.target.value)}
            autoComplete="tel"
          />
        </div>

        <PillGroup
          name="foot-traffic"
          label="About how many customers walk in on a busy day?"
          options={FOOT_TRAFFIC_OPTIONS}
          value={form.dailyFootTraffic}
          onChange={(value) => update('dailyFootTraffic', value)}
          error={errors.dailyFootTraffic}
        />

        <PillGroup
          name="code-frequency"
          label="How often do people ask for your restroom code?"
          options={CODE_FREQUENCY_OPTIONS}
          value={form.restroomCodeFrequency}
          onChange={(value) => update('restroomCodeFrequency', value)}
          error={errors.restroomCodeFrequency}
        />

        <PillGroup
          name="plan"
          label="Plan"
          options={PLAN_OPTIONS}
          value={form.plan}
          onChange={(value) => update('plan', value)}
          error={errors.plan}
        />

        {form.plan === 'multi' && (
          <div>
            <label htmlFor="location-count" className="mb-2 block text-sm font-semibold text-fp-ink">
              How many locations?
            </label>
            <input
              id="location-count"
              type="number"
              min={2}
              step={1}
              className={`${inputClass} max-w-[160px]`}
              value={form.locationCount}
              onChange={(e) => update('locationCount', e.target.value)}
            />
            {errors.locationCount && <p className="mt-2 text-sm text-red-600">{errors.locationCount}</p>}
          </div>
        )}

        <div>
          <label htmlFor="notes" className="mb-2 block text-sm font-semibold text-fp-ink">
            Anything we should know? <span className="font-normal text-fp-gray-600">(optional)</span>
          </label>
          <textarea
            id="notes"
            rows={4}
            className={`${inputClass} resize-y`}
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
          />
        </div>

        {submitError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-fp-teal px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-fp-teal-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? 'Sending…' : 'Send my info'}
        </button>
      </form>
    </div>
  )
}
