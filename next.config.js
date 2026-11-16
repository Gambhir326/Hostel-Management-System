/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Prevents non-critical lint warnings from failing production builds on Render/Vercel
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
