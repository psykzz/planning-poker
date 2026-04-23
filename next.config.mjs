import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)));
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
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
