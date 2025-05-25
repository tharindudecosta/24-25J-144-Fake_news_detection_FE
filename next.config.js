/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    domains: ['storage.googleapis.com'],
  },
}

module.exports = nextConfig
