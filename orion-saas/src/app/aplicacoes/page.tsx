import DashboardLayout from "../dashboard/layout";
import { AppWindow, Plus, Globe, Smartphone, Monitor, AppWindow as Pwa } from "lucide-react";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";

export const dynamic = "force-dynamic";

const APPS = [
  { name: "PagueMenos", version: "v1.4.2", type: "Web", status: "Publicado", client: "VarejoMax", icon: Globe, color: "text-violet-300 bg-violet-500/15" },
  { name: "BioSaúde", version: "v2.0.1", type: "Mobile", status: "Publicado", client: "BioSaúde Clínicas", icon: Smartphone, color: "text-sky-300 bg-sky-500/15" },
  { name: "FIManager", version: "v2.4.0", type: "Web", status: "Publicado", client: "FIManager Finance", icon: Globe, color: "text-violet-300 bg-violet-500/15" },
  { name: "MarketPro", version: "v3.1.0", type: "PWA", status: "Publicado", client: "MarketPro Agência", icon: Pwa, color: "text-fuchsia-300 bg-fuchsia-500/15" },
  { name: "LogTrack", version: "v0.9.2", type: "Desktop", status: "Em Testes", client: "LogTrack Logística", icon: Monitor, color: "text-emerald-300 bg-emerald-500/15" },
  { name: "EduSmart", version: "v1.0.0", type: "Web", status: "Publicado", client: "EduSmart Cursos", icon: Globe, color: "text-violet-300 bg-violet-500/15" },
  { name: "HealthPlus", version: "v1.2.0", type: "Mobile", status: "Homologação", client: "HealthPlus", icon: Smartphone, color: "text-sky-300 bg-sky-500/15" },
  { name: "AgroTech", version: "v2.0.0", type: "Web", status: "Publicado", client: "AgroTech Soluções", icon: Globe, color: "text-violet-300 bg-violet-500/15" },
];

const STATUS_TONE: Record<string, "success" | "warning" | "info"> = {
  Publicado: "success",
  "Em Testes": "info",
  Homologação: "warning",
};

export default function AplicacoesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Aplicações"
          description="Aplicações publicadas e gerenciadas pela plataforma."
          icon={AppWindow}
          action={<PageButton><Plus className="h-4 w-4" />Nova Aplicação</PageButton>}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "Total Publicadas", v: "278", c: "+15,2% este mês" },
            { l: "Web", v: "142", c: "51% do total" },
            { l: "Mobile", v: "96", c: "35% do total" },
            { l: "PWA + Desktop", v: "40", c: "14% do total" },
          ].map((s) => (
            <div key={s.l} className="glass-card glass-card-hover p-5">
              <p className="text-sm text-[#8b8fa3]">{s.l}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.v}</p>
              <p className="text-xs text-emerald-400 mt-1.5">{s.c}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          {APPS.map((a) => {
            const Icon = a.icon;
            return (
              <div key={a.name} className="glass-card glass-card-hover p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${a.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge>
                </div>
                <p className="text-base font-semibold text-white">{a.name}</p>
                <p className="text-xs text-[#8b8fa3] mt-0.5">{a.client}</p>
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-[11px] text-[#6b7280]">{a.type}</span>
                  <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-mono text-white/80">{a.version}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
