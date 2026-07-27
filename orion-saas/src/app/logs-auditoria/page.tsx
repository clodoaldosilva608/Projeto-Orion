import DashboardLayout from "../dashboard/layout";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { ScrollText, Search, Filter, Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LogsAuditoriaPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) redirect("/login");

  let logs: any[] = [];
  try {
    logs = await prisma.auditLog.findMany({
      where: { companyId: dbUser.companyId },
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    });
  } catch (e) { console.error("audit logs error:", e); }

  const actionColors: Record<string, string> = {
    create: "badge-success", update: "badge-info", delete: "badge-danger",
    approve: "badge-success", reject: "badge-danger", login: "badge-info",
    logout: "badge-neutral", export: "badge-warning", import: "badge-warning",
  };
  const actionLabels: Record<string, string> = {
    create: "Criar", update: "Atualizar", delete: "Excluir", approve: "Aprovar",
    reject: "Rejeitar", login: "Login", logout: "Logout", export: "Exportar",
    import: "Importar", restore: "Restaurar",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Logs de Auditoria</h1>
            <p className="text-sm mt-1 text-secondary">Histórico de todas as ações do sistema</p>
          </div>
          <button className="btn-ghost"><Download className="w-4 h-4" /> Exportar</button>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input type="text" placeholder="Buscar nos logs..." className="input-search" />
            </div>
            <button className="btn-ghost"><Filter className="w-4 h-4" /> Filtrar</button>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-12">
              <ScrollText className="w-10 h-10 mx-auto mb-3 opacity-30 text-muted" />
              <p className="text-sm text-muted">Nenhum log de auditoria registrado ainda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-subtle">
                    <th className="text-left px-3 py-2 text-tiny font-semibold uppercase tracking-wider text-muted">Usuário</th>
                    <th className="text-left px-3 py-2 text-tiny font-semibold uppercase tracking-wider text-muted">Ação</th>
                    <th className="text-left px-3 py-2 text-tiny font-semibold uppercase tracking-wider text-muted">Tabela</th>
                    <th className="text-left px-3 py-2 text-tiny font-semibold uppercase tracking-wider text-muted">Registro</th>
                    <th className="text-left px-3 py-2 text-tiny font-semibold uppercase tracking-wider text-muted">IP</th>
                    <th className="text-left px-3 py-2 text-tiny font-semibold uppercase tracking-wider text-muted">Data/Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-subtle hover:bg-white/5 transition-colors">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-tiny font-bold text-white" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                            {log.user?.name?.charAt(0) || 'S'}
                          </div>
                          <span className="text-sm text-primary">{log.user?.name || 'Sistema'}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3"><span className={`badge ${actionColors[log.action] || 'badge-neutral'}`}>{actionLabels[log.action] || log.action}</span></td>
                      <td className="px-3 py-3 text-sm text-secondary">{log.tableName}</td>
                      <td className="px-3 py-3 text-sm text-muted font-mono">{log.recordId?.toString() || '—'}</td>
                      <td className="px-3 py-3 text-sm text-muted font-mono">{log.ipAddress}</td>
                      <td className="px-3 py-3 text-sm text-muted">{new Date(log.createdAt).toLocaleString('pt-BR')}</td>
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
