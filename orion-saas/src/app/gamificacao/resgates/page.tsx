import DashboardLayout from "../../dashboard/layout";
import { PageHeader, Badge } from "@/components/ui-parts";
import { Gift, Check, X, Package } from "lucide-react";
import { listRedemptionsAction } from "@/lib/gamification-actions";
import { RedemptionActions } from "./RedemptionActions";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "info" | "violet"> = {
  pending: "warning",
  approved: "info",
  rejected: "danger",
  fulfilled: "success",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
  fulfilled: "Entregue",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function ResgatesPage() {
  const { data: redemptions, error } = await listRedemptionsAction();
  const list = redemptions ?? [];

  const stats = {
    total: list.length,
    pending: list.filter((r: any) => r.status === "pending").length,
    approved: list.filter((r: any) => r.status === "approved").length,
    fulfilled: list.filter((r: any) => r.status === "fulfilled").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Resgates de Pontos"
          description="Aprove ou rejeite as solicitações de troca de pontos por prêmios."
          icon={Gift}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Total</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Pendentes</div>
            <div className="text-2xl font-bold text-amber-300 mt-1">{stats.pending}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Aprovados</div>
            <div className="text-2xl font-bold text-sky-300 mt-1">{stats.approved}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Entregues</div>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{stats.fulfilled}</div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="glass-card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <Package className="h-4 w-4 text-violet-300" />
            <h3 className="text-sm font-semibold text-white">Solicitações de resgate</h3>
            <span className="text-xs text-[#6b7280] ml-auto">{list.length} registros</span>
          </div>
          {list.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-[#8b8fa3]">
              Nenhuma solicitação de resgate ainda.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-[#8b8fa3] uppercase tracking-wide border-b border-white/[0.06]">
                  <th className="px-5 py-3 font-medium">Usuário</th>
                  <th className="px-5 py-3 font-medium">Prêmio</th>
                  <th className="px-5 py-3 font-medium">Custo</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Solicitado em</th>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {list.map((r: any) => (
                  <tr key={r.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <div className="text-sm text-white">{r.user?.name ?? "—"}</div>
                      <div className="text-[10px] text-[#6b7280]">{r.user?.email}</div>
                    </td>
                    <td className="px-5 py-3 text-sm text-white">{r.rewardName}</td>
                    <td className="px-5 py-3 text-sm text-violet-300">{r.pointsCost.toLocaleString("pt-BR")} pts</td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[r.status] ?? "neutral"}>{STATUS_LABEL[r.status] ?? r.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#8b8fa3]">{formatDate(r.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <RedemptionActions id={r.id} status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
