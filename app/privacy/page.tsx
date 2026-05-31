export default function PrivacyPage() {
  return (
    <main style={{margin:0,padding:0,fontFamily:"'Inter',system-ui,sans-serif",background:"#fff",minHeight:"100vh"}}>
      <nav style={{background:"white",borderBottom:"1px solid #f0f0f0",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:20}}>
        <a href="/" style={{textDecoration:"none",display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{width:"34px",height:"34px",background:"#1D9E75",borderRadius:"9px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"2px"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"2px",width:"18px"}}>
              {[1,1,1,1,1,1,0,1,0].map((v,i)=>(<div key={i} style={{width:"4px",height:"4px",borderRadius:"50%",background:v?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.15)"}}/>))}
            </div>
            <div style={{width:0,height:0,borderLeft:"3px solid transparent",borderRight:"3px solid transparent",borderTop:"5px solid #1D9E75",marginTop:"-1px"}}/>
          </div>
          <span style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"18px",fontWeight:"700",color:"#0A2E1F"}}>Flush<span style={{color:"#1D9E75"}}>Pin</span></span>
        </a>
        <a href="/" style={{color:"#555",textDecoration:"none",fontSize:"14px",fontWeight:"500"}}>← Back to home</a>
      </nav>

      <div style={{maxWidth:"760px",margin:"0 auto",padding:"48px 24px 80px"}}>
        <h1 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"clamp(28px,5vw,40px)",fontWeight:"700",color:"#0A2E1F",marginBottom:"8px"}}>Privacy Policy</h1>
        <p style={{color:"#999",fontSize:"14px",marginBottom:"40px"}}>Last updated: May 28, 2025. Effective date: May 28, 2025.</p>

        <div style={{display:"flex",flexDirection:"column",gap:"36px",color:"#444",lineHeight:"1.8",fontSize:"15px"}}>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>1. Who we are</h2>
            <p>FlushPin ("we," "us," or "our") operates the website located at <strong>www.flushpin.com</strong>. FlushPin is a community platform that helps users find restroom PIN codes and cleanliness ratings at nearby businesses. We are based in Orange County, California, United States.</p>
            <p style={{marginTop:"10px"}}>Contact: <a href="mailto:admin@flushpin.com" style={{color:"#1D9E75"}}>admin@flushpin.com</a></p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>2. Information we collect</h2>
            <p><strong>Information you provide:</strong></p>
            <ul style={{marginTop:"8px",paddingLeft:"20px",display:"flex",flexDirection:"column",gap:"6px"}}>
              <li>Full name and email address when you create an account</li>
              <li>Profile color preference</li>
              <li>Restroom PIN codes, ratings, and comments you submit</li>
              <li>Business name and contact information if you register as a business</li>
            </ul>
            <p style={{marginTop:"14px"}}><strong>Information collected automatically:</strong></p>
            <ul style={{marginTop:"8px",paddingLeft:"20px",display:"flex",flexDirection:"column",gap:"6px"}}>
              <li>Approximate location (only when you grant permission, to show nearby restrooms)</li>
              <li>Device type, browser, and operating system</li>
              <li>Pages visited and features used (anonymous analytics)</li>
              <li>IP address and access timestamps</li>
            </ul>
            <p style={{marginTop:"14px"}}><strong>Information from third parties:</strong></p>
            <ul style={{marginTop:"8px",paddingLeft:"20px",display:"flex",flexDirection:"column",gap:"6px"}}>
              <li>If you sign in with Google, we receive your name and email address from Google</li>
            </ul>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>3. How we use your information</h2>
            <ul style={{paddingLeft:"20px",display:"flex",flexDirection:"column",gap:"8px"}}>
              <li>To create and manage your account</li>
              <li>To display your name next to ratings and PIN submissions (so contributions are accountable)</li>
              <li>To show you restrooms near your location</li>
              <li>To improve the accuracy and quality of our platform</li>
              <li>To send you account-related emails (confirmation, password reset)</li>
              <li>To detect and prevent fraud or abuse</li>
              <li>To comply with legal obligations</li>
            </ul>
            <p style={{marginTop:"14px"}}>We do <strong>not</strong> sell your personal data. We do <strong>not</strong> use your data for advertising purposes. We do <strong>not</strong> share your data with third parties except as described in Section 4.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>4. Data sharing</h2>
            <p>We share your information only in these limited circumstances:</p>
            <ul style={{marginTop:"8px",paddingLeft:"20px",display:"flex",flexDirection:"column",gap:"8px"}}>
              <li><strong>Supabase</strong> — our database and authentication provider (stores your account data securely)</li>
              <li><strong>Vercel</strong> — our hosting provider (serves the website)</li>
              <li><strong>Google</strong> — only if you choose to sign in with Google</li>
              <li><strong>Law enforcement</strong> — if required by applicable law, court order, or governmental authority</li>
            </ul>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>5. California privacy rights (CCPA)</h2>
            <p>If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA):</p>
            <ul style={{marginTop:"8px",paddingLeft:"20px",display:"flex",flexDirection:"column",gap:"8px"}}>
              <li><strong>Right to know</strong> — You may request a copy of the personal information we have collected about you</li>
              <li><strong>Right to delete</strong> — You may request deletion of your personal information</li>
              <li><strong>Right to opt out</strong> — We do not sell personal information, so there is nothing to opt out of</li>
              <li><strong>Right to non-discrimination</strong> — We will not discriminate against you for exercising your CCPA rights</li>
            </ul>
            <p style={{marginTop:"14px"}}>To exercise these rights, email us at <a href="mailto:admin@flushpin.com" style={{color:"#1D9E75"}}>admin@flushpin.com</a>. We will respond within 45 days.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>6. GDPR rights (EEA users)</h2>
            <p>If you are located in the European Economic Area, you have the following rights under the General Data Protection Regulation (GDPR):</p>
            <ul style={{marginTop:"8px",paddingLeft:"20px",display:"flex",flexDirection:"column",gap:"8px"}}>
              <li>Right of access to your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure ("right to be forgotten")</li>
              <li>Right to restriction of processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
            </ul>
            <p style={{marginTop:"14px"}}>Our legal basis for processing your data is your consent (when you create an account) and our legitimate interest in operating a safe, functional platform.</p>
            <p style={{marginTop:"10px"}}>To exercise GDPR rights, contact us at <a href="mailto:admin@flushpin.com" style={{color:"#1D9E75"}}>admin@flushpin.com</a>.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>7. Data retention</h2>
            <p>We retain your account information for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it by law.</p>
            <p style={{marginTop:"10px"}}>Ratings and PIN contributions may remain on the platform in anonymized form after account deletion.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>8. Location data</h2>
            <p>We request access to your device location only to show you restrooms nearby. Location access is optional — you can use FlushPin without granting location permission. We do not store your precise location on our servers.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>9. Security</h2>
            <p>We use industry-standard security measures including encrypted connections (HTTPS), secure authentication via Supabase, and row-level security on our database. However, no system is 100% secure. If you believe your account has been compromised, contact us immediately.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>10. Children</h2>
            <p>FlushPin is not directed at children under 13. We do not knowingly collect personal information from children under 13. If we learn we have collected such information, we will delete it promptly.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>11. Changes to this policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on our website or emailing you. Continued use of FlushPin after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>12. Contact us</h2>
            <p>For any privacy-related questions or requests:</p>
            <p style={{marginTop:"10px"}}><strong>FlushPin</strong><br/>Orange County, California, USA<br/>Email: <a href="mailto:admin@flushpin.com" style={{color:"#1D9E75"}}>admin@flushpin.com</a></p>
          </section>

        </div>
      </div>

      <footer style={{background:"#0A2E1F",padding:"28px 20px",textAlign:"center"}}>
        <div style={{display:"flex",gap:"20px",justifyContent:"center",flexWrap:"wrap"}}>
          <a href="/privacy" style={{color:"#5DCAA5",fontSize:"13px",textDecoration:"none"}}>Privacy Policy</a>
          <a href="/terms" style={{color:"#5DCAA5",fontSize:"13px",textDecoration:"none"}}>Terms of Service</a>
          <a href="mailto:admin@flushpin.com" style={{color:"#5DCAA5",fontSize:"13px",textDecoration:"none"}}>Contact</a>
        </div>
        <p style={{color:"#2D6A4F",fontSize:"11px",marginTop:"12px"}}>© 2025 FlushPin. All rights reserved.</p>
      </footer>
    </main>
  )
}
