import { createClient } from '@/shared/lib/supabase-server'
import { prisma } from '@/shared/lib/prisma'
import Link from 'next/link'
import { Search, User, Target, ArrowRight } from 'lucide-react'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const term = (q ?? '').trim()

  let users: { id: bigint; name: string | null; email: string | null }[] = []
  let goals: { id: bigint; name: string | null; targetValue: number | null }[] = []

  if (term.length >= 2) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    let companyId: bigint | null = null
    if (user) {
      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id },
        select: { companyId: true },
      })
      companyId = dbUser?.companyId ?? null
    }

    const filter = { contains: term, mode: 'insensitive' as const }

    if (companyId) {
      users = await prisma.user.findMany({
        where: { companyId, OR: [{ name: filter }, { email: filter }] },
        select: { id: true, name: true, email: true },
        take: 10,
      })
      goals = await prisma.goal.findMany({
        where: { companyId, name: filter },
        select: { id: true, name: true, targetValue: true },
        take: 10,
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Search className="w-6 h-6" style={{ color: 'rgb(var(--orion-indigo))' }} />
          Busca
        </h1>
        {term && (
          <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
            Resultados para <span className="font-semibold text-white">&ldquo;{term}&rdquo;</span>
          </p>
        )}
      </div>

      {term.length < 2 && (
        <div className="glass-card p-8 text-center" style={{ color: 'rgb(var(--text-muted))' }}>
          Digite ao menos 2 caracteres na busca do topo para encontrar pessoas e metas.
        </div>
      )}

      {term.length >= 2 && users.length === 0 && goals.length === 0 && (
        <div className="glass-card p-8 text-center" style={{ color: 'rgb(var(--text-muted))' }}>
          Nenhum resultado encontrado para &ldquo;{term}&rdquo;.
        </div>
      )}

      {users.length > 0 && (
        <section className="glass-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgb(var(--text-muted))' }}>
            Pessoas
          </h2>
          <ul className="space-y-2">
            {users.map((u) => (
              <li key={u.id}>
                <Link
                  href="/equipe"
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-[rgb(255_255_255/0.04)]"
                >
                  <span className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white" style={{ background: 'linear-gradient(135deg, rgb(99 102 241), rgb(168 85 247))' }}>
                    <User className="w-4 h-4" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-white truncate">{u.name ?? '—'}</span>
                    <span className="block text-xs truncate" style={{ color: 'rgb(var(--text-muted))' }}>{u.email}</span>
                  </span>
                  <ArrowRight className="w-4 h-4" style={{ color: 'rgb(var(--text-muted))' }} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {goals.length > 0 && (
        <section className="glass-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgb(var(--text-muted))' }}>
            Metas
          </h2>
          <ul className="space-y-2">
            {goals.map((g) => (
              <li key={g.id}>
                <Link
                  href="/metas"
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-[rgb(255_255_255/0.04)]"
                >
                  <span className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--glass-bg))', color: 'rgb(var(--orion-indigo))' }}>
                    <Target className="w-4 h-4" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-white truncate">{g.name ?? '—'}</span>
                    <span className="block text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
                      Meta: {g.targetValue ?? 0}
                    </span>
                  </span>
                  <ArrowRight className="w-4 h-4" style={{ color: 'rgb(var(--text-muted))' }} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
