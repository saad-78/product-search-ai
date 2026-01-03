/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static optimization for API routes
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Skip database during build
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
