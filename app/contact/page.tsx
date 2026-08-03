'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle2, Mail, MapPin, Building2 } from 'lucide-react'

type FormState = {
  name: string
  email: string
  subject: string
  message: string
  website: string
}

const emptyForm: FormState = {
  name: '',
  email: '',
  subject: '',
  message: '',
  website: '',
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (submitting) return

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in your name, email, and message.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
          website: form.website,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Something went wrong. Please try again.')
        return
      }
      setSent(true)
    } catch {
      setError('Network error — please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-fp-border bg-fp-white px-4 py-3 text-base text-fp-ink outline-none transition-colors focus:border-fp-teal focus:ring-2 focus:ring-fp-teal/20'

  return (
    <main className="min-h-screen bg-fp-white">
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-fp-ink md:text-4xl">Contact Us</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-fp-gray-600">
            Have a question, feedback, or want to list your business? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="fp-card p-6">
              <MapPin className="mb-3 h-6 w-6 text-fp-teal" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-fp-ink">Office Address</h2>
              <p className="mt-2 text-sm leading-relaxed text-fp-gray-600">
                400 Spectrum Center Drive
                <br />
                Irvine, CA 92618
                <br />
                United States
              </p>
            </div>

            <div className="fp-card p-6">
              <Mail className="mb-3 h-6 w-6 text-fp-teal" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-fp-ink">Email</h2>
              <a
                href="mailto:admin@flushpin.com"
                className="mt-2 inline-block text-sm font-semibold text-fp-teal no-underline hover:text-fp-teal-dark"
              >
                admin@flushpin.com
              </a>
              <p className="mt-2 text-xs text-fp-gray-400">We respond within 24 hours</p>
            </div>

            <div className="rounded-2xl border border-fp-teal/30 bg-fp-teal-tint p-6">
              <Building2 className="mb-3 h-6 w-6 text-fp-teal-dark" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-fp-ink">For Businesses</h2>
              <p className="mt-2 text-sm leading-relaxed text-fp-gray-600">
                Want to list your business or learn about Free Listing and paid plans?
              </p>
              <Link
                href="/business#packages"
                className="mt-4 inline-flex rounded-full bg-fp-teal px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-fp-teal-dark"
              >
                View business plans
              </Link>
            </div>
          </div>

          <div>
            {sent ? (
              <div className="fp-card p-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-fp-teal" aria-hidden="true" />
                <h2 className="mt-4 text-xl font-bold text-fp-ink">Message sent</h2>
                <p className="mt-3 text-sm leading-relaxed text-fp-gray-600">
                  Thank you for reaching out. We&apos;ll get back to you at{' '}
                  <strong className="text-fp-ink">{form.email}</strong> within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false)
                    setForm(emptyForm)
                  }}
                  className="mt-6 inline-flex rounded-full bg-fp-teal px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fp-teal-dark"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="fp-card space-y-5 p-6 md:p-8" noValidate>
                <h2 className="text-xl font-bold text-fp-ink">Send us a message</h2>

                <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                  <label htmlFor="contact-website">Website</label>
                  <input
                    id="contact-website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(e) => update('website', e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold text-fp-ink">
                    Your name
                  </label>
                  <input
                    id="contact-name"
                    className={inputClass}
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold text-fp-ink">
                    Email address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    className={inputClass}
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="contact-subject" className="mb-2 block text-sm font-semibold text-fp-ink">
                    Subject <span className="font-normal text-fp-gray-400">(optional)</span>
                  </label>
                  <input
                    id="contact-subject"
                    className={inputClass}
                    value={form.subject}
                    onChange={(e) => update('subject', e.target.value)}
                    placeholder="e.g. Business listing inquiry"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold text-fp-ink">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    className={`${inputClass} resize-y`}
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    placeholder="Tell us how we can help..."
                    required
                  />
                </div>

                {error && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-fp-teal px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-fp-teal-dark disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Sending…' : 'Send message'}
                </button>
                <p className="text-center text-xs text-fp-gray-400">
                  Or email us directly at admin@flushpin.com
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
