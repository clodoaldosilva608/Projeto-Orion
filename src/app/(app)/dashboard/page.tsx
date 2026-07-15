import { createClient } from '@/shared/lib/supabase-server'
import { logoutAction } from '@/modules/auth/services/auth.actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Topbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="text-lg font-semibold text-white">Orion</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">{user?.email}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                id="btn-logout"
                className="text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Bem-vindo ao Orion! Sua plataforma de gestão comercial.</p>
        </div>

        {/* Cards de status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Metas Ativas', value: '—', color: 'from-indigo-500 to-purple-600' },
            { label: 'Indicadores', value: '—', color: 'from-emerald-500 to-teal-600' },
            { label: 'Campanhas', value: '—', color: 'from-orange-500 to-rose-600' },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all"
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-xl mb-4`} />
              <div className="text-3xl font-bold text-white mb-1">{card.value}</div>
              <div className="text-sm text-slate-400">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Setup banner */}
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Projeto Orion — Fundação Configurada
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Next.js + TypeScript + Tailwind + Prisma + Supabase configurados.
            Próximo passo: rodar as migrations do banco de dados e construir os módulos.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
            {['✅ Next.js 15', '✅ TypeScript', '✅ Tailwind CSS', '✅ Prisma ORM', '✅ Supabase Auth', '✅ Middleware RBAC'].map((tag) => (
              <span
                key={tag}
                className="bg-indigo-500/20 text-indigo-300 text-xs px-3 py-1 rounded-full border border-indigo-500/30"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
