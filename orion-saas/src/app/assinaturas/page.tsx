import DashboardLayout from "../dashboard/layout";
import { Repeat, Plus } from "lucide-react";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";

export const dynamic = "force-dynamic";

const SUBS = [
  { client: "FormaPlus Ltda.", plan: "Pro", status: "Ativa", renewal: "12/02/2026", amount: "R$ 299,00/mês" },
  { client: "BioSaúde Clínicas", plan: "Enterprise", status: "Ativa", renewal: "03/04/2026", amount: "R$ 1.299,00/mês" },
  { client: "FIManager Finance", plan: "Pro", status: "Ativa", renewal: "21/05/2026", amount: "R$ 299,00/mês" },
  { client: "MarketPro Agência", plan: "Starter", status: "Ativa", renewal: "15/06/2026", amount: "R$ 99,00/mês" },
  { client: "LogTrack Logística", plan: "Starter", status: "Trial", renewal: "16/08/2025", amount: "R$ 99,00/mês" },
  { client: "EduSmart Cursos", plan: "Pro", status: "Ativa", renewal: "18/07/2026", amount: "R$ 299,00/mês" },
  { client: "HealthPlus", plan: "Pro", status: "Suspensa", renewal: "—", amount: "R$ 299,00/mês" },
  { client: "AgroTech Soluções", plan: "Enterprise", status: "Ativa", renewal: "07/03/2026", amount: "R$ 1.299,00/mês" },
  { client: "VarejoMax", plan: "Starter", status: "Ativa", renewal: "22/08/2026", amount: "R$ 99,00/mês" },
  { client: "FitGym Studios", plan: "Free", status: "Trial", renewal: "28/08/2025", amount: "R$ 0,00/mês" },
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

export default function AssinaturasPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Assinaturas"
          description="Gerencie assinaturas recorrentes dos clientes."
          icon={Repeat}
          action={<PageButton><Plus className="h-4 w-4" />Nova Assinatura</PageButton>}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "MRR Total", v: "R$ 286.580,00", c: "+18,6% vs mês anterior" },
            { l: "Assinaturas Ativas", v: "1.102", c: "88,3% do total" },
            { l: "Em Trial", v: "94", c: "7,5% do total" },
            { l: "Churn Rate", v: "2,1%", c: "-0,4pp vs mês anterior" },
          ].map((s) => (
            <div key={s.l} className="glass-card glass-card-hover p-5">
              <p className="text-sm text-[#8b8fa3]">{s.l}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.v}</p>
              <p className="text-xs text-emerald-400 mt-1.5">{s.c}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-5 lg:p-6">
          <h3 className="text-base font-semibold text-white mb-4">Assinaturas Ativas</h3>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#6b7280] border-b border-white/5">
                  <th className="font-medium px-2 pb-3">Cliente</th>
                  <th className="font-medium px-2 pb-3">Plano</th>
                  <th className="font-medium px-2 pb-3">Status</th>
                  <th className="font-medium px-2 pb-3">Renovação</th>
                  <th className="font-medium px-2 pb-3">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {SUBS.map((s, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="px-2 py-3 text-sm font-semibold text-white">{s.client}</td>
                    <td className="px-2 py-3"><Badge tone={PLAN_TONE[s.plan]}>{s.plan}</Badge></td>
                    <td className="px-2 py-3"><Badge tone={STATUS_TONE[s.status]}>{s.status}</Badge></td>
                    <td className="px-2 py-3 text-sm text-[#8b8fa3]">{s.renewal}</td>
                    <td className="px-2 py-3 text-sm font-bold text-white">{s.amount}</td>
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
