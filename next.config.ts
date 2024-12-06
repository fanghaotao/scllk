/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true  // 临时忽略 ESLint 错误
  },
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig