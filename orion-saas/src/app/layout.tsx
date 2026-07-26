import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Orion — Visão Geral da Plataforma',
  description: 'A Fábrica Inteligente de Software — Plataforma SaaS para desenvolvimento de aplicações com IA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
