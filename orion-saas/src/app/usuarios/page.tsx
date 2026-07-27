import DashboardLayout from "../dashboard/layout";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { Users, Plus, Mail, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) redirect("/login");

  let users: any[] = [];
  try {
    users = await prisma.user.findMany({
      where: { companyId: dbUser.companyId, deletedAt: null },
      include: { role: true, branch: true },
      orderBy: { createdAt: 'asc' },
    });
  } catch (e) { console.error("users error:", e); }

  const statusColors: Record<string, string> = { active: 'badge-success', pending: 'badge-warning', suspended: 'badge-danger', invited: 'badge-info', inactive: 'badge-neutral' }
  const statusLabels: Record<string, string> = { active: 'Ativo', pending: 'Pendente', suspended: 'Suspenso', invited: 'Convidado', inactive: 'Inativo' }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-white tracking-tight">Usuários</h1><p className="text-sm mt-1 text-secondary">Gerencie usuários do sistema</p></div>
          <button className="btn-primary"><Plus className="w-4 h-4" /> Convidar Usuário</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/15"><Users className="w-5 h-5 text-indigo-400" /></div><div><p className="text-2xl font-bold text-white">{users.length}</p><p className="text-xs text-muted">Total de usuários</p></div></div></div>
          <div className="glass-card p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/15"><Shield className="w-5 h-5 text-green-400" /></div><div><p className="text-2xl font-bold text-white">{users.filter(u => u.status === 'active').length}</p><p className="text-xs text-muted">Ativos</p></div></div></div>
          <div className="glass-card p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/15"><Mail className="w-5 h-5 text-amber-400" /></div><div><p className="text-2xl font-bold text-white">{users.filter(u => u.status === 'pending' || u.status === 'invited').length}</p><p className="text-xs text-muted">Pendentes</p></div></div></div>
        </div>
        <div className="glass-card p-5">
          {users.length === 0 ? (
            <div className="text-center py-12"><Users className="w-10 h-10 mx-auto mb-3 opacity-30 text-muted" /><p className="text-sm text-muted">Nenhum usuário encontrado.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-subtle">
                  <th className="text-left px-3 py-2 text-tiny font-semibold uppercase text-muted">Usuário</th>
                  <th className="text-left px-3 py-2 text-tiny font-semibold uppercase text-muted">Cargo</th>
                  <th className="text-left px-3 py-2 text-tiny font-semibold uppercase text-muted">Filial</th>
                  <th className="text-left px-3 py-2 text-tiny font-semibold uppercase text-muted">Status</th>
                  <th className="text-left px-3 py-2 text-tiny font-semibold uppercase text-muted">Último Login</th>
                </tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-subtle hover:bg-white/5 transition-colors">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>{u.name.charAt(0)}</div>
                          <div><p className="text-sm font-medium text-primary">{u.name}</p><p className="text-xs text-muted">{u.email}</p></div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-secondary">{u.role?.name || '—'}</td>
                      <td className="px-3 py-3 text-sm text-secondary">{u.branch?.name || '—'}</td>
                      <td className="px-3 py-3"><span className={`badge ${statusColors[u.status] || 'badge-neutral'}`}>{statusLabels[u.status] || u.status}</span></td>
                      <td className="px-3 py-3 text-sm text-muted">{u.lastLogin ? new Date(u.lastLogin).toLocaleString('pt-BR') : 'Nunca'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
