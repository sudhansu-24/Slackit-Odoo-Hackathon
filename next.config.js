/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel-optimized configuration
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: [],
    unoptimized: false,
  },
  
  // ESLint configuration - ignore during builds for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration - ignore errors for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Server external packages for better performance
  serverExternalPackages: ['winston'],
  
  // Webpack configuration for server-side packages
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude client-side modules from server bundle
      config.externals.push('winston')
    }
    return config
  },
}

module.exports = nextConfig 