import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FlushPin for Business - Restroom Intent Marketing',
  description: 'Turn restroom access moments into measurable local campaigns with QR codes, offers, and owner analytics.',
  alternates: { canonical: 'https://www.flushpin.com/business' },
}

const businessPageHtml = `<style>
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Sora:wght@600;700;800&display=swap");

      :root {
        --fp-ink: #092321;
        --fp-ink-soft: #123633;
        --fp-muted: #5d6f6d;
        --fp-teal: #0eb5ab;
        --fp-teal-dark: #087e78;
        --fp-teal-wash: #e5fbf8;
        --fp-coral: #ff6b4a;
        --fp-cream: #fff7ed;
        --fp-line: rgba(9, 35, 33, 0.12);
        --fp-shadow: 0 24px 70px rgba(9, 35, 33, 0.14);
      }

      * {
        box-sizing: border-box;
      }

      html {
        scroll-behavior: smooth;
      }

      body {
        margin: 0;
        color: var(--fp-ink);
        background: #fff;
        font-family: "Plus Jakarta Sans", Inter, system-ui, sans-serif;
      }

      a {
        color: inherit;
      }

      .fp-business-page {
        overflow: hidden;
        background:
          linear-gradient(#fff 0%, #fff7ed 42%, #f7fbfa 100%);
      }

      .fp-nav {
        position: sticky;
        top: 0;
        z-index: 20;
        background: rgba(255, 255, 255, 0.94);
        backdrop-filter: blur(16px);
        border-bottom: 1px solid #f0f0f0;
        padding: 16px 20px;
      }

      .fp-nav-inner {
        width: min(1180px, 100%);
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
      }

      .fp-logo {
        display: inline-flex;
        align-items: center;
        text-decoration: none;
      }

      .fp-logo img {
        display: block;
        width: auto;
        height: 58px;
      }

      .fp-nav-links {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px;
        border: 1px solid rgba(9, 35, 33, 0.1);
        border-radius: 14px;
        background: #fff;
        box-shadow: 0 8px 22px rgba(9, 35, 33, 0.04);
      }

      .fp-nav-links a {
        border-radius: 10px;
        padding: 10px 14px;
        color: #425755;
        font-size: 15px;
        font-weight: 800;
        text-decoration: none;
        white-space: nowrap;
      }

      .fp-nav-divider {
        width: 1px;
        height: 28px;
        background: rgba(9, 35, 33, 0.14);
      }

      .fp-nav-links a:hover {
        color: var(--fp-teal);
      }

      .fp-nav-links .fp-dark-link {
        background: var(--fp-ink);
        color: #fff;
      }

      .fp-hero {
        min-height: 710px;
        padding: 70px 24px 58px;
        color: #fff;
        background-image:
          linear-gradient(90deg, rgba(9, 35, 33, 0.97) 0%, rgba(9, 35, 33, 0.86) 42%, rgba(9, 35, 33, 0.32) 100%),
          url("https://images.unsplash.com/photo-1756158449200-678a8de156ac?auto=format&fit=crop&w=2200&q=82");
        background-position: center;
        background-size: cover;
        position: relative;
      }

      .fp-hero-shell {
        width: min(1180px, 100%);
        margin: 0 auto;
        display: grid;
        grid-template-columns: minmax(0, 1.02fr) minmax(360px, 0.78fr);
        align-items: center;
        gap: 56px;
      }

      .fp-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 8px 14px;
        border: 1px solid rgba(255, 255, 255, 0.22);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.11);
        backdrop-filter: blur(14px);
        color: #d7fffb;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .fp-eyebrow::before {
        content: "";
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--fp-teal);
        box-shadow: 0 0 0 5px rgba(14, 181, 171, 0.18);
      }

      .fp-hero h1,
      .fp-section-heading h2,
      .fp-panel h2,
      .fp-final h2 {
        margin: 0;
        font-family: Sora, "Plus Jakarta Sans", system-ui, sans-serif;
        letter-spacing: -0.035em;
      }

      .fp-hero h1 {
        max-width: 760px;
        margin-top: 24px;
        font-size: clamp(44px, 6.2vw, 78px);
        font-weight: 800;
        line-height: 0.96;
      }

      .fp-hero h1 span {
        color: #7df4ea;
      }

      .fp-hero p {
        max-width: 610px;
        margin: 24px 0 0;
        color: rgba(255, 255, 255, 0.84);
        font-size: clamp(18px, 2.2vw, 22px);
        line-height: 1.58;
      }

      .fp-cta-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 28px;
      }

      .fp-button {
        min-height: 50px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 14px;
        padding: 14px 22px;
        border: 1px solid transparent;
        font-size: 15px;
        font-weight: 800;
        text-decoration: none;
        transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
      }

      .fp-button:hover {
        transform: translateY(-1px);
      }

      .fp-button-primary {
        color: #fff;
        background: var(--fp-teal);
        box-shadow: 0 12px 24px rgba(14, 181, 171, 0.22);
      }

      .fp-button-primary:hover {
        box-shadow: 0 18px 34px rgba(14, 181, 171, 0.26);
      }

      .fp-button-secondary {
        color: #fff;
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.28);
      }

      .fp-proof {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 28px;
      }

      .fp-proof span {
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 999px;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.09);
        color: rgba(255, 255, 255, 0.78);
        font-size: 13px;
        font-weight: 700;
      }

      .fp-intent-card {
        justify-self: end;
        width: min(540px, 100%);
        perspective: 1200px;
      }

      .fp-ipad {
        position: relative;
        border: 1px solid rgba(255, 255, 255, 0.56);
        border-radius: 34px;
        padding: 14px;
        background:
          linear-gradient(145deg, rgba(252, 255, 254, 0.98), rgba(178, 190, 188, 0.92));
        box-shadow:
          0 42px 90px rgba(0, 0, 0, 0.42),
          inset 0 0 0 1px rgba(255, 255, 255, 0.62);
        transform: rotate(-2deg);
      }

      .fp-ipad::before {
        content: "";
        position: absolute;
        top: 50%;
        left: 7px;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #243331;
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.28);
        transform: translateY(-50%);
        z-index: 2;
      }

      .fp-ipad::after {
        content: "";
        position: absolute;
        inset: 10px;
        border-radius: 27px;
        pointer-events: none;
        box-shadow: inset 0 0 0 1px rgba(9, 35, 33, 0.08);
      }

      .fp-intent-screen {
        min-height: 520px;
        overflow: hidden;
        position: relative;
        border: 1px solid rgba(9, 35, 33, 0.1);
        border-radius: 24px;
        padding: 18px;
        background:
          radial-gradient(circle at 88% 6%, rgba(255, 107, 74, 0.18), transparent 26%),
          linear-gradient(180deg, #f8fffd 0%, #eefbf8 100%);
      }

      .fp-cockpit-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 18px;
      }

      .fp-cockpit-kicker {
        display: block;
        color: var(--fp-teal-dark);
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .fp-cockpit-top h3 {
        margin: 5px 0 0;
        color: var(--fp-ink);
        font-size: 23px;
        letter-spacing: -0.03em;
      }

      .fp-live-pill {
        flex: 0 0 auto;
        border: 1px solid rgba(14, 181, 171, 0.22);
        border-radius: 999px;
        padding: 8px 11px;
        color: var(--fp-teal-dark);
        background: rgba(229, 251, 248, 0.9);
        font-size: 12px;
        font-weight: 900;
      }

      .fp-conversion-flow {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 9px;
        margin-bottom: 14px;
      }

      .fp-flow-step {
        min-height: 92px;
        border: 1px solid rgba(9, 35, 33, 0.08);
        border-radius: 17px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.86);
        box-shadow: 0 14px 32px rgba(9, 35, 33, 0.07);
      }

      .fp-flow-step strong {
        display: block;
        width: 32px;
        height: 32px;
        margin-bottom: 9px;
        border-radius: 11px;
        color: #fff;
        background: var(--fp-teal);
        font-size: 18px;
        line-height: 32px;
        text-align: center;
      }

      .fp-flow-step:nth-child(2) strong {
        background: var(--fp-coral);
      }

      .fp-flow-step:nth-child(3) strong {
        background: var(--fp-ink);
      }

      .fp-flow-step span {
        display: block;
        color: var(--fp-ink);
        font-size: 13px;
        font-weight: 900;
        line-height: 1.28;
      }

      .fp-offer-module {
        border: 1px solid rgba(14, 181, 171, 0.18);
        border-radius: 22px;
        padding: 18px;
        background: #fff;
        box-shadow: 0 22px 48px rgba(9, 35, 33, 0.12);
      }

      .fp-ipad-dashboard {
        display: grid;
        grid-template-columns: 1.05fr 0.78fr;
        gap: 12px;
        align-items: stretch;
      }

      .fp-offer-module small {
        display: block;
        color: var(--fp-muted);
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .fp-offer-module h4 {
        margin: 8px 0 6px;
        color: var(--fp-ink);
        font-size: 22px;
        letter-spacing: -0.03em;
      }

      .fp-offer-module p {
        margin: 0 0 14px;
        color: var(--fp-muted);
        font-size: 13px;
        line-height: 1.48;
      }

      .fp-code-reveal {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        border-radius: 16px;
        padding: 14px;
        color: #fff;
        background: linear-gradient(135deg, #092321, #0b4a43);
      }

      .fp-code-reveal span {
        display: block;
        color: rgba(255, 255, 255, 0.68);
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.07em;
        text-transform: uppercase;
      }

      .fp-code-reveal strong {
        display: block;
        margin-top: 3px;
        font-size: 23px;
        letter-spacing: 0.08em;
      }

      .fp-code-reveal em {
        border-radius: 999px;
        padding: 8px 10px;
        color: #06211e;
        background: #7df4ea;
        font-size: 12px;
        font-style: normal;
        font-weight: 900;
        white-space: nowrap;
      }

      .fp-owner-metrics {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .fp-owner-metric {
        border: 1px solid rgba(9, 35, 33, 0.08);
        border-radius: 16px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.78);
      }

      .fp-owner-metric strong {
        display: block;
        color: var(--fp-ink);
        font-size: 24px;
        letter-spacing: -0.04em;
        line-height: 1;
      }

      .fp-owner-metric span {
        display: block;
        margin-top: 7px;
        color: var(--fp-muted);
        font-size: 12px;
        font-weight: 800;
        line-height: 1.28;
      }

      .fp-revenue-note {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 15px;
        border: 1px solid rgba(255, 107, 74, 0.2);
        border-radius: 18px;
        padding: 13px;
        color: var(--fp-ink);
        background: #fff7ed;
        font-size: 13px;
        font-weight: 900;
        line-height: 1.35;
      }

      .fp-traffic-chart {
        margin-top: 11px;
        border: 1px solid rgba(9, 35, 33, 0.08);
        border-radius: 18px;
        padding: 13px;
        background: rgba(255, 255, 255, 0.8);
      }

      .fp-traffic-chart span {
        display: block;
        margin-bottom: 10px;
        color: var(--fp-muted);
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .fp-bars {
        display: flex;
        align-items: end;
        gap: 7px;
        height: 78px;
      }

      .fp-bars i {
        display: block;
        flex: 1;
        min-width: 8px;
        border-radius: 999px 999px 6px 6px;
        background: rgba(14, 181, 171, 0.22);
      }

      .fp-bars i:nth-child(1) { height: 24%; }
      .fp-bars i:nth-child(2) { height: 38%; }
      .fp-bars i:nth-child(3) { height: 52%; }
      .fp-bars i:nth-child(4) { height: 82%; background: var(--fp-teal); }
      .fp-bars i:nth-child(5) { height: 68%; background: rgba(255, 107, 74, 0.72); }
      .fp-bars i:nth-child(6) { height: 44%; }

      .fp-ipad-caption {
        margin: 14px auto 0;
        width: fit-content;
        max-width: 92%;
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 999px;
        padding: 8px 12px;
        color: rgba(255, 255, 255, 0.82);
        background: rgba(9, 35, 33, 0.54);
        backdrop-filter: blur(14px);
        font-size: 13px;
        font-weight: 850;
        text-align: center;
      }

      .fp-revenue-note b {
        display: grid;
        flex: 0 0 auto;
        width: 34px;
        height: 34px;
        place-items: center;
        border-radius: 12px;
        color: #fff;
        background: var(--fp-coral);
      }

      .fp-section {
        width: min(1120px, calc(100% - 40px));
        margin: 0 auto;
        padding: 76px 0;
      }

      .fp-stat-grid,
      .fp-feature-grid,
      .fp-flow,
      .fp-source-grid {
        display: grid;
        gap: 18px;
      }

      .fp-stat-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .fp-stat {
        min-height: 178px;
        border: 1px solid var(--fp-line);
        border-radius: 22px;
        padding: 24px;
        background: rgba(255, 255, 255, 0.88);
        box-shadow: 0 18px 45px rgba(9, 35, 33, 0.08);
      }

      .fp-stat strong {
        display: block;
        margin-bottom: 10px;
        color: var(--fp-ink);
        font-size: clamp(28px, 4vw, 46px);
        font-weight: 800;
        letter-spacing: -0.04em;
        line-height: 1;
      }

      .fp-stat span {
        display: block;
        color: var(--fp-muted);
        font-size: 14px;
        font-weight: 700;
        line-height: 1.5;
      }

      .fp-stat a,
      .fp-source-card a {
        color: var(--fp-teal-dark);
        font-weight: 800;
        text-decoration: none;
      }

      .fp-section-heading {
        max-width: 760px;
        margin: 0 auto 34px;
        text-align: center;
      }

      .fp-section-heading h2 {
        color: var(--fp-ink);
        font-size: clamp(30px, 4.6vw, 52px);
        line-height: 1.04;
      }

      .fp-section-heading p {
        margin: 14px 0 0;
        color: var(--fp-muted);
        font-size: 17px;
        line-height: 1.65;
      }

      .fp-feature-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .fp-feature {
        min-height: 310px;
        border: 1px solid var(--fp-line);
        border-radius: 24px;
        padding: 24px;
        background: rgba(255, 255, 255, 0.86);
        box-shadow: 0 18px 45px rgba(9, 35, 33, 0.06);
      }

      .fp-feature-visual {
        height: 126px;
        margin-bottom: 20px;
        border: 1px solid rgba(9, 35, 33, 0.08);
        border-radius: 18px;
        padding: 14px;
        overflow: hidden;
        position: relative;
        background: linear-gradient(135deg, #e6fbf8, #fff1e9);
      }

      .fp-mini-line {
        height: 10px;
        margin-bottom: 10px;
        border-radius: 999px;
        background: rgba(9, 35, 33, 0.12);
      }

      .fp-mini-line.teal {
        width: 78%;
        background: rgba(14, 181, 171, 0.22);
      }

      .fp-mini-line.short {
        width: 54%;
      }

      .fp-feature h3 {
        margin: 0 0 10px;
        color: var(--fp-ink);
        font-size: 21px;
        letter-spacing: -0.02em;
      }

      .fp-feature p {
        margin: 0;
        color: var(--fp-muted);
        font-size: 15px;
        line-height: 1.65;
      }

      .fp-panel {
        display: grid;
        grid-template-columns: 1fr 0.78fr;
        align-items: stretch;
        gap: 26px;
        border-radius: 28px;
        padding: 34px;
        color: #fff;
        background:
          radial-gradient(circle at 92% 12%, rgba(14, 181, 171, 0.28), transparent 30%),
          var(--fp-ink);
        box-shadow: var(--fp-shadow);
      }

      .fp-panel h2 {
        max-width: 670px;
        font-size: clamp(30px, 4vw, 50px);
        line-height: 1.06;
      }

      .fp-panel p {
        max-width: 640px;
        margin: 16px 0 0;
        color: rgba(255, 255, 255, 0.74);
        font-size: 16px;
        line-height: 1.7;
      }

      .fp-dashboard {
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 22px;
        padding: 22px;
        background: rgba(255, 255, 255, 0.09);
      }

      .fp-dashboard-label {
        color: #7df4ea;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .fp-dashboard-bars {
        margin-top: 20px;
        display: grid;
        gap: 12px;
      }

      .fp-dashboard-bars span {
        height: 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.18);
      }

      .fp-dashboard-bars span:nth-child(2) {
        width: 76%;
        background: rgba(14, 181, 171, 0.42);
      }

      .fp-dashboard-bars span:nth-child(3) {
        width: 58%;
      }

      .fp-dashboard-metrics {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin-top: 26px;
      }

      .fp-dashboard-metric {
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 16px;
        padding: 14px;
      }

      .fp-dashboard-metric strong {
        display: block;
        margin-bottom: 4px;
        font-size: 24px;
      }

      .fp-dashboard-metric span {
        color: rgba(255, 255, 255, 0.64);
        font-size: 13px;
      }

      .fp-flow {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        counter-reset: flow;
      }

      .fp-flow-card {
        position: relative;
        min-height: 210px;
        border: 1px solid var(--fp-line);
        border-radius: 22px;
        padding: 24px;
        background: rgba(255, 255, 255, 0.9);
      }

      .fp-flow-card::before {
        counter-increment: flow;
        content: "0" counter(flow);
        display: inline-flex;
        width: 38px;
        height: 38px;
        align-items: center;
        justify-content: center;
        margin-bottom: 18px;
        border-radius: 12px;
        color: #fff;
        background: var(--fp-teal);
        font-size: 13px;
        font-weight: 800;
      }

      .fp-flow-card h3 {
        margin: 0 0 9px;
        font-size: 18px;
        letter-spacing: -0.02em;
      }

      .fp-flow-card p {
        margin: 0;
        color: var(--fp-muted);
        font-size: 14px;
        line-height: 1.62;
      }

      .fp-source-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .fp-package-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
        align-items: stretch;
      }

      .fp-package {
        display: flex;
        flex-direction: column;
        min-height: 520px;
        border: 1px solid var(--fp-line);
        border-radius: 24px;
        padding: 24px;
        background: rgba(255, 255, 255, 0.9);
        box-shadow: 0 18px 45px rgba(9, 35, 33, 0.08);
      }

      .fp-package-platinum {
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.28);
        background:
          radial-gradient(circle at 86% 8%, rgba(255, 217, 128, 0.18), transparent 30%),
          linear-gradient(145deg, #061c19 0%, #082622 54%, #0a403a 100%);
        box-shadow: 0 28px 72px rgba(9, 35, 33, 0.26);
      }

      .fp-package-kicker {
        margin-bottom: 10px;
        color: var(--fp-teal-dark);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .fp-package-platinum .fp-package-kicker {
        color: #ffe7a3;
      }

      .fp-package-platinum h3 {
        color: #ffffff;
      }

      .fp-package-platinum .fp-package-note {
        color: rgba(255, 255, 255, 0.94);
      }

      .fp-package-platinum li {
        color: rgba(255, 255, 255, 0.96);
      }

      .fp-package h3 {
        margin: 0;
        font-size: 23px;
        letter-spacing: -0.03em;
      }

      .fp-price {
        margin: 16px 0 8px;
        color: var(--fp-ink);
        font-size: 36px;
        font-weight: 800;
        letter-spacing: -0.05em;
        line-height: 1;
      }

      .fp-package-platinum .fp-price {
        color: #ffffff;
      }

      .fp-price small {
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0;
      }

      .fp-package-note {
        min-height: 48px;
        margin: 0 0 20px;
        color: var(--fp-muted);
        font-size: 14px;
        line-height: 1.55;
      }

      .fp-package ul {
        display: grid;
        gap: 10px;
        margin: 0 0 22px;
        padding: 0;
        list-style: none;
      }

      .fp-package li {
        color: var(--fp-muted);
        font-size: 14px;
        font-weight: 700;
        line-height: 1.42;
      }

      .fp-package li::before {
        content: "✓";
        margin-right: 8px;
        color: var(--fp-teal);
        font-weight: 800;
      }

      .fp-package-platinum li::before {
        color: #ffd980;
      }

      .fp-package .fp-button {
        width: 100%;
        margin-top: auto;
      }

      .fp-package-platinum .fp-button {
        color: var(--fp-ink);
        background: #ffd980;
        box-shadow: 0 16px 34px rgba(255, 217, 128, 0.22);
      }

      .fp-partner-strip {
        border: 1px dashed rgba(9, 35, 33, 0.18);
        border-radius: 24px;
        padding: 26px;
        background: rgba(255, 255, 255, 0.62);
      }

      .fp-partner-heading {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 18px;
        margin-bottom: 18px;
      }

      .fp-partner-heading h2 {
        margin: 0;
        font-family: Sora, "Plus Jakarta Sans", system-ui, sans-serif;
        font-size: clamp(24px, 3vw, 36px);
        letter-spacing: -0.03em;
      }

      .fp-partner-heading p {
        max-width: 420px;
        margin: 0;
        color: var(--fp-muted);
        font-size: 14px;
        line-height: 1.6;
      }

      .fp-logo-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 12px;
      }

      .fp-logo-slot {
        display: flex;
        min-height: 76px;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(9, 35, 33, 0.08);
        border-radius: 18px;
        background: rgba(247, 251, 250, 0.76);
        color: rgba(93, 111, 109, 0.64);
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .fp-source-card {
        border: 1px solid var(--fp-line);
        border-radius: 20px;
        padding: 22px;
        background: #fff;
      }

      .fp-source-card strong {
        display: block;
        margin-bottom: 8px;
        font-size: 18px;
      }

      .fp-source-card p {
        margin: 0 0 12px;
        color: var(--fp-muted);
        font-size: 14px;
        line-height: 1.6;
      }

      .fp-final {
        padding: 70px 24px;
        text-align: center;
        color: #fff;
        background: #071a18;
      }

      .fp-final-inner {
        width: min(820px, 100%);
        margin: 0 auto;
      }

      .fp-final h2 {
        font-size: clamp(32px, 5vw, 56px);
        line-height: 1.05;
      }

      .fp-final p {
        margin: 18px auto 0;
        max-width: 650px;
        color: rgba(255, 255, 255, 0.72);
        font-size: 17px;
        line-height: 1.68;
      }

      .fp-footer {
        padding: 34px 24px;
        color: rgba(255, 255, 255, 0.68);
        background: #071a18;
        border-top: 1px solid rgba(255, 255, 255, 0.12);
      }

      .fp-footer-inner {
        width: min(1120px, 100%);
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        font-size: 13px;
      }

      .fp-footer-links {
        display: flex;
        gap: 18px;
        flex-wrap: wrap;
      }

      .fp-footer a {
        color: rgba(255, 255, 255, 0.78);
        font-weight: 700;
        text-decoration: none;
      }

      @media (max-width: 980px) {
        .fp-hero {
          min-height: auto;
        }

        .fp-hero-shell,
        .fp-panel {
          grid-template-columns: 1fr;
        }

        .fp-intent-card {
          justify-self: start;
        }

        .fp-stat-grid,
        .fp-flow {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .fp-package-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .fp-feature-grid,
        .fp-source-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 640px) {
        .fp-logo img {
          height: 52px;
        }

        .fp-nav {
          padding: 12px 14px;
        }

        .fp-nav-inner {
          gap: 12px;
        }

        .fp-nav-links {
          max-width: calc(100vw - 116px);
          overflow-x: auto;
          scrollbar-width: none;
          gap: 6px;
          padding: 5px;
        }

        .fp-nav-links::-webkit-scrollbar {
          display: none;
        }

        .fp-nav-links a {
          font-size: 13px;
          padding: 9px 11px;
        }

        .fp-nav-divider {
          display: none;
        }

        .fp-hero {
          padding: 42px 20px 38px;
        }

        .fp-hero h1 {
          font-size: clamp(38px, 12vw, 52px);
        }

        .fp-hero p {
          font-size: 17px;
          line-height: 1.52;
        }

        .fp-intent-card {
          display: none;
        }

        .fp-section {
          width: min(100% - 28px, 1120px);
          padding: 58px 0;
        }

        .fp-stat-grid,
        .fp-flow,
        .fp-dashboard-metrics,
        .fp-package-grid,
        .fp-logo-grid {
          grid-template-columns: 1fr;
        }

        .fp-panel {
          padding: 24px;
        }

        .fp-package-platinum {
          transform: none;
        }

        .fp-partner-heading {
          display: block;
        }

        .fp-partner-heading p {
          margin-top: 10px;
        }
      }
    
</style>
<main class="fp-business-page">
      <section class="fp-hero">
        <div class="fp-hero-shell">
          <div>
            <div class="fp-eyebrow">Turn restroom questions into customers</div>
            <h1>Someone asks for the restroom. <span>Show them one reason to buy.</span></h1>
            <p>
              FlushPin gives your shop a simple QR flow: the guest scans, sees one short offer,
              gets the restroom code, and you see whether that moment created a visit, a sale,
              or a repeat customer.
            </p>
            <div class="fp-cta-row">
              <a class="fp-button fp-button-primary" href="mailto:hello@flushpin.com?subject=FlushPin%20Business%20Call&body=Hi%20FlushPin%2C%0A%0AI%20would%20like%20to%20set%20a%20short%20meeting.%20My%20shop%20name%20is%3A%0AMy%20best%20days%2Ftimes%20are%3A%0A">Tell us when you are available</a>
              <a class="fp-button fp-button-secondary" href="#packages">See packages</a>
            </div>
            <div class="fp-proof">
              <span>QR at the counter or restroom door</span>
              <span>One respectful offer before the code</span>
              <span>Simple proof after every scan</span>
            </div>
          </div>

          <aside class="fp-intent-card" aria-label="Business conversion dashboard preview">
            <div class="fp-ipad">
              <div class="fp-intent-screen">
                <div class="fp-cockpit-top">
                  <div>
                    <span class="fp-cockpit-kicker">FlushPin Business on iPad</span>
                    <h3>Restroom-to-customer dashboard</h3>
                  </div>
                  <span class="fp-live-pill">Today</span>
                </div>

                <div class="fp-conversion-flow" aria-label="QR offer code flow">
                  <div class="fp-flow-step">
                    <strong>1</strong>
                    <span>Guest needs restroom access</span>
                  </div>
                  <div class="fp-flow-step">
                    <strong>2</strong>
                    <span>Your offer appears once</span>
                  </div>
                  <div class="fp-flow-step">
                    <strong>3</strong>
                    <span>Code opens, result is tracked</span>
                  </div>
                </div>

                <div class="fp-ipad-dashboard">
                  <div>
                    <div class="fp-offer-module">
                      <small>Offer before code</small>
                      <h4>Buy any latte, get a cookie</h4>
                      <p>A clear, friendly offer shown at the exact moment someone is already in your shop.</p>
                      <div class="fp-code-reveal">
                        <div>
                          <span>Restroom code unlocked</span>
                          <strong>2486</strong>
                        </div>
                        <em>Offer viewed</em>
                      </div>
                    </div>
                    <div class="fp-revenue-note">
                      <b>$</b>
                      The restroom question becomes a trackable customer moment.
                    </div>
                  </div>

                  <div>
                    <div class="fp-owner-metrics" aria-label="Owner metrics">
                      <div class="fp-owner-metric">
                        <strong>186</strong>
                        <span>people asked today</span>
                      </div>
                      <div class="fp-owner-metric">
                        <strong>42</strong>
                        <span>saw the offer</span>
                      </div>
                      <div class="fp-owner-metric">
                        <strong>18</strong>
                        <span>came back</span>
                      </div>
                    </div>
                    <div class="fp-traffic-chart" aria-label="Peak restroom traffic chart">
                      <span>Peak demand</span>
                      <div class="fp-bars">
                        <i></i>
                        <i></i>
                        <i></i>
                        <i></i>
                        <i></i>
                        <i></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="fp-ipad-caption">A shop owner sees restroom requests, offers, code reveals, and repeat demand in one place.</div>
          </aside>
        </div>
      </section>

      <section class="fp-section" aria-label="Retail restroom opportunity">
        <div class="fp-stat-grid">
          <article class="fp-stat">
            <strong>1 in 2</strong>
            <span>
              NIDDK says researchers estimate about half of women experience urinary incontinence.
              Restroom access is a real daily need, not a small convenience. <a href="https://www.niddk.nih.gov/health-information/urologic-diseases/bladder-control-problems/definition-facts">NIDDK</a>
            </span>
          </article>
          <article class="fp-stat">
            <strong>1 in 3</strong>
            <span>
              NIDDK reports as many as one in three men over 65 may accidentally lose urine.
              A clear access flow helps people avoid an awkward counter conversation. <a href="https://www.niddk.nih.gov/health-information/urologic-diseases/bladder-control-problems/definition-facts">NIDDK</a>
            </span>
          </article>
          <article class="fp-stat">
            <strong>IBD</strong>
            <span>
              Crohn's disease and ulcerative colitis are forms of inflammatory bowel disease that affect
              the GI tract and everyday life. Access can feel urgent and private. <a href="https://www.crohnscolitisfoundation.org/patientsandcaregivers/what-is-ibd">Crohn's & Colitis Foundation</a>
            </span>
          </article>
          <article class="fp-stat">
            <strong>1 offer</strong>
            <span>
              Stop making guests ask for a code in front of the coffee line. Let them scan, see one respectful
              offer, get the code, and give your shop a chance to earn the visit.
            </span>
          </article>
        </div>
      </section>

      <section class="fp-section" id="model">
        <div class="fp-section-heading">
          <h2>One simple idea: if they ask, they are already close.</h2>
          <p>
            A person asking for the restroom is not a random online click. They are nearby, inside,
            or at your counter. FlushPin helps you answer politely and show one offer before the code.
          </p>
        </div>

        <div class="fp-feature-grid">
          <article class="fp-feature">
            <div class="fp-feature-visual">
              <div class="fp-mini-line" style="width: 90%"></div>
              <div class="fp-mini-line teal"></div>
              <div class="fp-mini-line short"></div>
            </div>
            <h3>Staff stops repeating codes</h3>
            <p>
              Put the QR near the counter or restroom door. Staff can point once, and the guest gets the current rule.
            </p>
          </article>

          <article class="fp-feature">
            <div class="fp-feature-visual">
              <div class="fp-mini-line" style="width: 72%"></div>
              <div class="fp-mini-line teal" style="width: 92%"></div>
              <div class="fp-mini-line short" style="width: 62%"></div>
            </div>
            <h3>The offer is short and respectful</h3>
            <p>
              No spam wall. No long ad. Just one useful offer: coffee, pastry, water, sandwich, or a comeback coupon.
            </p>
          </article>

          <article class="fp-feature">
            <div class="fp-feature-visual">
              <div class="fp-mini-line" style="width: 58%"></div>
              <div class="fp-mini-line teal" style="width: 84%"></div>
              <div class="fp-mini-line short" style="width: 72%"></div>
            </div>
            <h3>You see what worked</h3>
            <p>
              See how many people scanned, which hours were busy, which offer was viewed, and whether people came back.
            </p>
          </article>
        </div>
      </section>

      <section class="fp-section" id="packages">
        <div class="fp-section-heading">
          <h2>Two memberships. Easy choice.</h2>
          <p>
            Free keeps your public listing accurate. Gold turns restroom requests into a simple local offer system
            for $49 per shop per month. Ten or more locations get custom pricing.
          </p>
        </div>

        <div class="fp-package-grid">
          <article class="fp-package">
            <div class="fp-package-kicker">Control your listing</div>
            <h3>Free Listing</h3>
            <div class="fp-price">$0 <small>/ shop</small></div>
            <p class="fp-package-note">For shops that want correct restroom information without running offers.</p>
            <ul>
              <li>Claim or correct your public listing</li>
              <li>Show your restroom rule clearly</li>
              <li>Reduce wrong community information</li>
              <li>Good for open, closed, or ask-staff policies</li>
              <li>No QR offer flow</li>
              <li>No conversion dashboard</li>
            </ul>
            <a class="fp-button fp-button-secondary" style="color: var(--fp-ink); border-color: var(--fp-line)" href="mailto:hello@flushpin.com?subject=FlushPin%20Community%20Plan">Ask about free listing</a>
          </article>

          <article class="fp-package fp-package-platinum">
            <div class="fp-package-kicker">Convert restroom traffic</div>
            <h3>Gold QR</h3>
            <div class="fp-price">$49 <small>/ shop / month</small></div>
            <p class="fp-package-note">For shops that want to turn restroom questions into customers and repeat visits.</p>
            <ul>
              <li>QR sticker for counter, receipt area, or restroom door</li>
              <li>One short offer before the code appears</li>
              <li>Restroom code reveal without staff repeating it</li>
              <li>Dashboard for scans, offer views, peak hours, and repeat demand</li>
              <li>Offer templates for coffee, pastry, sandwich, water, or return coupons</li>
              <li>Respectful ad policy: one offer, clear wording, no pressure</li>
              <li>Custom pricing for 10+ shop operators</li>
            </ul>
            <a class="fp-button" href="mailto:hello@flushpin.com?subject=FlushPin%20Gold%20Meeting&body=Hi%20FlushPin%2C%0A%0AI%20am%20interested%20in%20Gold.%20Please%20call%20me%20to%20set%20a%20meeting.%0A%0AShop%20name%3A%0ANumber%20of%20locations%3A%0ABest%20days%2Ftimes%3A%0APhone%3A%0A">Have FlushPin call me</a>
          </article>
        </div>
      </section>

      <section class="fp-section">
        <div class="fp-panel">
          <div>
            <h2>This is not restroom advertising. It is restroom intent.</h2>
            <p>
              Traditional ads guess who might care. FlushPin starts when someone is already at your business
              and needs a small favor. You answer the restroom question, show one useful offer, reveal the code,
              and learn which moments can become customers.
            </p>
            <div class="fp-cta-row">
              <a class="fp-button fp-button-primary" href="mailto:hello@flushpin.com?subject=FlushPin%20Business%20Meeting">Tell us your availability</a>
              <a class="fp-button fp-button-secondary" href="#sources">Review data sources</a>
            </div>
          </div>
          <aside class="fp-dashboard" aria-label="Dashboard preview">
            <div class="fp-dashboard-label">Gold conversion preview</div>
            <div class="fp-dashboard-bars">
              <span style="width: 92%"></span>
              <span></span>
              <span></span>
            </div>
            <div class="fp-dashboard-metrics">
              <div class="fp-dashboard-metric">
                <strong>184</strong>
                <span>Restroom requests</span>
              </div>
              <div class="fp-dashboard-metric">
                <strong>37%</strong>
                <span>Saw the offer</span>
              </div>
              <div class="fp-dashboard-metric">
                <strong>2-5p</strong>
                <span>Busiest window</span>
              </div>
              <div class="fp-dashboard-metric">
                <strong>+12%</strong>
                <span>Conversion target</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section class="fp-section">
        <div class="fp-section-heading">
          <h2>How the customer moment works.</h2>
          <p>
            Simple enough for a busy cafe owner, bakery owner, or restaurant manager to understand in ten seconds.
          </p>
        </div>

        <div class="fp-flow">
          <article class="fp-flow-card">
            <h3>They need the restroom</h3>
            <p>A parent, driver, shopper, tourist, or delivery worker is already nearby and wants a clear answer.</p>
          </article>
          <article class="fp-flow-card">
            <h3>Your rule is clear</h3>
            <p>Set customer-only, ask-staff, QR code, no public restroom, or temporary changes in plain language.</p>
          </article>
          <article class="fp-flow-card">
            <h3>One offer appears</h3>
            <p>The guest sees one short offer before the code: useful, local, and easy to ignore if they are in a hurry.</p>
          </article>
          <article class="fp-flow-card">
            <h3>You learn what happened</h3>
            <p>Scans, offer views, code reveals, peak hours, and repeat demand become visible in one owner view.</p>
          </article>
        </div>
      </section>

      <section class="fp-section" id="sources">
        <div class="fp-section-heading">
          <h2>Why this moment deserves respect.</h2>
          <p>
            Many people who ask for a restroom are not browsing casually. Some are managing urgency,
            medical conditions, age, pregnancy, travel, kids, or anxiety. FlushPin helps businesses answer
            clearly without turning a private need into a public conversation.
          </p>
        </div>

        <div class="fp-source-grid">
          <article class="fp-source-card">
            <strong>Bladder control problems can affect daily life</strong>
            <p>
              NIDDK explains that bladder control problems can make people avoid normal activities and may
              cause embarrassment before they can get to a toilet. A QR code lets a shop help without a scene.
            </p>
            <a href="https://www.niddk.nih.gov/health-information/urologic-diseases/bladder-control-problems/definition-facts">Read NIDDK</a>
          </article>
          <article class="fp-source-card">
            <strong>IBD is not just a policy issue; it is a daily life issue</strong>
            <p>
              The Crohn's & Colitis Foundation describes IBD as chronic inflammation of the GI tract and says
              it affects a person's whole life. Clear restroom rules can make a business feel humane.
            </p>
            <a href="https://www.crohnscolitisfoundation.org/patientsandcaregivers/what-is-ibd">Read Crohn's & Colitis Foundation</a>
          </article>
          <article class="fp-source-card">
            <strong>Prostate symptoms can include frequent restroom trips</strong>
            <p>
              The American Cancer Society lists needing to urinate more often, especially at night, among
              possible prostate cancer symptoms. Access language should be simple, fast, and respectful.
            </p>
            <a href="https://www.cancer.org/cancer/types/prostate-cancer/detection-diagnosis-staging/signs-symptoms.html">Read American Cancer Society</a>
          </article>
        </div>
      </section>

      <section class="fp-final">
        <div class="fp-final-inner">
          <h2>The restroom question can become a customer moment.</h2>
          <p>
            FlushPin keeps the exchange respectful: scan, see one offer, get the code, and let the shop learn
            from the result. The goal is not to bother people. The goal is to turn an everyday question into
            a fair chance to earn a customer.
          </p>
          <div class="fp-cta-row" style="justify-content: center">
            <a class="fp-button fp-button-primary" href="mailto:hello@flushpin.com?subject=FlushPin%20Business%20Call&body=Hi%20FlushPin%2C%0A%0APlease%20contact%20me%20to%20set%20a%20meeting.%0A%0AShop%20name%3A%0ABest%20days%2Ftimes%3A%0APhone%3A%0A">Tell us when to call you</a>
          </div>
        </div>
      </section>
    </main>`

export default function BusinessPage() {
  return <div dangerouslySetInnerHTML={{ __html: businessPageHtml }} />
}
