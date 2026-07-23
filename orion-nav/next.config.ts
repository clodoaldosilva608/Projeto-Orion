/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['*.space-z.ai', '*.fcapp.run'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost', '*.space-z.ai', '*.fcapp.run'],
    },
  },
}
export default nextConfig
