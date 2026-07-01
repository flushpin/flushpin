'use client'

import { useLang } from '../../lib/LanguageContext'
import LanguageToggle from '../../components/LanguageToggle'

const BUSINESS_STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800;900&family=Manrope:wght@700;800&display=swap");
*{box-sizing:border-box}body{margin:0}.fpb{--ink:#071917;--muted:#5d6d69;--teal:#0eb5ab;--leaf:#194d42;--lime:#d9f76f;--coral:#ff6f4a;--cream:#fff8ec;--line:rgba(7,25,23,.12);background:#fbfffd;color:var(--ink);font-family:Inter,system-ui,sans-serif;overflow:hidden}.fpb a{color:inherit}.fp-nav{position:sticky;top:0;z-index:30;background:rgba(251,255,253,.9);backdrop-filter:blur(18px);border-bottom:1px solid rgba(7,25,23,.08);padding:12px 18px}.fp-nav-inner{width:min(1180px,100%);margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px}.fp-logo{display:inline-flex;align-items:center;text-decoration:none}.fp-logo img{display:block;height:58px;width:auto}.fp-nav-links{display:flex;align-items:center;gap:9px}.fp-nav-links a{min-height:42px;border-radius:12px;padding:11px 16px;font-size:14px;font-weight:850;text-decoration:none;color:#314d49}.fp-nav-links a:hover{color:var(--teal)}.fp-nav-links .fp-dark{background:var(--ink);color:#fff}.fp-lang{display:flex;background:#edf5f3;border-radius:12px;padding:3px}.fp-lang button{border:0;border-radius:9px;padding:7px 10px;background:transparent;cursor:pointer;font-weight:800;font-size:13px}.fp-hero{min-height:720px;padding:66px 22px 54px;color:#fff;background-image:linear-gradient(90deg,rgba(7,25,23,.96),rgba(7,25,23,.8) 46%,rgba(7,25,23,.24)),url("https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=2400&q=84");background-size:cover;background-position:center;display:grid;align-items:center}.fp-shell{width:min(1180px,100%);margin:0 auto;display:grid;grid-template-columns:minmax(0,1.04fr) minmax(340px,.76fr);align-items:center;gap:50px}.fp-kicker{display:inline-flex;align-items:center;gap:9px;border:1px solid rgba(255,255,255,.22);border-radius:999px;background:rgba(255,255,255,.11);backdrop-filter:blur(16px);padding:8px 13px;color:#d9fffb;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.04em}.fp-kicker:before{content:"";width:8px;height:8px;border-radius:50%;background:var(--lime);box-shadow:0 0 0 5px rgba(217,247,111,.18)}.fp-hero h1,.fp-heading h2,.fp-panel h2,.fp-final h2{font-family:Manrope,Inter,system-ui,sans-serif;letter-spacing:0}.fp-hero h1{max-width:780px;margin:22px 0 20px;font-size:clamp(44px,6.9vw,86px);line-height:.91;font-weight:900}.fp-hero h1 span{color:#8ffff5}.fp-hero p{max-width:640px;margin:0;color:rgba(255,255,255,.84);font-size:clamp(18px,2.25vw,22px);line-height:1.56}.fp-cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}.fp-btn{min-height:52px;border-radius:15px;padding:14px 20px;text-decoration:none;font-weight:900;display:inline-flex;align-items:center;justify-content:center}.fp-btn.teal{background:var(--teal);color:#fff;box-shadow:0 18px 38px rgba(14,181,171,.25)}.fp-btn.light{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.28);color:#fff}.fp-proof{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}.fp-proof span{border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(255,255,255,.1);padding:8px 12px;color:rgba(255,255,255,.8);font-size:13px;font-weight:800}.fp-phone{justify-self:end;width:min(414px,100%);aspect-ratio:430/932;border-radius:58px;padding:10px;background:linear-gradient(135deg,#f3f0e9 0%,#a7a29a 13%,#f9f7f1 24%,#8f8a82 50%,#f4f1ea 78%,#77726b 100%);border:1px solid rgba(255,255,255,.58);box-shadow:0 56px 120px rgba(0,0,0,.46),inset 0 0 0 1px rgba(255,255,255,.68);position:relative;transform:rotate(1.4deg);backdrop-filter:blur(20px)}.fp-phone:before{content:"";position:absolute;left:-5px;top:150px;width:4px;height:78px;border-radius:6px 0 0 6px;background:linear-gradient(#d8d4cc,#77726c)}.fp-phone:after{content:"";position:absolute;right:-5px;top:215px;width:4px;height:106px;border-radius:0 6px 6px 0;background:linear-gradient(#d8d4cc,#77726c)}.fp-screen{height:100%;border-radius:49px;background:#f8fffd;overflow:hidden;position:relative;border:9px solid #080b0b;color:var(--ink);box-shadow:inset 0 0 0 1px rgba(255,255,255,.18),inset 0 0 26px rgba(0,0,0,.18)}.fp-app-shot{display:block;width:100%;height:100%;object-fit:cover;object-position:top center}.fp-label{display:block;color:#087e78;font-size:11px;font-weight:950;letter-spacing:.06em;text-transform:uppercase}.fp-section{width:min(1120px,calc(100% - 40px));margin:0 auto;padding:76px 0}.fp-heading{text-align:center;max-width:780px;margin:0 auto 34px}.fp-heading h2{margin:0;font-size:clamp(32px,4.8vw,58px);line-height:.98;font-weight:900}.fp-heading p{margin:14px 0 0;color:var(--muted);font-size:17px;line-height:1.65}.fp-stats,.fp-grid,.fp-flow,.fp-pricing{display:grid;gap:16px}.fp-stats{grid-template-columns:repeat(4,minmax(0,1fr))}.fp-stat,.fp-card,.fp-step,.fp-plan{border:1px solid var(--line);border-radius:24px;background:#fff;box-shadow:0 18px 45px rgba(7,25,23,.06)}.fp-stat{min-height:170px;padding:23px}.fp-stat b{display:block;font-size:clamp(30px,4vw,48px);line-height:1;margin-bottom:10px}.fp-stat span{display:block;color:var(--muted);font-size:14px;line-height:1.5;font-weight:700}.fp-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.fp-card{padding:24px;min-height:300px}.fp-card-img{height:128px;border-radius:18px;background-size:cover;background-position:center;margin-bottom:20px;position:relative;overflow:hidden}.fp-card h3{margin:0 0 10px;font-size:22px}.fp-card p{margin:0;color:var(--muted);line-height:1.65}.fp-panel{display:grid;grid-template-columns:1fr .72fr;gap:26px;align-items:stretch;border-radius:30px;background:#071917;color:#fff;padding:34px;box-shadow:0 28px 72px rgba(7,25,23,.2)}.fp-panel h2{margin:0;font-size:clamp(32px,4.4vw,56px);line-height:1}.fp-panel p{margin:16px 0 0;color:rgba(255,255,255,.74);font-size:16px;line-height:1.7}.fp-dashboard{border:1px solid rgba(255,255,255,.14);border-radius:24px;background:rgba(255,255,255,.08);padding:20px}.fp-bars{display:grid;gap:11px;margin-top:16px}.fp-bars span{height:11px;border-radius:999px;background:rgba(255,255,255,.18)}.fp-bars span:nth-child(2){width:72%;background:rgba(14,181,171,.48)}.fp-dash-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:22px}.fp-dash-grid div{border:1px solid rgba(255,255,255,.14);border-radius:16px;padding:14px}.fp-dash-grid b{display:block;font-size:24px}.fp-dash-grid span{font-size:12px;color:rgba(255,255,255,.66)}.fp-flow{grid-template-columns:repeat(4,minmax(0,1fr));counter-reset:flow}.fp-step{min-height:218px;padding:24px}.fp-step:before{counter-increment:flow;content:"0" counter(flow);width:40px;height:40px;border-radius:14px;background:var(--teal);color:#fff;display:grid;place-items:center;font-size:13px;font-weight:900;margin-bottom:18px}.fp-step h3{margin:0 0 9px;font-size:18px}.fp-step p{margin:0;color:var(--muted);font-size:14px;line-height:1.62}.fp-pricing{grid-template-columns:repeat(2,minmax(0,1fr));align-items:stretch}.fp-plan{padding:26px;min-height:520px;display:flex;flex-direction:column}.fp-plan.gold{background:linear-gradient(145deg,#061c19,#082622 54%,#0a403a);color:#fff;border-color:rgba(255,255,255,.24);box-shadow:0 30px 80px rgba(7,25,23,.24)}.fp-plan h3{margin:0;font-size:26px}.fp-price{font-size:42px;font-weight:950;margin:16px 0 8px}.fp-price small{font-size:13px}.fp-plan p,.fp-plan li{color:var(--muted);line-height:1.55;font-weight:700}.fp-plan.gold p,.fp-plan.gold li{color:rgba(255,255,255,.82)}.fp-plan ul{display:grid;gap:10px;margin:18px 0 24px;padding:0;list-style:none}.fp-plan li:before{content:"✓";color:var(--teal);font-weight:950;margin-right:8px}.fp-plan.gold li:before{color:var(--lime)}.fp-plan .fp-btn{width:100%;margin-top:auto}.fp-final{padding:72px 22px;text-align:center;color:#fff;background:#071917}.fp-final-inner{width:min(820px,100%);margin:0 auto}.fp-final h2{margin:0;font-size:clamp(34px,5vw,60px);line-height:1}.fp-final p{margin:18px auto 0;max-width:650px;color:rgba(255,255,255,.72);font-size:17px;line-height:1.68}.fp-footer{background:#071917;color:rgba(255,255,255,.68);border-top:1px solid rgba(255,255,255,.12);padding:32px 22px}.fp-footer-inner{width:min(1120px,100%);margin:0 auto;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;font-size:13px}.fp-footer a{color:rgba(255,255,255,.78);font-weight:800;text-decoration:none;margin-left:16px}
@media(max-width:980px){.fp-shell,.fp-panel{grid-template-columns:1fr}.fp-phone{justify-self:start}.fp-stats,.fp-flow{grid-template-columns:repeat(2,minmax(0,1fr))}.fp-grid{grid-template-columns:1fr}}@media(max-width:640px){.fp-logo img{height:52px}.fp-nav-links a:not(.fp-dark){display:none}.fp-hero{min-height:auto;padding:42px 18px 38px}.fp-hero h1{font-size:clamp(40px,13vw,58px)}.fp-hero p{font-size:17px}.fp-phone{display:none}.fp-section{width:min(100% - 28px,1120px);padding:58px 0}.fp-stats,.fp-flow,.fp-pricing,.fp-dash-grid{grid-template-columns:1fr}.fp-panel{padding:24px}.fp-footer a{margin-left:0;margin-right:14px}}
`

export default function BusinessPageContent() {
  const { t } = useLang()
  const b = t.business

  return (
    <main className="fpb">
      <style>{BUSINESS_STYLES}</style>
      <nav className="fp-nav" aria-label="Main navigation">
        <div className="fp-nav-inner">
          <a className="fp-logo" href="/" aria-label="FlushPin home">
            <img src="/flushpin-logo-teal.png" alt="FlushPin" />
          </a>
          <div className="fp-nav-links">
            <LanguageToggle />
            <a href="/map">{b.navFind}</a>
            <a href="#plans">{b.navPlans}</a>
            <a className="fp-dark" href="mailto:hello@flushpin.com?subject=FlushPin%20Business%20Call">{b.navMeeting}</a>
          </div>
        </div>
      </nav>

      <section className="fp-hero">
        <div className="fp-shell">
          <div>
            <div className="fp-kicker">{b.kicker}</div>
            <h1>{b.heroTitle} <span>{b.heroTitleAccent}</span></h1>
            <p>{b.heroDesc}</p>
            <div className="fp-cta">
              <a className="fp-btn teal" href="mailto:hello@flushpin.com?subject=FlushPin%20Gold%20Meeting&body=Hi%20FlushPin%2C%0A%0AI%20want%20to%20talk%20about%20QR%20restroom%20access.%0A%0AShop%20name%3A%0ALocations%3A%0APhone%3A%0ABest%20time%3A">{b.ctaCall}</a>
              <a className="fp-btn light" href="#how">{b.ctaHow}</a>
            </div>
            <div className="fp-proof">
              <span>{b.proofQr}</span>
              <span>{b.proofAd}</span>
              <span>{b.proofCampaign}</span>
              <span>{b.proofStaff}</span>
            </div>
          </div>
          <aside className="fp-phone" aria-label="FlushPin restroom code entry preview">
            <div className="fp-screen">
              <img className="fp-app-shot" src="/flushpin-business-code-hero.png" alt="FlushPin restroom code entry screen" />
            </div>
          </aside>
        </div>
      </section>

      <section className="fp-section">
        <div className="fp-stats">
          <article className="fp-stat"><b>{b.statLess}</b><span>{b.statLessDesc}</span></article>
          <article className="fp-stat"><b>{b.statMore}</b><span>{b.statMoreDesc}</span></article>
          <article className="fp-stat"><b>{b.statValue}</b><span>{b.statValueDesc}</span></article>
          <article className="fp-stat"><b>{b.statPrice}</b><span>{b.statPriceDesc}</span></article>
        </div>
      </section>

      <section className="fp-section">
        <div className="fp-heading">
          <h2>{b.counterTitle}</h2>
          <p>{b.counterDesc}</p>
        </div>
        <div className="fp-grid">
          <article className="fp-card">
            <div className="fp-card-img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=82')" }} />
            <h3>{b.card1Title}</h3>
            <p>{b.card1Desc}</p>
          </article>
          <article className="fp-card">
            <div className="fp-card-img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=82')" }} />
            <h3>{b.card2Title}</h3>
            <p>{b.card2Desc}</p>
          </article>
          <article className="fp-card">
            <div className="fp-card-img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=900&q=82')" }} />
            <h3>{b.card3Title}</h3>
            <p>{b.card3Desc}</p>
          </article>
        </div>
      </section>

      <section className="fp-section">
        <div className="fp-panel">
          <div>
            <h2>{b.goldTitle}</h2>
            <p>{b.goldPanelDesc}</p>
            <div className="fp-cta">
              <a className="fp-btn teal" href="#plans">{b.viewGold}</a>
              <a className="fp-btn light" href="mailto:hello@flushpin.com?subject=FlushPin%20Pilot%20Program">{b.startPilot}</a>
            </div>
          </div>
          <aside className="fp-dashboard">
            <span className="fp-label">{b.campaignPreview}</span>
            <div className="fp-bars"><span style={{ width: '92%' }} /><span /><span style={{ width: '58%' }} /></div>
            <div className="fp-dash-grid">
              <div><b>37%</b><span>{b.offerInterest}</span></div>
              <div><b>+12%</b><span>{b.trafficTarget}</span></div>
              <div><b>41</b><span>{b.codeReveals}</span></div>
              <div><b>Sat</b><span>{b.busiestDay}</span></div>
            </div>
          </aside>
        </div>
      </section>

      <section className="fp-section" id="health">
        <div className="fp-heading">
          <h2>{b.healthTitle}</h2>
          <p>{b.healthDesc}</p>
        </div>
        <div className="fp-stats">
          <article className="fp-stat">
            <b>WHO</b>
            <span>The World Health Organization links sanitation to human well-being, dignity, safety, and economic opportunity. <a href="https://www.who.int/news-room/fact-sheets/detail/sanitation">WHO sanitation fact sheet</a></span>
          </article>
          <article className="fp-stat">
            <b>16%</b>
            <span>NIDDK says about 16 out of 100 U.S. adults have constipation symptoms; among adults 60+, about 33 out of 100 do. <a href="https://www.niddk.nih.gov/health-information/digestive-diseases/constipation/definition-facts">NIDDK constipation facts</a></span>
          </article>
          <article className="fp-stat">
            <b>BPH</b>
            <span>NIDDK lists urinary urgency, frequency, nocturia, and trouble emptying the bladder among enlarged-prostate symptoms. <a href="https://www.niddk.nih.gov/health-information/urologic-diseases/prostate-problems/enlarged-prostate-benign-prostatic-hyperplasia">NIDDK BPH facts</a></span>
          </article>
          <article className="fp-stat">
            <b>IBD</b>
            <span>Crohn&apos;s and colitis can create urgent restroom needs. Retail access policies should recognize that some requests are medical, not optional. <a href="https://www.crohnscolitisfoundation.org/what-is-ibd">Crohn&apos;s &amp; Colitis Foundation</a></span>
          </article>
        </div>
      </section>

      <section className="fp-section" id="how">
        <div className="fp-heading">
          <h2>{b.howTitle}</h2>
          <p>{b.howDesc}</p>
        </div>
        <div className="fp-flow">
          <article className="fp-step"><h3>{b.step1Title}</h3><p>{b.step1Desc}</p></article>
          <article className="fp-step"><h3>{b.step2Title}</h3><p>{b.step2Desc}</p></article>
          <article className="fp-step"><h3>{b.step3Title}</h3><p>{b.step3Desc}</p></article>
          <article className="fp-step"><h3>{b.step4Title}</h3><p>{b.step4Desc}</p></article>
        </div>
      </section>

      <section className="fp-section" id="plans">
        <div className="fp-heading">
          <h2>{b.plansTitle}</h2>
          <p>{b.plansDesc}</p>
        </div>
        <div className="fp-pricing">
          <article className="fp-plan">
            <span className="fp-label">{b.freeLabel}</span>
            <h3>{b.freeName}</h3>
            <div className="fp-price">{b.freePrice} <small>{b.freePriceUnit}</small></div>
            <p>{b.freeDesc}</p>
            <ul>{b.freeFeatures.map((item) => <li key={item}>{item}</li>)}</ul>
            <a className="fp-btn teal" href="mailto:hello@flushpin.com?subject=FlushPin%20Free%20Listing">{b.freeCta}</a>
          </article>
          <article className="fp-plan gold">
            <span className="fp-label" style={{ color: '#d9f76f' }}>{b.goldLabel}</span>
            <h3>{b.goldName}</h3>
            <div className="fp-price">{b.goldPrice} <small>{b.goldPriceUnit}</small></div>
            <p>{b.goldDesc}</p>
            <ul>{b.goldFeatures.map((item) => <li key={item}>{item}</li>)}</ul>
            <a className="fp-btn teal" href="mailto:hello@flushpin.com?subject=FlushPin%20Gold%20Meeting&body=Hi%20FlushPin%2C%0A%0AI%20am%20interested%20in%20Gold.%0A%0AShop%20name%3A%0ANumber%20of%20locations%3A%0APhone%3A%0ABest%20time%3A">{b.goldCta}</a>
          </article>
        </div>
      </section>

      <section className="fp-final">
        <div className="fp-final-inner">
          <h2>{b.finalTitle}</h2>
          <p>{b.finalDesc}</p>
          <div className="fp-cta" style={{ justifyContent: 'center' }}>
            <a className="fp-btn teal" href="mailto:hello@flushpin.com?subject=FlushPin%20Business%20Call">{b.finalCta}</a>
          </div>
        </div>
      </section>

      <footer className="fp-footer">
        <div className="fp-footer-inner">
          <span>© 2026 FlushPin. {b.footerTagline}</span>
          <span>
            <a href="/privacy">{b.privacy}</a>
            <a href="/terms">{b.terms}</a>
            <a href="/contact">{b.contact}</a>
          </span>
        </div>
      </footer>
    </main>
  )
}
