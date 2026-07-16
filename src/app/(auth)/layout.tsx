import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acesso | Orion Platform',
  description: 'Faça login ou crie sua conta na plataforma Orion de gestão comercial.',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-grid flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'rgb(var(--background))' }}
    >
      {/* Background Orbs */}
      <div
        className="orb w-96 h-96 -top-20 -left-20"
        style={{ background: 'rgb(var(--orion-indigo) / 0.15)' }}
      />
      <div
        className="orb w-80 h-80 -bottom-10 -right-10"
        style={{ background: 'rgb(var(--orion-purple) / 0.12)', animationDelay: '-3s' }}
      />
      <div
        className="orb w-64 h-64 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ background: 'rgb(var(--orion-violet) / 0.08)', animationDelay: '-5s' }}
      />

      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        {children}
      </div>
    </div>
  )
}
