import DashboardLayout from "../dashboard/layout";
import { TicketPercent, Plus, Copy } from "lucide-react";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";

export const dynamic = "force-dynamic";

const COUPONS = [
  { code: "BEMVINDO20", discount: "20%", uses: "312 / 500", status: "Ativo", expires: "31/12/2025" },
  { code: "BLACKFRIDAY", discount: "40%", uses: "1.024 / ∞", status: "Ativo", expires: "30/11/2025" },
  { code: "PRO50", discount: "50%", uses: "48 / 100", status: "Ativo", expires: "15/08/2025" },
  { code: "VERAO2025", discount: "15%", uses: "187 / 300", status: "Expirado", expires: "28/02/2025" },
  { code: "INDICA10", discount: "10%", uses: "542 / ∞", status: "Ativo", expires: "—" },
  { code: "LANCTO30", discount: "30%", uses: "0 / 50", status: "Pausado", expires: "30/09/2025" },
  { code: "VIP75", discount: "75%", uses: "12 / 20", status: "Ativo", expires: "10/08/2025" },
  { code: "RENOVA25", discount: "25%", uses: "234 / 500", status: "Ativo", expires: "31/12/2025" },
];

const STATUS_TONE: Record<string, "success" | "warning" | "danger"> = {
  Ativo: "success",
  Pausado: "warning",
  Expirado: "danger",
};

export default function CuponsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Cupons"
          description="Cupons de desconto para licenças e assinaturas."
          icon={TicketPercent}
          action={<PageButton><Plus className="h-4 w-4" />Novo Cupom</PageButton>}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "Cupons Ativos", v: "24", c: "6 criados este mês" },
            { l: "Resgates no Mês", v: "1.082", c: "+24,1% vs mês anterior" },
            { l: "Desconto Concedido", v: "R$ 38.420,00", c: "13,4% da receita" },
            { l: "Ticket Médio c/ Cupom", v: "R$ 218,00", c: "-12% vs sem cupom" },
          ].map((s) => (
            <div key={s.l} className="glass-card glass-card-hover p-5">
              <p className="text-sm text-[#8b8fa3]">{s.l}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.v}</p>
              <p className="text-xs text-emerald-400 mt-1.5">{s.c}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-5 lg:p-6">
          <h3 className="text-base font-semibold text-white mb-4">Lista de Cupons</h3>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#6b7280] border-b border-white/5">
                  <th className="font-medium px-2 pb-3">Código</th>
                  <th className="font-medium px-2 pb-3">Desconto</th>
                  <th className="font-medium px-2 pb-3">Usos</th>
                  <th className="font-medium px-2 pb-3">Status</th>
                  <th className="font-medium px-2 pb-3">Expira em</th>
                  <th className="font-medium px-2 pb-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {COUPONS.map((c) => (
                  <tr key={c.code} className="hover:bg-white/[0.02]">
                    <td className="px-2 py-3">
                      <span className="rounded-md bg-violet-500/10 px-2 py-1 text-xs font-mono font-bold text-violet-300">{c.code}</span>
                    </td>
                    <td className="px-2 py-3 text-sm font-bold text-emerald-400">{c.discount}</td>
                    <td className="px-2 py-3 text-sm text-[#8b8fa3]">{c.uses}</td>
                    <td className="px-2 py-3"><Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge></td>
                    <td className="px-2 py-3 text-sm text-[#8b8fa3]">{c.expires}</td>
                    <td className="px-2 py-3">
                      <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] hover:text-white hover:bg-white/5">
                        <Copy className="h-4 w-4" />
                      </button>
                    </td>
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
