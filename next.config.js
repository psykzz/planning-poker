/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: '/planning-poker',
  assetPrefix: '/planning-poker',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig