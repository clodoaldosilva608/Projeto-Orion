import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from './theme-provider'
import { I18nProvider } from '@/lib/i18n'

import { CookieConsent } from "@/components/CookieConsent"
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister"

export const metadata: Metadata = {
  title: 'Orion Platform — A Fábrica Inteligente de Software',
  description: 'Plataforma SaaS para desenvolvimento de aplicações com IA',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'Orion Platform — A Fábrica Inteligente de Software',
    description: 'Plataforma SaaS para desenvolvimento de aplicações com IA',
    url: 'https://orion-saas-platform.vercel.app',
    siteName: 'Orion Platform',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orion Platform',
    description: 'Plataforma SaaS para desenvolvimento de aplicações com IA',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#8b5cf6" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body suppressHydrationWarning>
        <I18nProvider><ThemeProvider>{children}</ThemeProvider></I18nProvider>
        <CookieConsent />
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
