import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ServiceWorkerRegister } from './register-sw'
import { CookieConsent } from '@/shared/components/CookieConsent'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Orion — Gestão Inteligente de Equipes Comerciais',
  description: 'Plataforma moderna e inteligente para gestão de desempenho comercial, metas, indicadores e campanhas.',
  keywords: ['gestão comercial', 'metas', 'indicadores', 'KPI', 'dashboard', 'vendas'],
  authors: [{ name: 'Orion Platform' }],
  robots: 'index, follow',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Orion — Gestão Inteligente de Equipes Comerciais',
    description: 'Plataforma para gestão de metas, indicadores e equipes comerciais.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#1E3A8A" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
        <ServiceWorkerRegister />
        <CookieConsent />
      </body>
    </html>
  )
}
