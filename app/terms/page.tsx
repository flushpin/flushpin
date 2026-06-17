import type { Metadata } from 'next'
import Logo from '../../components/Logo'

export const metadata: Metadata = {
  title: 'Terms of Service | FlushPin',
  description: 'FlushPin terms for community-submitted restroom access information, safety, business listings, user contributions, and platform use.',
  alternates: {
    canonical: 'https://www.flushpin.com/terms',
  },
}

const listStyle = { marginTop: '8px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' } as const
const headingStyle = { fontFamily: "'Space Grotesk','Inter',sans-serif", fontSize: '20px', fontWeight: '700', color: '#0A2E1F', marginBottom: '12px' } as const
const linkStyle = { color: '#1D9E75', fontWeight: '600' } as const
const noticeStyle = { background: '#FFF8F0', borderRadius: '14px', padding: '24px', border: '1px solid #FED7AA' } as const

export default function TermsPage() {
  return (
    <main style={{ margin: 0, padding: 0, fontFamily: "'Inter',system-ui,sans-serif", background: '#fff', minHeight: '100vh' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid #f0f0f0', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
        <Logo height={48} />
        <a href="/" style={{ color: '#555', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>← Back to home</a>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <h1 style={{ fontFamily: "'Space Grotesk','Inter',sans-serif", fontSize: 'clamp(28px,5vw,40px)', fontWeight: '700', color: '#0A2E1F', marginBottom: '8px' }}>Terms of Service</h1>
        <p style={{ color: '#999', fontSize: '14px', marginBottom: '18px' }}>Last updated: June 16, 2026. Effective date: June 16, 2026.</p>
        <div style={{ background: '#ECFBF9', border: '1px solid #B7F0E8', borderRadius: '14px', padding: '16px', color: '#0A2E1F', lineHeight: 1.7, fontSize: '14px', marginBottom: '40px' }}>
          FlushPin provides community-submitted restroom access guidance and business-intent tools. FlushPin does not own, operate, inspect, control, or guarantee access to any restroom, business, property, or third-party location.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', color: '#444', lineHeight: '1.8', fontSize: '15px' }}>
          <section>
            <h2 style={headingStyle}>1. Acceptance of terms</h2>
            <p>By accessing or using FlushPin ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. These terms apply to all users, including visitors, registered users, contributors, business owners, advertisers, and businesses.</p>
          </section>

          <section>
            <h2 style={headingStyle}>2. Description of service</h2>
            <p>FlushPin is a community platform that helps users find restroom access information at nearby businesses and third-party locations. The Service is available at <strong>www.flushpin.com</strong> and may also be available through the FlushPin mobile app. FlushPin serves as a neutral platform for community-submitted information and does not guarantee the accuracy, currency, availability, safety, cleanliness, legality, or completeness of any information displayed.</p>
          </section>

          <section style={noticeStyle}>
            <h2 style={{ ...headingStyle, color: '#9A3412' }}>3. Important access and safety notice</h2>
            <ul style={listStyle}>
              <li>FlushPin is an information service only. It is not an emergency service, safety service, security service, restroom operator, property manager, or public accommodation provider.</li>
              <li>An access code, PIN, QR scan, map listing, rating, confirmation, or "community shared" label does not guarantee permission to enter, restroom availability, safety, cleanliness, privacy, accessibility, or that a code still works.</li>
              <li>Business rules, posted signs, staff instructions, purchase requirements, local laws, and property policies always control over anything shown on FlushPin.</li>
              <li>If staff says access is not allowed, if a door is locked, or if an area appears private, unsafe, closed, restricted, employee-only, occupied, suspicious, or off-limits, you must not enter.</li>
              <li>If you feel unsafe or encounter harassment, threatening behavior, assault, a medical emergency, or another urgent situation, leave the area if safe to do so and contact local emergency services, including 911 where available.</li>
            </ul>
          </section>

          <section>
            <h2 style={headingStyle}>4. Community-submitted information</h2>
            <p>FlushPin displays restroom access information submitted by members of the public. By using the Service, you acknowledge and agree that:</p>
            <ul style={listStyle}>
              <li>All restroom access information may be inaccurate, outdated, incomplete, misleading, unavailable, or changed without notice.</li>
              <li>FlushPin does not verify, endorse, certify, warrant, or guarantee any access codes, PIN codes, QR flows, restroom access policies, cleanliness scores, ratings, accessibility notes, or business details.</li>
              <li>Restroom access policies are set solely by individual businesses or property operators and may change at any time.</li>
              <li>Some businesses may require a purchase, reservation, staff assistance, membership, ticket, or other condition even if not reflected in the Service.</li>
              <li>FlushPin is not responsible for denied access, outdated information, incorrect directions, unavailable restrooms, user inconvenience, or reliance on community-submitted data.</li>
              <li>Information labeled "Community Shared," "Verified," "Recently confirmed," "Last updated," or similar reflects community or platform signals only and should not be treated as a business guarantee.</li>
            </ul>
          </section>

          <section>
            <h2 style={headingStyle}>5. User accounts</h2>
            <ul style={listStyle}>
              <li>You must provide accurate information when creating an account.</li>
              <li>You are responsible for maintaining the security of your account and all activity under your account.</li>
              <li>You may not create multiple accounts to evade moderation, manipulate ratings, or impersonate others.</li>
              <li>You must be at least 13 years old to use FlushPin. If you are under the age of majority where you live, you may use the Service only with permission from a parent or legal guardian.</li>
            </ul>
          </section>

          <section>
            <h2 style={headingStyle}>6. User contributions and access codes</h2>
            <p>When you submit access information, ratings, codes, photos, corrections, reports, or feedback, you agree that:</p>
            <ul style={listStyle}>
              <li>The information you submit is accurate to the best of your knowledge and based on lawful, permitted access.</li>
              <li>You will not submit false, misleading, harmful, malicious, discriminatory, defamatory, private, or unlawful information.</li>
              <li>You will not submit employee-only, staff-only, maintenance-only, private, restricted-area, stolen, hacked, bypassed, or otherwise unauthorized codes or instructions.</li>
              <li>You will not encourage anyone to trespass, force entry, bypass locks, ignore staff instructions, or enter restricted or unsafe areas.</li>
              <li>You grant FlushPin a worldwide, non-exclusive, royalty-free, transferable, sublicensable license to host, display, reproduce, modify, moderate, translate, analyze, and use your contributions to operate, improve, promote, and protect the Service.</li>
              <li>FlushPin may review, edit, reject, hide, remove, label, de-rank, or preserve any contribution for safety, accuracy, legal, abuse-prevention, business-owner request, or platform-integrity reasons.</li>
            </ul>
          </section>

          <section>
            <h2 style={headingStyle}>7. Business listings, claims, and opt-out rights</h2>
            <p>Businesses listed on FlushPin may be added by community members, public sources, third-party data, or the FlushPin team. Business owners and authorized representatives may:</p>
            <ul style={listStyle}>
              <li>Claim their listing and manage restroom access information directly.</li>
              <li>Request correction of inaccurate information.</li>
              <li>Request removal, suppression, or opt-out of public restroom access sharing.</li>
              <li>Mark their listing as customer-only, ask-staff, temporarily unavailable, or not publicly available where appropriate.</li>
            </ul>
            <p style={{ marginTop: '12px' }}>To claim, update, or request removal of a listing, visit <a href="/business/claim" style={linkStyle}>flushpin.com/business/claim</a>, use <a href="/optout" style={linkStyle}>flushpin.com/optout</a>, or contact us at <a href="mailto:admin@flushpin.com" style={linkStyle}>admin@flushpin.com</a>. We aim to review business requests within 2 business days, but timing is not guaranteed.</p>
          </section>

          <section>
            <h2 style={headingStyle}>8. Platform status and third-party content</h2>
            <p>FlushPin operates as a neutral platform for third-party and community-submitted information. To the fullest extent permitted by applicable law, including Section 230 of the Communications Decency Act where applicable, FlushPin is not liable as the publisher or speaker of information provided by third-party users, businesses, public sources, or other information providers.</p>
          </section>

          <section>
            <h2 style={headingStyle}>9. Respectful and lawful use</h2>
            <p>When accessing restrooms or locations found through FlushPin, users agree to:</p>
            <ul style={listStyle}>
              <li>Be respectful of businesses, staff, customers, residents, visitors, and other users.</li>
              <li>Follow posted rules, staff instructions, property policies, and applicable laws at all times.</li>
              <li>Leave immediately if asked to leave or if access is denied.</li>
              <li>Not force entry, bypass locks, tailgate behind others, block facilities, misuse restrooms, damage property, or enter employee-only or restricted areas.</li>
              <li>Understand that a purchase or other condition may apply even if not reflected in the Service.</li>
              <li>Not share access information in ways that could harm businesses, staff, property, users, or the public.</li>
            </ul>
          </section>

          <section style={noticeStyle}>
            <h2 style={{ ...headingStyle, color: '#9A3412' }}>10. Third-party premises, personal safety, and user responsibility</h2>
            <p style={{ marginBottom: '12px' }}>FlushPin provides information about third-party locations. Users must exercise their own judgment when visiting any location found through the Service.</p>
            <ul style={listStyle}>
              <li>FlushPin does not own, operate, manage, inspect, supervise, maintain, secure, monitor, staff, or control any restroom, business, property, building, staff member, customer, visitor, or third-party location listed or referenced through the Service.</li>
              <li>FlushPin does not guarantee that any restroom or location is safe, clean, private, available, unlocked, monitored, accessible, lawful to enter, sanitary, well-lit, supervised, or free from inappropriate conduct by others.</li>
              <li>Users are solely responsible for evaluating their surroundings, following business instructions, complying with posted rules, and deciding whether it is safe and appropriate to enter or use any restroom or location.</li>
              <li>To the maximum extent permitted by law, FlushPin is not responsible for injuries, damages, losses, emotional distress, harassment, assault, theft, property damage, denial of access, unsafe conditions, unsanitary conditions, discrimination by third parties, or other incidents arising from or related to a user's decision to visit, enter, or use any third-party restroom, business, or property.</li>
              <li>This limitation does not affect rights that cannot be waived under applicable law and does not apply to FlushPin's own fraud, willful misconduct, or violations of law.</li>
            </ul>
          </section>

          <section>
            <h2 style={headingStyle}>11. Promotions, ads, QR codes, and business tools</h2>
            <p>FlushPin may offer QR codes, business dashboards, promotions, ads, sponsored placements, offer views, analytics, and business packages. Businesses are solely responsible for the accuracy, legality, availability, and fulfillment of their offers, promotions, restroom policies, posted notices, and staff practices.</p>
            <ul style={listStyle}>
              <li>FlushPin does not guarantee sales, foot traffic, conversions, offer redemption, restroom availability, customer behavior, revenue increase, or any specific business outcome.</li>
              <li>Any conversion rate, value target, scan count, offer view, projection, case study, or performance estimate is illustrative and not a promise or guarantee.</li>
              <li>Businesses must comply with advertising, consumer protection, accessibility, privacy, employment, health, safety, and local laws applicable to their locations and offers.</li>
              <li>FlushPin may reject, remove, pause, or modify promotions that we believe are misleading, unsafe, unlawful, discriminatory, abusive, or inconsistent with the Service.</li>
            </ul>
          </section>

          <section>
            <h2 style={headingStyle}>12. Moderation, abuse prevention, and audit logs</h2>
            <p>FlushPin may log, review, preserve, and use account activity, access-code views, submissions, ratings, reports, business claim requests, opt-out requests, IP addresses, device or browser information, timestamps, and moderation actions for platform safety, abuse prevention, fraud detection, business opt-out enforcement, legal compliance, and data-quality purposes, as described in our Privacy Policy.</p>
          </section>

          <section>
            <h2 style={headingStyle}>13. Prohibited conduct</h2>
            <p>You agree not to:</p>
            <ul style={listStyle}>
              <li>Submit deliberately false, misleading, harmful, defamatory, discriminatory, or unlawful information.</li>
              <li>Harass, threaten, intimidate, stalk, exploit, or harm other users, businesses, employees, or members of the public.</li>
              <li>Attempt to access systems, accounts, data, locations, locks, doors, networks, or information you are not authorized to access.</li>
              <li>Use the Service for any unlawful, unsafe, abusive, fraudulent, or exploitative purpose.</li>
              <li>Scrape, crawl, copy, resell, train models on, or bulk-extract content from the platform without written permission.</li>
              <li>Manipulate ratings, reviews, reports, access confirmations, promotions, claims, or analytics.</li>
              <li>Interfere with business operations or encourage others to disregard staff instructions or property rules.</li>
            </ul>
          </section>

          <section>
            <h2 style={headingStyle}>14. Reporting, correction, and removal</h2>
            <p>Users and businesses may report incorrect, unsafe, outdated, private, restricted, or harmful information by using available in-product reporting tools or contacting <a href="mailto:admin@flushpin.com" style={linkStyle}>admin@flushpin.com</a>. FlushPin may investigate and take action at its discretion, including editing, hiding, removing, preserving, or escalating information. Reporting does not guarantee removal or any specific outcome.</p>
          </section>

          <section>
            <h2 style={headingStyle}>15. Disclaimer of warranties</h2>
            <p>FlushPin is provided "as is" and "as available" without warranty of any kind, express or implied. We do not guarantee that the Service will be accurate, current, uninterrupted, secure, error-free, safe, available, or suitable for your needs. We do not guarantee that access codes are accurate, current, authorized, lawful to use, or functional. Use of information found on FlushPin is at your own risk.</p>
          </section>

          <section>
            <h2 style={headingStyle}>16. Limitation of liability</h2>
            <p>To the maximum extent permitted by law, FlushPin and its owners, operators, officers, employees, contractors, affiliates, service providers, and agents shall not be liable for any indirect, incidental, special, consequential, exemplary, punitive, or similar damages; lost profits; lost data; loss of goodwill; personal injury; property damage; denial of access; reliance on inaccurate information; third-party conduct; or inability to use a restroom or location, even if advised of the possibility of such damages.</p>
          </section>

          <section>
            <h2 style={headingStyle}>17. Indemnification</h2>
            <p>You agree to defend, indemnify, and hold harmless FlushPin and its owners, operators, officers, employees, contractors, affiliates, service providers, and agents from and against any claims, liabilities, damages, losses, costs, and expenses, including reasonable attorneys' fees, arising from or related to your use of the Service, your contributions, your violation of these Terms, your violation of law, your interaction with any business or third-party location, or your infringement or violation of any rights of another person or entity.</p>
          </section>

          <section>
            <h2 style={headingStyle}>18. Dispute resolution, arbitration, and class action waiver</h2>
            <p>To the extent permitted by applicable law, you and FlushPin agree to first attempt to resolve disputes informally by contacting <a href="mailto:admin@flushpin.com" style={linkStyle}>admin@flushpin.com</a>. If a dispute cannot be resolved informally, disputes shall be resolved by binding individual arbitration in Orange County, California, unless applicable law requires otherwise. You and FlushPin waive the right to participate in a class action, class arbitration, private attorney general action, or representative proceeding to the maximum extent permitted by law. This section does not prevent either party from seeking injunctive relief for misuse of the Service, intellectual property violations, security threats, or unauthorized access.</p>
          </section>

          <section>
            <h2 style={headingStyle}>19. Governing law and venue</h2>
            <p>These Terms are governed by the laws of the State of California, United States, without regard to conflict of law principles. Subject to the dispute resolution section above, any court proceeding shall be brought in the state or federal courts located in Orange County, California, and you consent to personal jurisdiction and venue there.</p>
          </section>

          <section>
            <h2 style={headingStyle}>20. Termination</h2>
            <p>We reserve the right to suspend, restrict, or terminate your account or access to the Service at any time if we believe you violated these Terms, created risk, abused the Service, submitted harmful information, interfered with businesses or users, or exposed FlushPin or others to legal, safety, or operational risk. You may delete your account by contacting <a href="mailto:admin@flushpin.com" style={linkStyle}>admin@flushpin.com</a>.</p>
          </section>

          <section>
            <h2 style={headingStyle}>21. Changes to terms</h2>
            <p>We may update these Terms at any time. We will notify users of material changes by posting a notice on the website or through the Service. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 style={headingStyle}>22. Contact</h2>
            <p><strong>FlushPin</strong><br />Orange County, California, USA<br />Email: <a href="mailto:admin@flushpin.com" style={linkStyle}>admin@flushpin.com</a><br />Business claims: <a href="/business/claim" style={linkStyle}>flushpin.com/business/claim</a><br />Business opt-out: <a href="/optout" style={linkStyle}>flushpin.com/optout</a></p>
          </section>
        </div>
      </div>
    </main>
  )
}
