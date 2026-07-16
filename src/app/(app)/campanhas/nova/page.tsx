import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { NovaCampanhaForm } from './NovaCampanhaForm'

export default function NovaCampanhaPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <Link 
          href="/campanhas"
          className="inline-flex items-center gap-1 text-sm font-medium mb-3 transition-colors hover:opacity-80"
          style={{ color: 'rgb(var(--orion-indigo))' }}
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Campanhas
        </Link>
        <h1 className="text-2xl font-bold text-white mb-1">Nova Campanha</h1>
        <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
          Configure um evento de incentivo temporário para sua equipe.
        </p>
      </div>

      <NovaCampanhaForm />
    </div>
  )
}
