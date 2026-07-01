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
        gap: 10px;
      }

      .fp-nav-links a {
        border-radius: 9px;
        padding: 10px 16px;
        color: #425755;
        font-size: 15px;
        font-weight: 750;
        text-decoration: none;
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
        grid-template-columns: 1fr;
        align-items: center;
        gap: 56px;
      }

      @media (min-width: 981px) {
        .fp-hero-shell {
          grid-template-columns: minmax(0, 1.02fr) minmax(360px, 0.78fr);
        }
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
        width: min(420px, 100%);
        border: 1px solid rgba(255, 255, 255, 0.42);
        border-radius: 36px;
        padding: 14px;
        background: linear-gradient(145deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.38));
        backdrop-filter: blur(22px);
        box-shadow: 0 38px 90px rgba(0, 0, 0, 0.38);
      }

      .fp-intent-screen {
        min-height: 540px;
        overflow: hidden;
        position: relative;
        border: 1px solid rgba(9, 35, 33, 0.1);
        border-radius: 28px;
        background:
          linear-gradient(90deg, rgba(14, 181, 171, 0.08) 1px, transparent 1px) 0 0 / 56px 56px,
          linear-gradient(rgba(14, 181, 171, 0.08) 1px, transparent 1px) 0 0 / 56px 56px,
          #f6faf8;
      }

      .fp-map-pin {
        position: absolute;
        width: 42px;
        height: 42px;
        border-radius: 50% 50% 50% 8px;
        transform: rotate(-45deg);
        background: var(--fp-teal);
        box-shadow: 0 14px 26px rgba(14, 181, 171, 0.32);
      }

      .fp-map-pin::after {
        content: "";
        position: absolute;
        top: 14px;
        left: 14px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #fff;
      }

      .fp-map-pin.one {
        top: 88px;
        left: 72px;
      }

      .fp-map-pin.two {
        top: 152px;
        right: 62px;
        background: var(--fp-coral);
      }

      .fp-map-pin.three {
        right: 106px;
        bottom: 188px;
        background: var(--fp-ink);
      }

      .fp-offer-sheet {
        position: absolute;
        left: 22px;
        right: 22px;
        bottom: 22px;
        border: 1px solid rgba(9, 35, 33, 0.08);
        border-radius: 24px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.96);
        box-shadow: 0 24px 54px rgba(9, 35, 33, 0.2);
      }

      .fp-offer-sheet small {
        display: block;
        color: var(--fp-muted);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .fp-offer-sheet h3 {
        margin: 8px 0 5px;
        color: var(--fp-ink);
        font-size: 21px;
        letter-spacing: -0.02em;
      }

      .fp-offer-sheet p {
        margin: 0;
        color: var(--fp-muted);
        font-size: 13px;
        line-height: 1.45;
      }

      .fp-offer-box {
        margin-top: 16px;
        border: 1px solid #c8ede9;
        border-radius: 16px;
        padding: 14px;
        background: var(--fp-teal-wash);
      }

      .fp-offer-box strong {
        display: block;
        color: var(--fp-ink);
        font-size: 16px;
        line-height: 1.35;
      }

      .fp-offer-box span {
        display: block;
        margin-top: 5px;
        color: var(--fp-teal-dark);
        font-size: 12px;
        font-weight: 800;
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
          padding: 14px 18px;
        }

        .fp-nav-inner {
          flex-wrap: wrap;
          gap: 12px;
        }

        .fp-nav-links {
          width: 100%;
          flex-wrap: wrap;
          gap: 8px;
        }

        .fp-nav-links a {
          padding: 8px 12px;
          font-size: 14px;
        }

        .fp-hero {
          min-height: auto;
          padding: 48px 20px 40px;
        }

        .fp-intent-card {
          justify-self: center;
          max-width: min(390px, 100%);
          margin: 0 auto;
        }
      }

      @media (max-width: 389px) {
        .fp-logo img {
          height: 44px;
        }

        .fp-hero {
          padding: 42px 18px 34px;
        }

        .fp-intent-card {
          display: none;
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
      <nav class="fp-nav" aria-label="Main navigation">
        <div class="fp-nav-inner">
          <a class="fp-logo" href="https://www.flushpin.com/" aria-label="FlushPin home">
            <img src="/flushpin-logo-teal.png" alt="FlushPin" height="58" style="height:58px;width:auto;display:block" />
          </a>
          <div class="fp-nav-links">
            <a href="https://www.flushpin.com/map">Find a Restroom</a>
            <a href="#sources">Sources</a>
            <a class="fp-dark-link" href="mailto:hello@flushpin.com?subject=FlushPin%20Business%20Call">Set a meeting</a>
          </div>
        </div>
      </nav>

      <section class="fp-hero">
        <div class="fp-hero-shell">
          <div>
            <div class="fp-eyebrow">Data analytics for local restroom traffic</div>
            <h1>Turn restroom scans into <span>daily sales signals.</span></h1>
            <p>
              FlushPin helps neighborhood cafes, bakeries, and small restaurants manage restroom access
              with a QR workflow: the guest sees a short offer for a few seconds, gets the current code,
              and the owner reads the data behind every scan, hour, campaign, and repeat pattern.
            </p>
            <div class="fp-cta-row">
              <a class="fp-button fp-button-primary" href="mailto:hello@flushpin.com?subject=FlushPin%20Business%20Call&body=Hi%20FlushPin%2C%0A%0AI%20would%20like%20to%20set%20a%20short%20meeting.%20My%20shop%20name%20is%3A%0AMy%20best%20days%2Ftimes%20are%3A%0A">Tell us when you are available</a>
              <a class="fp-button fp-button-secondary" href="#packages">See packages</a>
            </div>
            <div class="fp-proof">
              <span>QR restroom sticker</span>
              <span>Short offer before code reveal</span>
              <span>Data dashboard for owners</span>
            </div>
          </div>

          <aside class="fp-intent-card" aria-label="Business offer preview">
            <div class="fp-intent-screen">
              <div class="fp-map-pin one"></div>
              <div class="fp-map-pin two"></div>
              <div class="fp-map-pin three"></div>
              <div class="fp-offer-sheet">
                <small>Restroom access available</small>
                <h3>Corner Bakery campaign</h3>
                <p>Guest watches a short offer, then receives the current restroom code.</p>
                <div class="fp-offer-box">
                  <strong>Today: add drip coffee for $1 with any croissant.</strong>
                  <span>Scan logged into the owner dashboard</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section class="fp-section" aria-label="Retail restroom opportunity">
        <div class="fp-stat-grid">
          <article class="fp-stat">
            <strong>$1M</strong>
            <span>
              LA's Runyon Canyon restroom project became a public debate because access is expensive,
              emotional, and local. <a href="https://www.sfgate.com/la/article/runyon-canyon-bathroom-22253324.php">SFGATE</a>
            </span>
          </article>
          <article class="fp-stat">
            <strong>$1.7M</strong>
            <span>
              San Francisco's Noe Valley toilet estimate turned one restroom into national news before
              costs were reduced. <a href="https://www.theguardian.com/us-news/2024/apr/22/san-francisco-public-toilet-bathroom-opens">The Guardian</a>
            </span>
          </article>
          <article class="fp-stat">
            <strong>Code</strong>
            <span>
              Customer-only bathrooms, keypads, and counter keys are becoming normal in urban retail.
              FlushPin makes that gate measurable. <a href="https://www.theatlantic.com/ideas/2026/04/fare-gate-society-bart/686868/">The Atlantic</a>
            </span>
          </article>
          <article class="fp-stat">
            <strong>+12%</strong>
            <span>
              FlushPin's Gold target: help shops turn QR restroom traffic into more campaign-driven value
              through offers, scans, and analytics.
            </span>
          </article>
        </div>
      </section>

      <section class="fp-section" id="model">
        <div class="fp-section-heading">
          <h2>The business page should sell one simple idea.</h2>
          <p>
            A person asking for a restroom code is already inside or right outside the shop. FlushPin turns
            that moment into a clean data loop: QR scan, short campaign view, password access, and analytics
            the owner can actually use.
          </p>
        </div>

        <div class="fp-feature-grid">
          <article class="fp-feature">
            <div class="fp-feature-visual">
              <div class="fp-mini-line" style="width: 90%"></div>
              <div class="fp-mini-line teal"></div>
              <div class="fp-mini-line short"></div>
            </div>
            <h3>Access becomes controlled</h3>
            <p>
              Put a QR sticker near the counter or restroom door. Staff can point to the sticker instead of
              repeating the code all day.
            </p>
          </article>

          <article class="fp-feature">
            <div class="fp-feature-visual">
              <div class="fp-mini-line" style="width: 72%"></div>
              <div class="fp-mini-line teal" style="width: 92%"></div>
              <div class="fp-mini-line short" style="width: 62%"></div>
            </div>
            <h3>Offers fit the moment</h3>
            <p>
              Before the code appears, the guest sees a short coffee, pastry, sandwich, water, or comeback
              coupon campaign.
            </p>
          </article>

          <article class="fp-feature">
            <div class="fp-feature-visual">
              <div class="fp-mini-line" style="width: 58%"></div>
              <div class="fp-mini-line teal" style="width: 84%"></div>
              <div class="fp-mini-line short" style="width: 72%"></div>
            </div>
            <h3>Analytics stays practical</h3>
            <p>
              The owner sees scans by day, peak hours, campaign views, offer performance, and whether restroom
              traffic is creating measurable value.
            </p>
          </article>
        </div>
      </section>

      <section class="fp-section" id="packages">
        <div class="fp-section-heading">
          <h2>Two packages. One clear business model.</h2>
          <p>
            Free gets a shop listed. Gold turns restroom traffic into a measurable campaign channel for
            $49 per shop per month. Businesses with 10 or more locations get custom pricing.
          </p>
        </div>

        <div class="fp-package-grid">
          <article class="fp-package">
            <div class="fp-package-kicker">Entry package</div>
            <h3>Free</h3>
            <div class="fp-price">$0 <small>/ shop</small></div>
            <p class="fp-package-note">For small shops that want basic visibility and control over incorrect restroom information.</p>
            <ul>
              <li>Basic listing visibility</li>
              <li>Request corrections for wrong access details</li>
              <li>Public restroom policy note</li>
              <li>No QR campaign sticker</li>
              <li>No password reveal workflow</li>
              <li>No analytics dashboard</li>
            </ul>
            <a class="fp-button fp-button-secondary" style="color: var(--fp-ink); border-color: var(--fp-line)" href="mailto:hello@flushpin.com?subject=FlushPin%20Community%20Plan">Ask about free listing</a>
          </article>

          <article class="fp-package fp-package-platinum">
            <div class="fp-package-kicker">Paid growth package</div>
            <h3>Gold</h3>
            <div class="fp-price">$49 <small>/ shop / month</small></div>
            <p class="fp-package-note">For shops that want QR access, campaign views, and a data dashboard.</p>
            <ul>
              <li>QR sticker for restroom door, counter, or receipt area</li>
              <li>Guest sees a short campaign before the code</li>
              <li>Password reveal without staff repeating it every time</li>
              <li>Dashboard for scans, usage rate, peak hours, and campaign views</li>
              <li>Daily value target: help turn restroom traffic into 12% more campaign-driven shop benefit</li>
              <li>Offer ideas for coffee, pastry, sandwich, water, or comeback coupons</li>
              <li>Custom pricing for 10+ shop operators</li>
            </ul>
            <a class="fp-button" href="mailto:hello@flushpin.com?subject=FlushPin%20Gold%20Meeting&body=Hi%20FlushPin%2C%0A%0AI%20am%20interested%20in%20Gold.%20Please%20call%20me%20to%20set%20a%20meeting.%0A%0AShop%20name%3A%0ANumber%20of%20locations%3A%0ABest%20days%2Ftimes%3A%0APhone%3A%0A">Have FlushPin call me</a>
          </article>
        </div>
      </section>

      <section class="fp-section">
        <div class="fp-panel">
          <div>
            <h2>Restroom traffic is data. Gold turns it into action.</h2>
            <p>
              In Los Angeles, San Francisco, and other dense cities, restroom access can become a daily
              operational headache for small shops. FlushPin turns that pressure into a calmer workflow:
              scan the QR, view a short campaign, reveal the code, and send the scan into an owner dashboard
              that shows when restroom traffic happens and which offer deserves attention.
            </p>
            <div class="fp-cta-row">
              <a class="fp-button fp-button-primary" href="mailto:hello@flushpin.com?subject=FlushPin%20Business%20Meeting">Tell us your availability</a>
              <a class="fp-button fp-button-secondary" href="#sources">Review data sources</a>
            </div>
          </div>
          <aside class="fp-dashboard" aria-label="Dashboard preview">
            <div class="fp-dashboard-label">Gold analytics preview</div>
            <div class="fp-dashboard-bars">
              <span style="width: 92%"></span>
              <span></span>
              <span></span>
            </div>
            <div class="fp-dashboard-metrics">
              <div class="fp-dashboard-metric">
                <strong>184</strong>
                <span>Monthly QR scans</span>
              </div>
              <div class="fp-dashboard-metric">
                <strong>37%</strong>
                <span>Offer view rate</span>
              </div>
              <div class="fp-dashboard-metric">
                <strong>2-5p</strong>
                <span>Peak demand</span>
              </div>
              <div class="fp-dashboard-metric">
                <strong>+12%</strong>
                <span>Daily value target</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section class="fp-section">
        <div class="fp-section-heading">
          <h2>How the moment works.</h2>
          <p>
            The product story should be concrete enough that a bakery owner understands it in ten seconds.
          </p>
        </div>

        <div class="fp-flow">
          <article class="fp-flow-card">
            <h3>Customer scans or searches</h3>
            <p>A parent, driver, shopper, tourist, or delivery worker needs fast restroom guidance.</p>
          </article>
          <article class="fp-flow-card">
            <h3>Your rule is clear</h3>
            <p>The owner sets whether access is customer-only, ask-staff, QR code, or temporarily unavailable.</p>
          </article>
          <article class="fp-flow-card">
            <h3>Offer appears first</h3>
            <p>The user sees a respectful croissant, coffee, sandwich, or return-visit offer before the code.</p>
          </article>
          <article class="fp-flow-card">
            <h3>Owner reads the data</h3>
            <p>Scans, offer views, peak hours, and campaign performance become visible in one admin view.</p>
          </article>
        </div>
      </section>

      <section class="fp-section" id="sources">
        <div class="fp-section-heading">
          <h2>What shop owners are already seeing.</h2>
          <p>
            This is not a distant policy story. It is a daily retail problem: cities struggle to build
            public restrooms, shops add codes and customer-only rules, and every scan can become a local offer.
          </p>
        </div>

        <div class="fp-source-grid">
          <article class="fp-source-card">
            <strong>At Runyon Canyon's $1M LA bathrooms, the anger is overflowing</strong>
            <p>
              LA restroom access is not a quiet back-office issue; it creates neighborhood debate, cost pressure,
              and daily demand. For nearby shops, that demand can become a tracked QR moment instead of a random interruption.
            </p>
            <a href="https://www.sfgate.com/la/article/runyon-canyon-bathroom-22253324.php">Read on SFGATE</a>
          </article>
          <article class="fp-source-card">
            <strong>Relief as San Francisco public toilet finally opens - and not for $1.7m after all</strong>
            <p>
              One public restroom estimate became a citywide story. When public supply is slow and expensive,
              local businesses become the practical place where access decisions happen.
            </p>
            <a href="https://www.theguardian.com/us-news/2024/apr/22/san-francisco-public-toilet-bathroom-opens">Read in The Guardian</a>
          </article>
          <article class="fp-source-card">
            <strong>San Francisco Solved Metro Vandalism With One Neat Trick</strong>
            <p>
              The story connects modern access control with customer-only bathrooms, keypads, and digital gates.
              FlushPin brings that same idea to small retail with an offer before the code.
            </p>
            <a href="https://www.theatlantic.com/ideas/2026/04/fare-gate-society-bart/686868/">Read in The Atlantic</a>
          </article>
        </div>
      </section>

      <section class="fp-final">
        <div class="fp-final-inner">
          <h2>The restroom code can become a measurable local campaign.</h2>
          <p>
            FlushPin makes the exchange simple: a guest scans, sees a short offer, receives the code, and
            the shop learns from the data. The goal is to help small businesses capture more value from
            restroom traffic without making staff or guests feel uncomfortable.
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
