/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除 output: 'export'
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true
  }
}

module.exports = nextConfig