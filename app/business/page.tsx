'use client'
import { useState } from 'react'
import Link from 'next/link'

const FORMSPREE_ID = 'maqkrnep'

const stats = [
  { number: '2.3×', label: 'more likely to enter a business when restroom access is confirmed' },
  { number: '68%', label: 'of restroom visitors make a purchase when shown a relevant offer' },
  { number: '4 min', label: 'average time a customer spends inside after finding your restroom' },
]

const insights = [
  {
    icon: '📊',
    title: 'Foot Traffic Intelligence',
    desc: 'Understand restroom demand, peak hours, and intent traffic signals at your location. Know when people are coming — and why.',
  },
  {
    icon: '🎯',
    title: 'Customer Recovery',
    desc: 'Someone came for the restroom. Give them a reason to stay, buy, or return. Show your offer before they walk away.',
  },
  {
    icon: '✅',
    title: 'Restroom Experience Management',
    desc: 'Keep restroom info accurate, reduce complaints, and build the trust that keeps customers coming back.',
  },
]

const plans = [
  {
    name: 'Business',
    badge: 'Get Started',
    badgeColor: '#0EB5AB',
    price: null,
    priceLabel: 'Free forever',
    bg: '#f8fffe',
    border: '#c8ede9',
    cta: 'Claim Your Listing',
    ctaBg: '#0A2E1F',
    ctaHref: '/business/claim',
    features: [
      'Claim your listing on FlushPin',
      'Update restroom access info',
      'Appear in user searches',
      'Community visibility across iOS & web',
      '1 location',
    ],
  },
  {
    name: 'Business Pro',
    badge: 'Recommended',
    badgeColor: '#D97706',
    price: null,
    priceLabel: 'Contact us for pricing',
    bg: '#0A2E1F',
    border: '#0A2E1F',
    dark: true,
    cta: 'Book a Demo',
    ctaBg: '#0EB5AB',
    ctaHref: null,
    features: [
      'Everything in Community',
      'Monthly Restroom Intent Traffic report',
      'Peak demand hours dashboard',
      'Promo visibility before restroom access',
      'Priority fix for incorrect listings',
      'Verified Business badge',
      'QR sticker pack (mailed to you)',
      'Multi-location management',
      'Chain analytics & benchmarking',
      'Dedicated account support',
    ],
  },
]

const faqs = [
  {
    q: 'What does "restroom intent traffic" mean?',
    a: 'It refers to people who actively searched for or viewed restroom access at your location on FlushPin. This is demand signal data — not guaranteed conversions, but real behavioral interest from nearby customers.',
  },
  {
    q: 'How is FlushPin different from other restroom finder apps?',
    a: 'We ran a side-by-side test in the same neighborhood. FlushPin found the nearest verified restroom, confirmed it had a baby changing station, noted accessible entry for guests with disabilities, and showed accurate access info in real time. The competing app directed users to a location 0.5 miles away — which was closed — with no additional details. FlushPin wins on proximity, accuracy, and information depth.',
  },
  {
    q: 'What does the promo before restroom access look like?',
    a: 'Before a user sees your restroom PIN or access info, they see a short, branded offer from your business — like "Free coffee refill with any purchase today." It\'s 4 seconds, skippable, and drives real foot traffic, not just impressions.',
  },
  {
    q: 'Can I manage multiple locations?',
    a: 'Yes. Business Intelligence includes a multi-location dashboard with regional comparison, chain analytics, real-time alerts, and notifications to your field managers.',
  },
  {
    q: 'Is there a contract?',
    a: 'No long-term contracts. Plans are billed monthly per location. Cancel anytime.',
  },
]

