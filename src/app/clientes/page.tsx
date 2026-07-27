import DashboardLayout from "../dashboard/layout";
import { Users, Plus, Download, Search } from "lucide-react";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";

export const dynamic = "force-dynamic";

const CLIENTS = [
  { name: "FormaPlus Ltda.", email: "contato@formaplus.com", company: "FormaPlus", status: "Ativo", plan: "Pro", since: "12/01/2025" },
  { name: "BioSaúde Clínicas", email: "ti@biosaude.com", company: "BioSaúde", status: "Ativo", plan: "Enterprise", since: "03/03/2025" },
  { name: "FIManager Finance", email: "dev@fimanager.io", company: "FIManager", status: "Ativo", plan: "Pro", since: "21/04/2025" },
  { name: "MarketPro Agência", email: "hello@marketpro.com", company: "MarketPro", status: "Ativo", plan: "Starter", since: "15/05/2025" },
  { name: "LogTrack Logística", email: "ops@logtrack.com", company: "LogTrack", status: "Trial", plan: "Starter", since: "02/07/2025" },
  { name: "EduSmart Cursos", email: "contato@edusmart.com", company: "EduSmart", status: "Ativo", plan: "Pro", since: "18/06/2025" },
  { name: "HealthPlus", email: "admin@healthplus.com", company: "HealthPlus", status: "Suspenso", plan: "Pro", since: "29/03/2025" },
  { name: "AgroTech Soluções", email: "no-reply@agrotech.com", company: "AgroTech", status: "Ativo", plan: "Enterprise", since: "07/02/2025" },
  { name: "VarejoMax", email: "ti@varejomax.com", company: "VarejoMax", status: "Ativo", plan: "Starter", since: "22/07/2025" },
  { name: "FitGym Studios", email: "dev@fitgym.com", company: "FitGym", status: "Trial", plan: "Free", since: "14/07/2025" },
];

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "info" | "violet" | "neutral"> = {
  Ativo: "success",
  Trial: "info",
  Suspenso: "danger",
};

const PLAN_TONE: Record<string, "violet" | "info" | "success" | "neutral"> = {
  Free: "neutral",
  Starter: "info",
  Pro: "violet",
  Enterprise: "success",
};

export default function ClientesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Clientes"
          description="Gerencie todos os clientes da plataforma Orion."
          icon={Users}
          action={
            <div className="flex gap-2">
              <PageButton variant="ghost">
                <Download className="h-4 w-4" />
                Exportar
              </PageButton>
              <PageButton>
                <Plus className="h-4 w-4" />
                Novo Cliente
              </PageButton>
            </div>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "Total de Clientes", v: "1.248", c: "+12,5% este mês" },
            { l: "Ativos", v: "1.102", c: "88,3% do total" },
            { l: "Em Trial", v: "94", c: "7,5% do total" },
            { l: "Suspensos", v: "52", c: "4,2% do total" },
          ].map((s) => (
            <div key={s.l} className="glass-card glass-card-hover p-5">
              <p className="text-sm text-[#8b8fa3]">{s.l}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.v}</p>
              <p className="text-xs text-emerald-400 mt-1.5">{s.c}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-5 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Lista de Clientes</h3>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
              <input
                placeholder="Buscar cliente..."
                className="h-9 w-64 rounded-lg bg-white/5 border border-white/[0.06] pl-9 pr-3 text-sm text-white placeholder:text-[#6b7280] outline-none focus:border-violet-400/50"
              />
            </div>
          </div>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#6b7280] border-b border-white/5">
                  <th className="font-medium px-2 pb-3">Nome</th>
                  <th className="font-medium px-2 pb-3">E-mail</th>
                  <th className="font-medium px-2 pb-3">Empresa</th>
                  <th className="font-medium px-2 pb-3">Status</th>
                  <th className="font-medium px-2 pb-3">Plano</th>
                  <th className="font-medium px-2 pb-3">Cliente desde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {CLIENTS.map((c) => (
                  <tr key={c.email} className="hover:bg-white/[0.02]">
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full brand-gradient text-xs font-bold text-white shrink-0">
                          {c.company.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-white">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-sm text-[#8b8fa3]">{c.email}</td>
                    <td className="px-2 py-3 text-sm text-white/90">{c.company}</td>
                    <td className="px-2 py-3"><Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge></td>
                    <td className="px-2 py-3"><Badge tone={PLAN_TONE[c.plan]}>{c.plan}</Badge></td>
                    <td className="px-2 py-3 text-sm text-[#8b8fa3]">{c.since}</td>
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
