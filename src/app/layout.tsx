import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Orion — Gestão Inteligente de Equipes Comerciais',
  description: 'Plataforma moderna e inteligente para gestão de desempenho comercial, metas, indicadores e campanhas.',
  keywords: ['gestão comercial', 'metas', 'indicadores', 'KPI', 'dashboard', 'vendas'],
  authors: [{ name: 'Orion Platform' }],
  robots: 'index, follow',
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
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
