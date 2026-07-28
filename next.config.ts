import type { NextConfig } from "next";
import { APP_STORE_URL } from "./lib/site";

/**
 * Permanent redirects for removed / renamed marketing URLs.
 * Prefer the most specific live guide page over /map when SEO value exists.
 * Next.js emits HTTP 308 for permanent: true (SEO-equivalent to 301).
 */
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'flushpin.com' }],
        destination: 'https://www.flushpin.com/:path*',
        permanent: true,
      },

      // Auth aliases
      { source: '/signin', destination: '/signup', permanent: true },
      { source: '/sign-in', destination: '/signup', permanent: true },
      { source: '/login', destination: '/signup', permanent: true },

      // Map / discovery aliases
      { source: '/find', destination: '/map', permanent: true },
      { source: '/restroom', destination: '/map', permanent: true },
      { source: '/restrooms', destination: '/map', permanent: true },
      { source: '/bathroom-near-me', destination: '/map', permanent: true },
      { source: '/restroom-access-codes', destination: '/map', permanent: true },
      { source: '/restrooms-for-delivery-drivers', destination: '/map', permanent: true },

      // Business aliases
      { source: '/for-businesses', destination: '/business', permanent: true },
      { source: '/business/remove', destination: '/optout', permanent: true },

      // Brand / legal aliases
      { source: '/about-flushpin-ai', destination: '/', permanent: true },
      { source: '/about', destination: '/', permanent: true },
      { source: '/community-guidelines', destination: '/safety', permanent: true },
      { source: '/help', destination: '/contact', permanent: true },
      { source: '/faq', destination: '/contact', permanent: true },
      { source: '/guides', destination: '/restrooms/california', permanent: true },

      // App download aliases → App Store
      { source: '/app', destination: APP_STORE_URL, permanent: true },
      { source: '/download', destination: APP_STORE_URL, permanent: true },

      // City / landmark pages → best matching live guides
      { source: '/restrooms/irvine', destination: '/restrooms/orange-county/irvine', permanent: true },
      { source: '/restrooms/anaheim', destination: '/restrooms/orange-county/anaheim', permanent: true },
      { source: '/restrooms/los-angeles', destination: '/restrooms/california/los-angeles', permanent: true },
      { source: '/restrooms/sofi-stadium', destination: '/restrooms/california/los-angeles', permanent: true },
      { source: '/restrooms/disneyland-area', destination: '/restrooms/orange-county/anaheim', permanent: true },

      // Attribute landing pages (specific before :region wildcards)
      { source: '/accessible-restrooms/orange-county', destination: '/restrooms/orange-county', permanent: true },
      { source: '/restrooms-for-seniors/orange-county', destination: '/restrooms/orange-county', permanent: true },
      { source: '/baby-changing-restrooms/orange-county', destination: '/restrooms/orange-county', permanent: true },
      { source: '/accessible-restrooms/:region', destination: '/map', permanent: true },
      { source: '/baby-changing-restrooms/:region', destination: '/map', permanent: true },
      { source: '/restrooms-for-seniors/:region', destination: '/map', permanent: true },
    ]
  },
};

export default nextConfig;
