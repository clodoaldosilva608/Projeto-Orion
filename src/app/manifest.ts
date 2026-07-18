import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Orion — Gestão de Desempenho Comercial',
    short_name: 'Orion',
    description: 'Gerencie seu time comercial com inteligência: metas, indicadores, resultados e ranking.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#080814',
    theme_color: '#6366f1',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  }
}
