import DashboardLayout from "../dashboard/layout";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { ShieldCheck, Plus, Key, Check, X } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FuncoesPermissoesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) redirect("/login");

  let roles: any[] = [];
  let permissions: any[] = [];
  try {
    roles = await prisma.role.findMany({
      where: { companyId: dbUser.companyId, deletedAt: null },
      include: { rolePermissions: { include: { permission: true } }, _count: { select: { users: true } } },
      orderBy: { createdAt: 'asc' },
    });
    permissions = await prisma.permission.findMany({ orderBy: { module: 'asc' } });
  } catch (e) { console.error("roles error:", e); }

  // Agrupa permissões por módulo
  const permsByModule: Record<string, any[]> = {}
  for (const p of permissions) {
    if (!permsByModule[p.module]) permsByModule[p.module] = []
    permsByModule[p.module].push(p)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Funções e Permissões</h1>
            <p className="text-sm mt-1 text-secondary">Gerencie cargos e permissões do sistema</p>
          </div>
          <button className="btn-primary"><Plus className="w-4 h-4" /> Novo Cargo</button>
        </div>

        {/* Cards de Roles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div key={role.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: role.isSystem ? 'rgba(139,92,246,0.15)' : 'rgba(59,130,246,0.15)' }}>
                  <ShieldCheck className="w-5 h-5" style={{ color: role.isSystem ? '#a78bfa' : '#60a5fa' }} />
                </div>
                {role.isSystem && <span className="badge badge-info">Sistema</span>}
              </div>
              <h3 className="text-base font-semibold text-white mb-1">{role.name}</h3>
              <p className="text-xs text-muted mb-3">{role.description || 'Sem descrição'}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary">{role._count?.users || 0} usuário(s)</span>
                <span className="text-secondary">{role.rolePermissions?.length || 0} permissão(ões)</span>
              </div>
            </div>
          ))}
        </div>

        {/* Matriz de Permissões */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Key className="w-4 h-4 text-indigo-400" /> Matriz de Permissões por Módulo</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-subtle">
                  <th className="text-left px-3 py-2 text-tiny font-semibold uppercase text-muted">Módulo</th>
                  <th className="text-left px-3 py-2 text-tiny font-semibold uppercase text-muted">Permissão</th>
                  {roles.map(r => <th key={r.id} className="text-center px-3 py-2 text-tiny font-semibold uppercase text-muted">{r.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {Object.entries(permsByModule).map(([module, perms]) => (
                  perms.map((p, idx) => (
                    <tr key={p.id} className="border-b border-subtle hover:bg-white/5 transition-colors">
                      <td className="px-3 py-2 text-sm text-secondary">{idx === 0 ? module : ''}</td>
                      <td className="px-3 py-2 text-sm text-primary font-mono">{p.slug}</td>
                      {roles.map(r => {
                        const has = r.rolePermissions?.some((rp: any) => rp.permissionId === p.id)
                        return <td key={r.id} className="text-center px-3 py-2">{has ? <Check className="w-4 h-4 mx-auto text-green-400" /> : <X className="w-4 h-4 mx-auto text-muted opacity-30" />}</td>
                      })}
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
