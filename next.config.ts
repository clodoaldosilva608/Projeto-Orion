/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  turbopack: {
    root: 'C:/Users/gessy/Downloads/Projeto-OrioN/codigo-01/orion-app',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
