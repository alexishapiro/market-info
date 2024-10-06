
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        canvas: false,
      };
    }
    config.module.rules.push({
      test: /\.m?js/,
      resolve: {
        fullySpecified: false,
      },
    });
    config.externals = [
      ...(config.externals || []),
      { puppeteer: 'puppeteer' },
      { 'puppeteer-extra': 'puppeteer-extra' },
      { 'puppeteer-extra-plugin-stealth': 'puppeteer-extra-plugin-stealth' },
    ]
    return config
  },
}

export default nextConfig;