import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'flushpin.com' }],
        destination: 'https://www.flushpin.com/:path*',
        permanent: true,
      },
      { source: '/signin', destination: '/signup', permanent: true },
      { source: '/sign-in', destination: '/signup', permanent: true },
      { source: '/login', destination: '/signup', permanent: true },
      { source: '/find', destination: '/map', permanent: true },
      { source: '/restroom', destination: '/map', permanent: true },
      { source: '/restrooms', destination: '/map', permanent: true },
      { source: '/for-businesses', destination: '/business', permanent: true },
      { source: '/bathroom-near-me', destination: '/map', permanent: true },
      { source: '/restroom-access-codes', destination: '/map', permanent: true },
      { source: '/about-flushpin-ai', destination: '/', permanent: true },
      { source: '/restrooms/irvine', destination: '/restrooms/orange-county/irvine', permanent: true },
      { source: '/restrooms/anaheim', destination: '/restrooms/orange-county/anaheim', permanent: true },
      { source: '/restrooms/los-angeles', destination: '/map', permanent: true },
      { source: '/restrooms/sofi-stadium', destination: '/map', permanent: true },
      { source: '/restrooms/disneyland-area', destination: '/map', permanent: true },
      { source: '/accessible-restrooms/orange-county', destination: '/restrooms/orange-county', permanent: true },
      { source: '/restrooms-for-seniors/orange-county', destination: '/restrooms/orange-county', permanent: true },
      { source: '/accessible-restrooms/:region', destination: '/map', permanent: true },
      { source: '/baby-changing-restrooms/:region', destination: '/map', permanent: true },
      { source: '/restrooms-for-seniors/:region', destination: '/map', permanent: true },
      { source: '/restrooms-for-delivery-drivers', destination: '/map', permanent: true },
      { source: '/business/remove', destination: '/optout', permanent: true },
      { source: '/community-guidelines', destination: '/safety', permanent: true },
    ]
  },
};

export default nextConfig;
