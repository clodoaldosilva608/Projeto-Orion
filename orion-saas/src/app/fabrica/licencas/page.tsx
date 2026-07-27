import DashboardLayout from "../../dashboard/layout";
import { PageHeader, Badge } from "@/components/ui-parts";
import { KeyRound, ShieldCheck, Clock, CheckCircle2, XCircle } from "lucide-react";
import { listLicensesAction } from "@/lib/license-actions";
import { RevokeButton, ExtendButton } from "./LicensesClient";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "info" | "violet"> = {
  active: "success",
  suspended: "warning",
  expired: "danger",
  revoked: "danger",
  pending_activation: "neutral",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Ativa",
  suspended: "Suspensa",
  expired: "Expirada",
  revoked: "Revogada",
  pending_activation: "Pendente",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function LicencasPage() {
  const { data: licenses, error } = await listLicensesAction();
  const list = licenses ?? [];

  const stats = {
    total: list.length,
    active: list.filter((l: any) => l.status === "active").length,
    expired: list.filter((l: any) => l.status === "expired").length,
    revoked: list.filter((l: any) => l.status === "revoked").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1300px] mx-auto">
        <PageHeader
          title="Licenças de Software"
          description="Gerencie licenças dos softwares entregues. Cada licença tem uma key de validação e um token de workspace do cliente."
          icon={KeyRound}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Total</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Ativas</div>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{stats.active}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Expiradas</div>
            <div className="text-2xl font-bold text-red-300 mt-1">{stats.expired}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Revogadas</div>
            <div className="text-2xl font-bold text-[#8b8fa3] mt-1">{stats.revoked}</div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* List */}
        <div className="glass-card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-violet-300" />
            <h3 className="text-sm font-semibold text-white">Licenças emitidas</h3>
            <span className="text-xs text-[#6b7280] ml-auto">{list.length} registro(s)</span>
          </div>

          {list.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-[#8b8fa3]">
              Nenhuma licença emitida ainda. As licenças são geradas automaticamente
              quando um projeto é entregue.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-[#8b8fa3] uppercase tracking-wide border-b border-white/[0.06]">
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Projeto</th>
                  <th className="px-5 py-3 font-medium">License Key</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Expira</th>
                  <th className="px-5 py-3 font-medium">Validações</th>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {list.map((l: any) => (
                  <tr key={l.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <div className="text-sm font-medium text-white">{l.clientName}</div>
                      <div className="text-[10px] text-[#6b7280]">{l.clientEmail}</div>
                    </td>
                    <td className="px-5 py-3 text-sm text-[#c4c8d8]">{l.projectName}</td>
                    <td className="px-5 py-3">
                      <code className="text-xs font-mono text-violet-200 bg-white/5 px-2 py-1 rounded">
                        {l.licenseKey}
                      </code>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[l.status] ?? "neutral"}>
                        {STATUS_LABEL[l.status] ?? l.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#8b8fa3]">{formatDate(l.expiresAt)}</td>
                    <td className="px-5 py-3 text-xs text-[#8b8fa3]">{l.validationsCount}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <ExtendButton id={l.id} currentExpiresAt={l.expiresAt} status={l.status} />
                        {l.status === "active" && (
                          <RevokeButton id={l.id} clientName={l.clientName} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Info */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-2">Como funciona o licenciamento</h3>
          <div className="space-y-2 text-xs text-[#8b8fa3]">
            <p>
              <strong className="text-violet-300">1. Geração:</strong> Quando um projeto é entregue,
              o admin gera uma licença que cria uma <code className="text-violet-200">licenseKey</code> (ORION-XXXX-XXXX-XXXX-XXXX)
              e um <code className="text-violet-200">workspaceToken</code> (ws_xxx).
            </p>
            <p>
              <strong className="text-violet-300">2. Workspace do cliente:</strong> O cliente acessa
              <code className="text-violet-200"> /workspace/ws_xxx</code> para ver o progresso do projeto,
              timeline, deliverables e informações da licença.
            </p>
            <p>
              <strong className="text-violet-300">3. Validação online:</strong> O software entregue
              valida sua licença chamando
              <code className="text-violet-200"> POST /api/v1/public/license/validate</code> com a
              <code className="text-violet-200"> licenseKey</code>. A resposta indica se a licença é
              válida, ativa, expirada ou revogada.
            </p>
            <p>
              <strong className="text-violet-300">4. Revogação:</strong> O admin pode revogar a licença
              a qualquer momento. A próxima validação do software retornará "Licença revogada".
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
