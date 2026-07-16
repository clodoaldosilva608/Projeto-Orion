import { listUsersAction } from '@/modules/users/services/users.actions'
import EquipeClient from './EquipeClient'

export const metadata = { title: 'Orion — Equipe' }

export default async function EquipePage() {
  const { data: users, error } = await listUsersAction()

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl p-4 text-sm text-rose-400" style={{ background: 'rgb(244 63 94 / 0.1)', border: '1px solid rgb(244 63 94 / 0.2)' }}>
          {error}
        </div>
      </div>
    )
  }

  return <EquipeClient users={users ?? []} />
}
