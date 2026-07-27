import DashboardLayout from "../dashboard/layout";
import { CreditCard, Plus, Download } from "lucide-react";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";

export const dynamic = "force-dynamic";

const PAYMENTS = [
  { client: "FormaPlus Ltda.", amount: "R$ 299,00", method: "Cartão de Crédito", status: "Aprovado", date: "26/07/2025, 14:22" },
  { client: "BioSaúde Clínicas", amount: "R$ 1.299,00", method: "Pix", status: "Aprovado", date: "26/07/2025, 11:05" },
  { client: "FIManager Finance", amount: "R$ 299,00", method: "Cartão de Crédito", status: "Aprovado", date: "25/07/2025, 18:40" },
  { client: "MarketPro Agência", amount: "R$ 99,00", method: "Pix", status: "Aprovado", date: "25/07/2025, 09:15" },
  { client: "LogTrack Logística", amount: "R$ 99,00", method: "Boleto", status: "Pendente", date: "24/07/2025, 16:30" },
  { client: "EduSmart Cursos", amount: "R$ 299,00", method: "Cartão de Crédito", status: "Aprovado", date: "23/07/2025, 10:00" },
  { client: "HealthPlus", amount: "R$ 299,00", method: "Cartão de Crédito", status: "Recusado", date: "22/07/2025, 15:45" },
  { client: "AgroTech Soluções", amount: "R$ 1.299,00", method: "Pix", status: "Aprovado", date: "21/07/2025, 08:20" },
  { client: "VarejoMax", amount: "R$ 99,00", method: "Pix", status: "Aprovado", date: "20/07/2025, 13:10" },
  { client: "FitGym Studios", amount: "R$ 0,00", method: "—", status: "Gratuito", date: "19/07/2025, 11:00" },
];

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  Aprovado: "success",
  Pendente: "warning",
  Recusado: "danger",
  Gratuito: "neutral",
};

export default function PagamentosPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Pagamentos"
          description="Histórico de pagamentos processados pela plataforma."
          icon={CreditCard}
          action={
            <div className="flex gap-2">
              <PageButton variant="ghost"><Download className="h-4 w-4" />Exportar</PageButton>
              <PageButton><Plus className="h-4 w-4" />Registrar Pagamento</PageButton>
            </div>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "Receita do Mês", v: "R$ 286.580,00", c: "+18,6% vs mês anterior" },
            { l: "Pagamentos Aprovados", v: "1.082", c: "92,4% do total" },
            { l: "Pendentes", v: "47", c: "4,0% do total" },
            { l: "Recusados", v: "41", c: "3,6% do total" },
          ].map((s) => (
            <div key={s.l} className="glass-card glass-card-hover p-5">
              <p className="text-sm text-[#8b8fa3]">{s.l}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.v}</p>
              <p className="text-xs text-emerald-400 mt-1.5">{s.c}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-5 lg:p-6">
          <h3 className="text-base font-semibold text-white mb-4">Transações Recentes</h3>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#6b7280] border-b border-white/5">
                  <th className="font-medium px-2 pb-3">Cliente</th>
                  <th className="font-medium px-2 pb-3">Valor</th>
                  <th className="font-medium px-2 pb-3">Método</th>
                  <th className="font-medium px-2 pb-3">Status</th>
                  <th className="font-medium px-2 pb-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {PAYMENTS.map((p, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="px-2 py-3 text-sm font-semibold text-white">{p.client}</td>
                    <td className="px-2 py-3 text-sm font-bold text-white">{p.amount}</td>
                    <td className="px-2 py-3 text-sm text-[#8b8fa3]">{p.method}</td>
                    <td className="px-2 py-3"><Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge></td>
                    <td className="px-2 py-3 text-sm text-[#8b8fa3]">{p.date}</td>
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
