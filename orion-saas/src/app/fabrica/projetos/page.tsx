import Link from "next/link";
import DashboardLayout from "../../dashboard/layout";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";
import { FolderKanban, Plus, Filter } from "lucide-react";
import { listSoftwareProjectsAction } from "@/lib/fabrica-actions";
import { ProjectFilters } from "./ProjectsClient";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  briefing: "Briefing",
  architecting: "Arquitetura",
  developing: "Desenvolvimento",
  testing: "Testes",
  deploying: "Deploy",
  delivered: "Entregue",
  maintenance: "Manutenção",
  cancelled: "Cancelado",
};

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "info" | "violet"> = {
  briefing: "violet",
  architecting: "info",
  developing: "warning",
  testing: "info",
  deploying: "warning",
  delivered: "success",
  maintenance: "neutral",
  cancelled: "danger",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default async function ProjetosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const statusFilter = (params.status as string) || "all";
  const { data: projects, error } = await listSoftwareProjectsAction({
    status: statusFilter,
  });
  const list = projects ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <PageHeader
          title="Projetos de Software"
          description="Gerencie todos os projetos da fábrica de software — do briefing à entrega."
          icon={FolderKanban}
        />

        {/* Filters */}
        <ProjectFilters current={statusFilter} />

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* List */}
        {list.length === 0 ? (
          <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
              <FolderKanban className="h-8 w-8 text-[#6b7280]" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">
              {statusFilter === "all" ? "Nenhum projeto ainda" : `Nenhum projeto em ${STATUS_LABEL[statusFilter] ?? statusFilter}`}
            </h3>
            <p className="text-sm text-[#8b8fa3] mb-4">
              {statusFilter === "all"
                ? "Crie seu primeiro projeto de software ou inicie com um briefing."
                : "Tente outro filtro ou crie um novo projeto."}
            </p>
            <div className="flex gap-2">
              <Link
                href="/fabrica/briefings"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg brand-gradient text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                Iniciar Briefing
              </Link>
              <Link
                href="/fabrica/templates"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-[#c4c8d8] hover:text-white"
              >
                Ver Templates
              </Link>
            </div>
          </div>
        ) : (
          <div className="glass-card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                {list.length} projeto{list.length !== 1 ? "s" : ""}
              </h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-[#8b8fa3] uppercase tracking-wide border-b border-white/[0.06]">
                  <th className="px-5 py-3 font-medium">Projeto</th>
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Progresso</th>
                  <th className="px-5 py-3 font-medium">Estágios</th>
                  <th className="px-5 py-3 font-medium">Prazo</th>
                  <th className="px-5 py-3 font-medium">Criado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {list.map((p: any) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] cursor-pointer">
                    <td className="px-5 py-3">
                      <div className="text-sm font-medium text-white">{p.name}</div>
                      {p.template && (
                        <div className="text-[10px] text-[#6b7280] mt-0.5">
                          {p.template.emoji} {p.template.name}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-sm text-white">{p.client?.name ?? "—"}</div>
                      <div className="text-[10px] text-[#6b7280]">{p.client?.company ?? ""}</div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[p.status] ?? "neutral"}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                          <div
                            className="h-full brand-gradient"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-white">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#8b8fa3]">
                      {p.completedStages}/{p.stagesCount}
                    </td>
                    <td className="px-5 py-3 text-xs text-[#8b8fa3]">
                      {formatDate(p.estimatedEndDate)}
                    </td>
                    <td className="px-5 py-3 text-xs text-[#8b8fa3]">
                      {formatDate(p.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
