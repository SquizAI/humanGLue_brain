/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Disable features that don't work with static export
  experimental: {
    esmExternals: false
  }
}

module.exports = nextConfig