import Logo from '../../components/Logo'

export default function TermsPage() {
  const h2 = {
    fontFamily: "'Space Grotesk','Inter',sans-serif",
    fontSize: '20px',
    fontWeight: '700' as const,
    color: '#0A2E1F',
    marginBottom: '12px',
  }
  const link = { color: '#1D9E75' }

  return (
    <main style={{ margin: 0, padding: 0, fontFamily: "'Inter',system-ui,sans-serif", background: '#fff', minHeight: '100vh' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid #f0f0f0', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
        <Logo height={32} />
        <a href="/" style={{ color: '#555', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>← Back to home</a>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <h1 style={{ fontFamily: "'Space Grotesk','Inter',sans-serif", fontSize: 'clamp(28px,5vw,40px)', fontWeight: '700', color: '#0A2E1F', marginBottom: '8px' }}>Terms of Service</h1>
        <p style={{ color: '#999', fontSize: '14px', marginBottom: '40px' }}>Last updated: June 12, 2026. Effective date: June 12, 2026.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', color: '#444', lineHeight: '1.8', fontSize: '15px' }}>

          <section>
            <h2 style={h2}>1. Acceptance of terms</h2>
            <p>By accessing or using FlushPin (&quot;the Service&quot;), you agree to be bound by these Terms of Service and our <a href="/privacy" style={link}>Privacy Policy</a>, which is incorporated by reference. If you do not agree, do not use the Service. These Terms apply to all users, including visitors, registered users, business subscribers, and businesses listed on the platform.</p>
          </section>

          <section>
            <h2 style={h2}>2. Description of service</h2>
            <p>FlushPin operates www.flushpin.com and the FlushPin mobile app. FlushPin is a community platform that helps users find, submit, and update restroom access information at nearby businesses, including keypad codes, access types (such as no code required, ask staff, or customers only), ratings, and related feedback.</p>
            <p style={{ marginTop: '8px' }}>FlushPin also offers optional paid business plans that may include restroom intelligence reports, listing management tools, alerts, and related business features as described on our website.</p>
            <p style={{ marginTop: '8px' }}>The Service relies on community contributions and automated systems. FlushPin does not guarantee that any restroom access information is accurate, current, complete, or available at any given time. Restroom access policies are set by businesses and may change without notice.</p>
          </section>

          <section>
            <h2 style={h2}>3. User accounts</h2>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>You must provide accurate information when creating an account</li>
              <li>You are responsible for maintaining the security of your account and credentials</li>
              <li>You may not create multiple accounts to evade restrictions or impersonate others</li>
              <li>You must be at least 13 years old to create an account or use interactive features</li>
              <li>Your name or display name may appear publicly next to your contributions, as described in our Privacy Policy</li>
              <li>If you sign in with Google or Apple, you agree to comply with those providers&apos; terms as well</li>
            </ul>
          </section>

          <section>
            <h2 style={h2}>4. User contributions and moderation</h2>
            <p>When you submit restroom access information, ratings, corrections, feedback, or other content, you agree that:</p>
            <ul style={{ marginTop: '8px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>The information you submit is accurate to the best of your knowledge</li>
              <li>You will not submit false, misleading, harmful, or unauthorized information</li>
              <li>You grant FlushPin a non-exclusive, worldwide, royalty-free, perpetual license to use, display, store, reproduce, modify, and distribute your contributions solely to operate, improve, and provide the Service</li>
              <li>You will not submit private information about individuals without their consent</li>
              <li>You retain ownership of your submissions, subject to the license above</li>
            </ul>
            <p style={{ marginTop: '12px' }}>Community-submitted information may be published, reviewed, accepted, rejected, edited, hidden, or removed at any time for safety, accuracy, business-owner request, legal, or platform integrity reasons. Some submissions may appear on the platform before manual review. FlushPin does not pre-verify all community contributions before display.</p>
          </section>

          <section>
            <h2 style={h2}>5. Prohibited conduct</h2>
            <p>You agree not to:</p>
            <ul style={{ marginTop: '8px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Submit deliberately false, misleading, or unauthorized restroom access information or ratings</li>
              <li>Share, scrape, export, or redistribute access codes or restricted platform data outside authorized Service flows</li>
              <li>Harass, threaten, or harm other users, businesses, or FlushPin personnel</li>
              <li>Attempt to access systems, accounts, or data you are not authorized to access</li>
              <li>Submit fraudulent business claims, opt-out requests, or removal requests</li>
              <li>Use the Service for any unlawful purpose</li>
              <li>Scrape, crawl, copy, or reverse engineer the platform or its data without written permission</li>
              <li>Manipulate ratings, submissions, or intelligence signals for competitive advantage</li>
              <li>Circumvent opt-out restrictions, authentication controls, or abuse prevention measures</li>
            </ul>
          </section>

          <section>
            <h2 style={h2}>6. Business listings, claims, and opt-out</h2>
            <p>Businesses listed on FlushPin may be added by users, data partners, or the FlushPin team. If you are a business owner or authorized representative and wish to claim, correct, update, or remove your listing, contact us at <a href="mailto:admin@flushpin.com" style={link}>admin@flushpin.com</a> or submit a request through our <a href="/optout" style={link}>business opt-out page</a>.</p>
            <p style={{ marginTop: '8px' }}>We may request reasonable verification of your authority to act on behalf of a business. Verified opt-out or removal requests may result in restricted display of restroom access information for that business. We will respond to business listing requests within 5 business days where practicable.</p>
          </section>

          <section>
            <h2 style={h2}>7. Business subscriptions</h2>
            <p>FlushPin may offer paid business plans, including Business and Business Pro tiers, on a per-location, monthly subscription basis unless otherwise agreed in writing.</p>
            <ul style={{ marginTop: '8px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Subscription pricing, features, and availability are described on our website and may change with notice</li>
              <li>Unless stated otherwise at checkout or in a separate agreement, subscriptions renew monthly until canceled</li>
              <li>You may cancel at any time by contacting <a href="mailto:admin@flushpin.com" style={link}>admin@flushpin.com</a>; cancellation takes effect at the end of the current billing period unless otherwise stated</li>
              <li>Fees are generally non-refundable except where required by law or expressly stated in writing</li>
              <li>Promotional offers, free trials, or custom enterprise terms apply only as described in the applicable offer or signed agreement</li>
              <li>Business subscribers are responsible for providing accurate business, billing, and authorized contact information</li>
            </ul>
            <p style={{ marginTop: '12px' }}>FlushPin may suspend or terminate business access for non-payment, misuse, violation of these Terms, or fraudulent activity.</p>
          </section>

          <section>
            <h2 style={h2}>8. Analytics and intelligence disclaimer</h2>
            <p>Business intelligence features, including demand signals, access interest metrics, peak-hour patterns, estimated engagement, alerts, reports, and regional summaries, are provided for informational purposes only.</p>
            <p style={{ marginTop: '8px' }}>These features reflect platform activity, modeled estimates, and aggregated signals. They are not guarantees of foot traffic, sales, conversions, restroom usage counts, or business outcomes. FlushPin does not warrant the accuracy, completeness, or fitness for a particular purpose of any intelligence output.</p>
            <p style={{ marginTop: '8px' }}>If FlushPin offers SMS, email, or other notifications to business subscribers or their designated contacts, you are responsible for obtaining any legally required consent from recipients and for providing accurate contact information.</p>
          </section>

          <section>
            <h2 style={h2}>9. Disclaimer of warranties</h2>
            <p>THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTY OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.</p>
            <p style={{ marginTop: '8px' }}>Without limiting the foregoing, FlushPin does not guarantee that restroom access information, codes, listings, alerts, or intelligence reports are accurate, current, functional, uninterrupted, or error-free. Your use of restroom access information found on FlushPin is at your own risk.</p>
          </section>

          <section>
            <h2 style={h2}>10. Limitation of liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, FLUSHPIN AND ITS OPERATORS, OFFICERS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR BUSINESS OPPORTUNITY, ARISING FROM OR RELATED TO YOUR USE OF THE SERVICE.</p>
            <p style={{ marginTop: '8px' }}>TO THE MAXIMUM EXTENT PERMITTED BY LAW, FLUSHPIN&apos;S TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THE SERVICE OR THESE TERMS SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO FLUSHPIN FOR THE SERVICE IN THE 12 MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM, OR (B) USD $100.</p>
            <p style={{ marginTop: '8px' }}>Some jurisdictions do not allow certain limitations of liability, so some of the above limitations may not apply to you.</p>
          </section>

          <section>
            <h2 style={h2}>11. Indemnification</h2>
            <p>You agree to defend, indemnify, and hold harmless FlushPin and its operators from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising out of or related to your use of the Service, your contributions, your violation of these Terms, or your violation of any law or third-party rights.</p>
          </section>

          <section>
            <h2 style={h2}>12. Governing law and disputes</h2>
            <p>These Terms are governed by the laws of the State of California, United States, without regard to conflict of law principles. Any dispute arising out of or relating to these Terms or the Service shall be resolved exclusively in the state or federal courts located in Orange County, California, and you consent to the personal jurisdiction of those courts.</p>
          </section>

          <section>
            <h2 style={h2}>13. Termination</h2>
            <p>We may suspend or terminate your account or business access at any time for violation of these Terms, suspected fraud, abuse, legal risk, or platform safety reasons. You may request account deletion at any time by contacting <a href="mailto:admin@flushpin.com" style={link}>admin@flushpin.com</a>.</p>
            <p style={{ marginTop: '8px' }}>Sections that by their nature should survive termination will survive, including intellectual property licenses, disclaimers, limitations of liability, indemnification, and governing law.</p>
          </section>

          <section>
            <h2 style={h2}>14. Changes to terms</h2>
            <p>We may update these Terms from time to time. We will notify users of material changes by posting an updated version on our website with a revised effective date. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 style={h2}>15. Contact</h2>
            <p><strong>FlushPin</strong><br />Orange County, California, USA<br />Email: <a href="mailto:admin@flushpin.com" style={link}>admin@flushpin.com</a></p>
          </section>

        </div>
      </div>

      <footer style={{ background: '#0A2E1F', padding: '28px 20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/privacy" style={{ color: '#5DCAA5', fontSize: '13px', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="/terms" style={{ color: '#5DCAA5', fontSize: '13px', textDecoration: 'none' }}>Terms of Service</a>
          <a href="/contact" style={{ color: '#5DCAA5', fontSize: '13px', textDecoration: 'none' }}>Contact</a>
        </div>
        <p style={{ color: '#2D6A4F', fontSize: '11px', marginTop: '12px' }}>© 2026 FlushPin. All rights reserved.</p>
      </footer>
    </main>
  )
}
