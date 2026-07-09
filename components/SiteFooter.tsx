'use client'

import Link from 'next/link'
import { useLang } from '../lib/LanguageContext'
import AppStoreLink from './AppStoreLink'

const footerGroups = {
  en: [
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
        { href: '/business/claim', label: 'Reclamar negocios' },
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
  ],
}

export default function SiteFooter() {
  const { lang } = useLang()
  const groups = footerGroups[lang]

  return (
    <footer className="bg-fp-footer px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.25fr_repeat(4,minmax(0,1fr))]">
          <div className="max-w-sm">
            <Link
              href="/"
              className="mb-5 inline-block bg-transparent no-underline"
              aria-label="FlushPin home"
            >
              <span className="block text-2xl font-bold leading-none tracking-tight">
                <span className="text-white">Flush</span>
                <span className="text-fp-teal">Pin</span>
              </span>
              <span className="mt-1 block text-sm text-fp-gray-400">
                {lang === 'es' ? 'Inteligencia de acceso a baños' : 'Restroom access intelligence'}
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-fp-gray-400">
              {lang === 'es'
                ? 'Con base en Irvine, California. Ayudamos a las personas a encontrar acceso a baños y a los negocios locales a entender y convertir tráfico real.'
                : 'Irvine, California based. Helping people find restroom access while helping local shops understand and convert real foot traffic.'}
            </p>
            <div className="mt-[18px] bg-transparent">
              <AppStoreLink height={48} />
            </div>
          </div>

          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="mb-4 text-sm font-semibold text-white">{group.title}</h2>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-fp-gray-400 no-underline transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-8 text-sm text-fp-gray-400 sm:flex-row sm:justify-between">
          <span>{lang === 'es' ? 'Irvine, California - flushpin.com' : 'Irvine, California - flushpin.com'}</span>
          <span>
            {lang === 'es' ? '© 2026 FlushPin. Todos los derechos reservados.' : '© 2026 FlushPin. All rights reserved.'}
          </span>
        </div>
      </div>
    </footer>
  )
}
