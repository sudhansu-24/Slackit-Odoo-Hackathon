/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This disables ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to complete even with TypeScript errors
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 