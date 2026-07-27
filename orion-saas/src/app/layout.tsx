import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from './theme-provider'

import { CookieConsent } from "@/components/CookieConsent"
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister"
import { TenantProvider } from "@/components/TenantProvider"
import { getCurrentTenant, DEFAULT_TENANT } from "@/lib/tenant"

export const metadata: Metadata = {
  title: 'Orion Platform — A Fábrica Inteligente de Software',
  description: 'Plataforma SaaS para desenvolvimento de aplicações com IA',
  manifest: '/manifest.json',
}

export const dynamic = "force-dynamic"

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Resolve tenant for white-label CSS injection
  const tenant = await getCurrentTenant() ?? DEFAULT_TENANT

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content={tenant.primaryColor} />
        <link rel="manifest" href="/manifest.json" />
        {/* White-Label: inject tenant colors as CSS variables */}
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
        <TenantProvider tenant={tenant}>
          <ThemeProvider>{children}</ThemeProvider>
        </TenantProvider>
        <CookieConsent />
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
