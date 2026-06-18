'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLang } from '../lib/LanguageContext'
import AppStoreLink from './AppStoreLink'

const footerGroups = { en: [
  {
    title: 'Explore',
    links: [
      { href: '/', label: 'Home' },
      { href: '/map', label: 'Find a Restroom' },
      { href: '/business', label: 'For Businesses' },
      { href: '/signup', label: 'Join free' },
    ],
  },
  {
    title: 'For Shops',
    links: [
      { href: '/business#model', label: 'How it works' },
      { href: '/business#packages', label: 'Free and Gold plans' },
      { href: '/business/claim', label: 'Claim a business' },
      { href: '/contact', label: 'Talk to FlushPin' },
    ],
  },
  {
    title: 'Guides',
    links: [
      { href: '/restrooms/california', label: 'California guides' },
      { href: '/restrooms/california/los-angeles', label: 'Los Angeles' },
      { href: '/restrooms/california/san-francisco', label: 'San Francisco' },
      { href: '/restrooms/california/orange-county', label: 'Orange County' },
      { href: '/restrooms/california/san-diego', label: 'San Diego' },
      { href: '/restrooms/orange-county/irvine', label: 'Irvine' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
      { href: '/safety', label: 'Safety Notice' },
      { href: '/optout', label: 'Business opt-out' },
    ],
  },
],
  es: [
  {
    title: 'Explorar',
    links: [
      { href: '/', label: 'Inicio' },
      { href: '/map', label: 'Encontrar un baño' },
      { href: '/business', label: 'Para negocios' },
      { href: '/signup', label: 'Únete gratis' },
    ],
  },
  {
    title: 'Para tiendas',
    links: [
      { href: '/business#model', label: 'Cómo funciona' },
      { href: '/business#packages', label: 'Planes Free y Gold' },
      { href: '/business/claim', label: 'Reclamar negocio' },
      { href: '/contact', label: 'Hablar con FlushPin' },
    ],
  },
  {
    title: 'Guías',
    links: [
      { href: '/restrooms/california', label: 'Guías de California' },
      { href: '/restrooms/california/los-angeles', label: 'Los Ángeles' },
      { href: '/restrooms/california/san-francisco', label: 'San Francisco' },
      { href: '/restrooms/california/orange-county', label: 'Orange County' },
      { href: '/restrooms/california/san-diego', label: 'San Diego' },
      { href: '/restrooms/orange-county/irvine', label: 'Irvine' },
    ],
  },
  {
    title: 'Confianza',
    links: [
      { href: '/privacy', label: 'Política de privacidad' },
      { href: '/terms', label: 'Términos de servicio' },
      { href: '/safety', label: 'Aviso de seguridad' },
      { href: '/optout', label: 'Opt-out para negocios' },
    ],
  },
] }

export default function SiteFooter() {
  const { lang } = useLang()
  const groups = footerGroups[lang]

  return (
    <footer className="flushpin-site-footer">
      <style>{`
        .flushpin-site-footer {
          background: #061c19;
          border-top: 1px solid rgba(255,255,255,.12);
          color: #fff;
          font-family: Inter, "Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          padding: 54px 24px 28px;
        }
        .flushpin-site-footer__inner {
          width: min(1180px, 100%);
          margin: 0 auto;
        }
        .flushpin-site-footer__grid {
          display: grid;
          grid-template-columns: 1.25fr repeat(4, minmax(120px, .65fr));
          gap: 34px;
          align-items: start;
        }
        .flushpin-site-footer__brand {
          max-width: 360px;
        }
        .flushpin-site-footer__mark {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }
        .flushpin-site-footer__mark img {
          border-radius: 18px;
          box-shadow: 0 18px 46px rgba(13, 196, 186, .22);
        }
        .flushpin-site-footer__name {
          color: #f6fffd;
          display: block;
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -.03em;
          line-height: 1;
        }
        .flushpin-site-footer__tagline {
          color: rgba(255,255,255,.62);
          display: block;
          font-size: 13px;
          font-weight: 750;
          margin-top: 6px;
        }
        .flushpin-site-footer p {
          color: rgba(255,255,255,.66);
          font-size: 14px;
          line-height: 1.7;
          margin: 0;
        }
        .flushpin-site-footer h2 {
          color: #ffffff;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: .08em;
          margin: 6px 0 15px;
          text-transform: uppercase;
        }
        .flushpin-site-footer ul {
          display: grid;
          gap: 10px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .flushpin-site-footer a {
          color: rgba(255,255,255,.68);
          font-size: 14px;
          font-weight: 760;
          text-decoration: none;
          transition: color .18s ease, transform .18s ease;
        }
        .flushpin-site-footer a:hover {
          color: #20c7bd;
        }
        .flushpin-site-footer__bottom {
          border-top: 1px solid rgba(255,255,255,.11);
          color: rgba(255,255,255,.48);
          display: flex;
          flex-wrap: wrap;
          font-size: 13px;
          gap: 16px;
          justify-content: space-between;
          margin-top: 40px;
          padding-top: 24px;
        }
        @media (max-width: 940px) {
          .flushpin-site-footer__grid {
            grid-template-columns: 1fr 1fr;
          }
          .flushpin-site-footer__brand {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 620px) {
          .flushpin-site-footer {
            padding: 42px 20px 26px;
          }
          .flushpin-site-footer__grid {
            grid-template-columns: 1fr;
            gap: 26px;
          }
          .flushpin-site-footer__bottom {
            flex-direction: column;
          }
        }
      `}</style>
      <div className="flushpin-site-footer__inner">
        <div className="flushpin-site-footer__grid">
          <div className="flushpin-site-footer__brand">
            <Link href="/" className="flushpin-site-footer__mark" aria-label="FlushPin home">
              <Image
                src="/flushpin-footer-logo.png"
                alt="FlushPin"
                width={64}
                height={64}
                sizes="64px"
              />
              <span>
                <span className="flushpin-site-footer__name">FlushPin</span>
                <span className="flushpin-site-footer__tagline">{lang === 'es' ? 'Inteligencia de acceso a baños' : 'Restroom access intelligence'}</span>
              </span>
            </Link>
            <p>
              {lang === 'es'
                ? 'Con base en Irvine, California. Ayudamos a las personas a encontrar acceso a baños y a los negocios locales a entender y convertir tráfico real.'
                : 'Irvine, California based. Helping people find restroom access while helping local shops understand and convert real foot traffic.'}
            </p>
            <div style={{ marginTop: 18 }}>
              <AppStoreLink width={140} height={42} />
            </div>
          </div>

          {groups.map(group => (
            <nav key={group.title} aria-label={group.title}>
              <h2>{group.title}</h2>
              <ul>
                {group.links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flushpin-site-footer__bottom">
          <span>{lang === 'es' ? 'Irvine, California - flushpin.com' : 'Irvine, California - flushpin.com'}</span>
          <span>{lang === 'es' ? '© 2026 FlushPin. Todos los derechos reservados.' : '© 2026 FlushPin. All rights reserved.'}</span>
        </div>
      </div>
    </footer>
  )
}
