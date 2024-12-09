/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    runtime: 'edge',
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true  // 临时忽略 ESLint 错误
  },
  images: {
    unoptimized: true
  },
  // 添加 Cloudflare 特定配置
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.experiments = {
        ...config.experiments,
        topLevelAwait: true,
      }
    }
    return config
  }
}

module.exports = nextConfig