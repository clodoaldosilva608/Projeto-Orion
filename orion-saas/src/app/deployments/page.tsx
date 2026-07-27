import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  ExternalLink,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type DeploymentRow = {
  id: string;
  url: string | null;
  status: string;
  productId: string;
  product: { id: string; name: string } | null;
  clientId: string | null;
  vercelProjectId: string | null;
  deployedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const STATUS_META: Record<
  string,
  { label: string; icon: LucideIcon; color: string }
> = {
  deployed: {
    label: "Publicado",
    icon: CheckCircle2,
    color: "bg-emerald-500/15 text-emerald-300",
  },
  pending: {
    label: "Pendente",
    icon: Clock,
    color: "bg-amber-500/15 text-amber-300",
  },
  building: {
    label: "Em build",
    icon: Loader2,
    color: "bg-sky-500/15 text-sky-300",
  },
  failed: {
    label: "Falhou",
    icon: XCircle,
    color: "bg-red-500/15 text-red-300",
  },
};

function formatDateTime(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function environmentFor(status: string) {
  switch (status) {
    case "deployed":
      return "Produção";
    case "building":
      return "Preview";
    case "failed":
      return "Produção";
    default:
      return "Homologação";
  }
}

export default async function DeploymentsPage() {
  const deployments: DeploymentRow[] = await prisma.saasDeployment.findMany({
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  const published = deployments.filter((d) => d.status === "deployed").length;
  const pending = deployments.filter((d) => d.status === "pending").length;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0a0b14]/70 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg brand-gradient">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold brand-text">ORION</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted mb-3">
              <Rocket className="h-3.5 w-3.5 text-violet-300" />
              Deploys
            </div>
            <h1 className="text-3xl font-bold text-white">Deployments</h1>
            <p className="mt-2 text-sm text-muted">
              Acompanhe os deploys das aplicações publicadas na Orion.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="glass-card px-4 py-2 text-center">
              <p className="text-xl font-bold text-emerald-400">{published}</p>
              <p className="text-[11px] text-muted">Publicados</p>
            </div>
            <div className="glass-card px-4 py-2 text-center">
              <p className="text-xl font-bold text-amber-400">{pending}</p>
              <p className="text-[11px] text-muted">Pendentes</p>
            </div>
          </div>
        </div>

        {deployments.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <p className="text-muted">
              Nenhum deploy registrado ainda.
            </p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-muted/70 border-b border-white/5">
                    <th className="font-medium px-5 py-3">Projeto</th>
                    <th className="font-medium px-5 py-3">URL</th>
                    <th className="font-medium px-5 py-3">Ambiente</th>
                    <th className="font-medium px-5 py-3">Status</th>
                    <th className="font-medium px-5 py-3">Deploy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {deployments.map((d) => {
                    const meta = STATUS_META[d.status] ?? STATUS_META.pending;
                    const Icon = meta.icon;
                    const projectName = d.product?.name ?? "—";
                    return (
                      <tr key={d.id} className="hover:bg-white/[0.02]">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-white">{projectName}</p>
                        </td>
                        <td className="px-5 py-4">
                          {d.url ? (
                            <a
                              href={d.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-violet-300 hover:text-violet-200"
                            >
                              <span className="truncate max-w-[220px]">
                                {d.url.replace(/^https?:\/\//, "")}
                              </span>
                              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-muted">
                          {environmentFor(d.status)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${meta.color}`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-white/80">
                            {d.deployedAt
                              ? formatDateTime(d.deployedAt)
                              : "Em fila"}
                          </p>
                          <p className="text-[11px] text-muted">
                            {d.deployedAt ? "Concluído" : "Aguardando build"}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
