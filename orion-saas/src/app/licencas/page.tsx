import DashboardLayout from "../dashboard/layout";
import { KeyRound, Plus, Download } from "lucide-react";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";

export const dynamic = "force-dynamic";

const LICENSES = [
  { key: "ORN-FP-1A2B-3C4D-5E6F", client: "FormaPlus Ltda.", plan: "Pro", status: "Ativa", expires: "12/01/2026" },
  { key: "ORN-BS-7G8H-9I0J-1K2L", client: "BioSaúde Clínicas", plan: "Enterprise", status: "Ativa", expires: "03/03/2026" },
  { key: "ORN-FM-3M4N-5O6P-7Q8R", client: "FIManager Finance", plan: "Pro", status: "Ativa", expires: "21/04/2026" },
  { key: "ORN-MP-9S0T-1U2V-3W4X", client: "MarketPro Agência", plan: "Starter", status: "Ativa", expires: "15/05/2026" },
  { key: "ORN-LT-5Y6Z-7A8B-9C0D", client: "LogTrack Logística", plan: "Starter", status: "Trial", expires: "16/08/2025" },
  { key: "ORN-ES-1E2F-3G4H-5I6J", client: "EduSmart Cursos", plan: "Pro", status: "Ativa", expires: "18/06/2026" },
  { key: "ORN-HP-7K8L-9M0N-1O2P", client: "HealthPlus", plan: "Pro", status: "Suspensa", expires: "29/03/2026" },
  { key: "ORN-AT-3Q4R-5S6T-7U8V", client: "AgroTech Soluções", plan: "Enterprise", status: "Ativa", expires: "07/02/2026" },
  { key: "ORN-VM-9W0X-1Y2Z-3A4B", client: "VarejoMax", plan: "Starter", status: "Ativa", expires: "22/07/2026" },
  { key: "ORN-FG-5C6D-7E8F-9G0H", client: "FitGym Studios", plan: "Free", status: "Trial", expires: "28/08/2025" },
];

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "info"> = {
  Ativa: "success",
  Trial: "info",
  Suspensa: "danger",
};

const PLAN_TONE: Record<string, "violet" | "info" | "success" | "neutral"> = {
  Free: "neutral",
  Starter: "info",
  Pro: "violet",
  Enterprise: "success",
};

export default function LicencasPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Licenças"
          description="Controle de licenças emitidas para os clientes."
          icon={KeyRound}
          action={
            <div className="flex gap-2">
              <PageButton variant="ghost"><Download className="h-4 w-4" />Exportar</PageButton>
              <PageButton><Plus className="h-4 w-4" />Nova Licença</PageButton>
            </div>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "Licenças Ativas", v: "1.035", c: "+10,2% este mês" },
            { l: "Em Trial", v: "94", c: "9,1% do total" },
            { l: "Suspensas", v: "52", c: "5,0% do total" },
            { l: "Expiram em 30d", v: "38", c: "Renovação pendente" },
          ].map((s) => (
            <div key={s.l} className="glass-card glass-card-hover p-5">
              <p className="text-sm text-[#8b8fa3]">{s.l}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.v}</p>
              <p className="text-xs text-emerald-400 mt-1.5">{s.c}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-5 lg:p-6">
          <h3 className="text-base font-semibold text-white mb-4">Lista de Licenças</h3>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#6b7280] border-b border-white/5">
                  <th className="font-medium px-2 pb-3">Chave de Licença</th>
                  <th className="font-medium px-2 pb-3">Cliente</th>
                  <th className="font-medium px-2 pb-3">Plano</th>
                  <th className="font-medium px-2 pb-3">Status</th>
                  <th className="font-medium px-2 pb-3">Expira em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {LICENSES.map((l) => (
                  <tr key={l.key} className="hover:bg-white/[0.02]">
                    <td className="px-2 py-3">
                      <span className="rounded-md bg-white/5 px-2 py-1 text-xs font-mono text-violet-300">{l.key}</span>
                    </td>
                    <td className="px-2 py-3 text-sm text-white/90">{l.client}</td>
                    <td className="px-2 py-3"><Badge tone={PLAN_TONE[l.plan]}>{l.plan}</Badge></td>
                    <td className="px-2 py-3"><Badge tone={STATUS_TONE[l.status]}>{l.status}</Badge></td>
                    <td className="px-2 py-3 text-sm text-[#8b8fa3]">{l.expires}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
