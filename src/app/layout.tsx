import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from './theme-provider'
import { I18nProvider } from '@/lib/i18n'
import { getCurrentTenant, DEFAULT_TENANT } from '@/lib/tenant'

import { CookieConsent } from "@/components/CookieConsent"
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister"

export const dynamic = "force-dynamic"

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // FASE 3: White-Label — resolve tenant colors and inject as CSS
  const tenant = await getCurrentTenant() ?? DEFAULT_TENANT

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content={tenant.primaryColor} />
        <link rel="manifest" href="/manifest.json" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --brand-primary: ${tenant.primaryColor};
            --brand-secondary: ${tenant.secondaryColor};
            --brand-background: ${tenant.backgroundColor};
          }
          .brand-gradient {
            background: linear-gradient(135deg, ${tenant.primaryColor}, ${tenant.secondaryColor}) !important;
          }
          .brand-text {
            color: ${tenant.primaryColor} !important;
          }
          .brand-gradient-strong {
            background: linear-gradient(135deg, ${tenant.primaryColor}, ${tenant.secondaryColor}) !important;
          }
        `}} />
      </head>
      <body suppressHydrationWarning>
        <I18nProvider><ThemeProvider>{children}</ThemeProvider></I18nProvider>
        <CookieConsent />
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
