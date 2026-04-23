const deployTarget = process.env.DEPLOY_TARGET?.trim();
const deployBasePath = deployTarget ? `/${deployTarget}` : undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(deployBasePath
    ? {
        basePath: deployBasePath,
        assetPrefix: deployBasePath,
      }
    : {}),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  transpilePackages: ['nanoid'],
};

export default nextConfig;
