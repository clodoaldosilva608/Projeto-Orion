import Link from "next/link";
import DashboardLayout from "../dashboard/layout";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";
import {
  Factory, FolderKanban, ClipboardList, Layers, Users, Rocket,
  CheckCircle2, Clock, TrendingUp, ArrowRight, Plus,
} from "lucide-react";
import { getFabricaStatsAction } from "@/lib/fabrica-actions";

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

export default async function FabricaPage() {
  let data: any = null;
  let error: string | null = null;
  try {
    const result = await getFabricaStatsAction();
    data = result.data;
    error = result.error;
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <PageHeader
          title="Fábrica de Software"
          description="Plataforma Inteligente de Desenvolvimento de Software — gerencie o ciclo de vida completo dos projetos."
          icon={Factory}
          action={
            <Link href="/fabrica/projetos">
              <PageButton>
                <Plus className="h-4 w-4" />
                Novo Projeto
              </PageButton>
            </Link>
          }
        />

        {/* Hero — new positioning */}
        <div className="glass-card p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="relative flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300 mb-3">
                <TrendingUp className="h-3 w-3" />
                PLATAFORMA INTELIGENTE DE DESENVOLVIMENTO DE SOFTWARE
              </div>
              <h2 className="text-2xl font-bold text-white">
                Da ideia à evolução contínua
              </h2>
              <p className="text-sm text-[#8b8fa3] mt-2 max-w-2xl">
                Briefing inteligente com IA · Arquitetura gerada automaticamente ·
                Templates reutilizáveis · Pipeline parcialmente automatizado ·
                Especialistas garantem a qualidade final.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/fabrica/briefings"
                className="rounded-lg border border-violet-500/30 bg-violet-500/10 p-3 hover:bg-violet-500/15 transition-colors"
              >
                <ClipboardList className="h-5 w-5 text-violet-300 mb-1" />
                <div className="text-xs font-semibold text-white">Briefings</div>
                <div className="text-[10px] text-[#8b8fa3]">Iniciar novo projeto</div>
              </Link>
              <Link
                href="/fabrica/templates"
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 hover:bg-emerald-500/15 transition-colors"
              >
                <Layers className="h-5 w-5 text-emerald-300 mb-1" />
                <div className="text-xs font-semibold text-white">Templates</div>
                <div className="text-[10px] text-[#8b8fa3]">Catálogo reutilizável</div>
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* KPIs */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <KpiCard
              icon={<FolderKanban className="h-5 w-5" />}
              label="Projetos ativos"
              value={data.totals.projects}
              color="#8b5cf6"
              href="/fabrica/projetos"
            />
            <KpiCard
              icon={<ClipboardList className="h-5 w-5" />}
              label="Briefings"
              value={data.totals.briefings}
              color="#3b82f6"
              href="/fabrica/briefings"
            />
            <KpiCard
              icon={<Layers className="h-5 w-5" />}
              label="Templates"
              value={data.totals.templates}
              color="#10b981"
              href="/fabrica/templates"
            />
            <KpiCard
              icon={<Users className="h-5 w-5" />}
              label="Clientes"
              value={data.totals.clients}
              color="#f59e0b"
              href="/clientes"
            />
            <KpiCard
              icon={<Rocket className="h-5 w-5" />}
              label="Entregues no mês"
              value={data.totals.deliveredThisMonth}
              color="#ec4899"
            />
          </div>
        )}

        {/* Pipeline overview */}
        {data && (
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Pipeline de Projetos</h3>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {["briefing", "architecting", "developing", "testing", "deploying", "delivered", "maintenance"].map((status) => {
                const count = data.byStatus[status] ?? 0;
                const tone = STATUS_TONE[status] ?? "neutral";
                const toneColor: Record<string, string> = {
                  violet: "#8b5cf6", info: "#3b82f6", warning: "#f59e0b",
                  success: "#10b981", neutral: "#6b7280", danger: "#ef4444",
                };
                const color = toneColor[tone] ?? "#6b7280";
                return (
                  <Link
                    key={status}
                    href={`/fabrica/projetos?status=${status}`}
                    className="rounded-lg border p-3 text-center hover:bg-white/[0.04] transition-colors"
                    style={{ backgroundColor: `${color}11`, borderColor: `${color}33` }}
                  >
                    <div className="text-2xl font-bold" style={{ color }}>{count}</div>
                    <div className="text-[10px] text-[#8b8fa3] uppercase tracking-wide mt-1">
                      {STATUS_LABEL[status] ?? status}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent projects */}
        {data && data.recentProjects.length > 0 && (
          <div className="glass-card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Projetos recentes</h3>
              <Link
                href="/fabrica/projetos"
                className="inline-flex items-center gap-1 text-xs text-violet-300 hover:text-violet-200"
              >
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <ul className="divide-y divide-white/[0.04]">
              {data.recentProjects.map((p: any) => (
                <li key={p.id} className="px-5 py-3 hover:bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 shrink-0">
                      <FolderKanban className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{p.name}</div>
                      <div className="text-xs text-[#8b8fa3]">
                        {p.clientName}
                        {p.clientCompany && ` · ${p.clientCompany}`}
                        {" · criado em "}
                        {formatDate(p.createdAt)}
                      </div>
                    </div>
                    <Badge tone={STATUS_TONE[p.status] ?? "neutral"}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </Badge>
                    <div className="text-right shrink-0 hidden sm:block">
                      <div className="text-sm font-bold text-white">{p.progress}%</div>
                      <div className="text-[10px] text-[#6b7280]">progresso</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            icon={<ClipboardList className="h-5 w-5" />}
            title="Iniciar Briefing"
            description="Colete requisitos do cliente estruturadamente"
            href="/fabrica/briefings"
            color="#8b5cf6"
          />
          <QuickAction
            icon={<Layers className="h-5 w-5" />}
            title="Ver Templates"
            description="Catálogo de templates reutilizáveis"
            href="/fabrica/templates"
            color="#10b981"
          />
          <QuickAction
            icon={<FolderKanban className="h-5 w-5" />}
            title="Gerenciar Projetos"
            description="Acompanhe projetos em todos os estágios"
            href="/fabrica/projetos"
            color="#3b82f6"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

function KpiCard({
  icon, label, value, color, href,
}: {
  icon: React.ReactNode; label: string; value: number; color: string; href?: string;
}) {
  const inner = (
    <div
      className="rounded-xl border p-4 hover:bg-white/[0.04] transition-colors"
      style={{ backgroundColor: `${color}11`, borderColor: `${color}33` }}
    >
      <div className="flex items-center gap-2" style={{ color }}>
        {icon}
        <span className="text-[10px] uppercase tracking-wide font-semibold">{label}</span>
      </div>
      <div className="text-3xl font-bold text-white mt-2">{value}</div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function QuickAction({
  icon, title, description, href, color,
}: {
  icon: React.ReactNode; title: string; description: string; href: string; color: string;
}) {
  return (
    <Link
      href={href}
      className="glass-card p-5 flex items-start gap-3 hover:border-violet-500/30 transition-colors"
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
        style={{ backgroundColor: `${color}22`, color }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-xs text-[#8b8fa3] mt-0.5">{description}</div>
      </div>
      <ArrowRight className="h-4 w-4 text-[#6b7280]" />
    </Link>
  );
}
