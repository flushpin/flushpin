import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.flushpin.com/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <main style={{ margin: 0, padding: 0, fontFamily: "'Inter',system-ui,sans-serif", background: "#fff", minHeight: "100vh" }}>
      <nav style={{ background: "white", borderBottom: "1px solid #f0f0f0", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 20 }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <Image src="/icon-512.png" alt="FlushPin" width={40} height={40} />
        </a>
        <a href="/" style={{ color: "#555", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}>
          ← Back to home
        </a>
      </nav>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 24px 80px" }}>
        <h1 style={{ fontFamily: "'Space Grotesk','Inter',sans-serif", fontSize: "clamp(28px,5vw,40px)", fontWeight: "700", color: "#0A2E1F", marginBottom: "8px" }}>
          Privacy Policy
        </h1>
        <p style={{ color: "#999", fontSize: "14px", marginBottom: "40px" }}>
          Last updated: June 8, 2026. Effective date: June 8, 2026.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "36px", color: "#444", lineHeight: "1.8", fontSize: "15px" }}>

          <section>
            <h2 style={headingStyle}>1. Who we are</h2>
            <p>FlushPin ("we," "us," or "our") operates the website at <strong>www.flushpin.com</strong> and the FlushPin mobile app. FlushPin is a community platform that helps users find restroom access information at nearby businesses. We are based in Orange County, California, United States.</p>
            <p style={{ marginTop: "10px" }}>Contact: <a href="mailto:admin@flushpin.com" style={linkStyle}>admin@flushpin.com</a></p>
          </section>

          <section>
            <h2 style={headingStyle}>2. Information we collect</h2>
            <p><strong>Information you provide:</strong></p>
            <ul style={listStyle}>
              <li>Email address and name when you create an account</li>
              <li>Restroom access codes, ratings, corrections, and feedback you submit</li>
              <li>PIN submissions and access type reports</li>
              <li>Business name, contact name, email address, phone number, and other information if you submit a business claim, correction, or removal request</li>
              <li>Messages or reports you send to us, including safety reports, outdated information reports, or abuse reports</li>
            </ul>
            <p style={{ marginTop: "14px" }}><strong>Information collected automatically:</strong></p>
            <ul style={listStyle}>
              <li>Approximate or current device location when you grant permission, so we can show nearby restroom listings and calculate distance</li>
              <li>Restroom searches and app interactions</li>
              <li>Access code view logs, including user account, restroom listing, and timestamp, for abuse prevention, business opt-out enforcement, platform safety, and data quality</li>
              <li>PIN submissions, feedback, and report history</li>
              <li>Device type, browser, operating system, and app environment</li>
              <li>IP address, access timestamps, and limited technical information for security, fraud prevention, and abuse prevention</li>
              <li>If analytics are enabled, pages visited, app interactions, and feature usage data may be collected in aggregated or pseudonymous form</li>
              <li>Moderation, audit, and abuse prevention logs</li>
            </ul>
            <p style={{ marginTop: "14px" }}><strong>Information from third parties:</strong></p>
            <ul style={listStyle}>
              <li>If you sign in with Google or Apple, we may receive your name, email address, and authentication identifier from those providers</li>
              <li>Business claim or contact form providers may send us the information you submit through those forms</li>
            </ul>
          </section>

          <section>
            <h2 style={headingStyle}>3. How we use your information</h2>
            <ul style={listStyle}>
              <li>To create, authenticate, and manage your account</li>
              <li>To show you restroom listings near your location</li>
              <li>To calculate distance to nearby restroom listings</li>
              <li>To display, review, and improve community-submitted restroom access information</li>
              <li>To log and attribute access code views, submissions, confirmations, and reports</li>
              <li>To process business claim, correction, opt-out, or removal requests</li>
              <li>To detect and prevent fraud, spam, false submissions, misuse, scraping, or platform abuse</li>
              <li>To enforce our Terms of Service and Safety Notice</li>
              <li>To send you account-related emails, including confirmation, password reset, security, or service notices</li>
              <li>To comply with legal obligations and respond to lawful requests</li>
            </ul>
            <div style={noticeBoxStyle}>
              <p style={{ margin: 0 }}>We do <strong>not</strong> sell your personal information. We do <strong>not</strong> share your personal information for cross-context behavioral advertising. We do <strong>not</strong> use your personal information for third-party advertising.</p>
            </div>
          </section>

          <section>
            <h2 style={headingStyle}>4. Data sharing</h2>
            <p>We share information only in limited circumstances necessary to operate, protect, and improve FlushPin:</p>
            <ul style={listStyle}>
              <li><strong>Supabase</strong> — authentication, database, and backend services</li>
              <li><strong>Vercel</strong> — website hosting provider</li>
              <li><strong>Google / Apple</strong> — only if you choose to sign in with those providers</li>
              <li><strong>Form service providers</strong> — if you submit a contact form, business claim, correction request, or removal request through a third-party form service</li>
              <li><strong>Analytics or monitoring providers</strong> — if enabled, to understand app performance and improve the Service</li>
              <li><strong>Law enforcement, courts, or legal authorities</strong> — if required by applicable law, subpoena, court order, or to protect rights, safety, and security</li>
            </ul>
            <p style={{ marginTop: "14px" }}>We do not allow service providers to use your personal information for their own advertising purposes.</p>
          </section>

          <section>
            <h2 style={headingStyle}>5. Business claim and removal data</h2>
            <p>If you submit a business claim, correction, opt-out, or removal request, we may use your contact information to verify your relationship to the business, respond to the request, maintain claim records, prevent fraudulent claims, enforce business opt-out requests, and protect the integrity of the platform.</p>
            <p style={{ marginTop: "10px" }}>Business claim records may be retained as needed to document requests, prevent repeated misuse, and enforce listing restrictions.</p>
          </section>

          <section>
            <h2 style={headingStyle}>6. Location data</h2>
            <p>FlushPin requests access to your device location only to show nearby restroom listings and calculate distances. Location access is optional. You can disable location access through your device settings.</p>
            <p style={{ marginTop: "10px" }}>We may process your current device location to calculate nearby results. Unless otherwise stated, we do not permanently store your precise GPS coordinates in your account profile. If you do not grant location permission, FlushPin may still show general restroom listings, but nearby sorting and distance accuracy may be limited.</p>
          </section>

          <section>
            <h2 style={headingStyle}>7. Access code views and community submissions</h2>
            <p>To protect businesses, users, and the integrity of the platform, FlushPin may log when an authenticated user views an access code. These logs may include the user account, restroom listing, timestamp, and limited technical information.</p>
            <p style={{ marginTop: "10px" }}>We use these logs for abuse prevention, business opt-out enforcement, safety investigations, moderation, and data quality improvement.</p>
            <p style={{ marginTop: "10px" }}>Community-submitted restroom information may be reviewed, accepted, rejected, edited, hidden, or removed for safety, accuracy, business-owner request, legal, or platform integrity reasons.</p>
          </section>

          <section>
            <h2 style={headingStyle}>8. Data retention and deletion</h2>
            <p>We retain your account information for as long as your account is active or as needed to provide the Service and comply with legal obligations.</p>
            <p style={{ marginTop: "10px" }}>You may request deletion of your account and associated personal information by contacting us at <a href="mailto:admin@flushpin.com" style={linkStyle}>admin@flushpin.com</a>. We will process deletion requests within 30 days unless a longer period is required by law.</p>
            <p style={{ marginTop: "10px" }}>Community-submitted restroom information may remain on the platform in de-identified, aggregated, or non-account-linked form after account deletion, unless removal is required by law or approved through our moderation process.</p>
            <p style={{ marginTop: "10px" }}>Abuse prevention and moderation logs may be retained for up to 12 months for platform safety purposes.</p>
          </section>

          <section>
            <h2 style={headingStyle}>9. California privacy rights</h2>
            <p>If you are a California resident, you may have certain privacy rights under California law, including:</p>
            <ul style={listStyle}>
              <li><strong>Right to know/access</strong> — You may request information about the personal information we collect, use, disclose, and retain</li>
              <li><strong>Right to delete</strong> — You may request deletion of your personal information, subject to legal exceptions</li>
              <li><strong>Right to correct</strong> — You may request correction of inaccurate personal information</li>
              <li><strong>Right to opt out of sale or sharing</strong> — We do not sell personal information and do not share for cross-context behavioral advertising</li>
              <li><strong>Right to limit use of sensitive personal information</strong> — Where applicable, you may request limits on certain uses of sensitive personal information</li>
              <li><strong>Right to non-discrimination</strong> — We will not discriminate against you for exercising your privacy rights</li>
            </ul>
            <p style={{ marginTop: "14px" }}>To exercise these rights, you or an authorized agent acting on your behalf may email us at <a href="mailto:admin@flushpin.com" style={linkStyle}>admin@flushpin.com</a>. We will respond within 45 days as required by applicable law.</p>
          </section>

          <section>
            <h2 style={headingStyle}>10. Security</h2>
            <p>We use reasonable administrative, technical, and organizational safeguards designed to protect personal information. These may include encrypted connections, secure authentication, access controls, and database security rules.</p>
            <p style={{ marginTop: "10px" }}>No online service can guarantee absolute security. If you believe your account has been compromised, contact us immediately at <a href="mailto:admin@flushpin.com" style={linkStyle}>admin@flushpin.com</a>.</p>
            <p style={{ marginTop: "10px" }}>Real PIN codes and access codes should only be available through authenticated, controlled access flows and are not exposed in public API responses.</p>
          </section>

          <section>
            <h2 style={headingStyle}>11. Children</h2>
            <p>FlushPin is not directed to children under 13. Users under 13 may not create accounts, submit information, or use interactive features of the Service. We do not knowingly collect personal information from children under 13. If we learn that we have collected such information, we may delete the account and associated information.</p>
            <p style={{ marginTop: "10px" }}>If you believe a child under 13 has created an account, please contact us at <a href="mailto:admin@flushpin.com" style={linkStyle}>admin@flushpin.com</a>.</p>
          </section>

          <section>
            <h2 style={headingStyle}>12. Third-party links and services</h2>
            <p>FlushPin may contain links to third-party websites, businesses, maps, or external services. We are not responsible for the privacy practices or content of third-party services. Your use of third-party services is governed by their own terms and privacy policies.</p>
          </section>

          <section>
            <h2 style={headingStyle}>13. Changes to this policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify users of material changes by posting a notice on our website. Continued use of FlushPin after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 style={headingStyle}>14. Contact us</h2>
            <p>For privacy-related questions, deletion requests, or security concerns:</p>
            <p style={{ marginTop: "10px" }}><strong>FlushPin</strong><br />Orange County, California, USA<br />Email: <a href="mailto:admin@flushpin.com" style={linkStyle}>admin@flushpin.com</a></p>
          </section>

        </div>
      </div>

      <footer style={{ background: "#0A2E1F", padding: "28px 20px", textAlign: "center" }}>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/privacy" style={footerLinkStyle}>Privacy Policy</a>
          <a href="/terms" style={footerLinkStyle}>Terms of Service</a>
          <a href="/safety" style={footerLinkStyle}>Safety Notice</a>
          <a href="/business/claim" style={footerLinkStyle}>Business Claims</a>
          <a href="mailto:admin@flushpin.com" style={footerLinkStyle}>Contact</a>
        </div>
        <p style={{ color: "#2D6A4F", fontSize: "11px", marginTop: "12px" }}>© 2026 FlushPin. All rights reserved.</p>
      </footer>
    </main>
  );
}

const headingStyle = { fontFamily: "'Space Grotesk','Inter',sans-serif", fontSize: "20px", fontWeight: "700", color: "#0A2E1F", marginBottom: "12px" } as const;
const linkStyle = { color: "#1D9E75", fontWeight: "600" } as const;
const footerLinkStyle = { color: "#5DCAA5", fontSize: "13px", textDecoration: "none" } as const;
const listStyle = { marginTop: "8px", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" } as const;
const noticeBoxStyle = { marginTop: "16px", background: "#ECFBF9", border: "1px solid #B7F0E8", borderRadius: "14px", padding: "16px", color: "#0A2E1F" } as const;
