import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from './theme-provider'

import { CookieConsent } from "@/components/CookieConsent"
export const metadata: Metadata = {
  title: 'Orion Platform — A Fábrica Inteligente de Software',
  description: 'Plataforma SaaS para desenvolvimento de aplicações com IA',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#8b5cf6" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
        <CookieConsent />
      </body>
    </html>
  )
}
