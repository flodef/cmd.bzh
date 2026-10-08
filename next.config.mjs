/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  outputFileTracingRoot: process.cwd(),
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  async redirects() {
    return [
      // Legacy routes → single-page anchors
      { source: '/about', destination: '/#about', permanent: true },
      { source: '/contact', destination: '/#contact', permanent: true },
      { source: '/reviews', destination: '/#reviews', permanent: true },
    ];
  },
};

export default nextConfig;
