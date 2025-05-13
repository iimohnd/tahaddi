// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ⛔️ يتجاهل أخطاء ESLint أثناء build
  },
};

module.exports = nextConfig;
