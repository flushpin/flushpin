import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.flushpin.com/terms',
  },
}

export default function TermsPage() {
  return (
    <main style={{margin:0,padding:0,fontFamily:"'Inter',system-ui,sans-serif",background:"#fff",minHeight:"100vh"}}>
      <nav style={{background:"white",borderBottom:"1px solid #f0f0f0",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:20}}>
        <a href="/" style={{textDecoration:"none"}}><Image src="/icon-512.png" alt="FlushPin" width={40} height={40} /></a>
        <a href="/" style={{color:"#555",textDecoration:"none",fontSize:"14px",fontWeight:"500"}}>← Back to home</a>
      </nav>

      <div style={{maxWidth:"760px",margin:"0 auto",padding:"48px 24px 80px"}}>
        <h1 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"clamp(28px,5vw,40px)",fontWeight:"700",color:"#0A2E1F",marginBottom:"8px"}}>Terms of Service</h1>
        <p style={{color:"#999",fontSize:"14px",marginBottom:"40px"}}>Last updated: June 8, 2026. Effective date: June 8, 2026.</p>

        <div style={{display:"flex",flexDirection:"column",gap:"36px",color:"#444",lineHeight:"1.8",fontSize:"15px"}}>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>1. Acceptance of terms</h2>
            <p>By accessing or using FlushPin ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. These terms apply to all users, including visitors, registered users, and businesses.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>2. Description of service</h2>
            <p>FlushPin is a community platform that helps users find restroom access information at nearby businesses. The platform is available at www.flushpin.com and via the FlushPin mobile app. FlushPin serves as a neutral platform for community-submitted information and does not guarantee the accuracy, currency, or availability of any information displayed.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>3. Community-submitted information</h2>
            <p>FlushPin displays restroom access information submitted by members of the public. By using this Service, you acknowledge and agree that:</p>
            <ul style={{marginTop:"8px",paddingLeft:"20px",display:"flex",flexDirection:"column",gap:"8px"}}>
              <li>All restroom access information on FlushPin is community-submitted and may not be accurate, current, or complete</li>
              <li>FlushPin does not verify, endorse, or guarantee any access codes, PIN codes, or restroom access policies listed on the platform</li>
              <li>Restroom access policies are set solely by individual businesses and may change at any time without notice</li>
              <li>Some businesses may require a purchase, reservation, or staff assistance to access their restroom, regardless of information shown on FlushPin</li>
              <li>FlushPin is not responsible for denied access, outdated information, or any inconvenience resulting from reliance on community-submitted data</li>
              <li>Information labeled "Community Shared" has not been verified by the business and should be used with appropriate caution</li>
            </ul>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>4. User accounts</h2>
            <ul style={{paddingLeft:"20px",display:"flex",flexDirection:"column",gap:"8px"}}>
              <li>You must provide accurate information when creating an account</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You may not create multiple accounts or impersonate others</li>
              <li>You must be at least 13 years old to use FlushPin</li>
            </ul>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>5. User contributions</h2>
            <p>When you submit access information, ratings, or feedback, you agree that:</p>
            <ul style={{marginTop:"8px",paddingLeft:"20px",display:"flex",flexDirection:"column",gap:"8px"}}>
              <li>The information you submit is accurate to the best of your knowledge</li>
              <li>You will not submit false, misleading, or harmful information</li>
              <li>You grant FlushPin a non-exclusive, royalty-free license to display and use your contributions</li>
              <li>You will not submit private information about individuals without their consent</li>
              <li>FlushPin may remove any contribution that violates these terms</li>
              <li>Submitted access codes are reviewed before being publicly displayed and may be rejected or modified</li>
            </ul>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>6. Business listings and platform liability</h2>
            <p>Businesses listed on FlushPin may be added by community members or the FlushPin team. FlushPin operates as a neutral platform under applicable law, including Section 230 of the Communications Decency Act, and is not liable for third-party content submitted by users.</p>
            <p style={{marginTop:"12px"}}>Business owners have the right to:</p>
            <ul style={{marginTop:"8px",paddingLeft:"20px",display:"flex",flexDirection:"column",gap:"8px"}}>
              <li>Claim their listing and manage their restroom access information directly</li>
              <li>Request correction of inaccurate information</li>
              <li>Request removal of their listing from FlushPin at any time</li>
              <li>Mark their listing as opted out of public access sharing</li>
            </ul>
            <p style={{marginTop:"12px"}}>To claim, update, or request removal of a listing, visit <a href="/business/claim" style={{color:"#1D9E75",fontWeight:"600"}}>flushpin.com/business/claim</a> or contact us at <a href="mailto:admin@flushpin.com" style={{color:"#1D9E75"}}>admin@flushpin.com</a>. We will respond within 2 business days.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>7. Respectful use</h2>
            <p>When accessing restrooms found through FlushPin, users agree to:</p>
            <ul style={{marginTop:"8px",paddingLeft:"20px",display:"flex",flexDirection:"column",gap:"8px"}}>
              <li>Be respectful of the business, its staff, and other customers</li>
              <li>Follow any posted restroom policies or staff instructions at all times</li>
              <li>Not force entry, bypass locks, or access any area marked as restricted or employee-only</li>
              <li>Understand that a purchase or other requirement may apply even if not reflected in the app</li>
              <li>Not share access information in ways that could harm businesses or other users</li>
            </ul>
          </section>

          <section style={{background:"#FFF8F0",borderRadius:"14px",padding:"24px",border:"1px solid #FED7AA"}}>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#9A3412",marginBottom:"12px"}}>8. Third-party premises, personal safety, and user responsibility</h2>
            <p style={{marginBottom:"12px"}}>FlushPin provides access to information about third-party locations. Users must exercise their own judgment when visiting any location found through the Service.</p>
            <ul style={{paddingLeft:"20px",display:"flex",flexDirection:"column",gap:"10px"}}>
              <li>FlushPin does not own, operate, manage, inspect, supervise, or control any restroom, business, property, building, staff member, customer, visitor, or third-party location listed or referenced through the Service.</li>
              <li>FlushPin does not guarantee that any restroom or location is safe, clean, private, available, unlocked, monitored, accessible, lawful to enter, or free from inappropriate conduct by others.</li>
              <li>Users are solely responsible for evaluating their surroundings, following business instructions, complying with posted rules, and deciding whether it is safe and appropriate to enter or use any restroom or location.</li>
              <li>Users should not enter any area that appears unsafe, private, restricted, employee-only, closed, occupied, suspicious, or where access is denied by staff or signage.</li>
              <li>If a user feels unsafe or encounters harassment, threatening behavior, assault, a medical emergency, or any other urgent situation, the user should leave the area if safe to do so and contact local emergency services (911) or appropriate authorities immediately.</li>
              <li>To the maximum extent permitted by applicable law, FlushPin is not responsible for injuries, damages, losses, emotional distress, harassment, assault, theft, property damage, denial of access, unsafe conditions, unsanitary conditions, or other incidents arising from or related to a user's decision to visit, enter, or use any third-party restroom, business, or property.</li>
              <li>This limitation does not affect any rights that cannot be waived under applicable law, and does not apply to FlushPin's own fraud, willful misconduct, or violations of law.</li>
            </ul>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>9. Prohibited conduct</h2>
            <p>You agree not to:</p>
            <ul style={{marginTop:"8px",paddingLeft:"20px",display:"flex",flexDirection:"column",gap:"8px"}}>
              <li>Submit deliberately false or misleading access information</li>
              <li>Harass, threaten, or harm other users or businesses</li>
              <li>Attempt to access systems or data you are not authorized to access</li>
              <li>Use the Service for any unlawful purpose</li>
              <li>Scrape, crawl, or copy content from the platform without permission</li>
              <li>Manipulate ratings or reviews for competitive advantage</li>
            </ul>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>10. Disclaimer of warranties</h2>
            <p>FlushPin is provided "as is" without warranty of any kind. We do not guarantee that access codes are accurate, current, or functional. Restroom access policies are set by businesses and may change at any time. Use of information found on FlushPin is at your own risk.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>11. Limitation of liability</h2>
            <p>To the maximum extent permitted by law, FlushPin and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to inability to access a restroom, reliance on inaccurate access information, or data loss.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>12. Governing law</h2>
            <p>These Terms are governed by the laws of the State of California, United States, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Orange County, California.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>13. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at any time for violation of these Terms. You may delete your account at any time by contacting us at <a href="mailto:admin@flushpin.com" style={{color:"#1D9E75"}}>admin@flushpin.com</a>.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>14. Changes to terms</h2>
            <p>We may update these Terms at any time. We will notify users of material changes by posting a notice on the website. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>15. Contact</h2>
            <p><strong>FlushPin</strong><br/>Orange County, California, USA<br/>Email: <a href="mailto:admin@flushpin.com" style={{color:"#1D9E75"}}>admin@flushpin.com</a><br/>Business claims: <a href="/business/claim" style={{color:"#1D9E75"}}>flushpin.com/business/claim</a></p>
          </section>

        </div>
      </div>

      <footer style={{background:"#0A2E1F",padding:"28px 20px",textAlign:"center"}}>
        <div style={{display:"flex",gap:"20px",justifyContent:"center",flexWrap:"wrap"}}>
          <a href="/privacy" style={{color:"#5DCAA5",fontSize:"13px",textDecoration:"none"}}>Privacy Policy</a>
          <a href="/terms" style={{color:"#5DCAA5",fontSize:"13px",textDecoration:"none"}}>Terms of Service</a>
          <a href="/safety" style={{color:"#5DCAA5",fontSize:"13px",textDecoration:"none"}}>Safety Notice</a>
          <a href="/business/claim" style={{color:"#5DCAA5",fontSize:"13px",textDecoration:"none"}}>Business Claims</a>
          <a href="mailto:admin@flushpin.com" style={{color:"#5DCAA5",fontSize:"13px",textDecoration:"none"}}>Contact</a>
        </div>
        <p style={{color:"#2D6A4F",fontSize:"11px",marginTop:"12px"}}>© 2026 FlushPin. All rights reserved.</p>
      </footer>
    </main>
  )
}
