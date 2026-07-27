import DashboardLayout from "../dashboard/layout";
import { Database, Download, HardDrive, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { PageHeader, Badge } from "@/components/ui-parts";
import { listBackupsAction } from "@/lib/p6-actions";
import { CreateBackupButton, DeleteBackupButton } from "./BackupsClient";

export const dynamic = "force-dynamic";

function formatBytes(bytes: number | string | null): string {
  if (bytes === null || bytes === undefined) return "—";
  const n = typeof bytes === "string" ? Number(bytes) : bytes;
  if (!n || isNaN(n)) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(2)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  completed: "success",
  running: "info",
  queued: "neutral",
  failed: "danger",
  expired: "warning",
};

const STATUS_LABEL: Record<string, string> = {
  completed: "Concluído",
  running: "Executando",
  queued: "Na fila",
  failed: "Falhou",
  expired: "Expirado",
};

export default async function BackupsPage() {
  const { data: backups } = await listBackupsAction();
  const list = backups ?? [];
  const totalSize = list.reduce((acc: number, b: any) => acc + (b.sizeBytes ? Number(b.sizeBytes) : 0), 0);
  const completedCount = list.filter((b: any) => b.status === "completed").length;
  const failedCount = list.filter((b: any) => b.status === "failed").length;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <PageHeader
          title="Backups & Exportações"
          description="Exporte e baixe os dados da empresa em formato JSON. Os backups expiram em 30 dias."
          icon={Database}
          action={<CreateBackupButton />}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Total de backups</div>
            <div className="text-2xl font-bold text-white mt-1">{list.length}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Concluídos</div>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{completedCount}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Falhas</div>
            <div className="text-2xl font-bold text-red-300 mt-1">{failedCount}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Tamanho total</div>
            <div className="text-2xl font-bold text-violet-300 mt-1">{formatBytes(totalSize)}</div>
          </div>
        </div>

        {/* List */}
        <div className="glass-card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-[#8b8fa3]" />
            <h3 className="text-sm font-semibold text-white">Histórico de backups</h3>
          </div>
          {list.length === 0 ? (
            <div className="px-5 py-16 flex flex-col items-center justify-center text-center">
              <div className="h-14 w-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
                <Database className="h-7 w-7 text-[#6b7280]" />
              </div>
              <p className="text-sm text-[#8b8fa3] mb-4">Nenhum backup ainda.</p>
              <CreateBackupButton />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-[#8b8fa3] uppercase tracking-wide border-b border-white/[0.06]">
                  <th className="px-5 py-3 font-medium">Tipo</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Tamanho</th>
                  <th className="px-5 py-3 font-medium">Início</th>
                  <th className="px-5 py-3 font-medium">Fim</th>
                  <th className="px-5 py-3 font-medium">Expira</th>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {list.map((b: any) => {
                  const status = b.status;
                  const tone = STATUS_TONE[status] ?? "neutral";
                  return (
                    <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3">
                        <span className="text-sm text-white capitalize">{b.type}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {status === "running" && <Loader2 className="h-3.5 w-3.5 text-sky-300 animate-spin" />}
                          {status === "completed" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                          {status === "failed" && <AlertCircle className="h-3.5 w-3.5 text-red-400" />}
                          <Badge tone={tone}>{STATUS_LABEL[status] ?? status}</Badge>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-[#c4c8d8]">{formatBytes(b.sizeBytes)}</td>
                      <td className="px-5 py-3 text-xs text-[#8b8fa3]">
                        {b.startedAt ? new Date(b.startedAt).toLocaleString("pt-BR") : "—"}
                      </td>
                      <td className="px-5 py-3 text-xs text-[#8b8fa3]">
                        {b.finishedAt ? new Date(b.finishedAt).toLocaleString("pt-BR") : "—"}
                      </td>
                      <td className="px-5 py-3 text-xs text-[#8b8fa3]">
                        {b.expiresAt ? new Date(b.expiresAt).toLocaleDateString("pt-BR") : "—"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          {status === "completed" && (
                            <a
                              href={`/api/backup/download?id=${b.id}`}
                              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-violet-500/15 text-violet-300 text-xs font-medium hover:bg-violet-500/20 transition-colors"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Baixar
                            </a>
                          )}
                          <DeleteBackupButton id={b.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
