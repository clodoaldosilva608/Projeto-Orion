import { getCompanyAction } from '@/modules/companies/services/company.actions'
import ConfiguracoesClient from './ConfiguracoesClient'

export const metadata = { title: 'Orion — Configurações' }

export default async function ConfiguracoesPage() {
  const { data: company, error } = await getCompanyAction()

  if (error || !company) {
    return (
      <div className="p-6">
        <div className="rounded-xl p-4 text-sm text-rose-400" style={{ background: 'rgb(244 63 94 / 0.1)', border: '1px solid rgb(244 63 94 / 0.2)' }}>
          {error ?? 'Empresa não encontrada'}
        </div>
      </div>
    )
  }

  return <ConfiguracoesClient company={company} />
}
