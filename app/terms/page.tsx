export default function TermsPage() {
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
        <h1 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"clamp(28px,5vw,40px)",fontWeight:"700",color:"#0A2E1F",marginBottom:"8px"}}>Terms of Service</h1>
        <p style={{color:"#999",fontSize:"14px",marginBottom:"40px"}}>Last updated: May 28, 2025. Effective date: May 28, 2025.</p>

        <div style={{display:"flex",flexDirection:"column",gap:"36px",color:"#444",lineHeight:"1.8",fontSize:"15px"}}>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>1. Acceptance of terms</h2>
            <p>By accessing or using FlushPin ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. These terms apply to all users, including visitors, registered users, and businesses.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>2. Description of service</h2>
            <p>FlushPin is a community platform that allows users to find, submit, and rate restroom PIN codes at nearby businesses. The platform is available at www.flushpin.com. FlushPin relies on community contributions and does not guarantee the accuracy or availability of any information displayed.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>3. User accounts</h2>
            <ul style={{paddingLeft:"20px",display:"flex",flexDirection:"column",gap:"8px"}}>
              <li>You must provide accurate information when creating an account</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You may not create multiple accounts or impersonate others</li>
              <li>You must be at least 13 years old to use FlushPin</li>
              <li>Your full name will appear publicly next to your contributions</li>
            </ul>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>4. User contributions</h2>
            <p>When you submit PIN codes, ratings, or comments, you agree that:</p>
            <ul style={{marginTop:"8px",paddingLeft:"20px",display:"flex",flexDirection:"column",gap:"8px"}}>
              <li>The information you submit is accurate to the best of your knowledge</li>
              <li>You will not submit false, misleading, or harmful information</li>
              <li>You grant FlushPin a non-exclusive, royalty-free license to display and use your contributions</li>
              <li>You will not submit private information about individuals without their consent</li>
              <li>FlushPin may remove any contribution that violates these terms</li>
            </ul>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>5. Prohibited conduct</h2>
            <p>You agree not to:</p>
            <ul style={{marginTop:"8px",paddingLeft:"20px",display:"flex",flexDirection:"column",gap:"8px"}}>
              <li>Submit deliberately false or misleading PIN codes or ratings</li>
              <li>Harass, threaten, or harm other users or businesses</li>
              <li>Attempt to access systems or data you are not authorized to access</li>
              <li>Use the Service for any unlawful purpose</li>
              <li>Scrape, crawl, or copy content from the platform without permission</li>
              <li>Manipulate ratings or reviews for competitive advantage</li>
            </ul>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>6. Business listings</h2>
            <p>Businesses listed on FlushPin may be added by users or the FlushPin team. If you are a business and wish to claim, correct, or remove your listing, contact us at <a href="mailto:admin@flushpin.com" style={{color:"#1D9E75"}}>admin@flushpin.com</a>. We will respond within 5 business days.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>7. Disclaimer of warranties</h2>
            <p>FlushPin is provided "as is" without warranty of any kind. We do not guarantee that PIN codes are accurate, current, or functional. Restroom access policies are set by businesses and may change at any time. Use of PIN codes found on FlushPin is at your own risk.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>8. Limitation of liability</h2>
            <p>To the maximum extent permitted by law, FlushPin and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to inability to access a restroom, reliance on inaccurate PIN information, or data loss.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>9. Governing law</h2>
            <p>These Terms are governed by the laws of the State of California, United States, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Orange County, California.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>10. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at any time for violation of these Terms. You may delete your account at any time by contacting us at <a href="mailto:admin@flushpin.com" style={{color:"#1D9E75"}}>admin@flushpin.com</a>.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>11. Changes to terms</h2>
            <p>We may update these Terms at any time. We will notify users of material changes by posting a notice on the website. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>12. Contact</h2>
            <p><strong>FlushPin</strong><br/>Orange County, California, USA<br/>Email: <a href="mailto:admin@flushpin.com" style={{color:"#1D9E75"}}>admin@flushpin.com</a></p>
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
