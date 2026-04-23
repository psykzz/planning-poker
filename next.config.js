/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: '/planning-poker',
  assetPrefix: '/planning-poker',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  transpilePackages: ['nanoid'],
};

module.exports = nextConfig;