export default function BusinessPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showDemo, setShowDemo] = useState(false)
  const [form, setForm] = useState({ name: '', business: '', email: '', locations: '1', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleDemoSubmit = async () => {
    if (!form.name || !form.email || !form.business) return
    setSending(true)
    try {
      await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _subject: `FlushPin Business Demo Request — ${form.business}`,
          type: 'Business Demo Request',
          name: form.name,
          business: form.business,
          email: form.email,
          locations: form.locations,
          message: form.message || '—',
        }),
      })
      setSent(true)
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: '9px',
    border: '1px solid #e0e0e0', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', color: '#1a1a1a',
    fontFamily: "'Inter',system-ui,sans-serif",
  }
  const lbl: React.CSSProperties = {
    fontSize: '12px', fontWeight: 600, color: '#444',
    marginBottom: '6px', display: 'block',
  }

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: '#fff', minHeight: '100vh', color: '#1a1a1a' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f0f0f0', maxWidth: '1100px', margin: '0 auto' }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <img src="/flushpin-logo.png" alt="FlushPin" className="h-12 w-auto" />
        </a>
        <Link href="/" style={{ fontSize: '14px', color: '#666', textDecoration: 'none' }}>← Back to home</Link>
      </nav>

      {/* HERO */}
      <section style={{ textAlign: 'center', padding: '72px 24px 56px', maxWidth: '780px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: '#f0fdfb', border: '1px solid #c8ede9', borderRadius: '100px', padding: '6px 16px', fontSize: '12px', fontWeight: 600, color: '#0EB5AB', letterSpacing: '0.05em', marginBottom: '24px' }}>
          FOR BUSINESSES
        </div>
        <h1 style={{ fontSize: 'clamp(32px,6vw,58px)', fontWeight: 800, lineHeight: 1.1, color: '#0A2E1F', margin: '0 0 20px', fontFamily: "'Space Grotesk','Inter',sans-serif", letterSpacing: '-1px' }}>
          Turn restroom traffic<br />into customer opportunity
        </h1>
        <p style={{ fontSize: '18px', color: '#555', lineHeight: 1.7, margin: '0 0 36px', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto' }}>
          Understand restroom demand, recover missed customers, and improve customer experience before people walk away.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setShowDemo(true)} style={{ background: '#0EB5AB', color: 'white', border: 'none', borderRadius: '12px', padding: '14px 28px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Space Grotesk','Inter',sans-serif" }}>
            Book a Demo
          </button>
          <Link href="/business/claim" style={{ background: '#f5f5f5', color: '#0A2E1F', borderRadius: '12px', padding: '14px 28px', fontSize: '16px', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
            Claim Free Listing
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#f8fffe', padding: '48px 24px', borderTop: '1px solid #e8f5f3', borderBottom: '1px solid #e8f5f3' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '32px', textAlign: 'center' }}>
          {stats.map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '42px', fontWeight: 800, color: '#0EB5AB', fontFamily: "'Space Grotesk','Inter',sans-serif", letterSpacing: '-1px' }}>{s.number}</div>
              <div style={{ fontSize: '14px', color: '#555', lineHeight: 1.5, marginTop: '8px', maxWidth: '200px', margin: '8px auto 0' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* INSIGHTS */}
      <section id="insights-section" style={{ padding: '72px 24px', maxWidth: '980px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 800, color: '#0A2E1F', fontFamily: "'Space Grotesk','Inter',sans-serif", letterSpacing: '-0.5px', margin: '0 0 12px' }}>
            What FlushPin gives your business
          </h2>
          <p style={{ color: '#666', fontSize: '16px' }}>Data and tools built around the most overlooked customer touchpoint.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px' }}>
          {insights.map((item, i) => (
            <div key={i} style={{ background: '#f8fffe', border: '1px solid #e0f5f2', borderRadius: '16px', padding: '28px 24px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '17px', color: '#0A2E1F', marginBottom: '8px', fontFamily: "'Space Grotesk','Inter',sans-serif" }}>{item.title}</div>
              <div style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COSTCO CALLOUT */}
      <section style={{ background: '#0A2E1F', padding: '56px 24px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0EB5AB', letterSpacing: '0.1em', marginBottom: '16px' }}>THE OPPORTUNITY</div>
          <h2 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 800, color: 'white', fontFamily: "'Space Grotesk','Inter',sans-serif", lineHeight: 1.2, margin: '0 0 20px' }}>
            Your competitors are invisible. You don&apos;t have to be.
          </h2>
          <p style={{ color: '#9FE1CB', fontSize: '16px', lineHeight: 1.7, margin: '0 0 32px' }}>
            We tested two restroom apps in the same neighborhood. FlushPin found the closest restroom, confirmed it had a baby changing station, flagged accessible entry for guests with disabilities, and showed real-time access info. The other app pointed to a location 0.5 miles away — that turned out to be closed — with zero additional details. That difference is your competitive advantage.
          </p>
          <button onClick={() => setShowDemo(true)} style={{ background: '#0EB5AB', color: 'white', border: 'none', borderRadius: '12px', padding: '14px 28px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Space Grotesk','Inter',sans-serif" }}>
            Get Listed Today
          </button>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: '72px 24px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 800, color: '#0A2E1F', fontFamily: "'Space Grotesk','Inter',sans-serif", letterSpacing: '-0.5px', margin: '0 0 12px' }}>
            Simple plans, real results
          </h2>
          <p style={{ color: '#666', fontSize: '16px' }}>Start free. Upgrade when you&apos;re ready to unlock intelligence.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '24px', alignItems: 'start' }}>
          {plans.map((plan, i) => (
            <div key={i} style={{ background: plan.bg, border: `2px solid ${plan.border}`, borderRadius: '20px', padding: '32px 28px', color: plan.dark ? 'white' : '#0A2E1F' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: plan.badgeColor, marginBottom: '6px' }}>{plan.badge}</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: "'Space Grotesk','Inter',sans-serif" }}>{plan.name}</div>
                </div>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: plan.dark ? '#9FE1CB' : '#0EB5AB', marginBottom: '24px' }}>{plan.priceLabel}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ display: 'flex', gap: '10px', fontSize: '14px', color: plan.dark ? '#d4f5ef' : '#444', lineHeight: 1.4 }}>
                    <span style={{ color: plan.dark ? '#0EB5AB' : '#0EB5AB', flexShrink: 0, marginTop: '1px' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {plan.ctaHref ? (
                <Link href={plan.ctaHref} style={{ display: 'block', textAlign: 'center', background: plan.ctaBg, color: 'white', borderRadius: '12px', padding: '13px', fontSize: '15px', fontWeight: 700, textDecoration: 'none', fontFamily: "'Space Grotesk','Inter',sans-serif" }}>
                  {plan.cta}
                </Link>
              ) : (
                <button onClick={() => setShowDemo(true)} style={{ width: '100%', background: plan.ctaBg, color: 'white', border: 'none', borderRadius: '12px', padding: '13px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Space Grotesk','Inter',sans-serif" }}>
                  {plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* PROMO PREVIEW */}
      <section style={{ background: '#f8fffe', padding: '64px 24px', borderTop: '1px solid #e8f5f3' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, color: '#0A2E1F', fontFamily: "'Space Grotesk','Inter',sans-serif", margin: '0 0 12px' }}>
            Your offer, shown at the right moment
          </h2>
          <p style={{ color: '#666', fontSize: '16px', marginBottom: '36px', lineHeight: 1.6 }}>
            Before a user sees restroom access, they see your promotion. Real intent traffic. Real opportunity.
          </p>
          <div style={{ background: 'white', border: '1px solid #e0f5f2', borderRadius: '20px', padding: '28px 24px', maxWidth: '360px', margin: '0 auto', boxShadow: '0 4px 24px rgba(14,181,171,0.08)' }}>
            <div style={{ fontSize: '13px', color: '#999', marginBottom: '16px', fontWeight: 500 }}>🚻 Restroom Access Available</div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: '#0A2E1F', fontFamily: "'Space Grotesk','Inter',sans-serif", marginBottom: '8px' }}>Today&apos;s Offer</div>
            <div style={{ background: '#f0fdfb', border: '1px solid #c8ede9', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '15px', color: '#0A2E1F', fontWeight: 500 }}>☕ Free coffee refill with any breakfast sandwich purchase.</div>
            </div>
            <div style={{ background: '#0EB5AB', color: 'white', borderRadius: '10px', padding: '11px', fontSize: '14px', fontWeight: 700 }}>Continue to restroom access</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '72px 24px', maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, color: '#0A2E1F', fontFamily: "'Space Grotesk','Inter',sans-serif", textAlign: 'center', margin: '0 0 40px' }}>
          Common questions
        </h2>
        {faqs.map((faq, i) => (
          <div key={i} style={{ borderBottom: '1px solid #f0f0f0', padding: '20px 0' }}>
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontWeight: 600, fontSize: '15px', color: '#0A2E1F', lineHeight: 1.4 }}>{faq.q}</span>
              <span style={{ color: '#0EB5AB', fontSize: '20px', flexShrink: 0 }}>{openFaq === i ? '−' : '+'}</span>
            </button>
            {openFaq === i && (
              <p style={{ margin: '12px 0 0', fontSize: '14px', color: '#555', lineHeight: 1.7 }}>{faq.a}</p>
            )}
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #f0f0f0', padding: '32px 24px', textAlign: 'center' }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <img src="/flushpin-logo.png" alt="FlushPin" className="h-12 w-auto" />
        </a>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px', marginBottom: '4px' }}>
          <a href="/privacy" style={{ color: '#666', fontSize: '13px', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="/terms" style={{ color: '#666', fontSize: '13px', textDecoration: 'none' }}>Terms of Service</a>
          <a href="/safety" style={{ color: '#666', fontSize: '13px', textDecoration: 'none' }}>Safety Notice</a>
          <a href="/contact" style={{ color: '#666', fontSize: '13px', textDecoration: 'none' }}>Contact</a>
        </div>
        <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#aaa' }}>© {new Date().getFullYear()} FlushPin. All rights reserved.</p>
      </footer>

      {/* DEMO MODAL */}
      {showDemo && (
        <div onClick={() => { setShowDemo(false); setSent(false) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px', padding: '28px 24px', width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0A2E1F', fontFamily: "'Space Grotesk','Inter',sans-serif" }}>
                {sent ? '✅ Request received!' : 'Book a Demo'}
              </h2>
              <button onClick={() => { setShowDemo(false); setSent(false) }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}>✕</button>
            </div>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ fontSize: '15px', color: '#555', lineHeight: 1.7 }}>
                  Thanks! We&apos;ll reach out to <strong>{form.email}</strong> within 24 hours to schedule your demo.
                </p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '13px', color: '#999', marginBottom: '22px' }}>
                  Tell us about your business and we&apos;ll show you how FlushPin intelligence works.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { label: 'Your name', key: 'name', placeholder: 'Jane Smith', type: 'text' },
                    { label: 'Business name', key: 'business', placeholder: 'e.g. Sunrise Café', type: 'text' },
                    { label: 'Work email', key: 'email', placeholder: 'you@yourbusiness.com', type: 'email' },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={lbl}>{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={form[field.key as keyof typeof form]}
                        onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                        style={inp}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={lbl}>Number of locations</label>
                    <select value={form.locations} onChange={e => setForm(f => ({ ...f, locations: e.target.value }))} style={{ ...inp }}>
                      {['1', '2–5', '6–20', '21–50', '50+'].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Anything you want us to know? (optional)</label>
                    <textarea
                      placeholder="e.g. We have 3 locations in Irvine and want to test the analytics..."
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      style={{ ...inp, minHeight: '80px', resize: 'vertical' }}
                    />
                  </div>
                  <button
                    onClick={handleDemoSubmit}
                    disabled={sending || !form.name || !form.email || !form.business}
                    style={{ background: sending ? '#ccc' : '#0EB5AB', color: 'white', border: 'none', borderRadius: '12px', padding: '13px', fontSize: '15px', fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', fontFamily: "'Space Grotesk','Inter',sans-serif" }}
                  >
                    {sending ? 'Sending…' : 'Request Demo →'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
