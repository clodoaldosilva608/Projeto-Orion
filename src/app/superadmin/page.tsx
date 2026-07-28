import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, Building2, Users, FolderKanban, KeyRound, TrendingUp, AlertTriangle, ShieldCheck, Boxes } from "lucide-react";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getSuperAdminStatsAction, listAllCompaniesAction } from "@/lib/superadmin-actions";
import { CreateCompanyForm, ToggleCompanyButton } from "./SuperAdminClient";

export const dynamic = "force-dynamic";

async function checkSuperAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true, isSuperAdmin: true, name: true, email: true },
  });
  if (!dbUser || !dbUser.isSuperAdmin) return null;
  return dbUser;
}

export default async function SuperAdminPage() {
  const admin = await checkSuperAdmin();
  if (!admin) {
    redirect("/login?error=Acesso+restrito+ao+Super+Admin");
  }

  const [{ data: stats }, { data: companies }] = await Promise.all([
    getSuperAdminStatsAction(),
    listAllCompaniesAction(),
  ]);

  return (
    <div className="min-h-screen bg-[#0a0b14] text-white p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl brand-gradient shadow-lg">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Super Admin</h1>
              <p className="text-xs text-[#8b8fa3]">
                {admin.name} · {admin.email} · Plataforma Orion SaaS
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/superadmin/modules"
              className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-violet-500/30 bg-violet-500/10 text-xs font-medium text-violet-200 hover:bg-violet-500/20"
            >
              <Boxes className="h-3.5 w-3.5" /> Gerenciar Módulos
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-[#c4c8d8] hover:text-white"
            >
              ← Voltar ao painel
            </Link>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <StatCard icon={<Building2 className="h-5 w-5" />} label="Empresas" value={stats.companies} color="#8b5cf6" />
            <StatCard icon={<ShieldCheck className="h-5 w-5" />} label="Ativas" value={stats.activeCompanies} color="#10b981" />
            <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Suspensas" value={stats.suspendedCompanies} color="#ef4444" />
            <StatCard icon={<Users className="h-5 w-5" />} label="Usuários" value={stats.totalUsers} color="#3b82f6" />
            <StatCard icon={<FolderKanban className="h-5 w-5" />} label="Projetos" value={stats.projects} color="#f59e0b" />
            <StatCard icon={<KeyRound className="h-5 w-5" />} label="Licenças" value={stats.licenses} color="#ec4899" />
          </div>
        )}

        {/* Plan distribution */}
        {stats && (
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-violet-300" />
              Distribuição por plano
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {(["free", "starter", "pro", "enterprise"] as const).map((plan) => {
                const count = stats.byPlan[plan] ?? 0;
                const colors: Record<string, string> = {
                  free: "#6b7280", starter: "#3b82f6", pro: "#8b5cf6", enterprise: "#10b981",
                };
                return (
                  <div
                    key={plan}
                    className="rounded-lg border p-3 text-center"
                    style={{ backgroundColor: `${colors[plan]}11`, borderColor: `${colors[plan]}33` }}
                  >
                    <div className="text-2xl font-bold" style={{ color: colors[plan] }}>{count}</div>
                    <div className="text-[10px] text-[#8b8fa3] uppercase tracking-wide mt-1">{plan}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Create company form */}
        <CreateCompanyForm />

        {/* Companies list */}
        <div className="glass-card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <Building2 className="h-4 w-4 text-violet-300" />
            <h3 className="text-sm font-semibold text-white">Empresas (Tenants)</h3>
            <span className="text-xs text-[#6b7280] ml-auto">{(companies ?? []).length} empresa(s)</span>
          </div>
          {(!companies || companies.length === 0) ? (
            <div className="px-5 py-10 text-center text-sm text-[#8b8fa3]">
              Nenhuma empresa cadastrada ainda.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-[#8b8fa3] uppercase tracking-wide border-b border-white/[0.06]">
                  <th className="px-5 py-3 font-medium">Empresa</th>
                  <th className="px-5 py-3 font-medium">Subdomínio</th>
                  <th className="px-5 py-3 font-medium">Plano</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Usuários</th>
                  <th className="px-5 py-3 font-medium">Cores</th>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {companies.map((c: any) => (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <div className="text-sm font-medium text-white">{c.tradeName}</div>
                      <div className="text-[10px] text-[#6b7280]">{c.appName}</div>
                    </td>
                    <td className="px-5 py-3">
                      {c.subdomain ? (
                        <code className="text-xs font-mono text-violet-200 bg-white/5 px-2 py-1 rounded">
                          {c.subdomain}
                        </code>
                      ) : (
                        <span className="text-xs text-[#6b7280]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-semibold capitalize" style={{
                        color: c.plan === "enterprise" ? "#10b981" : c.plan === "pro" ? "#8b5cf6" : c.plan === "starter" ? "#3b82f6" : "#6b7280"
                      }}>
                        {c.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                        c.active
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-red-500/15 text-red-300"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${c.active ? "bg-emerald-400" : "bg-red-400"}`} />
                        {c.active ? "Ativa" : "Suspensa"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#c4c8d8]">{c.usersCount}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <span className="h-4 w-4 rounded" style={{ backgroundColor: c.primaryColor }} />
                        <span className="h-4 w-4 rounded" style={{ backgroundColor: c.secondaryColor }} />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/superadmin/empresas/${c.id}`}
                          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-violet-500/30 bg-violet-500/10 text-[10px] font-medium text-violet-200 hover:bg-violet-500/20"
                        >
                          Detalhes
                        </Link>
                        <ToggleCompanyButton id={c.id} active={c.active} tradeName={c.tradeName} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ backgroundColor: `${color}11`, borderColor: `${color}33` }}
    >
      <div className="flex items-center gap-2" style={{ color }}>
        {icon}
        <span className="text-[10px] uppercase tracking-wide font-semibold">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white mt-2">{value}</div>
    </div>
  );
}
