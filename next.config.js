/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict mode for better error detection
  reactStrictMode: true,

  // Enable SWC minification for better performance
  swcMinify: true,

  // Compiler options
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // ============================================================================
  // Image Optimization
  // ============================================================================
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'humanglue.ai',
      },
    ],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ============================================================================
  // Headers for Security
  // ============================================================================
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ]
  },

  // ============================================================================
  // Redirects
  // ============================================================================
  async redirects() {
    return [
      // Example: Redirect old assessment route
      {
        source: '/old-assessment',
        destination: '/assessments',
        permanent: true,
      },
      // Example: Redirect legacy workshop URLs
      {
        source: '/workshop/:slug',
        destination: '/workshops/:slug',
        permanent: true,
      },
    ]
  },

  // ============================================================================
  // Rewrites (if needed)
  // ============================================================================
  async rewrites() {
    return [
      // Example: Rewrite API calls (if not using Netlify Functions)
      // {
      //   source: '/api/:path*',
      //   destination: 'https://api.humanglue.ai/:path*',
      // },
    ]
  },

  // ============================================================================
  // Experimental Features
  // ============================================================================
  experimental: {
    // Optimize CSS bundle size (disabled - requires critters package)
    // optimizeCss: true,

    // Enable scroll restoration
    scrollRestoration: true,

    // Server actions (if using)
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // ============================================================================
  // Webpack Configuration (for bundle analysis)
  // ============================================================================
  webpack: (config, { isServer, dev }) => {
    // Bundle analyzer (only when ANALYZE=true)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer
            ? '../analyze/server.html'
            : './analyze/client.html',
          openAnalyzer: false,
        })
      )
    }

    // Optimize SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },

  // ============================================================================
  // TypeScript Configuration
  // ============================================================================
  typescript: {
    // Don't run type checking during build (run in CI/CD instead)
    ignoreBuildErrors: false,
  },

  // ============================================================================
  // ESLint Configuration
  // ============================================================================
  eslint: {
    // Run ESLint in these directories during build
    dirs: ['app', 'components', 'lib', 'utils'],
    // Don't fail build on lint errors (handle in CI/CD)
    ignoreDuringBuilds: false,
  },

  // ============================================================================
  // Environment Variables (Client-side)
  // ============================================================================
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
  },

  // ============================================================================
  // Output Configuration
  // ============================================================================
  // For Netlify, we don't use standalone mode
  // The @netlify/plugin-nextjs handles the deployment

  // Trailing slash preference
  trailingSlash: false,

  // Compression
  compress: true,

  // Generate ETags for caching
  generateEtags: true,

  // ============================================================================
  // Performance Optimizations
  // ============================================================================

  // Optimize imports
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },

  // ============================================================================
  // Production Source Maps (optional - can slow down builds)
  // ============================================================================
  productionBrowserSourceMaps: false,

  // ============================================================================
  // Power Mode (for faster builds in development)
  // ============================================================================
  poweredByHeader: false,
}

module.exports = nextConfig
