import { AlertCircle } from 'lucide-react'
import { getCompanyLicenseAction } from '@/modules/licensing/services/licensing.actions'
import { LicencasClient } from './LicencasClient'

export default async function LicencasPage() {
  const { data: license, error } = await getCompanyLicenseAction()

  if (error) {
    return (
      <div className="p-6">
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: 'rgb(244 63 94 / 0.1)', border: '1px solid rgb(244 63 94 / 0.3)' }}
        >
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <p className="text-sm text-rose-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Licenciamento</h1>
          <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
            Gerencie a ativação, validade e limites da licença da sua empresa
          </p>
        </div>
      </div>

      <LicencasClient license={license} />
    </div>
  )
}
