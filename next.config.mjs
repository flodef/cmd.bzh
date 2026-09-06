/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  outputFileTracingRoot: process.cwd(),
  async redirects() {
    return [
      {
        source: '/',
        has: [{ type: 'query', key: 'tab', value: 'About' }],
        destination: '/about?',
        permanent: true,
      },
      {
        source: '/',
        has: [{ type: 'query', key: 'tab', value: 'Contact' }],
        destination: '/contact?',
        permanent: true,
      },
      {
        source: '/',
        has: [{ type: 'query', key: 'tab', value: 'Reviews' }],
        destination: '/reviews?',
        permanent: true,
      },
      {
        source: '/',
        has: [{ type: 'query', key: 'tab', value: 'GDPR' }],
        destination: '/gdpr?',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
