import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/(app)', '/(auth)', '/api', '/dashboard', '/metas', '/resultados', '/ranking', '/campanhas', '/equipe', '/notificacoes', '/empresa', '/configuracoes', '/busca'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
