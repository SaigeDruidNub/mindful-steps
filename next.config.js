/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
  },
}

module.exports = nextConfig